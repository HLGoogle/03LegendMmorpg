export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/ws") {
      const mapId = url.searchParams.get("mapId") || "lobby";
      const id = env.GAME_ROOM.idFromName(mapId);
      return env.GAME_ROOM.get(id).fetch(request);
    }
    return new Response("Not Found", { status: 404 });
  }
};

export class GameRoom {
  constructor(state, env) {
    this.state = state;
    this.env = env;
  }

  async fetch(request) {
    const url = new URL(request.url);
    const mapId = url.searchParams.get("mapId");
    const [client, server] = new WebSocketPair();
    await this.handleSession(server, mapId);
    return new Response(null, { status: 101, webSocket: client });
  }

  async handleSession(ws, mapId) {
    ws.accept();

    // 1. 从 D1 获取地图元数据 (感官大小)
    let meta = await this.env.DB.prepare("SELECT * FROM maps WHERE id = ?").bind(mapId).first();
    
    if (!meta) {
      // 如果 D1 没记录，初始化一个
      meta = { id: mapId, name: "新地图", width: 40, height: 30 };
      await this.env.DB.prepare("INSERT INTO maps (id, name, width, height) VALUES (?, ?, ?, ?)")
        .bind(meta.id, meta.name, meta.width, meta.height).run();
    }

    // 2. 从 KV 获取地形蓝图
    const kvKey = `map:bin:${mapId}`;
    const binBuffer = await this.env.MAP_KV.get(kvKey, { type: "arrayBuffer" });
    const binary = binBuffer ? new Uint8Array(binBuffer) : new Uint8Array(meta.width * meta.height);

    // 3. 发送初始数据
    ws.send(JSON.stringify({
      type: 'init',
      meta: meta,
      binary: Array.from(binary)
    }));

    ws.onmessage = async (msg) => {
      const data = JSON.parse(msg.data);

      if (data.type === 'admin_update_full') {
        // A. 更新 D1 (元数据)
        await this.env.DB.prepare("UPDATE maps SET width = ?, height = ? WHERE id = ?")
          .bind(data.meta.width, data.meta.height, data.meta.id).run();
        
        // B. 更新 KV (二进制蓝图)
        const newBin = new Uint8Array(data.binary);
        await this.env.MAP_KV.put(`map:bin:${data.meta.id}`, newBin.buffer);

        // C. 广播给当前地图所有人
        this.broadcast({
            type: 'map_sync',
            meta: data.meta,
            binary: data.binary
        });
      }
    };
  }

  broadcast(msg) {
    const s = JSON.stringify(msg);
    this.state.getWebSockets().forEach(ws => ws.send(s));
  }
}
