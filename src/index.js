// src/index.js
export class GameRoom {
  constructor(state, env) {
    this.state = state;
    this.sessions = new Map(); // 存储 WebSocket 连接对应的玩家 ID
    this.players = {};         // 存储所有玩家的状态数据
  }

  async fetch(request) {
    if (request.headers.get("Upgrade") !== "websocket") {
      return new Response("Expected Upgrade: websocket", { status: 426 });
    }

    const webSocketPair = new WebSocketPair();
    const [client, server] = Object.values(webSocketPair);
    
    server.accept();
    const playerId = crypto.randomUUID(); // 为新连接生成唯一 ID
    this.sessions.set(server, playerId);

    // 随机分配一个圆点颜色
    const colors = ['#e74c3c', '#9b59b6', '#3498db', '#1abc9c', '#f1c40f', '#e67e22'];
    const playerColor = colors[Math.floor(Math.random() * colors.length)];

    server.addEventListener("message", event => {
      const data = JSON.parse(event.data);

      if (data.type === 'join') {
        // 玩家提交名字进入游戏，初始化坐标在屏幕中间区域
        this.players[playerId] = {
          name: data.name,
          x: Math.floor(Math.random() * 400) + 200,
          y: Math.floor(Math.random() * 300) + 200,
          color: playerColor
        };
        
        // 1. 告诉当前玩家：当前所有在线玩家的数据，以及你自己的 ID
        server.send(JSON.stringify({ 
          type: 'init', 
          id: playerId, 
          players: this.players 
        }));
        
        // 2. 广播给其他人：有新玩家加入了
        this.broadcast({ 
          type: 'join', 
          id: playerId, 
          player: this.players[playerId] 
        });

      } else if (data.type === 'move') {
        // 玩家移动，更新服务器内存状态并广播
        if (this.players[playerId]) {
          this.players[playerId].x = data.x;
          this.players[playerId].y = data.y;
          this.broadcast({ type: 'move', id: playerId, x: data.x, y: data.y });
        }
        
      } else if (data.type === 'chat') {
        // 聊天处理逻辑：拦截聊天消息并分发
        const sender = this.players[playerId];
        if (!sender) return;

        const chatMsg = {
          type: 'chat',
          id: playerId, // 【重要新增】将发送者的 ID 也传给前端，用于显示头顶气泡
          channel: data.channel,
          sender: sender.name,
          color: sender.color,
          text: data.text
        };

        if (data.channel === '私聊' && data.target) {
          // 私聊逻辑：遍历寻找目标玩家的 WebSocket 连接
          let targetSession = null;
          for (const [session, pId] of this.sessions.entries()) {
            if (this.players[pId] && this.players[pId].name === data.target) {
              targetSession = session;
              break;
            }
          }
          if (targetSession) {
            targetSession.send(JSON.stringify(chatMsg)); // 发给对方
            if (targetSession !== server) server.send(JSON.stringify(chatMsg)); // 也发给自己一份显示
          } else {
            // 目标不存在或不在线（系统消息不带 id）
            server.send(JSON.stringify({ 
              type: 'chat', channel: '系统', text: `玩家 [${data.target}] 不在线或不存在。` 
            }));
          }
        } else {
          // 世界、团队、自定义频道：广播全服
          this.broadcast(chatMsg);
        }
      }
    });

    server.addEventListener("close", () => {
      // 玩家断开连接，清理内存并通知其他人
      this.sessions.delete(server);
      delete this.players[playerId];
      this.broadcast({ type: 'leave', id: playerId });
    });

    return new Response(null, { status: 101, webSocket: client });
  }

  // 辅助方法：向所有在线的 WebSocket 广播消息
  broadcast(message) {
    const msgString = JSON.stringify(message);
    for (const session of this.sessions.keys()) {
      try {
        session.send(msgString);
      } catch (e) {
        // 忽略已经断开的错误连接
      }
    }
  }
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        },
      });
    }
    const id = env.GAME_ROOM.idFromName("world-map-1");
    const room = env.GAME_ROOM.get(id);
    return room.fetch(request);
  }
};
