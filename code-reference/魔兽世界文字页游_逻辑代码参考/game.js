// 游戏状态
let gameState = {
    gold: 100,
    team: [],
    inventory: [],
    materials: {
        fish: 0,
        ore: 0,
        dust: 0,
        gem: 0
    },
    upgrades: {
        attack: 0,
        defense: 0,
        speed: 0
    },
    professions: {
        fishing: 0,
        mining: 0
    },
    achievements: [],
    achievementsProgress: {},
    selectedDungeon: null,
    autoBattle: false,
    battleInterval: null,
    dungeonChallenges: {},
    currentZone: 'northshire',
    activeQuests: [],
    completedQuests: [],
    // 游戏倍率设置
    multipliers: {
        equipmentDropRate: 1.0,  // 装备掉率倍率
        goldDropRate: 1.0,        // 金币掉率倍率
        xpRate: 1.0,              // 经验获取倍率
        statGrowthRate: 1.0       // 属性成长倍率
    }
};

// 临时掉落列表
let pendingLoot = [];

// 种族定义
const RACES = {
    human: { name: '人类', bonus: { spirit: 1, reputation: 1 } },
    dwarf: { name: '矮人', bonus: { frostResistance: 2, mining: 1 } },
    gnome: { name: '侏儒', bonus: { arcane: 1, engineering: 1 } },
    nightelf: { name: '暗夜精灵', bonus: { dodge: 1, nature: 1 } },
    draenei: { name: '德莱尼', bonus: { heal: 1, shadowResistance: 1 } },
    orc: { name: '兽人', bonus: { attack: 1, stunResistance: 1 } },
    troll: { name: '巨魔', bonus: { haste: 1, beastDamage: 1 } },
    tauren: { name: '牛头人', bonus: { hp: 1, nature: 1 } },
    undead: { name: '亡灵', bonus: { underwater: 1, shadowResistance: 1 } },
    bloodelf: { name: '血精灵', bonus: { arcane: 1, enchanting: 1 } }
};

// 职业定义（WLK全职业）- 压缩属性版本
const CLASSES = {
    warrior: {
        name: '战士',
        talents: [
            { id: 'arms', name: '武器', role: 'dps', description: '双手武器专精，高单体伤害' },
            { id: 'fury', name: '狂暴', role: 'dps', description: '双武器专精，快速攻击' },
            { id: 'protection', name: '防护', role: 'tank', description: '盾牌专精，坦克专精' }
        ],
        baseStats: {
            attack: 10,
            defense: 8,
            hp: 100
        },
        growth: {
            attack: 1.5,
            defense: 2,
            hp: 12
        },
        color: '#c79c6e'
    },
    paladin: {
        name: '圣骑士',
        talents: [
            { id: 'holy', name: '神圣', role: 'healer', description: '强力治疗专精' },
            { id: 'protection', name: '防护', role: 'tank', description: '圣盾和防护技能' },
            { id: 'retribution', name: '惩戒', role: 'dps', description: '圣光伤害输出' }
        ],
        baseStats: {
            attack: 8,
            defense: 7,
            hp: 95
        },
        growth: {
            attack: 1.4,
            defense: 1.6,
            hp: 11
        },
        color: '#f58cba'
    },
    hunter: {
        name: '猎人',
        talents: [
            { id: 'beastmastery', name: '野兽控制', role: 'dps', description: '宠物强化专精' },
            { id: 'marksmanship', name: '射击', role: 'dps', description: '远程伤害专精' },
            { id: 'survival', name: '生存', role: 'dps', description: '陷阱和近战专精' }
        ],
        baseStats: {
            attack: 12,
            defense: 4,
            hp: 80
        },
        growth: {
            attack: 2.2,
            defense: 0.8,
            hp: 8
        },
        color: '#abd473'
    },
    rogue: {
        name: '潜行者',
        talents: [
            { id: 'assassination', name: '刺杀', role: 'dps', description: '毒药和爆发伤害' },
            { id: 'combat', name: '战斗', role: 'dps', description: '剑术专精，持续输出' },
            { id: 'subtlety', name: '敏锐', role: 'dps', description: '潜行和控制专精' }
        ],
        baseStats: {
            attack: 15,
            defense: 3,
            hp: 70
        },
        growth: {
            attack: 2.5,
            defense: 0.5,
            hp: 6
        },
        color: '#fff569'
    },
    priest: {
        name: '牧师',
        talents: [
            { id: 'discipline', name: '戒律', role: 'healer', description: '护盾和增益专精' },
            { id: 'holy', name: '神圣', role: 'healer', description: '强力治疗专精' },
            { id: 'shadow', name: '暗影', role: 'dps', description: '暗影伤害输出' }
        ],
        baseStats: {
            attack: 5,
            defense: 3,
            hp: 65
        },
        growth: {
            attack: 0.8,
            defense: 0.5,
            hp: 6
        },
        color: '#ffffff'
    },
    shaman: {
        name: '萨满祭司',
        talents: [
            { id: 'elemental', name: '元素', role: 'dps', description: '法术伤害输出' },
            { id: 'enhancement', name: '增强', role: 'dps', description: '近战风暴使者' },
            { id: 'restoration', name: '恢复', role: 'healer', description: '治疗图腾专精' }
        ],
        baseStats: {
            attack: 9,
            defense: 5,
            hp: 85
        },
        growth: {
            attack: 1.7,
            defense: 1.0,
            hp: 9
        },
        color: '#0070dd'
    },
    mage: {
        name: '法师',
        talents: [
            { id: 'arcane', name: '奥术', role: 'dps', description: '奥术伤害和爆发' },
            { id: 'fire', name: '火焰', role: 'dps', description: '火焰伤害专精' },
            { id: 'frost', name: '冰霜', role: 'dps', description: '冰霜伤害和控制' }
        ],
        baseStats: {
            attack: 13,
            defense: 3,
            hp: 75
        },
        growth: {
            attack: 2.3,
            defense: 0.6,
            hp: 7
        },
        color: '#69ccf0'
    },
    warlock: {
        name: '术士',
        talents: [
            { id: 'affliction', name: '痛苦', role: 'dps', description: '持续暗影伤害' },
            { id: 'demonology', name: '恶魔', role: 'dps', description: '恶魔强化专精' },
            { id: 'destruction', name: '毁灭', role: 'dps', description: '火焰和暗影爆发' }
        ],
        baseStats: {
            attack: 12,
            defense: 3,
            hp: 78
        },
        growth: {
            attack: 2.2,
            defense: 0.6,
            hp: 7.5
        },
        color: '#9482c9'
    },
    druid: {
        name: '德鲁伊',
        talents: [
            { id: 'balance', name: '平衡', role: 'dps', description: '自然法术伤害' },
            { id: 'feral', name: '野性', role: 'dps', description: '变形近战专精' },
            { id: 'restoration', name: '恢复', role: 'healer', description: '自然治疗专精' }
        ],
        baseStats: {
            attack: 8,
            defense: 6,
            hp: 95
        },
        growth: {
            attack: 1.5,
            defense: 1.2,
            hp: 10
        },
        color: '#ff7d0a'
    },
    deathknight: {
        name: '死亡骑士',
        talents: [
            { id: 'blood', name: '鲜血', role: 'tank', description: '鲜血护盾专精' },
            { id: 'frost', name: '冰霜', role: 'dps', description: '双持冰霜伤害' },
            { id: 'unholy', name: '邪恶', role: 'dps', description: '亡灵专精，持续伤害' }
        ],
        baseStats: {
            attack: 11,
            defense: 10,
            hp: 110
        },
        growth: {
            attack: 1.6,
            defense: 1.8,
            hp: 13
        },
        color: '#c41f3b'
    }
};

// 技能定义（扩展到所有职业）
const SKILLS = {
    warrior: [
        { name: '盾牌猛击', type: 'attack', power: 1.5, cooldown: 0, unlockLevel: 1, description: '造成150%攻击伤害' },
        { name: '嘲讽', type: 'taunt', power: 0, cooldown: 2, unlockLevel: 5, description: '增加仇恨值' },
        { name: '破甲攻击', type: 'attack', power: 1.2, cooldown: 0, unlockLevel: 10, description: '造成120%攻击伤害，降低防御' },
        { name: '盾墙', type: 'buff', power: 0, cooldown: 5, unlockLevel: 20, description: '减少50%受到的伤害，持续3回合' },
        { name: '雷霆一击', type: 'aoe', power: 1.3, cooldown: 3, unlockLevel: 35, description: '对所有敌人造成130%攻击伤害' }
    ],
    paladin: [
        { name: '圣光术', type: 'attack', power: 1.2, cooldown: 0, unlockLevel: 1, description: '造成120%攻击伤害' },
        { name: '神圣打击', type: 'attack', power: 1.8, cooldown: 1, unlockLevel: 5, description: '造成180%攻击伤害' },
        { name: '圣光闪现', type: 'heal', power: 2.0, cooldown: 3, unlockLevel: 12, description: '治疗200%攻击力生命值' },
        { name: '奉献', type: 'aoe', power: 1.0, cooldown: 4, unlockLevel: 30, description: '对所有敌人造成100%攻击伤害' },
        { name: '圣盾术', type: 'buff', power: 0, cooldown: 8, unlockLevel: 50, description: '免疫所有伤害，持续2回合' }
    ],
    hunter: [
        { name: '奥术射击', type: 'attack', power: 1.5, cooldown: 0, unlockLevel: 1, description: '造成150%攻击伤害' },
        { name: '多重射击', type: 'aoe', power: 1.0, cooldown: 2, unlockLevel: 8, description: '对所有敌人造成100%攻击伤害' },
        { name: '狙击', type: 'attack', power: 2.2, cooldown: 3, unlockLevel: 20, description: '造成220%攻击伤害' },
        { name: '毒蛇钉刺', type: 'dot', power: 0.5, cooldown: 2, unlockLevel: 35, description: '每回合造成50%攻击伤害，持续5回合' },
        { name: '野兽之眼', type: 'buff', power: 0, cooldown: 4, unlockLevel: 55, description: '提高50%攻击，持续3回合' }
    ],
    rogue: [
        { name: '背刺', type: 'attack', power: 2.0, cooldown: 0, unlockLevel: 1, description: '造成200%攻击伤害' },
        { name: '毒刃', type: 'attack', power: 1.8, cooldown: 1, unlockLevel: 5, description: '造成180%攻击伤害并施加毒药' },
        { name: '闪避', type: 'buff', power: 0, cooldown: 3, unlockLevel: 12, description: '提高50%闪避，持续3回合' },
        { name: '刀扇', type: 'aoe', power: 1.2, cooldown: 2, unlockLevel: 25, description: '对所有敌人造成120%攻击伤害' },
        { name: '暗影步', type: 'attack', power: 2.5, cooldown: 5, unlockLevel: 45, description: '瞬移并造成250%攻击伤害' }
    ],
    priest: [
        { name: '暗言术：痛', type: 'attack', power: 1.2, cooldown: 0, unlockLevel: 1, description: '造成120%攻击伤害' },
        { name: '治疗术', type: 'heal', power: 1.5, cooldown: 2, unlockLevel: 3, description: '治疗150%攻击力生命值' },
        { name: '精神鞭笞', type: 'attack', power: 1.6, cooldown: 1, unlockLevel: 10, description: '造成160%攻击伤害' },
        { name: '群体治疗', type: 'heal', power: 1.0, cooldown: 4, unlockLevel: 25, description: '治疗所有友方100%攻击力生命值' },
        { name: '暗影形态', type: 'buff', power: 0, cooldown: 5, unlockLevel: 45, description: '提高100%伤害，持续5回合' }
    ],
    shaman: [
        { name: '闪电箭', type: 'attack', power: 1.6, cooldown: 0, unlockLevel: 1, description: '造成160%攻击伤害' },
        { name: '熔岩暴击', type: 'attack', power: 2.0, cooldown: 2, unlockLevel: 8, description: '造成200%攻击伤害' },
        { name: '治疗波', type: 'heal', power: 1.8, cooldown: 3, unlockLevel: 15, description: '治疗180%攻击力生命值' },
        { name: '闪电链', type: 'aoe', power: 1.3, cooldown: 3, unlockLevel: 30, description: '对所有敌人造成130%攻击伤害' },
        { name: '元素掌握', type: 'buff', power: 0, cooldown: 5, unlockLevel: 50, description: '提高80%伤害，持续4回合' }
    ],
    mage: [
        { name: '火球术', type: 'attack', power: 1.8, cooldown: 0, unlockLevel: 1, description: '造成180%攻击伤害' },
        { name: '冰霜新星', type: 'aoe', power: 1.2, cooldown: 3, unlockLevel: 5, description: '对所有敌人造成120%攻击伤害' },
        { name: '奥术飞弹', type: 'attack', power: 2.0, cooldown: 2, unlockLevel: 15, description: '造成200%攻击伤害' },
        { name: '法力护盾', type: 'buff', power: 0, cooldown: 4, unlockLevel: 30, description: '吸收伤害，持续3回合' },
        { name: '炎爆术', type: 'attack', power: 3.0, cooldown: 5, unlockLevel: 50, description: '造成300%攻击伤害' }
    ],
    warlock: [
        { name: '暗影箭', type: 'attack', power: 1.7, cooldown: 0, unlockLevel: 1, description: '造成170%攻击伤害' },
        { name: '腐蚀术', type: 'dot', power: 0.4, cooldown: 1, unlockLevel: 5, description: '每回合造成40%攻击伤害，持续6回合' },
        { name: '献祭', type: 'aoe', power: 1.4, cooldown: 2, unlockLevel: 15, description: '对所有敌人造成140%攻击伤害' },
        { name: '生命吸取', type: 'heal', power: 1.2, cooldown: 3, unlockLevel: 30, description: '吸取敌人生命值恢复自身' },
        { name: '混乱之箭', type: 'attack', power: 2.8, cooldown: 5, unlockLevel: 50, description: '造成280%攻击伤害' }
    ],
    druid: [
        { name: '愤怒', type: 'attack', power: 1.4, cooldown: 0, unlockLevel: 1, description: '造成140%攻击伤害' },
        { name: '月火术', type: 'dot', power: 0.3, cooldown: 1, unlockLevel: 5, description: '每回合造成30%攻击伤害，持续8回合' },
        { name: '治疗之触', type: 'heal', power: 1.6, cooldown: 2, unlockLevel: 12, description: '治疗160%攻击力生命值' },
        { name: '星落', type: 'aoe', power: 1.5, cooldown: 3, unlockLevel: 30, description: '对所有敌人造成150%攻击伤害' },
        { name: '树皮术', type: 'buff', power: 0, cooldown: 4, unlockLevel: 45, description: '减少40%受到的伤害，持续4回合' }
    ],
    deathknight: [
        { name: '枯萎凋零', type: 'aoe', power: 1.2, cooldown: 0, unlockLevel: 1, description: '对所有敌人造成120%攻击伤害' },
        { name: '死亡缠绕', type: 'attack', power: 1.8, cooldown: 1, unlockLevel: 5, description: '造成180%攻击伤害' },
        { name: '符文打击', type: 'attack', power: 1.6, cooldown: 0, unlockLevel: 12, description: '造成160%攻击伤害' },
        { name: '灵界打击', type: 'attack', power: 2.2, cooldown: 2, unlockLevel: 25, description: '造成220%攻击伤害' },
        { name: '冰霜之柱', type: 'buff', power: 0, cooldown: 5, unlockLevel: 45, description: '提高60%攻击和40%防御，持续4回合' }
    ]
};

// 装备槽位定义
const EQUIPMENT_SLOTS = ['weapon', 'helmet', 'chest', 'legs', 'gloves', 'boots', 'ring1', 'ring2', 'necklace'];

// 装备品质定义
const ITEM_QUALITIES = {
    common: { name: '普通', color: '#ffffff', multiplier: 1, maxEnhance: 1 },
    uncommon: { name: '优秀', color: '#1eff00', multiplier: 1.5, maxEnhance: 2 },
    rare: { name: '精良', color: '#0070dd', multiplier: 2, maxEnhance: 3 },
    epic: { name: '史诗', color: '#a335ee', multiplier: 4, maxEnhance: 4 },
    legendary: { name: '传说', color: '#ff8000', multiplier: 8, maxEnhance: 5 }
};

// 副本定义
const DUNGEONS = [
    { id: 1, name: '哀嚎洞穴', level: 10, normalCount: 5, bossCount: 1, rewardGold: 50, xp: 100, challengeLimit: 10 },
    { id: 2, name: '死亡矿井', level: 15, normalCount: 6, bossCount: 1, rewardGold: 80, xp: 150, challengeLimit: 10 },
    { id: 3, name: '影牙城堡', level: 18, normalCount: 7, bossCount: 2, rewardGold: 100, xp: 200, challengeLimit: 12 },
    { id: 4, name: '黑暗深渊', level: 22, normalCount: 8, bossCount: 2, rewardGold: 120, xp: 240, challengeLimit: 12 },
    { id: 5, name: '血色修道院', level: 25, normalCount: 8, bossCount: 2, rewardGold: 150, xp: 300, challengeLimit: 15 },
    { id: 6, name: '诺莫瑞根', level: 28, normalCount: 9, bossCount: 3, rewardGold: 180, xp: 360, challengeLimit: 15 },
    { id: 7, name: '剃刀沼泽', level: 30, normalCount: 10, bossCount: 2, rewardGold: 200, xp: 400, challengeLimit: 15 },
    { id: 8, name: '剃刀高地', level: 35, normalCount: 10, bossCount: 2, rewardGold: 250, xp: 500, challengeLimit: 15 },
    { id: 9, name: '奥达曼', level: 40, normalCount: 11, bossCount: 3, rewardGold: 300, xp: 600, challengeLimit: 18 },
    { id: 10, name: '祖尔法拉克', level: 42, normalCount: 12, bossCount: 3, rewardGold: 320, xp: 640, challengeLimit: 18 },
    { id: 11, name: '玛拉顿', level: 45, normalCount: 12, bossCount: 4, rewardGold: 400, xp: 800, challengeLimit: 20 },
    { id: 12, name: '黑石深渊', level: 48, normalCount: 13, bossCount: 4, rewardGold: 450, xp: 900, challengeLimit: 20 },
    { id: 13, name: '厄运之槌', level: 52, normalCount: 14, bossCount: 3, rewardGold: 500, xp: 1000, challengeLimit: 22 },
    { id: 14, name: '通灵学院', level: 55, normalCount: 15, bossCount: 3, rewardGold: 600, xp: 1200, challengeLimit: 20 },
    { id: 15, name: '斯坦索姆', level: 58, normalCount: 15, bossCount: 3, rewardGold: 650, xp: 1300, challengeLimit: 22 },
    { id: 16, name: '黑石塔', level: 60, normalCount: 20, bossCount: 4, rewardGold: 800, xp: 1500, challengeLimit: 25 },
    { id: 17, name: '祖尔格拉布', level: 60, normalCount: 18, bossCount: 6, rewardGold: 1000, xp: 2000, challengeLimit: 25 },
    { id: 18, name: '安其拉废墟', level: 60, normalCount: 8, bossCount: 6, rewardGold: 1500, xp: 3000, challengeLimit: 25 },
    { id: 19, name: '安其拉神殿', level: 60, normalCount: 12, bossCount: 8, rewardGold: 2000, xp: 4000, challengeLimit: 30, hasEpic: true },
    { id: 20, name: '熔火之心', level: 60, normalCount: 10, bossCount: 10, rewardGold: 2500, xp: 5000, challengeLimit: 30, hasLegendary: true },
    { id: 21, name: '纳克萨玛斯', level: 70, normalCount: 15, bossCount: 12, rewardGold: 3500, xp: 7000, challengeLimit: 40, hasEpic: true },
    { id: 22, name: '太阳之井', level: 70, normalCount: 12, bossCount: 8, rewardGold: 4000, xp: 8000, challengeLimit: 40, hasEpic: true },
    { id: 23, name: '奥妮克希亚的巢穴', level: 75, normalCount: 8, bossCount: 3, rewardGold: 4500, xp: 9000, challengeLimit: 45, hasEpic: true },
    { id: 24, name: '冰冠堡垒', level: 80, normalCount: 15, bossCount: 12, rewardGold: 5000, xp: 10000, challengeLimit: 50, hasLegendary: true },
    { id: 25, name: '红玉圣殿', level: 80, normalCount: 12, bossCount: 8, rewardGold: 5500, xp: 11000, challengeLimit: 50, hasLegendary: true },
    { id: 26, name: '黑曜石圣殿', level: 80, normalCount: 10, bossCount: 5, rewardGold: 6000, xp: 12000, challengeLimit: 50, hasLegendary: true }
];

// 成就定义
const ACHIEVEMENTS = [
    // 击杀成就
    { id: 'kill_10', name: '初出茅庐', description: '击杀10个怪物', type: 'kills', target: 10, reward: { attack: 2, defense: 2, hp: 20 } },
    { id: 'kill_50', name: '狩猎者', description: '击杀50个怪物', type: 'kills', target: 50, reward: { attack: 3, defense: 3, hp: 30 } },
    { id: 'kill_100', name: '屠戮者', description: '击杀100个怪物', type: 'kills', target: 100, reward: { attack: 5, defense: 5, hp: 50 } },
    { id: 'kill_500', name: '杀戮机器', description: '击杀500个怪物', type: 'kills', target: 500, reward: { attack: 8, defense: 8, hp: 80 } },
    { id: 'kill_1000', name: '传奇猎手', description: '击杀1000个怪物', type: 'kills', target: 1000, reward: { attack: 10, defense: 10, hp: 100 } },
    { id: 'kill_5000', name: '神话猎手', description: '击杀5000个怪物', type: 'kills', target: 5000, reward: { attack: 15, defense: 15, hp: 150 } },
    { id: 'kill_10000', name: '神级猎手', description: '击杀10000个怪物', type: 'kills', target: 10000, reward: { attack: 20, defense: 20, hp: 200 } },

    // 副本成就
    { id: 'dungeon_5', name: '副本新手', description: '通关5次副本', type: 'dungeons', target: 5, reward: { attack: 2, defense: 2, hp: 20 } },
    { id: 'dungeon_10', name: '副本探险家', description: '通关10次副本', type: 'dungeons', target: 10, reward: { attack: 3, defense: 3, hp: 30 } },
    { id: 'dungeon_25', name: '副本专家', description: '通关25次副本', type: 'dungeons', target: 25, reward: { attack: 5, defense: 5, hp: 50 } },
    { id: 'dungeon_50', name: '副本老手', description: '通关50次副本', type: 'dungeons', target: 50, reward: { attack: 6, defense: 6, hp: 60 } },
    { id: 'dungeon_100', name: '副本大师', description: '通关100次副本', type: 'dungeons', target: 100, reward: { attack: 8, defense: 8, hp: 80 } },
    { id: 'dungeon_200', name: '副本传说', description: '通关200次副本', type: 'dungeons', target: 200, reward: { attack: 12, defense: 12, hp: 120 } },
    { id: 'dungeon_500', name: '副本之神', description: '通关500次副本', type: 'dungeons', target: 500, reward: { attack: 20, defense: 20, hp: 200 } },

    // BOSS成就
    { id: 'boss_5', name: 'BOSS杀手初阶', description: '击败5个BOSS', type: 'bosses', target: 5, reward: { attack: 3, defense: 3, hp: 30 } },
    { id: 'boss_10', name: 'BOSS杀手', description: '击败10个BOSS', type: 'bosses', target: 10, reward: { attack: 5, defense: 5, hp: 50 } },
    { id: 'boss_25', name: 'BOSS猎人', description: '击败25个BOSS', type: 'bosses', target: 25, reward: { attack: 7, defense: 7, hp: 70 } },
    { id: 'boss_50', name: 'BOSS毁灭者', description: '击败50个BOSS', type: 'bosses', target: 50, reward: { attack: 12, defense: 12, hp: 120 } },
    { id: 'boss_100', name: 'BOSS之神', description: '击败100个BOSS', type: 'bosses', target: 100, reward: { attack: 20, defense: 20, hp: 200 } },

    // 金币成就
    { id: 'gold_1000', name: '小富翁', description: '累计获得1000金币', type: 'gold', target: 1000, reward: { attack: 2, defense: 2, hp: 20 } },
    { id: 'gold_5000', name: '中富翁', description: '累计获得5000金币', type: 'gold', target: 5000, reward: { attack: 3, defense: 3, hp: 30 } },
    { id: 'gold_10000', name: '富翁', description: '累计获得10000金币', type: 'gold', target: 10000, reward: { attack: 4, defense: 4, hp: 40 } },
    { id: 'gold_50000', name: '富豪', description: '累计获得50000金币', type: 'gold', target: 50000, reward: { attack: 6, defense: 6, hp: 60 } },
    { id: 'gold_100000', name: '大富翁', description: '累计获得100000金币', type: 'gold', target: 100000, reward: { attack: 10, defense: 10, hp: 100 } },
    { id: 'gold_500000', name: '巨富', description: '累计获得500000金币', type: 'gold', target: 500000, reward: { attack: 15, defense: 15, hp: 150 } },

    // 等级成就
    { id: 'level_20', name: '新手队伍', description: '所有角色达到20级', type: 'level', target: 20, reward: { attack: 3, defense: 3, hp: 30 } },
    { id: 'level_40', name: '精英队伍', description: '所有角色达到40级', type: 'level', target: 40, reward: { attack: 6, defense: 6, hp: 60 } },
    { id: 'level_60', name: '精英小队', description: '所有角色达到60级', type: 'level', target: 60, reward: { attack: 10, defense: 10, hp: 100 } },
    { id: 'level_80', name: '传说队伍', description: '所有角色达到80级', type: 'level', target: 80, reward: { attack: 20, defense: 20, hp: 200 } },
    { id: 'level_100', name: '神话队伍', description: '所有角色达到100级', type: 'level', target: 100, reward: { attack: 30, defense: 30, hp: 300 } },

    // 装备成就
    { id: 'rare_5', name: '精良收藏家', description: '获得5件精良装备', type: 'rare', target: 5, reward: { attack: 3, defense: 3, hp: 30 } },
    { id: 'epic_5', name: '史诗收藏家', description: '获得5件史诗装备', type: 'epic', target: 5, reward: { attack: 4, defense: 4, hp: 40 } },
    { id: 'epic_10', name: '装备收集者', description: '获得10件史诗装备', type: 'epic', target: 10, reward: { attack: 5, defense: 5, hp: 50 } },
    { id: 'epic_25', name: '史诗大师', description: '获得25件史诗装备', type: 'epic', target: 25, reward: { attack: 8, defense: 8, hp: 80 } },
    { id: 'legendary_1', name: '传说持有者', description: '获得1件传说装备', type: 'legendary', target: 1, reward: { attack: 15, defense: 15, hp: 150 } },
    { id: 'legendary_5', name: '传说大师', description: '获得5件传说装备', type: 'legendary', target: 5, reward: { attack: 25, defense: 25, hp: 250 } },
    { id: 'max_enhance', name: '强化大师', description: '强化任意装备到上限', type: 'enhance', target: 5, reward: { attack: 8, defense: 8, hp: 80 } },
    { id: 'enhance_10', name: '强化狂人', description: '累计强化10次装备', type: 'enhance_total', target: 10, reward: { attack: 5, defense: 5, hp: 50 } },
    { id: 'enhance_50', name: '强化之神', description: '累计强化50次装备', type: 'enhance_total', target: 50, reward: { attack: 12, defense: 12, hp: 120 } },

    // 专业成就
    { id: 'profession_50', name: '生活技能专家', description: '任意生活技能达到50', type: 'profession', target: 50, reward: { attack: 3, defense: 3, hp: 30 } },
    { id: 'profession_100', name: '生活技能大师', description: '任意生活技能达到100', type: 'profession', target: 100, reward: { attack: 5, defense: 5, hp: 50 } },
    { id: 'profession_200', name: '生活技能传说', description: '任意生活技能达到200', type: 'profession', target: 200, reward: { attack: 10, defense: 10, hp: 100 } },

    // 任务成就
    { id: 'quest_5', name: '任务新手', description: '完成5个任务', type: 'quests', target: 5, reward: { attack: 2, defense: 2, hp: 20 } },
    { id: 'quest_10', name: '任务达人', description: '完成10个任务', type: 'quests', target: 10, reward: { attack: 3, defense: 3, hp: 30 } },
    { id: 'quest_25', name: '任务专家', description: '完成25个任务', type: 'quests', target: 25, reward: { attack: 5, defense: 5, hp: 50 } },
    { id: 'quest_50', name: '任务大师', description: '完成50个任务', type: 'quests', target: 50, reward: { attack: 8, defense: 8, hp: 80 } },
    { id: 'quest_100', name: '任务之神', description: '完成100个任务', type: 'quests', target: 100, reward: { attack: 15, defense: 15, hp: 150 } },

    // 特殊成就
    { id: 'team_5', name: '满员战队', description: '团队达到5人', type: 'team', target: 5, reward: { attack: 5, defense: 5, hp: 50 } },
    { id: 'all_classes', name: '职业收集者', description: '收集全部10种职业', type: 'all_classes', target: 10, reward: { attack: 15, defense: 15, hp: 150 } },
    { id: 'all_races', name: '种族收集者', description: '收集全部10种种族', type: 'all_races', target: 10, reward: { attack: 10, defense: 10, hp: 100 } },
    { id: 'all_zones', name: '世界探险家', description: '探索全部9个区域', type: 'all_zones', target: 9, reward: { attack: 10, defense: 10, hp: 100 } },
    { id: 'dungeon_all', name: '副本征服者', description: '通关全部26个副本', type: 'dungeon_all', target: 26, reward: { attack: 30, defense: 30, hp: 300 } },
    { id: 'auto_hunt_100', name: '自动猎手', description: '自动狩猎100次', type: 'auto_hunt', target: 100, reward: { attack: 5, defense: 5, hp: 50 } },
    { id: 'auto_hunt_500', name: '自动狩猎狂人', description: '自动狩猎500次', type: 'auto_hunt', target: 500, reward: { attack: 10, defense: 10, hp: 100 } },
    { id: 'rich_materials', name: '材料大亨', description: '每种材料超过1000', type: 'rich_materials', target: 1000, reward: { attack: 8, defense: 8, hp: 80 } },

    // 新增20个高难度成就
    { id: 'kill_50000', name: '杀戮神', description: '击杀50000个怪物', type: 'kills', target: 50000, reward: { attack: 50, defense: 50, hp: 500 } },
    { id: 'kill_100000', name: '杀戮魔神', description: '击杀100000个怪物', type: 'kills', target: 100000, reward: { attack: 80, defense: 80, hp: 800 } },
    { id: 'dungeon_1000', name: '副本圣神', description: '通关1000次副本', type: 'dungeons', target: 1000, reward: { attack: 40, defense: 40, hp: 400 } },
    { id: 'dungeon_5000', name: '副本神王', description: '通关5000次副本', type: 'dungeons', target: 5000, reward: { attack: 60, defense: 60, hp: 600 } },
    { id: 'boss_500', name: 'BOSS圣神', description: '击败500个BOSS', type: 'bosses', target: 500, reward: { attack: 50, defense: 50, hp: 500 } },
    { id: 'boss_1000', name: 'BOSS神王', description: '击败1000个BOSS', type: 'bosses', target: 1000, reward: { attack: 80, defense: 80, hp: 800 } },
    { id: 'gold_1000000', name: '金神', description: '累计获得1000000金币', type: 'gold', target: 1000000, reward: { attack: 30, defense: 30, hp: 300 } },
    { id: 'gold_10000000', name: '金魔神', description: '累计获得10000000金币', type: 'gold', target: 10000000, reward: { attack: 50, defense: 50, hp: 500 } },
    { id: 'epic_50', name: '史诗收集大师', description: '获得50件史诗装备', type: 'epic', target: 50, reward: { attack: 12, defense: 12, hp: 120 } },
    { id: 'epic_100', name: '史诗收集之神', description: '获得100件史诗装备', type: 'epic', target: 100, reward: { attack: 20, defense: 20, hp: 200 } },
    { id: 'legendary_10', name: '传说收藏大师', description: '获得10件传说装备', type: 'legendary', target: 10, reward: { attack: 40, defense: 40, hp: 400 } },
    { id: 'legendary_20', name: '传说收藏之神', description: '获得20件传说装备', type: 'legendary', target: 20, reward: { attack: 60, defense: 60, hp: 600 } },
    { id: 'profession_500', name: '生活技能圣神', description: '任意生活技能达到500', type: 'profession', target: 500, reward: { attack: 20, defense: 20, hp: 200 } },
    { id: 'profession_1000', name: '生活技能神王', description: '任意生活技能达到1000', type: 'profession', target: 1000, reward: { attack: 30, defense: 30, hp: 300 } },
    { id: 'quest_200', name: '任务圣神', description: '完成200个任务', type: 'quests', target: 200, reward: { attack: 25, defense: 25, hp: 250 } },
    { id: 'quest_500', name: '任务神王', description: '完成500个任务', type: 'quests', target: 500, reward: { attack: 40, defense: 40, hp: 400 } },
    { id: 'auto_hunt_1000', name: '自动狩猎之神', description: '自动狩猎1000次', type: 'auto_hunt', target: 1000, reward: { attack: 20, defense: 20, hp: 200 } },
    { id: 'enhance_100', name: '强化圣神', description: '累计强化100次装备', type: 'enhance_total', target: 100, reward: { attack: 20, defense: 20, hp: 200 } },
    { id: 'enhance_200', name: '强化神王', description: '累计强化200次装备', type: 'enhance_total', target: 200, reward: { attack: 30, defense: 30, hp: 300 } },
    { id: 'rich_materials_10000', name: '材料神王', description: '每种材料超过10000', type: 'rich_materials', target: 10000, reward: { attack: 25, defense: 25, hp: 250 } },
    { id: 'perfect_team', name: '完美团队', description: '5个角色全满级100级', type: 'perfect_team', target: 5, reward: { attack: 50, defense: 50, hp: 500 } }
];

// 野外区域定义
const ZONES = {
    northshire: {
        name: '北郡',
        levelRange: '1-10',
        description: '新手区域，适合初学者练级',
        monsters: [
            { name: '野猪', level: 1, hp: 90, attack: 15, defense: 6, xp: 20, gold: 5 },
            { name: '狼', level: 3, hp: 135, attack: 24, defense: 9, xp: 35, gold: 8 },
            { name: '强盗', level: 5, hp: 180, attack: 36, defense: 15, xp: 50, gold: 15 },
            { name: '暴徒', level: 8, hp: 240, attack: 54, defense: 21, xp: 80, gold: 25 },
            { name: '森林熊', level: 10, hp: 300, attack: 60, defense: 30, xp: 100, gold: 35 },
            { name: '野猪人斥候', level: 8, hp: 225, attack: 45, defense: 24, xp: 75, gold: 30 }
        ],
        quests: [
            { id: 'nq1', name: '清理野猪', description: '击杀5只野猪', type: 'kill', target: '野猪', count: 5, rewardGold: 50, xp: 100, itemChance: 0.1 },
            { id: 'nq2', name: '狼的威胁', description: '击杀3只狼', type: 'kill', target: '狼', count: 3, rewardGold: 80, xp: 150, itemChance: 0.15 },
            { id: 'nq3', name: '消灭强盗', description: '击杀2个强盗', type: 'kill', target: '强盗', count: 2, rewardGold: 120, xp: 200, itemChance: 0.2 },
            { id: 'nq4', name: '熊王讨伐', description: '击杀3只森林熊', type: 'kill', target: '森林熊', count: 3, rewardGold: 150, xp: 250, itemChance: 0.25 },
            { id: 'nq5', name: '野猪人清理', description: '击杀5个野猪人斥候', type: 'kill', target: '野猪人斥候', count: 5, rewardGold: 180, xp: 300, itemChance: 0.25 },
            { id: 'nq6', name: '北郡守卫', description: '累计击杀20个怪物', type: 'kill', target: 'all', count: 20, rewardGold: 300, xp: 500, itemChance: 0.3 }
        ]
    },
    elwynn: {
        name: '艾尔文森林',
        levelRange: '10-20',
        description: '联盟新手村的延伸',
        monsters: [
            { name: '森林熊', level: 10, hp: 450, attack: 75, defense: 30, xp: 150, gold: 40 },
            { name: '迪菲亚苦工', level: 12, hp: 540, attack: 90, defense: 36, xp: 180, gold: 50 },
            { name: '豺狼人', level: 15, hp: 660, attack: 105, defense: 45, xp: 220, gold: 65 },
            { name: '野猪人', level: 18, hp: 780, attack: 120, defense: 54, xp: 260, gold: 80 },
            { name: '游荡者', level: 16, hp: 720, attack: 114, defense: 48, xp: 240, gold: 72 },
            { name: '盗贼首领', level: 20, hp: 960, attack: 144, defense: 60, xp: 320, gold: 100 }
        ],
        quests: [
            { id: 'eq1', name: '熊的皮毛', description: '击杀5只森林熊', type: 'kill', target: '森林熊', count: 5, rewardGold: 150, xp: 300, itemChance: 0.15 },
            { id: 'eq2', name: '迪菲亚威胁', description: '击杀3个迪菲亚苦工', type: 'kill', target: '迪菲亚苦工', count: 3, rewardGold: 200, xp: 400, itemChance: 0.2 },
            { id: 'eq3', name: '豺狼人部落', description: '击杀5个豺狼人', type: 'kill', target: '豺狼人', count: 5, rewardGold: 250, xp: 500, itemChance: 0.25 },
            { id: 'eq4', name: '野猪人洞穴', description: '击杀4个野猪人', type: 'kill', target: '野猪人', count: 4, rewardGold: 300, xp: 600, itemChance: 0.3 },
            { id: 'eq5', name: '铲除游荡者', description: '击杀3个游荡者', type: 'kill', target: '游荡者', count: 3, rewardGold: 280, xp: 550, itemChance: 0.28 },
            { id: 'eq6', name: '盗贼首领', description: '击杀1个盗贼首领', type: 'kill', target: '盗贼首领', count: 1, rewardGold: 400, xp: 800, itemChance: 0.4 },
            { id: 'eq7', name: '艾尔文清理者', description: '累计击杀30个怪物', type: 'kill', target: 'all', count: 30, rewardGold: 500, xp: 1000, itemChance: 0.35 }
        ]
    },
    westfall: {
        name: '西部荒野',
        levelRange: '20-30',
        description: '荒凉的沙漠地区',
        monsters: [
            { name: '收割机器人', level: 20, hp: 1050, attack: 150, defense: 60, xp: 350, gold: 100 },
            { name: '鱼人', level: 25, hp: 1260, attack: 180, defense: 75, xp: 420, gold: 125 },
            { name: '狗头人', level: 28, hp: 1440, attack: 204, defense: 84, xp: 480, gold: 145 },
            { name: '沙漠蝎子', level: 22, hp: 1140, attack: 165, defense: 66, xp: 380, gold: 110 },
            { name: '荒野食尸鬼', level: 27, hp: 1350, attack: 195, defense: 78, xp: 450, gold: 140 },
            { name: '亡灵巫师', level: 30, hp: 1560, attack: 216, defense: 90, xp: 520, gold: 160 }
        ],
        quests: [
            { id: 'wq1', name: '机械威胁', description: '击杀4个收割机器人', type: 'kill', target: '收割机器人', count: 4, rewardGold: 300, xp: 600, itemChance: 0.2 },
            { id: 'wq2', name: '鱼人袭击', description: '击杀3个鱼人', type: 'kill', target: '鱼人', count: 3, rewardGold: 350, xp: 700, itemChance: 0.25 },
            { id: 'wq3', name: '狗头人矿洞', description: '击杀5个狗头人', type: 'kill', target: '狗头人', count: 5, rewardGold: 400, xp: 800, itemChance: 0.3 },
            { id: 'wq4', name: '蝎子清除', description: '击杀5个沙漠蝎子', type: 'kill', target: '沙漠蝎子', count: 5, rewardGold: 380, xp: 750, itemChance: 0.28 },
            { id: 'wq5', name: '清理亡灵', description: '击杀4个荒野食尸鬼', type: 'kill', target: '荒野食尸鬼', count: 4, rewardGold: 450, xp: 900, itemChance: 0.32 },
            { id: 'wq6', name: '亡灵巫师', description: '击杀2个亡灵巫师', type: 'kill', target: '亡灵巫师', count: 2, rewardGold: 500, xp: 1000, itemChance: 0.35 },
            { id: 'wq7', name: '西部清理者', description: '累计击杀40个怪物', type: 'kill', target: 'all', count: 40, rewardGold: 700, xp: 1400, itemChance: 0.4 }
        ]
    },
    redridge: {
        name: '赤脊山',
        levelRange: '30-40',
        description: '险峻的山脉',
        monsters: [
            { name: '黑石兽人', level: 30, hp: 1650, attack: 240, defense: 105, xp: 550, gold: 180 },
            { name: '赤脊山野猪', level: 35, hp: 1950, attack: 285, defense: 120, xp: 650, gold: 210 },
            { name: '黑石刺客', level: 38, hp: 2160, attack: 315, defense: 135, xp: 720, gold: 240 },
            { name: '赤脊山狼人', level: 33, hp: 1800, attack: 264, defense: 114, xp: 600, gold: 195 },
            { name: '黑石萨满', level: 37, hp: 2100, attack: 306, defense: 126, xp: 700, gold: 230 },
            { name: '兽人队长', level: 40, hp: 2400, attack: 345, defense: 150, xp: 800, gold: 280 }
        ],
        quests: [
            { id: 'rq1', name: '兽人入侵', description: '击杀5个黑石兽人', type: 'kill', target: '黑石兽人', count: 5, rewardGold: 500, xp: 1000, itemChance: 0.25 },
            { id: 'rq2', name: '野猪清理', description: '击杀4个赤脊山野猪', type: 'kill', target: '赤脊山野猪', count: 4, rewardGold: 560, xp: 1100, itemChance: 0.28 },
            { id: 'rq3', name: '刺客危机', description: '击杀3个黑石刺客', type: 'kill', target: '黑石刺客', count: 3, rewardGold: 600, xp: 1200, itemChance: 0.3 },
            { id: 'rq4', name: '狼人猎杀', description: '击杀5个赤脊山狼人', type: 'kill', target: '赤脊山狼人', count: 5, rewardGold: 580, xp: 1150, itemChance: 0.28 },
            { id: 'rq5', name: '萨满威胁', description: '击杀4个黑石萨满', type: 'kill', target: '黑石萨满', count: 4, rewardGold: 620, xp: 1250, itemChance: 0.32 },
            { id: 'rq6', name: '兽人队长', description: '击杀2个兽人队长', type: 'kill', target: '兽人队长', count: 2, rewardGold: 700, xp: 1400, itemChance: 0.35 },
            { id: 'rq7', name: '赤脊守卫', description: '累计击杀50个怪物', type: 'kill', target: 'all', count: 50, rewardGold: 1000, xp: 2000, itemChance: 0.4 }
        ]
    },
    duskwood: {
        name: '暮色森林',
        levelRange: '40-50',
        description: '被诅咒的黑暗森林',
        monsters: [
            { name: '食尸鬼', level: 40, hp: 2400, attack: 360, defense: 150, xp: 800, gold: 280 },
            { name: '狼人', level: 45, hp: 2850, attack: 420, defense: 174, xp: 950, gold: 330 },
            { name: '怨灵', level: 48, hp: 3150, attack: 465, defense: 195, xp: 1050, gold: 370 },
            { name: '黑暗潜行者', level: 43, hp: 2640, attack: 396, defense: 162, xp: 880, gold: 305 },
            { name: '暮色女巫', level: 47, hp: 3000, attack: 450, defense: 186, xp: 1000, gold: 360 },
            { name: '黑暗领主', level: 50, hp: 3450, attack: 495, defense: 210, xp: 1150, gold: 400 }
        ],
        quests: [
            { id: 'dq1', name: '清理亡灵', description: '击杀5个食尸鬼', type: 'kill', target: '食尸鬼', count: 5, rewardGold: 700, xp: 1400, itemChance: 0.3 },
            { id: 'dq2', name: '狼人猎杀', description: '击杀4个狼人', type: 'kill', target: '狼人', count: 4, rewardGold: 800, xp: 1600, itemChance: 0.32 },
            { id: 'dq3', name: '怨灵驱散', description: '击杀5个怨灵', type: 'kill', target: '怨灵', count: 5, rewardGold: 850, xp: 1700, itemChance: 0.35 },
            { id: 'dq4', name: '潜行者清除', description: '击杀4个黑暗潜行者', type: 'kill', target: '黑暗潜行者', count: 4, rewardGold: 820, xp: 1640, itemChance: 0.33 },
            { id: 'dq5', name: '女巫讨伐', description: '击杀3个暮色女巫', type: 'kill', target: '暮色女巫', count: 3, rewardGold: 900, xp: 1800, itemChance: 0.35 },
            { id: 'dq6', name: '黑暗领主', description: '击杀2个黑暗领主', type: 'kill', target: '黑暗领主', count: 2, rewardGold: 1000, xp: 2000, itemChance: 0.4 },
            { id: 'dq7', name: '暮色守卫', description: '累计击杀60个怪物', type: 'kill', target: 'all', count: 60, rewardGold: 1500, xp: 3000, itemChance: 0.42 }
        ]
    },
    wetlands: {
        name: '湿地',
        levelRange: '50-60',
        description: '沼泽地带',
        monsters: [
            { name: '巨龙幼龙', level: 50, hp: 3600, attack: 540, defense: 225, xp: 1200, gold: 420 },
            { name: '沼泽爬行者', level: 55, hp: 4200, attack: 600, defense: 255, xp: 1400, gold: 490 },
            { name: '黑龙卫士', level: 58, hp: 4650, attack: 660, defense: 285, xp: 1550, gold: 540 },
            { name: '龙人巫师', level: 53, hp: 3900, attack: 570, defense: 240, xp: 1300, gold: 455 },
            { name: '沼泽领主', level: 57, hp: 4500, attack: 645, defense: 270, xp: 1500, gold: 525 },
            { name: '黑龙督军', level: 60, hp: 5100, attack: 720, defense: 315, xp: 1700, gold: 600 }
        ],
        quests: [
            { id: 'weq1', name: '龙之威胁', description: '击杀4个巨龙幼龙', type: 'kill', target: '巨龙幼龙', count: 4, rewardGold: 1000, xp: 2000, itemChance: 0.35 },
            { id: 'weq2', name: '沼泽清理', description: '击杀5个沼泽爬行者', type: 'kill', target: '沼泽爬行者', count: 5, rewardGold: 1150, xp: 2300, itemChance: 0.38 },
            { id: 'weq3', name: '黑龙入侵', description: '击杀4个黑龙卫士', type: 'kill', target: '黑龙卫士', count: 4, rewardGold: 1200, xp: 2400, itemChance: 0.4 },
            { id: 'weq4', name: '巫师危机', description: '击杀5个龙人巫师', type: 'kill', target: '龙人巫师', count: 5, rewardGold: 1100, xp: 2200, itemChance: 0.37 },
            { id: 'weq5', name: '沼泽领主', description: '击杀3个沼泽领主', type: 'kill', target: '沼泽领主', count: 3, rewardGold: 1250, xp: 2500, itemChance: 0.4 },
            { id: 'weq6', name: '黑龙督军', description: '击杀2个黑龙督军', type: 'kill', target: '黑龙督军', count: 2, rewardGold: 1400, xp: 2800, itemChance: 0.42 },
            { id: 'weq7', name: '湿地守卫', description: '累计击杀70个怪物', type: 'kill', target: 'all', count: 70, rewardGold: 2000, xp: 4000, itemChance: 0.45 }
        ]
    },
    hellfire: {
        name: '地狱火半岛',
        levelRange: '60-70',
        description: '燃烧军团的前哨',
        monsters: [
            { name: '地狱犬', level: 60, hp: 5400, attack: 840, defense: 330, xp: 1800, gold: 650 },
            { name: '恶魔守卫', level: 65, hp: 6300, attack: 960, defense: 390, xp: 2100, gold: 750 },
            { name: '虚空行者', level: 68, hp: 6900, attack: 1050, defense: 435, xp: 2300, gold: 820 },
            { name: '末日使者', level: 63, hp: 5850, attack: 900, defense: 360, xp: 1950, gold: 700 },
            { name: '深渊领主', level: 67, hp: 6750, attack: 1020, defense: 420, xp: 2250, gold: 800 },
            { name: '魔王', level: 70, hp: 7500, attack: 1140, defense: 480, xp: 2500, gold: 950 }
        ],
        quests: [
            { id: 'hq1', name: '对抗恶魔', description: '击杀5个地狱犬', type: 'kill', target: '地狱犬', count: 5, rewardGold: 1500, xp: 3000, itemChance: 0.4 },
            { id: 'hq2', name: '守卫危机', description: '击杀5个恶魔守卫', type: 'kill', target: '恶魔守卫', count: 5, rewardGold: 1700, xp: 3400, itemChance: 0.42 },
            { id: 'hq3', name: '虚空威胁', description: '击杀4个虚空行者', type: 'kill', target: '虚空行者', count: 4, rewardGold: 1600, xp: 3200, itemChance: 0.4 },
            { id: 'hq4', name: '末日使者', description: '击杀5个末日使者', type: 'kill', target: '末日使者', count: 5, rewardGold: 1650, xp: 3300, itemChance: 0.41 },
            { id: 'hq5', name: '深渊领主', description: '击杀3个深渊领主', type: 'kill', target: '深渊领主', count: 3, rewardGold: 1800, xp: 3600, itemChance: 0.43 },
            { id: 'hq6', name: '魔王讨伐', description: '击杀2个魔王', type: 'kill', target: '魔王', count: 2, rewardGold: 2000, xp: 4000, itemChance: 0.45 },
            { id: 'hq7', name: '地狱火守卫', description: '累计击杀80个怪物', type: 'kill', target: 'all', count: 80, rewardGold: 3000, xp: 6000, itemChance: 0.48 }
        ]
    },
    netherstorm: {
        name: '虚空风暴',
        levelRange: '70-80',
        description: '虚空的中心',
        monsters: [
            { name: '虚空灵', level: 70, hp: 8400, attack: 1260, defense: 510, xp: 2800, gold: 1000 },
            { name: '虚灵强盗', level: 75, hp: 9600, attack: 1440, defense: 585, xp: 3200, gold: 1150 },
            { name: '虚空领主', level: 78, hp: 10800, attack: 1620, defense: 660, xp: 3600, gold: 1300 },
            { name: '元素召唤师', level: 73, hp: 9000, attack: 1350, defense: 540, xp: 3000, gold: 1080 },
            { name: '虚空巫师', level: 77, hp: 10500, attack: 1560, defense: 630, xp: 3500, gold: 1250 },
            { name: '虚空之主', level: 80, hp: 12000, attack: 1800, defense: 750, xp: 4000, gold: 1500 }
        ],
        quests: [
            { id: 'nq1', name: '虚空威胁', description: '击杀4个虚空灵', type: 'kill', target: '虚空灵', count: 4, rewardGold: 2000, xp: 4000, itemChance: 0.42 },
            { id: 'nq2', name: '强盗危机', description: '击杀5个虚灵强盗', type: 'kill', target: '虚灵强盗', count: 5, rewardGold: 2300, xp: 4600, itemChance: 0.44 },
            { id: 'nq3', name: '领主讨伐', description: '击杀4个虚空领主', type: 'kill', target: '虚空领主', count: 4, rewardGold: 2200, xp: 4400, itemChance: 0.43 },
            { id: 'nq4', name: '元素威胁', description: '击杀5个元素召唤师', type: 'kill', target: '元素召唤师', count: 5, rewardGold: 2100, xp: 4200, itemChance: 0.43 },
            { id: 'nq5', name: '巫师清除', description: '击杀4个虚空巫师', type: 'kill', target: '虚空巫师', count: 4, rewardGold: 2400, xp: 4800, itemChance: 0.45 },
            { id: 'nq6', name: '虚空之主', description: '击杀2个虚空之主', type: 'kill', target: '虚空之主', count: 2, rewardGold: 2800, xp: 5600, itemChance: 0.48 },
            { id: 'nq7', name: '虚空守卫', description: '累计击杀90个怪物', type: 'kill', target: 'all', count: 90, rewardGold: 4000, xp: 8000, itemChance: 0.5 }
        ]
    },
    icecrown: {
        name: '冰冠冰川',
        levelRange: '80',
        description: '巫妖王的领地',
        monsters: [
            { name: '天灾食尸鬼', level: 80, hp: 13500, attack: 1950, defense: 840, xp: 4500, gold: 1800 },
            { name: '冰霜巨龙', level: 80, hp: 15600, attack: 2250, defense: 960, xp: 5200, gold: 2100 },
            { name: '巫妖王使者', level: 80, hp: 18000, attack: 2550, defense: 1110, xp: 6000, gold: 2500 },
            { name: '死亡骑士', level: 80, hp: 17400, attack: 2460, defense: 1050, xp: 5800, gold: 2400 },
            { name: '亡灵大法师', level: 80, hp: 18600, attack: 2640, defense: 1170, xp: 6200, gold: 2600 },
            { name: '阿尔萨斯之影', level: 80, hp: 22500, attack: 3000, defense: 1350, xp: 7500, gold: 3500 }
        ],
        quests: [
            { id: 'iq1', name: '对抗天灾', description: '击杀5个天灾食尸鬼', type: 'kill', target: '天灾食尸鬼', count: 5, rewardGold: 3000, xp: 6000, itemChance: 0.45 },
            { id: 'iq2', name: '龙之威胁', description: '击杀5个冰霜巨龙', type: 'kill', target: '冰霜巨龙', count: 5, rewardGold: 3500, xp: 7000, itemChance: 0.48 },
            { id: 'iq3', name: '使者讨伐', description: '击杀4个巫妖王使者', type: 'kill', target: '巫妖王使者', count: 4, rewardGold: 3800, xp: 7600, itemChance: 0.5 },
            { id: 'iq4', name: '死亡骑士', description: '击杀5个死亡骑士', type: 'kill', target: '死亡骑士', count: 5, rewardGold: 3600, xp: 7200, itemChance: 0.48 },
            { id: 'iq5', name: '亡灵大法师', description: '击杀4个亡灵大法师', type: 'kill', target: '亡灵大法师', count: 4, rewardGold: 4000, xp: 8000, itemChance: 0.5 },
            { id: 'iq6', name: '阿尔萨斯之影', description: '击杀3个阿尔萨斯之影', type: 'kill', target: '阿尔萨斯之影', count: 3, rewardGold: 5000, xp: 10000, itemChance: 0.55 },
            { id: 'iq7', name: '冰冠守卫', description: '累计击杀100个怪物', type: 'kill', target: 'all', count: 100, rewardGold: 6000, xp: 12000, itemChance: 0.55 }
        ]
    }
};

// 初始化游戏
function initGame() {
    loadGame();
    updateUI();
    renderDungeons();
    renderAchievements();
    renderWildMonsters();
    renderQuests();
    startRandomEventTimer();
}

// 随机事件系统
let randomEventTimer = null;
let autoHuntCount = 0;

const RANDOM_EVENTS = [
    {
        id: 'treasure_chest',
        name: '💎 宝藏宝箱',
        description: '你发现了一个隐藏的宝箱！',
        positive: true,
        effect: (eventData) => {
            const goldReward = Math.floor(Math.random() * 500) + 100;
            gameState.gold += goldReward;
            updateAchievementProgress('gold', goldReward);
            return `打开宝箱获得 ${goldReward} 金币！`;
        }
    },
    {
        id: 'wandering_merchant',
        name: '🧙‍♂️ 流浪商人',
        description: '一个神秘的商人经过...',
        positive: true,
        effect: (eventData) => {
            const options = [
                () => {
                    if (gameState.materials.ore >= 10) {
                        gameState.materials.ore -= 10;
                        gameState.materials.dust += 5;
                        return '用10矿石交换了5灵魂之尘';
                    }
                    return '矿石不足，无法交换';
                },
                () => {
                    if (gameState.materials.fish >= 10) {
                        gameState.materials.fish -= 10;
                        gameState.materials.gem += 2;
                        return '用10鱼交换了2宝石';
                    }
                    return '鱼不足，无法交换';
                },
                () => {
                    const goldCost = 200;
                    if (gameState.gold >= goldCost) {
                        gameState.gold -= goldCost;
                        const quality = Math.random() < 0.3 ? 'epic' : Math.random() < 0.6 ? 'rare' : 'uncommon';
                        const item = generateGodItemByQuality(gameState.team.reduce((max, c) => Math.max(max, c.level), 1), quality);
                        pendingLoot.push(item);
                        showLootModal();
                        return `花费${goldCost}金币购买了${item.name}`;
                    }
                    return '金币不足，无法购买装备';
                }
            ];
            return options[Math.floor(Math.random() * options.length)]();
        }
    },
    {
        id: 'monster_ambush',
        name: '⚔️ 怪物埋伏',
        description: '突然遭到怪物埋伏！',
        positive: false,
        effect: (eventData) => {
            const damagePercent = 0.1 + Math.random() * 0.2;
            gameState.team.forEach(char => {
                if (!char.dead) {
                    char.hp = Math.max(1, char.hp * (1 - damagePercent));
                }
            });
            return `团队受到${Math.floor(damagePercent * 100)}%伤害，生命值下降！`;
        }
    },
    {
        id: 'mysterious_shrine',
        name: '✨ 神秘祭坛',
        description: '发现了一个古老的祭坛',
        positive: true,
        effect: (eventData) => {
            const effects = [
                () => {
                    gameState.upgrades.attack += 1;
                    return '获得1点攻击强化！';
                },
                () => {
                    gameState.upgrades.defense += 1;
                    return '获得1点防御强化！';
                },
                () => {
                    gameState.team.forEach(char => {
                        if (!char.dead) {
                            const stats = calculateCharacterStats(char);
                            char.hp = stats.hp;
                        }
                    });
                    return '团队生命值完全恢复！';
                },
                () => {
                    const zone = ZONES[gameState.currentZone];
                    const avgLevel = zone.monsters.reduce((sum, m) => sum + m.level, 0) / zone.monsters.length;
                    const item = generateWildLoot(Math.floor(avgLevel));
                    if (item) {
                        pendingLoot.push(item);
                        showLootModal();
                        return `祭坛赐予了一件装备：${item.name}！`;
                    }
                    return '祭坛什么也没给...';
                }
            ];
            return effects[Math.floor(Math.random() * effects.length)]();
        }
    },
    {
        id: 'rainstorm',
        name: '🌧️ 暴雨',
        description: '突如其来的暴风雨',
        positive: false,
        effect: (eventData) => {
            gameState.materials.fish = Math.floor(gameState.materials.fish * 0.5);
            return '鱼被水冲走了一半！';
        }
    },
    {
        id: 'lucky_day',
        name: '🍀 幸运日',
        description: '今天是个好日子！',
        positive: true,
        effect: (eventData) => {
            const goldBonus = 500;
            gameState.gold += goldBonus;
            updateAchievementProgress('gold', goldBonus);
            return '获得了500金币幸运奖励！';
        }
    },
    {
        id: 'lost_equipment',
        name: '😢 装备丢失',
        description: '不小心丢失了一些装备',
        positive: false,
        effect: (eventData) => {
            if (gameState.inventory.length > 0) {
                const lostIndex = Math.floor(Math.random() * gameState.inventory.length);
                const lostItem = gameState.inventory[lostIndex];
                gameState.inventory.splice(lostIndex, 1);
                return `丢失了装备：${lostItem.name}...`;
            }
            return '没有装备可丢失，逃过一劫';
        }
    },
    {
        id: 'wise_hermit',
        name: '🧙‍♂️ 智慧隐士',
        description: '一位隐士分享了智慧',
        positive: true,
        effect: (eventData) => {
            const xpBonus = 100;
            gameState.team.forEach(char => {
                if (!char.dead) {
                    char.xp += xpBonus;
                    checkLevelUp(char);
                }
            });
            return `每位角色获得${xpBonus}经验值！`;
        }
    },
    {
        id: 'bandit_attack',
        name: '🗡️ 强盗袭击',
        description: '强盗试图抢劫你！',
        positive: false,
        effect: (eventData) => {
            const goldLoss = Math.min(gameState.gold, Math.floor(Math.random() * 300) + 100);
            gameState.gold -= goldLoss;
            return `被强盗抢走了${goldLoss}金币！`;
        }
    },
    {
        id: 'mysterious_potion',
        name: '🧪 神秘药水',
        description: '发现了一瓶神秘的药水',
        positive: true,
        effect: (eventData) => {
            const potions = [
                () => {
                    gameState.team.forEach(char => {
                        if (!char.dead) {
                            const stats = calculateCharacterStats(char);
                            char.hp = Math.min(char.hp * 1.5, stats.hp);
                        }
                    });
                    return '喝了生命药水，生命值恢复50%！';
                },
                () => {
                    gameState.upgrades.attack += 2;
                    return '喝了力量药水，攻击强化+2！';
                },
                () => {
                    gameState.upgrades.defense += 2;
                    return '喝了坚韧药水，防御强化+2！';
                }
            ];
            return potions[Math.floor(Math.random() * potions.length)]();
        }
    },
    {
        id: 'dark_forest',
        name: '🌲 黑暗森林',
        description: '迷失在黑暗森林中',
        positive: false,
        effect: (eventData) => {
            gameState.materials.ore = Math.max(0, gameState.materials.ore - 5);
            gameState.materials.fish = Math.max(0, gameState.materials.fish - 5);
            return '迷路过程中丢失了一些材料...';
        }
    },
    {
        id: 'celebration',
        name: '🎉 节日庆祝',
        description: '今天是盛大节日！',
        positive: true,
        effect: (eventData) => {
            const rewards = [
                () => {
                    gameState.materials.fish += 50;
                    gameState.materials.ore += 50;
                    gameState.materials.dust += 30;
                    gameState.materials.gem += 20;
                    return '节日礼物：获得各种材料！';
                },
                () => {
                    const item = generateGodItemByQuality(gameState.team.reduce((max, c) => Math.max(max, c.level), 1), 'epic');
                    pendingLoot.push(item);
                    showLootModal();
                    return '节日抽奖：获得史诗装备！';
                },
                () => {
                    gameState.gold += 1000;
                    updateAchievementProgress('gold', 1000);
                    return '节日红包：获得1000金币！';
                }
            ];
            return rewards[Math.floor(Math.random() * rewards.length)]();
        }
    },
    {
        id: 'ancient_tome',
        name: '📚 古老典籍',
        description: '发现了一本古老典籍',
        positive: true,
        effect: (eventData) => {
            const knowledge = [
                () => {
                    gameState.upgrades.attack += 3;
                    gameState.upgrades.defense += 3;
                    return '学会了战斗技巧：攻击+3，防御+3！';
                },
                () => {
                    gameState.professions.fishing += 10;
                    gameState.professions.mining += 10;
                    return '学会了生活技能：钓鱼+10，采矿+10！';
                }
            ];
            return knowledge[Math.floor(Math.random() * knowledge.length)]();
        }
    },
    {
        id: 'equipment_break',
        name: '💔 装备损坏',
        description: '装备突然损坏了',
        positive: false,
        effect: (eventData) => {
            if (gameState.inventory.length > 0) {
                const brokenIndex = Math.floor(Math.random() * gameState.inventory.length);
                const brokenItem = gameState.inventory[brokenIndex];
                if (brokenItem.enhance > 0) {
                    brokenItem.enhance = Math.max(0, brokenItem.enhance - 1);
                    brokenItem.attack = Math.floor(brokenItem.attack / 1.1);
                    brokenItem.defense = Math.floor(brokenItem.defense / 1.1);
                    brokenItem.hp = Math.floor(brokenItem.hp / 1.1);
                    return `装备${brokenItem.name}的强化等级降低了！`;
                }
            }
            return '没有可损坏的强化装备';
        }
    },
    {
        id: 'magical_crystal',
        name: '💎 魔法水晶',
        description: '发现了一块魔水晶',
        positive: true,
        effect: (eventData) => {
            const crystalEffects = [
                () => {
                    gameState.upgrades.speed += 1;
                    return '水晶蕴含速度之力：速度+1！';
                },
                () => {
                    gameState.team.forEach(char => {
                        if (!char.dead) {
                            const stats = calculateCharacterStats(char);
                            char.attack = stats.attack + 10;
                            char.defense = stats.defense + 10;
                        }
                    });
                    return '水晶蕴含力量：全队攻击+10，防御+10！';
                }
            ];
            return crystalEffects[Math.floor(Math.random() * crystalEffects.length)]();
        }
    },
    {
        id: 'monster_migration',
        name: '🦅 怪物迁徙',
        description: '怪物大规模迁徙',
        positive: false,
        effect: (eventData) => {
            const teamDamage = 0.15;
            gameState.team.forEach(char => {
                if (!char.dead) {
                    char.hp = Math.max(1, char.hp * (1 - teamDamage));
                }
            });
            return `遭受迁徙怪物袭击，团队生命值下降${Math.floor(teamDamage * 100)}%！`;
        }
    },
    {
        id: 'treasure_hunt',
        name: '🗺️ 寻宝游戏',
        description: '发现了寻宝图！',
        positive: true,
        effect: (eventData) => {
            const treasureType = Math.random();
            if (treasureType < 0.4) {
                const goldReward = Math.floor(Math.random() * 800) + 200;
                gameState.gold += goldReward;
                updateAchievementProgress('gold', goldReward);
                return `发现宝藏：获得${goldReward}金币！`;
            } else if (treasureType < 0.7) {
                gameState.materials.gem += 10;
                gameState.materials.dust += 20;
                return `发现宝藏：获得10宝石和20灵魂之尘！`;
            } else {
                const zone = ZONES[gameState.currentZone];
                const avgLevel = zone.monsters.reduce((sum, m) => sum + m.level, 0) / zone.monsters.length;
                const quality = Math.random() < 0.2 ? 'legendary' : Math.random() < 0.4 ? 'epic' : 'rare';
                const item = generateGodItemByQuality(Math.floor(avgLevel), quality);
                pendingLoot.push(item);
                showLootModal();
                return `发现宝藏：获得${item.name}！`;
            }
        }
    },
    {
        id: 'mystic_portal',
        name: '🌀 神秘传送门',
        description: '发现了一个神秘传送门',
        positive: true,
        effect: (eventData) => {
            const portalEffects = [
                () => {
                    const xpBonus = 200;
                    gameState.team.forEach(char => {
                        if (!char.dead) {
                            char.xp += xpBonus;
                            checkLevelUp(char);
                        }
                    });
                    return `传送门带回了经验：每位角色获得${xpBonus}经验！`;
                },
                () => {
                    gameState.gold += 1500;
                    updateAchievementProgress('gold', 1500);
                    return '传送门连接到金币世界：获得1500金币！';
                }
            ];
            return portalEffects[Math.floor(Math.random() * portalEffects.length)]();
        }
    },
    {
        id: 'food_shortage',
        name: '🍞 食物短缺',
        description: '遭遇食物短缺',
        positive: false,
        effect: (eventData) => {
            const lostMaterials = Math.floor(Math.random() * 15) + 5;
            gameState.materials.fish = Math.max(0, gameState.materials.fish - lostMaterials);
            return `食物短缺，损失了${lostMaterials}条鱼！`;
        }
    }
];

// 按品质生成装备（上帝模式用）
function generateGodItemByQuality(level, quality) {
    const qualityInfo = ITEM_QUALITIES[quality];
    const slot = EQUIPMENT_SLOTS[Math.floor(Math.random() * EQUIPMENT_SLOTS.length)];
    const baseValue = level * 2;

    const equipment = {
        id: Date.now() + Math.random(),
        name: `${qualityInfo.name}${slot === 'weapon' ? '武器' : slot === 'helmet' ? '头盔' : slot === 'chest' ? '胸甲' : slot === 'legs' ? '护腿' : slot === 'gloves' ? '手套' : slot === 'boots' ? '靴子' : slot === 'necklace' ? '项链' : '戒指'}`,
        slot: slot,
        quality: quality,
        level: level,
        attack: slot === 'weapon' || slot === 'ring1' || slot === 'ring2' || slot === 'necklace' ? Math.floor(baseValue * qualityInfo.multiplier) : 0,
        defense: slot !== 'weapon' ? Math.floor(baseValue * qualityInfo.multiplier) : 0,
        hp: slot === 'chest' || slot === 'legs' ? Math.floor(baseValue * qualityInfo.multiplier * 2) : 0,
        enhance: 0
    };

    return equipment;
}

// 启动随机事件定时器
function startRandomEventTimer() {
    if (randomEventTimer) {
        clearInterval(randomEventTimer);
    }

    randomEventTimer = setInterval(() => {
        triggerRandomEvent();
    }, 60000); // 每60秒触发一次随机事件
}

// 触发随机事件
function triggerRandomEvent() {
    const eventChance = 0.3; // 30%概率触发
    if (Math.random() > eventChance) return;

    const event = RANDOM_EVENTS[Math.floor(Math.random() * RANDOM_EVENTS.length)];
    const result = event.effect();

    showRandomEvent(event, result);
}

// 显示随机事件
function showRandomEvent(event, result) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.style.zIndex = '10000';
    modal.innerHTML = `
        <div class="modal-content" style="max-width:500px;background:${event.positive ? 'linear-gradient(180deg, #1a3a2a 0%, #2a4a3a 100%)' : 'linear-gradient(180deg, #3a2a2a 0%, #4a3a3a 100%)'};">
            <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
            <h2 style="margin-top:0;font-size:2em;">${event.name}</h2>
            <p style="margin:15px 0;font-size:1.1em;">${event.description}</p>
            <div style="padding:15px;background:${event.positive ? 'rgba(74, 138, 74, 0.2)' : 'rgba(255, 107, 107, 0.2)'};border-radius:5px;margin-bottom:15px;">
                <p style="margin:0;font-weight:bold;font-size:1.2em;">${result}</p>
            </div>
            <button onclick="this.parentElement.parentElement.remove()" style="width:100%;padding:15px;background:linear-gradient(180deg,${event.positive ? '#4a6a4a' : '#6a4a4a'} 0%, ${event.positive ? '#3a5a3a' : '#5a3a3a'} 100%);border:2px solid ${event.positive ? '#6a8a6a' : '#8a6a6a'};color:#e0e0e0;border-radius:8px;cursor:pointer;font-size:1.1em;font-weight:bold;">
                确定
            </button>
        </div>
    `;
    document.body.appendChild(modal);

    saveGame();
    updateUI();
}

// 关闭随机事件
function closeRandomEvent() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (modal.innerHTML.includes('随机事件') || modal.querySelector('.modal-content').innerHTML.includes('宝藏') ||
            modal.querySelector('.modal-content').innerHTML.includes('商人') ||
            modal.querySelector('.modal-content').innerHTML.includes('祭坛') ||
            modal.querySelector('.modal-content').innerHTML.includes('药水')) {
            modal.remove();
        }
    });
}

// 更新自动狩猎计数
function updateAutoHuntCount() {
    autoHuntCount++;
    updateAchievementProgress('auto_hunt', 1);
}

// 添加角色
function addCharacter() {
    if (gameState.team.length >= 5) {
        alert('团队已满，最多5个角色！');
        return;
    }

    // 创建模态框
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-content" style="max-width:500px;">
            <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
            <h2>🎭 创建新角色</h2>
            
            <div style="margin:15px 0;">
                <label style="display:block;margin-bottom:5px;">角色名称：</label>
                <input type="text" id="char-name" placeholder="输入角色名称" style="width:100%;padding:8px;background:#2a2a4a;border:1px solid #4a4a6a;color:#e0e0e0;border-radius:5px;">
            </div>
            
            <div style="margin:15px 0;">
                <label style="display:block;margin-bottom:5px;">选择种族：</label>
                <select id="char-race" style="width:100%;padding:8px;background:#2a2a4a;border:1px solid #4a4a6a;color:#e0e0e0;border-radius:5px;">
                    ${Object.entries(RACES).map(([key, race]) => 
                        `<option value="${key}">${race.name}</option>`
                    ).join('')}
                </select>
            </div>
            
            <div style="margin:15px 0;">
                <label style="display:block;margin-bottom:5px;">选择职业：</label>
                <select id="char-class" onchange="updateTalents()" style="width:100%;padding:8px;background:#2a2a4a;border:1px solid #4a4a6a;color:#e0e0e0;border-radius:5px;">
                    ${Object.entries(CLASSES).map(([key, cls]) => 
                        `<option value="${key}">${cls.name}</option>`
                    ).join('')}
                </select>
            </div>
            
            <div style="margin:15px 0;">
                <label style="display:block;margin-bottom:5px;">选择天赋：</label>
                <select id="char-talent" style="width:100%;padding:8px;background:#2a2a4a;border:1px solid #4a4a6a;color:#e0e0e0;border-radius:5px;">
                </select>
            </div>
            
            <div id="talent-description" style="margin:15px 0;padding:10px;background:#1a1a2a;border:1px solid #3a3a5a;border-radius:5px;font-size:0.9em;">
            </div>
            
            <button onclick="confirmCreateCharacter()" style="width:100%;padding:12px;background:linear-gradient(180deg,#4a6a4a 0%,#3a5a3a 100%);border:2px solid #6a8a6a;color:#e0e0e0;border-radius:5px;cursor:pointer;transition:all 0.3s;">
                ✅ 创建角色
            </button>
        </div>
    `;
    
    document.body.appendChild(modal);
    updateTalents();
}

// 更新天赋选项
function updateTalents() {
    const classSelect = document.getElementById('char-class');
    const talentSelect = document.getElementById('char-talent');
    const descriptionDiv = document.getElementById('talent-description');
    
    if (!classSelect || !talentSelect) return;
    
    const selectedClass = classSelect.value;
    const classData = CLASSES[selectedClass];
    
    talentSelect.innerHTML = classData.talents.map(talent => 
        `<option value="${talent.id}">${talent.name} (${talent.role === 'tank' ? '坦克' : talent.role === 'healer' ? '治疗' : '输出'})</option>`
    ).join('');
    
    // 显示第一个天赋的描述
    descriptionDiv.innerHTML = `<strong>${classData.talents[0].name}</strong>：${classData.talents[0].description}`;
    
    talentSelect.onchange = () => {
        const selectedTalent = classData.talents.find(t => t.id === talentSelect.value);
        descriptionDiv.innerHTML = `<strong>${selectedTalent.name}</strong>：${selectedTalent.description}`;
    };
}

// 确认创建角色
function confirmCreateCharacter() {
    const name = document.getElementById('char-name').value.trim();
    if (!name) {
        alert('请输入角色名称！');
        return;
    }
    
    const race = document.getElementById('char-race').value;
    const classType = document.getElementById('char-class').value;
    const talent = document.getElementById('char-talent').value;
    
    const classData = CLASSES[classType];
    const talentData = classData.talents.find(t => t.id === talent);
    
    const character = {
        id: Date.now(),
        name: name,
        race: race,
        class: classType,
        talent: talent,
        talentRole: talentData.role,
        level: 1,
        xp: 0,
        hp: classData.baseStats.hp,
        maxHp: classData.baseStats.hp,
        attack: classData.baseStats.attack,
        defense: classData.baseStats.defense,
        equipment: {},
        buffs: [],
        cooldowns: {}
    };
    
    // 根据天赋调整属性
    if (talentData.role === 'tank') {
        character.defense = Math.floor(character.defense * 1.3);
        character.hp = Math.floor(character.hp * 1.2);
    } else if (talentData.role === 'healer') {
        character.attack = Math.floor(character.attack * 0.8);
    } else if (talentData.role === 'dps') {
        character.attack = Math.floor(character.attack * 1.2);
        character.defense = Math.floor(character.defense * 0.8);
    }
    
    gameState.team.push(character);
    saveGame();
    updateUI();
    
    // 关闭模态框
    document.querySelector('.modal:last-child').remove();
    
    alert(`角色 ${name} 创建成功！职业：${classData.name} | 天赋：${talentData.name} | 定位：${talentData.role === 'tank' ? '坦克' : talentData.role === 'healer' ? '治疗' : '输出'}`);
}

// 计算角色属性
function calculateCharacterStats(character) {
    const classInfo = CLASSES[character.class];
    const growth = classInfo.growth;

    // 应用属性成长倍率
    let baseAttack = classInfo.baseStats.attack + (character.level - 1) * growth.attack * gameState.multipliers.statGrowthRate;
    let baseDefense = classInfo.baseStats.defense + (character.level - 1) * growth.defense * gameState.multipliers.statGrowthRate;
    let baseHp = classInfo.baseStats.hp + (character.level - 1) * growth.hp * gameState.multipliers.statGrowthRate;

    // 装备加成
    let equipmentBonus = { attack: 0, defense: 0, hp: 0 };
    Object.values(character.equipment).forEach(item => {
        if (item) {
            equipmentBonus.attack += item.attack || 0;
            equipmentBonus.defense += item.defense || 0;
            equipmentBonus.hp += item.hp || 0;
        }
    });

    // 强化加成
    const attackUpgrade = gameState.upgrades.attack * 5;
    const defenseUpgrade = gameState.upgrades.defense * 5;
    const hpUpgrade = gameState.upgrades.defense * 50;

    // 专业加成
    const professionBonus = getProfessionBonus();

    // 成就加成
    const achievementBonuses = getAchievementBonuses();

    return {
        attack: Math.floor((baseAttack + equipmentBonus.attack + attackUpgrade + professionBonus.attack) * (1 + achievementBonuses.attack / 100)),
        defense: Math.floor((baseDefense + equipmentBonus.defense + defenseUpgrade + professionBonus.defense) * (1 + achievementBonuses.defense / 100)),
        hp: Math.floor((baseHp + equipmentBonus.hp + hpUpgrade + professionBonus.hp) * (1 + achievementBonuses.hp / 100))
    };
}

// 获取专业加成
function getProfessionBonus() {
    let bonus = { attack: 0, defense: 0, hp: 0 };

    // 钓鱼加成（每级增加少量属性）
    bonus.hp += Math.floor(gameState.professions.fishing * 0.5);

    // 采矿加成（每级增加少量防御和生命）
    bonus.defense += Math.floor(gameState.professions.mining * 0.3);
    bonus.hp += Math.floor(gameState.professions.mining * 0.5);

    return bonus;
}

// 获取成就加成
function getAchievementBonuses() {
    let bonuses = { attack: 0, defense: 0, hp: 0 };
    gameState.achievements.forEach(achId => {
        const ach = ACHIEVEMENTS.find(a => a.id === achId);
        if (ach && ach.reward) {
            bonuses.attack += ach.reward.attack || 0;
            bonuses.defense += ach.reward.defense || 0;
            bonuses.hp += ach.reward.hp || 0;
        }
    });
    return bonuses;
}

// 更新UI
function updateUI() {
    document.getElementById('gold').textContent = gameState.gold;
    document.getElementById('team-count').textContent = gameState.team.filter(c => !c.dead).length;

    // 更新团队面板
    renderTeam();

    // 更新状态面板
    updateStatsPanel();

    // 更新材料面板
    updateMaterialsPanel();

    // 更新技能显示
    renderSkills();

    // 更新装备背包
    renderInventory();

    // 更新专业面板
    updateProfessionPanel();

    // 更新强化面板
    updateUpgradePanel();

    // 更新成就面板
    renderAchievements();
}

// 渲染团队
function renderTeam() {
    const teamPanel = document.getElementById('team-panel');
    teamPanel.innerHTML = '';

    gameState.team.forEach((character, index) => {
        const stats = calculateCharacterStats(character);
        const raceName = RACES[character.race]?.name || '未知';
        const className = CLASSES[character.class].name;
        const talentInfo = CLASSES[character.class].talents.find(t => t.id === character.talent);
        const talentName = talentInfo ? talentInfo.name : '未知';
        const roleEmoji = character.talentRole === 'tank' ? '🛡️' : character.talentRole === 'healer' ? '💚' : '⚔️';

        const card = document.createElement('div');
        
        if (character.dead) {
            // 死亡角色显示
            card.className = `character-card ${character.class}`;
            card.style.opacity = '0.6';
            card.style.filter = 'grayscale(100%)';
            card.style.border = '2px solid #555';
            card.innerHTML = `
                <div class="character-name">💀 ${character.name} (已阵亡)</div>
                <div class="character-class">${raceName} ${className} | ${talentName} | Lv.${character.level}</div>
                <div class="character-stats">
                    <div class="stat-row"><span>❤️ 生命:</span><span style="color:#ff4444;">0/${stats.hp}</span></div>
                    <div class="stat-row"><span>⚔️ 攻击:</span><span>${stats.attack}</span></div>
                    <div class="stat-row"><span>🛡️ 防御:</span><span>${stats.defense}</span></div>
                </div>
                <div style="margin-top:8px;">
                    <button onclick="event.stopPropagation();reviveCharacter(${index})" style="width:100%;padding:8px;font-size:0.9em;background:linear-gradient(180deg,#4a8a4a 0%,#3a7a3a 100%);border:1px solid #6aaa6a;color:#e0e0e0;border-radius:5px;cursor:pointer;">✨ 复活 (${Math.floor(character.level * 10)}金币)</button>
                </div>
            `;
        } else {
            // 存活角色显示
            card.className = `character-card ${character.class}`;
            card.style.cursor = 'pointer';
            card.innerHTML = `
                <div class="character-name">${roleEmoji} ${character.name}</div>
                <div class="character-class">${raceName} ${className} | ${talentName} | Lv.${character.level}</div>
                <div class="character-stats">
                    <div class="stat-row"><span>❤️ 生命:</span><span>${Math.floor(character.hp)}/${stats.hp}</span></div>
                    <div class="stat-row"><span>⚔️ 攻击:</span><span>${stats.attack}</span></div>
                    <div class="stat-row"><span>🛡️ 防御:</span><span>${stats.defense}</span></div>
                </div>
                <div style="display:flex;gap:5px;margin-top:8px;">
                    <button onclick="event.stopPropagation();showCharacterDetail(${index})" style="flex:1;padding:5px;font-size:0.8em;background:linear-gradient(180deg,#4a6a8a 0%,#3a5a7a 100%);border:1px solid #6a8aaa;color:#e0e0e0;border-radius:3px;cursor:pointer;">详情</button>
                    <button onclick="event.stopPropagation();showTalentSelector(${index})" style="flex:1;padding:5px;font-size:0.8em;background:linear-gradient(180deg,#8a6a4a 0%,#7a5a3a 100%);border:1px solid #aa8a6a;color:#e0e0e0;border-radius:3px;cursor:pointer;">天赋</button>
                </div>
            `;
            card.onclick = () => showCharacterDetail(index);
        }
        teamPanel.appendChild(card);
    });
}

// 显示角色详情
function showCharacterDetail(index) {
    const character = gameState.team[index];
    if (!character) return;

    const stats = calculateCharacterStats(character);
    const raceName = RACES[character.race]?.name || '未知';
    const className = CLASSES[character.class].name;
    const classInfo = CLASSES[character.class];
    const talentInfo = classInfo.talents.find(t => t.id === character.talent);
    const talentName = talentInfo ? talentInfo.name : '未知';
    const roleEmoji = character.talentRole === 'tank' ? '🛡️' : character.talentRole === 'healer' ? '💚' : '⚔️';
    const roleText = character.talentRole === 'tank' ? '坦克' : character.talentRole === 'healer' ? '治疗' : '输出';

    const xpNeeded = character.level * 100;
    const xpPercent = Math.min(100, (character.xp / xpNeeded) * 100).toFixed(1);

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-content" style="max-width:500px;">
            <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
            <h2>🎭 ${character.name}</h2>

            <div style="margin:15px 0;padding:10px;background:#1a1a2a;border:1px solid #3a3a5a;border-radius:5px;">
                <h3>基本信息</h3>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px;">
                    <div>🏃 种族: ${raceName}</div>
                    <div>⚔️ 职业: <span style="color:${classInfo.color};font-weight:bold;">${className}</span></div>
                    <div>📊 天赋: <span style="color:#ffd700;cursor:pointer;text-decoration:underline;" onclick="showTalentSelector(${index})">${talentName}</span></div>
                    <div>🎯 定位: ${roleEmoji} ${roleText}</div>
                </div>
            </div>

            <div style="margin:15px 0;padding:10px;background:#1a1a2a;border:1px solid #3a3a5a;border-radius:5px;">
                <h3>角色属性</h3>
                <div style="margin-top:10px;">
                    <div style="margin-bottom:5px;">
                        <span>❤️ 等级: ${character.level}/100</span>
                        <span style="margin-left:20px;">⭐ 经验: ${character.xp}/${xpNeeded} (${xpPercent}%)</span>
                    </div>
                    <div style="background:#2a2a2a;height:10px;border-radius:5px;margin-top:5px;overflow:hidden;">
                        <div style="background:linear-gradient(90deg,#4a8a4a 0%,#6aaa6a 100%);width:${xpPercent}%;height:100%;"></div>
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-top:15px;">
                        <div style="text-align:center;padding:10px;background:#2a2a2a;border-radius:5px;">
                            <div style="color:#ff6b6b;font-size:1.2em;">❤️</div>
                            <div style="margin-top:5px;">生命</div>
                            <div style="color:#ffd700;font-weight:bold;">${Math.floor(character.hp)}/${stats.hp}</div>
                        </div>
                        <div style="text-align:center;padding:10px;background:#2a2a2a;border-radius:5px;">
                            <div style="color:#ff8c00;font-size:1.2em;">⚔️</div>
                            <div style="margin-top:5px;">攻击</div>
                            <div style="color:#ffd700;font-weight:bold;">${stats.attack}</div>
                        </div>
                        <div style="text-align:center;padding:10px;background:#2a2a2a;border-radius:5px;">
                            <div style="color:#87ceeb;font-size:1.2em;">🛡️</div>
                            <div style="margin-top:5px;">防御</div>
                            <div style="color:#ffd700;font-weight:bold;">${stats.defense}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div style="margin:15px 0;padding:10px;background:#1a1a2a;border:1px solid #3a3a5a;border-radius:5px;">
                <h3>装备信息</h3>
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:10px;">
                    ${EQUIPMENT_SLOTS.map(slot => {
                        const slotName = slot === 'weapon' ? '武器' :
                                       slot === 'helmet' ? '头盔' :
                                       slot === 'chest' ? '胸甲' :
                                       slot === 'legs' ? '护腿' :
                                       slot === 'gloves' ? '手套' :
                                       slot === 'boots' ? '靴子' :
                                       slot === 'necklace' ? '项链' :
                                       slot === 'ring1' ? '戒指1' :
                                       slot === 'ring2' ? '戒指2' : slot;
                        const equipment = character.equipment[slot];
                        return `
                            <div style="padding:10px;background:${equipment ? getEquipmentColor(equipment.quality) + '22' : '#2a2a2a'};border:1px solid ${equipment ? getEquipmentColor(equipment.quality) : '#3a3a5a'};border-radius:5px;min-height:80px;">
                                <div style="font-size:0.8em;color:#888;margin-bottom:5px;">${slotName}</div>
                                ${equipment ? `
                                    <div style="font-size:0.85em;font-weight:bold;color:${getEquipmentColor(equipment.quality)};">${equipment.name}</div>
                                    <div style="font-size:0.8em;margin-top:3px;">
                                        ${equipment.attack ? `⚔️${equipment.attack} ` : ''}
                                        ${equipment.defense ? `🛡️${equipment.defense} ` : ''}
                                        ${equipment.hp ? `❤️${equipment.hp}` : ''}
                                    </div>
                                    ${equipment.enhance > 0 ? `<div style="font-size:0.8em;color:#ffd700;">+${equipment.enhance}</div>` : ''}
                                ` : `<div style="font-size:0.8em;color:#666;">空</div>`}
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>

            <button onclick="this.parentElement.parentElement.remove()" style="width:100%;padding:10px;background:linear-gradient(180deg,#4a6a4a 0%,#3a5a3a 100%);border:1px solid #6a8a6a;color:#e0e0e0;border-radius:5px;cursor:pointer;">关闭</button>
        </div>
    `;
    document.body.appendChild(modal);
}

// 显示天赋选择器
function showTalentSelector(characterIndex) {
    const character = gameState.team[characterIndex];
    if (!character) return;

    const classInfo = CLASSES[character.class];
    const classColor = classInfo.color;

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-content" style="max-width:800px;">
            <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
            <h2 style="color:${classColor}">🎭 ${classInfo.name} 天赋树</h2>

            <div style="margin:15px 0;padding:10px;background:#1a1a2a;border:1px solid ${classColor}33;border-radius:5px;">
                <p style="margin:0;color:#aaa;">选择一个天赋专精，不同的天赋会影响角色的属性和定位</p>
            </div>

            <div style="display:flex;gap:20px;flex-wrap:wrap;">
                ${classInfo.talents.map((talent, idx) => {
                    const isSelected = character.talent === talent.id;
                    const roleIcon = talent.role === 'tank' ? '🛡️' : talent.role === 'healer' ? '💚' : '⚔️';
                    const roleText = talent.role === 'tank' ? '坦克' : talent.role === 'healer' ? '治疗' : '输出';

                    return `
                        <div style="flex:1;min-width:220px;padding:15px;background:${isSelected ? classColor + '22' : '#1a1a2a'};border:2px solid ${isSelected ? classColor : '#3a3a5a'};border-radius:10px;cursor:pointer;transition:all 0.3s;"
                             onclick="selectTalent(${characterIndex}, '${talent.id}')"
                             onmouseenter="this.style.background='${classColor}33';this.style.transform='scale(1.02)'"
                             onmouseleave="this.style.background='${isSelected ? classColor + '22' : '#1a1a2a'}';this.style.transform='scale(1)'">
                            <div style="display:flex;align-items:center;margin-bottom:10px;">
                                <div style="font-size:2em;margin-right:10px;">${roleIcon}</div>
                                <div>
                                    <div style="font-size:1.2em;font-weight:bold;color:${classColor};">${talent.name}</div>
                                    <div style="font-size:0.9em;color:#888;">${roleText}</div>
                                </div>
                            </div>
                            <div style="color:#aaa;font-size:0.9em;line-height:1.5;">
                                ${talent.description}
                            </div>
                            ${isSelected ? `
                                <div style="margin-top:10px;padding:5px;background:${classColor};color:#fff;text-align:center;border-radius:5px;font-weight:bold;">
                                    ✓ 当前天赋
                                </div>
                            ` : ''}
                        </div>
                    `;
                }).join('')}
            </div>

            <div style="margin:20px 0;padding:15px;background:#2a2a2a;border:1px solid #3a3a5a;border-radius:5px;">
                <h3 style="margin-top:0;color:#ffd700;">📊 天赋加成说明</h3>
                <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:15px;margin-top:15px;">
                    <div style="padding:10px;background:#1a1a2a;border-radius:5px;">
                        <div style="color:#ff6b6b;font-size:1.5em;margin-bottom:5px;">🛡️</div>
                        <div style="font-weight:bold;color:#ff6b6b;">坦克</div>
                        <div style="font-size:0.85em;color:#aaa;margin-top:5px;">
                            防御 +30%<br>
                            生命 +20%<br>
                            更容易吸引仇恨
                        </div>
                    </div>
                    <div style="padding:10px;background:#1a1a2a;border-radius:5px;">
                        <div style="color:#4ade80;font-size:1.5em;margin-bottom:5px;">💚</div>
                        <div style="font-weight:bold;color:#4ade80;">治疗</div>
                        <div style="font-size:0.85em;color:#aaa;margin-top:5px;">
                            攻击 -20%<br>
                            可以使用治疗技能<br>
                            恢复团队生命
                        </div>
                    </div>
                    <div style="padding:10px;background:#1a1a2a;border-radius:5px;">
                        <div style="color:#ff8c00;font-size:1.5em;margin-bottom:5px;">⚔️</div>
                        <div style="font-weight:bold;color:#ff8c00;">输出</div>
                        <div style="font-size:0.85em;color:#aaa;margin-top:5px;">
                            攻击 +20%<br>
                            防御 -20%<br>
                            造成最大伤害
                        </div>
                    </div>
                </div>
            </div>

            <button onclick="this.parentElement.parentElement.remove()" style="width:100%;padding:12px;background:linear-gradient(180deg,#4a6a4a 0%,#3a5a3a 100%);border:1px solid #6a8a6a;color:#e0e0e0;border-radius:5px;cursor:pointer;font-size:1.1em;">关闭</button>
        </div>
    `;
    document.body.appendChild(modal);
}

// 选择天赋
function selectTalent(characterIndex, talentId) {
    const character = gameState.team[characterIndex];
    const classInfo = CLASSES[character.class];
    const talentInfo = classInfo.talents.find(t => t.id === talentId);

    if (!talentInfo) return;

    character.talent = talentId;
    character.talentRole = talentInfo.role;

    // 重新计算属性
    const stats = calculateCharacterStats(character);

    // 应用天赋加成
    if (talentInfo.role === 'tank') {
        character.defense = Math.floor(stats.defense * 1.3);
        character.hp = Math.floor(stats.hp * 1.2);
        character.maxHp = character.hp;
    } else if (talentInfo.role === 'healer') {
        character.attack = Math.floor(stats.attack * 0.8);
    } else if (talentInfo.role === 'dps') {
        character.attack = Math.floor(stats.attack * 1.2);
        character.defense = Math.floor(stats.defense * 0.8);
    }

    saveGame();
    updateUI();

    // 刷新显示
    document.querySelector('.modal:last-child').remove();
    showTalentSelector(characterIndex);
}

// 获取装备颜色
function getEquipmentColor(quality) {
    return ITEM_QUALITIES[quality]?.color || '#ffffff';
}

// 复活角色
function reviveCharacter(index) {
    const character = gameState.team[index];
    const cost = Math.floor(character.level * 10);
    
    if (gameState.gold < cost) {
        alert('金币不足！');
        return;
    }

    gameState.gold -= cost;
    character.dead = false;
    character.hp = calculateCharacterStats(character).hp;
    
    saveGame();
    updateUI();
}

// 更新状态面板
function updateStatsPanel() {
    let totalAttack = 0, totalDefense = 0, totalHp = 0;

    gameState.team.forEach(character => {
        if (!character.dead) {
            const stats = calculateCharacterStats(character);
            totalAttack += stats.attack;
            totalDefense += stats.defense;
            totalHp += stats.hp;
        }
    });

    document.getElementById('total-attack').textContent = totalAttack;
    document.getElementById('total-defense').textContent = totalDefense;
    document.getElementById('total-hp').textContent = totalHp;
}

// 更新材料面板
function updateMaterialsPanel() {
    document.getElementById('material-fish').textContent = gameState.materials.fish;
    document.getElementById('material-ore').textContent = gameState.materials.ore;
    document.getElementById('material-dust').textContent = gameState.materials.dust;
    document.getElementById('material-gem').textContent = gameState.materials.gem;

    document.getElementById('fish-count').textContent = gameState.materials.fish;
    document.getElementById('ore-count').textContent = gameState.materials.ore;
    document.getElementById('dust-count').textContent = gameState.materials.dust;
    document.getElementById('gem-count').textContent = gameState.materials.gem;
}

// 更新专业面板
function updateProfessionPanel() {
    document.getElementById('fishing-skill').textContent = gameState.professions.fishing;
    document.getElementById('mining-skill').textContent = gameState.professions.mining;
    
    const fishingCost = 10 + gameState.professions.fishing * 2;
    const miningCost = 10 + gameState.professions.mining * 2;
    
    document.getElementById('fishing-cost').textContent = fishingCost;
    document.getElementById('mining-cost').textContent = miningCost;
}

// 更新强化面板
function updateUpgradePanel() {
    document.getElementById('attack-level').textContent = gameState.upgrades.attack;
    document.getElementById('attack-bonus').textContent = gameState.upgrades.attack * 5;
    document.getElementById('attack-cost').textContent = 100 + gameState.upgrades.attack * 50;

    document.getElementById('defense-level').textContent = gameState.upgrades.defense;
    document.getElementById('defense-bonus').textContent = gameState.upgrades.defense * 5;
    document.getElementById('hp-bonus').textContent = gameState.upgrades.defense * 50;
    document.getElementById('defense-cost').textContent = 100 + gameState.upgrades.defense * 50;

    document.getElementById('speed-level').textContent = gameState.upgrades.speed;
    document.getElementById('speed-cost').textContent = 1000 + gameState.upgrades.speed * 500;
}

// 渲染副本列表
function renderDungeons() {
    const dungeonList = document.getElementById('dungeon-list');
    dungeonList.innerHTML = '';

    DUNGEONS.forEach(dungeon => {
        const challenges = gameState.dungeonChallenges[dungeon.id] || 0;
        const maxChallenges = dungeon.challengeLimit;
        
        const card = document.createElement('div');
        card.className = 'dungeon-card' + (gameState.selectedDungeon === dungeon.id ? ' selected' : '');
        card.innerHTML = `
            <div class="dungeon-name">${dungeon.name}</div>
            <div class="dungeon-level">推荐等级: ${dungeon.level}</div>
            <div class="dungeon-count">剩余次数: ${maxChallenges - challenges}/${maxChallenges}</div>
            ${dungeon.hasLegendary ? '<div style="color:#ff8000;font-size:0.8em;">🔥 传说掉落</div>' : ''}
        `;
        card.onclick = () => selectDungeon(dungeon.id);
        dungeonList.appendChild(card);
    });
}

// 选择副本
function selectDungeon(dungeonId) {
    gameState.selectedDungeon = dungeonId;
    renderDungeons();
}

// 开始战斗
async function startBattle() {
    if (!gameState.selectedDungeon) {
        alert('请先选择一个副本！');
        return;
    }

    const aliveTeam = gameState.team.filter(c => !c.dead);
    if (aliveTeam.length === 0) {
        alert('没有可用的角色，请先复活！');
        return;
    }

    const dungeon = DUNGEONS.find(d => d.id === gameState.selectedDungeon);
    const challenges = gameState.dungeonChallenges[dungeon.id] || 0;
    
    if (challenges >= dungeon.challengeLimit) {
        alert('今日挑战次数已用完！');
        return;
    }

    const battleLog = document.getElementById('battle-log');
    battleLog.innerHTML = `<p class="info">=== 进入 ${dungeon.name} ===</p>`;

    // 生成怪物
    const monsters = generateMonsters(dungeon);
    
    let battleWon = true;
    
    // 普通怪物战斗
    for (let i = 0; i < dungeon.normalCount; i++) {
        battleLog.innerHTML += `<p class="info">--- 遭遇 ${dungeon.name} 守卫 ${i + 1}/${dungeon.normalCount} ---</p>`;
        
        for (const monster of monsters) {
            monster.hp = monster.maxHp;
            const result = await battleRound(monster, dungeon, false);
            if (!result) {
                battleWon = false;
                break;
            }
        }
        
        if (!battleWon) break;
        
        // 清除冷却
        aliveTeam.forEach(char => {
            char.buffs = [];
            Object.keys(char.cooldowns).forEach(skill => {
                if (char.cooldowns[skill] > 0) char.cooldowns[skill]--;
            });
        });
    }

    if (battleWon) {
        // BOSS战斗
        battleLog.innerHTML += `<p class="info" style="color:#ff8000;font-weight:bold;">=== BOSS 战！ ===</p>`;
        
        for (let i = 0; i < dungeon.bossCount; i++) {
            const boss = generateBoss(dungeon, i + 1);
            const result = await battleRound(boss, dungeon, true);
            
            if (!result) {
                battleWon = false;
                break;
            }

            // BOSS掉落
            const loot = generateLoot(dungeon, true);
            if (loot) {
                pendingLoot.push(loot);
                showLootModal();
            }
        }
    }

    // 战斗结束
    if (battleWon) {
        const goldReward = Math.floor(dungeon.rewardGold * (1 + Math.random() * 0.5));
        gameState.gold += goldReward;
        
        // 增加挑战次数
        if (!gameState.dungeonChallenges[dungeon.id]) {
            gameState.dungeonChallenges[dungeon.id] = 0;
        }
        gameState.dungeonChallenges[dungeon.id]++;
        
        // 更新成就进度
        updateAchievementProgress('dungeons', 1);
        updateAchievementProgress('bosses', dungeon.bossCount);
        
        battleLog.innerHTML += `<p class="heal">=== 战斗胜利！获得 ${goldReward} 金币 ===</p>`;
    } else {
        battleLog.innerHTML += `<p class="damage">=== 战斗失败！ ===</p>`;
    }

    saveGame();
    updateUI();
    renderDungeons();
}

// 生成怪物
function generateMonsters(dungeon) {
    const count = Math.min(gameState.team.length, 3);
    const monsters = [];
    
    for (let i = 0; i < count; i++) {
        const level = dungeon.level + Math.floor(Math.random() * 5) - 2;
        monsters.push({
            name: `${dungeon.name}守卫`,
            level: Math.max(1, level),
            hp: dungeon.level * 150,
            maxHp: dungeon.level * 150,
            attack: dungeon.level * 15,
            defense: dungeon.level * 9,
            threat: {}
        });
    }
    
    return monsters;
}

// 生成BOSS
function generateBoss(dungeon, bossNum) {
    const level = dungeon.level + 5;
    return {
        name: `${dungeon.name}BOSS ${bossNum}`,
        level: level,
        hp: dungeon.level * 600,
        maxHp: dungeon.level * 600,
        attack: dungeon.level * 45,
        defense: dungeon.level * 24,
        threat: {}
    };
}

// 战斗回合
async function battleRound(monster, dungeon, isBoss) {
    const aliveTeam = gameState.team.filter(c => !c.dead);
    if (aliveTeam.length === 0) return false;

    const battleLog = document.getElementById('battle-log');
    
    while (monster.hp > 0 && aliveTeam.some(c => c.hp > 0)) {
        // 团队攻击
        const sortedTeam = [...aliveTeam].sort((a, b) => {
            // 坦克先行动
            const aRole = CLASSES[a.class].role;
            const bRole = CLASSES[b.class].role;
            if (aRole === 'tank' && bRole !== 'tank') return -1;
            if (bRole === 'tank' && aRole !== 'tank') return 1;
            return 0;
        });

        for (const character of sortedTeam) {
            if (character.hp <= 0) continue;

            const stats = calculateCharacterStats(character);
            await characterAttack(character, monster, stats, isBoss);
            
            if (monster.hp <= 0) break;
        }

        if (monster.hp <= 0) {
            // 更新击杀成就
            updateAchievementProgress('kills', 1);
            break;
        }

        // 怪物攻击
        await monsterAttack(monster, aliveTeam);
        
        if (!aliveTeam.some(c => c.hp > 0)) {
            return false;
        }
    }

    // 普通怪物掉落
    if (!isBoss) {
        const loot = generateLoot(dungeon, false);
        if (loot) {
            pendingLoot.push(loot);
            showLootModal();
        }
    }

    return true;
}

// 角色攻击
async function characterAttack(character, monster, stats, isBoss) {
    const battleLog = document.getElementById('battle-log');
    const classSkills = SKILLS[character.class];
    const availableSkills = classSkills.filter(s => character.level >= s.unlockLevel);
    
    let skill = availableSkills[0]; // 默认使用第一个技能
    if (availableSkills.length > 1) {
        skill = availableSkills[Math.floor(Math.random() * availableSkills.length)];
    }

    // 检查冷却
    if (character.cooldowns[skill.name] > 0) {
        skill = availableSkills[0];
    }

    let damage = 0;

    switch (skill.type) {
        case 'attack':
            damage = Math.max(1, Math.floor(stats.attack * skill.power - monster.defense * 0.5));
            monster.hp -= damage;
            character.cooldowns[skill.name] = skill.cooldown;
            battleLog.innerHTML += `<p>⚔️ ${character.name} 使用 ${skill.name}，造成 <span class="damage">${damage}</span> 伤害</p>`;
            break;
            
        case 'heal':
            if (character.hp < calculateCharacterStats(character).hp) {
                const healAmount = Math.floor(stats.attack * skill.power);
                character.hp = Math.min(calculateCharacterStats(character).hp, character.hp + healAmount);
                character.cooldowns[skill.name] = skill.cooldown;
                battleLog.innerHTML += `<p>💚 ${character.name} 使用 ${skill.name}，恢复 <span class="heal">${healAmount}</span> 生命</p>`;
            }
            break;
            
        case 'aoe':
            damage = Math.max(1, Math.floor(stats.attack * skill.power - monster.defense * 0.5));
            monster.hp -= damage;
            character.cooldowns[skill.name] = skill.cooldown;
            battleLog.innerHTML += `<p>💥 ${character.name} 使用 ${skill.name}，造成 <span class="damage">${damage}</span> 范围伤害</p>`;
            break;
            
        case 'taunt':
            monster.threat[character.id] = (monster.threat[character.id] || 0) + 1000;
            character.cooldowns[skill.name] = skill.cooldown;
            battleLog.innerHTML += `<p>😤 ${character.name} 使用 ${skill.name}，建立仇恨</p>`;
            break;
            
        default:
            damage = Math.max(1, Math.floor(stats.attack - monster.defense * 0.5));
            monster.hp -= damage;
            battleLog.innerHTML += `<p>⚔️ ${character.name} 攻击，造成 <span class="damage">${damage}</span> 伤害</p>`;
    }

    // 更新仇恨
    monster.threat[character.id] = (monster.threat[character.id] || 0) + damage;

    battleLog.scrollTop = battleLog.scrollHeight;
    
    // 速度延迟
    const speedDelay = Math.max(100, 1000 - gameState.upgrades.speed * 100);
    await new Promise(resolve => setTimeout(resolve, speedDelay));
}

// 怪物攻击
async function monsterAttack(monster, aliveTeam) {
    const battleLog = document.getElementById('battle-log');
    
    // 根据仇恨选择目标
    let target = aliveTeam[0];
    if (monster.threat && Object.keys(monster.threat).length > 0) {
        let maxThreat = 0;
        aliveTeam.forEach(char => {
            const threat = monster.threat[char.id] || 0;
            if (threat > maxThreat) {
                maxThreat = threat;
                target = char;
            }
        });
    }

    if (target.hp <= 0) {
        target = aliveTeam.find(c => c.hp > 0);
    }

    if (!target || target.hp <= 0) return;

    const stats = calculateCharacterStats(target);
    const damage = Math.max(1, Math.floor(monster.attack - stats.defense * 0.5));
    target.hp -= damage;

    battleLog.innerHTML += `<p>👹 ${monster.name} 攻击 ${target.name}，造成 <span class="damage">${damage}</span> 伤害</p>`;

    if (target.hp <= 0) {
        target.hp = 0;
        target.dead = true;
        battleLog.innerHTML += `<p class="damage">💀 ${target.name} 阵亡！</p>`;
    }

    battleLog.scrollTop = battleLog.scrollHeight;
}

// 生成魔兽世界风格装备名称
function generateEquipmentName(slot, quality) {
    const qualityPrefix = {
        common: ['粗糙', '破损', '旧'],
        uncommon: ['坚固', '精制', '优质'],
        rare: ['卓越', '精良', '强力'],
        epic: ['史诗', '传说', '神圣'],
        legendary: ['传奇', '不朽', '神级']
    };

    const slotNames = {
        weapon: ['斧', '剑', '锤', '匕首', '法杖', '弓', '魔杖'],
        helmet: ['头盔', '头冠', '面具', '兜帽'],
        chest: ['胸甲', '护胸', '战衣', '长袍'],
        legs: ['护腿', '腿甲', '长裤'],
        gloves: ['手套', '护手', '手镯'],
        boots: ['靴子', '战靴', '鞋'],
        necklace: ['项链', '坠饰', '护符'],
        ring: ['指环', '戒指', '环']
    };

    const epicNames = ['雷霆之怒', '风之怒', '逐风者', '灰烬使者', '霜之哀伤', '神圣之剑', '雷霆之怒'];
    const legendaryNames = ['桑德兰', '炎魔拉格纳罗斯', '艾泽拉斯之眼', '泰坦之握', '神之圣裁', '世界终结者'];

    const prefix = qualityPrefix[quality][Math.floor(Math.random() * qualityPrefix[quality].length)];
    const slots = slotNames[slot][Math.floor(Math.random() * slotNames[slot].length)];

    if (quality === 'legendary') {
        const legendaryName = legendaryNames[Math.floor(Math.random() * legendaryNames.length)];
        return `${legendaryName}${slots}`;
    } else if (quality === 'epic') {
        const epicName = epicNames[Math.floor(Math.random() * epicNames.length)];
        return `${epicName}${slots}`;
    } else {
        return `${prefix}${slots}`;
    }
}

// 生成装备
function generateLoot(dungeon, isBoss) {
    // 应用装备掉率倍率，副本基础10%掉落率
    if (Math.random() > (0.1 * gameState.multipliers.equipmentDropRate)) return null;

    let quality = 'common';
    const roll = Math.random() * 100;

    if (isBoss) {
        if (roll < 3) quality = 'legendary';
        else if (roll < 10) quality = 'epic';
        else if (roll < 30) quality = 'rare';
        else if (roll < 60) quality = 'uncommon';
    } else {
        if (roll < 0.5) quality = 'legendary';
        else if (roll < 2) quality = 'epic';
        else if (roll < 8) quality = 'rare';
        else if (roll < 25) quality = 'uncommon';
    }

    const qualityInfo = ITEM_QUALITIES[quality];
    const slot = EQUIPMENT_SLOTS[Math.floor(Math.random() * EQUIPMENT_SLOTS.length)];
    const baseValue = dungeon.level * 2;

    const equipment = {
        id: Date.now() + Math.random(),
        name: generateEquipmentName(slot, quality),
        slot: slot,
        quality: quality,
        level: dungeon.level,
        attack: slot === 'weapon' || slot === 'ring1' || slot === 'ring2' || slot === 'necklace' ? Math.floor(baseValue * qualityInfo.multiplier) : 0,
        defense: slot !== 'weapon' ? Math.floor(baseValue * qualityInfo.multiplier) : 0,
        hp: slot === 'chest' || slot === 'legs' ? Math.floor(baseValue * qualityInfo.multiplier * 2) : 0,
        enhance: 0
    };

    // 检查传说装备成就
    if (quality === 'legendary') {
        updateAchievementProgress('legendary', 1);
    } else if (quality === 'epic') {
        updateAchievementProgress('epic', 1);
    }

    return equipment;
}

// 渲染装备背包
function renderInventory() {
    const inventory = document.getElementById('inventory');
    inventory.innerHTML = '';

    const qualityCount = { common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0 };

    gameState.inventory.forEach((item, index) => {
        qualityCount[item.quality]++;
        
        const div = document.createElement('div');
        div.className = `equipment-item ${item.quality}`;
        div.innerHTML = `
            <div class="equipment-name ${item.quality}">${item.name} +${item.enhance}</div>
            <div class="equipment-stats">
                ${item.attack ? `攻击: ${item.attack} ` : ''}
                ${item.defense ? `防御: ${item.defense} ` : ''}
                ${item.hp ? `生命: ${item.hp}` : ''}
            </div>
            <button onclick="equipItem(${index})" style="margin-top:5px;width:100%;padding:3px;">装备</button>
            <button onclick="enhanceItem(${index})" style="margin-top:3px;width:100%;padding:3px;">强化</button>
            <button onclick="enchantItem(${index})" style="margin-top:3px;width:100%;padding:3px;">附魔</button>
        `;
        inventory.appendChild(div);
    });

    if (gameState.inventory.length === 0) {
        inventory.innerHTML = '<p style="text-align:center;color:#888;">背包空空如也</p>';
    }
}

// 装备物品
function equipItem(itemIndex) {
    const item = gameState.inventory[itemIndex];
    const aliveTeam = gameState.team.filter(c => !c.dead);
    
    // 找出最适合的角色
    let bestChar = null;
    let bestScore = -1;

    aliveTeam.forEach(char => {
        const stats = calculateCharacterStats(char);
        let currentScore = 0;
        if (char.equipment[item.slot]) {
            currentScore = (char.equipment[item.slot].attack || 0) + 
                          (char.equipment[item.slot].defense || 0) * 0.5 + 
                          (char.equipment[item.slot].hp || 0) * 0.3;
        }
        
        const newScore = (item.attack || 0) + (item.defense || 0) * 0.5 + (item.hp || 0) * 0.3;
        
        if (newScore > currentScore && newScore > bestScore) {
            bestScore = newScore;
            bestChar = char;
        }
    });

    if (!bestChar) {
        alert('没有合适的角色');
        return;
    }

    // 交换装备
    if (bestChar.equipment[item.slot]) {
        gameState.inventory.push(bestChar.equipment[item.slot]);
    }
    
    bestChar.equipment[item.slot] = item;
    gameState.inventory.splice(itemIndex, 1);
    
    saveGame();
    updateUI();
}

// 一键装备
function autoEquipAll() {
    const aliveTeam = gameState.team.filter(c => !c.dead);
    
    aliveTeam.forEach(char => {
        EQUIPMENT_SLOTS.forEach(slot => {
            let bestItem = null;
            let bestScore = -1;

            gameState.inventory.forEach((item, index) => {
                if (item.slot === slot) {
                    const score = (item.attack || 0) + (item.defense || 0) * 0.5 + (item.hp || 0) * 0.3;
                    if (score > bestScore) {
                        bestScore = score;
                        bestItem = { item, index };
                    }
                }
            });

            if (bestItem) {
                if (char.equipment[slot]) {
                    gameState.inventory.push(char.equipment[slot]);
                }
                char.equipment[slot] = bestItem.item;
                gameState.inventory.splice(bestItem.index, 1);
            }
        });
    });

    saveGame();
    updateUI();
}

// 强化装备
let totalEnhancements = 0;

function enhanceItem(itemIndex) {
    const item = gameState.inventory[itemIndex];
    const qualityInfo = ITEM_QUALITIES[item.quality];

    if (item.enhance >= qualityInfo.maxEnhance) {
        alert('已达到强化上限！');
        return;
    }

    const cost = item.level * 10 * (item.enhance + 1);
    if (gameState.gold < cost) {
        alert('金币不足！');
        return;
    }

    gameState.gold -= cost;
    item.enhance++;
    item.attack = Math.floor(item.attack * 1.1);
    item.defense = Math.floor(item.defense * 1.1);
    item.hp = Math.floor(item.hp * 1.1);

    totalEnhancements++;
    updateAchievementProgress('enhance_total', 1);

    if (item.enhance >= qualityInfo.maxEnhance) {
        updateAchievementProgress('enhance', 1);
    }

    // 更新特殊成就
    updateSpecialAchievements();

    saveGame();
    updateUI();
}

// 附魔装备
function enchantItem(itemIndex) {
    const item = gameState.inventory[itemIndex];
    const cost = item.level * 20;
    
    if (gameState.materials.dust < 5) {
        alert('灵魂之尘不足（需要5个）！');
        return;
    }
    
    if (gameState.gold < cost) {
        alert('金币不足！');
        return;
    }

    gameState.materials.dust -= 5;
    gameState.gold -= cost;
    
    if (item.attack) item.attack = Math.floor(item.attack * 1.2);
    if (item.defense) item.defense = Math.floor(item.defense * 1.2);
    if (item.hp) item.hp = Math.floor(item.hp * 1.2);

    saveGame();
    updateUI();
}

// 出售装备
function sellEquipment(quality, amount) {
    let totalPrice = 0;
    let sellCount = 0;

    if (quality === 'all') {
        gameState.inventory.forEach(item => {
            const price = item.level * 5 * ITEM_QUALITIES[item.quality].multiplier * (item.enhance + 1);
            totalPrice += price;
            sellCount++;
        });
        gameState.inventory = [];
    } else {
        gameState.inventory = gameState.inventory.filter(item => {
            if (item.quality === quality && sellCount < amount) {
                const price = item.level * 5 * ITEM_QUALITIES[item.quality].multiplier * (item.enhance + 1);
                totalPrice += price;
                sellCount++;
                return false;
            }
            return true;
        });
    }

    gameState.gold += totalPrice;
    saveGame();
    updateUI();
    
    if (totalPrice > 0) {
        updateAchievementProgress('gold', totalPrice);
    }
}

// 改变区域
let exploredZones = new Set();

function changeZone() {
    const select = document.getElementById('zone-select');
    gameState.currentZone = select.value;

    const zone = ZONES[gameState.currentZone];
    document.getElementById('current-location').textContent = zone.name;
    document.getElementById('zone-info').innerHTML = `
        <h3>📍 ${zone.name}</h3>
        <p>等级范围: ${zone.levelRange}级</p>
        <p>${zone.description}</p>
        <p>怪物: ${zone.monsters.map(m => m.name).join('、')}</p>
    `;

    // 记录探索的区域
    exploredZones.add(gameState.currentZone);
    if (exploredZones.size >= 9 && !gameState.achievements.includes('all_zones')) {
        gameState.achievements.push('all_zones');
        alert(`🏆 成就完成：世界探险家！`);
    }

    renderWildMonsters();
    renderQuests();
    saveGame();
}

// 渲染野外怪物
function renderWildMonsters() {
    const container = document.getElementById('wild-monsters');
    const zone = ZONES[gameState.currentZone];

    container.innerHTML = zone.monsters.map((monster, index) => `
        <div class="monster-card" data-monster-index="${index}" data-monster-name="${monster.name}">
            <div class="monster-name">🐺 ${monster.name}</div>
            <div class="monster-level">等级: ${monster.level}</div>
            <div class="monster-stats">
                ❤️ ${monster.hp} | ⚔️ ${monster.attack} | 🛡️ ${monster.defense}
            </div>
            <div style="font-size:0.8em;color:#ffd700;margin-top:5px;">
                XP: ${monster.xp} | 💰 ${monster.gold}
            </div>
        </div>
    `).join('');

    // 添加点击事件监听
    container.querySelectorAll('.monster-card').forEach(card => {
        card.addEventListener('click', function() {
            const monsterName = this.getAttribute('data-monster-name');
            huntSpecificMonster(monsterName);
        });
    });
}

// 狩猎特定怪物
async function huntSpecificMonster(monsterName) {
    const aliveTeam = gameState.team.filter(c => !c.dead);
    if (aliveTeam.length === 0) {
        alert('没有可用的角色，请先复活！');
        return;
    }

    const zone = ZONES[gameState.currentZone];
    const monsterData = zone.monsters.find(m => m.name === monsterName);
    if (!monsterData) return;

    const battleLog = document.getElementById('battle-log');
    switchTab('battle');

    // 显示停止战斗按钮
    showWildBattleButton(true);

    battleLog.innerHTML = `<p class="info">=== 遭遇 ${monsterName} ===</p>`;

    const monster = {
        name: monsterName,
        level: monsterData.level,
        hp: monsterData.hp,
        maxHp: monsterData.hp,
        attack: monsterData.attack,
        defense: monsterData.defense,
        threat: {},
        xpReward: monsterData.xp,
        goldReward: monsterData.gold
    };

    currentWildBattle = true;

    while (currentWildBattle && monster.hp > 0 && aliveTeam.some(c => c.hp > 0)) {
        // 团队攻击
        const sortedTeam = [...aliveTeam].sort((a, b) => {
            const aRole = CLASSES[a.class].role;
            const bRole = CLASSES[b.class].role;
            if (aRole === 'tank' && bRole !== 'tank') return -1;
            if (bRole === 'tank' && aRole !== 'tank') return 1;
            return 0;
        });

        for (const character of sortedTeam) {
            if (character.hp <= 0) continue;

            const stats = calculateCharacterStats(character);
            await characterAttack(character, monster, stats, false);

            if (monster.hp <= 0) break;

            if (!currentWildBattle) break;
        }

        if (monster.hp <= 0) break;
        if (!currentWildBattle) break;

        // 怪物攻击
        await monsterAttack(monster, aliveTeam);

        if (!aliveTeam.some(c => c.hp > 0)) {
            battleLog.innerHTML += `<p class="damage">=== 战斗失败！===</p>`;
            showWildBattleButton(false);
            saveGame();
            updateUI();
            return false;
        }
    }

    // 战斗被停止
    if (!currentWildBattle) {
        showWildBattleButton(false);
        return false;
    }

    // 战斗胜利
    battleLog.innerHTML += `<p class="heal">=== 战斗胜利！===</p>`;

    // 应用金币和经验倍率
    const goldGained = Math.floor(monster.goldReward * gameState.multipliers.goldDropRate);
    const xpGained = Math.floor(monster.xpReward * gameState.multipliers.xpRate);
    const xpPerChar = Math.floor(xpGained / aliveTeam.length);

    aliveTeam.forEach(char => {
        char.xp += xpPerChar;
        const leveledUp = checkLevelUp(char);
        if (leveledUp) {
            battleLog.innerHTML += `<p class="info">🎉 ${char.name} 升级到了 ${char.level} 级！</p>`;
        }
    });

    gameState.gold += goldGained;
    battleLog.innerHTML += `<p class="info">获得 ${goldGained} 金币，每人获得 ${xpPerChar} 经验值</p>`;

    // 怪物掉落装备
    const loot = generateWildLoot(monster.level);
    if (loot) {
        pendingLoot.push(loot);
        showLootModal();
    }

    // 更新任务进度
    updateQuestProgress(monsterName);
    renderQuests();
    renderActiveQuests();

    // 更新成就
    updateAchievementProgress('kills', 1);
    updateAchievementProgress('gold', monster.goldReward);

    currentWildBattle = false;
    showWildBattleButton(false);

    saveGame();
    updateUI();
    return true;
}

// 显示/隐藏野外战斗停止按钮
function showWildBattleButton(show) {
    let button = document.getElementById('stop-wild-battle');

    if (show) {
        if (!button) {
            button = document.createElement('button');
            button.id = 'stop-wild-battle';
            button.className = 'battle-button';
            button.textContent = '⏹️ 停止战斗';
            button.style.background = 'linear-gradient(180deg, #cc5555 0%, #aa4444 100%)';
            button.onclick = stopCurrentBattle;

            const controls = document.querySelector('.battle-controls');
            if (controls) {
                controls.appendChild(button);
            }
        }
    } else {
        if (button) {
            button.remove();
        }
    }
}

// 随机狩猎怪物
async function huntMonsters() {
    const zone = ZONES[gameState.currentZone];
    const randomMonster = zone.monsters[Math.floor(Math.random() * zone.monsters.length)];
    await huntSpecificMonster(randomMonster.name);
}

// 持续自动狩猎
let autoHuntInterval = null;
let isAutoHunting = false;

function toggleAutoHunt() {
    if (isAutoHunting) {
        stopAutoHunt();
    } else {
        startAutoHunt();
    }
}

function startAutoHunt() {
    const aliveTeam = gameState.team.filter(c => !c.dead);
    if (aliveTeam.length === 0) {
        alert('没有可用的角色，请先复活！');
        return;
    }

    isAutoHunting = true;

    const button = document.querySelector('.hunt-button');
    if (button) {
        button.textContent = '⏹️ 停止狩猎';
        button.style.background = 'linear-gradient(180deg, #cc5555 0%, #aa4444 100%)';
    }

    async function autoHuntLoop() {
        while (isAutoHunting) {
            const currentAliveTeam = gameState.team.filter(c => !c.dead);

            if (currentAliveTeam.length === 0) {
                stopAutoHunt();
                alert('所有角色已阵亡，自动狩猎停止！');
                return;
            }

            const zone = ZONES[gameState.currentZone];
            const randomMonster = zone.monsters[Math.floor(Math.random() * zone.monsters.length)];
            await huntSpecificMonster(randomMonster.name);

            // 更新自动狩猎计数
            updateAutoHuntCount();

            // 更新特殊成就
            updateSpecialAchievements();

            // 等待间隔时间
            await new Promise(resolve => setTimeout(resolve, 500 + (1000 - gameState.upgrades.speed * 100)));
        }
    }

    autoHuntLoop();
}

function stopAutoHunt() {
    isAutoHunting = false;
    if (autoHuntInterval) {
        clearInterval(autoHuntInterval);
        autoHuntInterval = null;
    }

    const button = document.querySelector('.hunt-button');
    if (button) {
        button.textContent = '🎯 狩猎怪物';
        button.style.background = 'linear-gradient(180deg, #ff6b6b 0%, #cc5555 100%)';
    }
}

// 停止当前战斗（野外战斗）
let currentWildBattle = false;
function stopCurrentBattle() {
    currentWildBattle = false;
    const battleLog = document.getElementById('battle-log');
    battleLog.innerHTML += '<p class="damage">=== 战斗已停止 ===</p>';
}

// 生成野外装备掉落
function generateWildLoot(level) {
    // 应用装备掉率倍率，基础10%掉落率
    if (Math.random() > (0.1 * gameState.multipliers.equipmentDropRate)) return null;

    let quality = 'common';
    const roll = Math.random() * 100;

    if (roll < 1) quality = 'legendary';
    else if (roll < 3) quality = 'epic';
    else if (roll < 10) quality = 'rare';
    else if (roll < 30) quality = 'uncommon';

    const qualityInfo = ITEM_QUALITIES[quality];
    const slot = EQUIPMENT_SLOTS[Math.floor(Math.random() * EQUIPMENT_SLOTS.length)];
    const baseValue = level * 1.5;

    const equipment = {
        id: Date.now() + Math.random(),
        name: generateEquipmentName(slot, quality),
        slot: slot,
        quality: quality,
        level: level,
        attack: slot === 'weapon' || slot === 'ring1' || slot === 'ring2' || slot === 'necklace' ? Math.floor(baseValue * qualityInfo.multiplier) : 0,
        defense: slot !== 'weapon' ? Math.floor(baseValue * qualityInfo.multiplier) : 0,
        hp: slot === 'chest' || slot === 'legs' ? Math.floor(baseValue * qualityInfo.multiplier * 2) : 0,
        enhance: 0
    };

    if (quality === 'legendary') {
        updateAchievementProgress('legendary', 1);
    } else if (quality === 'epic') {
        updateAchievementProgress('epic', 1);
    }

    return equipment;
}

// 渲染可接任务
function renderQuests() {
    const container = document.getElementById('quest-list');
    const zone = ZONES[gameState.currentZone];
    const availableQuests = zone.quests.filter(q => !gameState.completedQuests.includes(q.id));
    
    container.innerHTML = availableQuests.map(quest => `
        <div class="quest-card" onclick="acceptQuest('${quest.id}')">
            <div class="quest-title">📜 ${quest.name}</div>
            <div class="quest-description">${quest.description}</div>
            <div class="quest-rewards">
                奖励: 💰${quest.rewardGold} | XP:${quest.xp}
                ${quest.itemChance > 0 ? ` | 🎁 装备概率: ${Math.floor(quest.itemChance * 100)}%` : ''}
            </div>
        </div>
    `).join('');

    if (availableQuests.length === 0) {
        container.innerHTML = '<p style="text-align:center;color:#888;">暂无可接任务</p>';
    }
}

// 接受任务
function acceptQuest(questId) {
    if (gameState.activeQuests.find(q => q.id === questId)) {
        alert('该任务已在进行中！');
        return;
    }

    const zone = ZONES[gameState.currentZone];
    const quest = zone.quests.find(q => q.id === questId);
    if (!quest) return;

    gameState.activeQuests.push({
        ...quest,
        progress: 0
    });

    alert(`任务已接受：${quest.name}`);
    renderQuests();
    renderActiveQuests();
    saveGame();
}

// 渲染进行中的任务
function renderActiveQuests() {
    const container = document.getElementById('active-quests');
    
    if (gameState.activeQuests.length === 0) {
        container.innerHTML = '<p style="color:#888;">暂无进行中的任务</p>';
        return;
    }

    container.innerHTML = gameState.activeQuests.map(quest => {
        const progress = Math.min(quest.progress, quest.count);
        const isCompleted = progress >= quest.count;
        
        return `
            <div class="quest-card ${isCompleted ? 'completed' : ''}">
                <div class="quest-title">${isCompleted ? '✅' : '📋'} ${quest.name}</div>
                <div class="quest-description">${quest.description}</div>
                <div class="quest-progress">
                    进度: ${progress}/${quest.count}
                    ${isCompleted ? `<button onclick="completeQuest('${quest.id}')" style="margin-left:10px;padding:5px 10px;background:linear-gradient(180deg,#4a6a4a 0%,#3a5a3a 100%);border:1px solid #6a8a6a;color:#fff;border-radius:3px;cursor:pointer;">领取奖励</button>` : ''}
                </div>
            </div>
        `;
    }).join('');
}

// 更新任务进度
function updateQuestProgress(monsterName) {
    gameState.activeQuests.forEach(quest => {
        if ((quest.target === monsterName || quest.target === 'all') && quest.progress < quest.count) {
            quest.progress++;
        }
    });
}

// 完成任务
function completeQuest(questId) {
    const questIndex = gameState.activeQuests.findIndex(q => q.id === questId);
    if (questIndex === -1) return;

    const quest = gameState.activeQuests[questIndex];
    
    // 给予奖励
    gameState.gold += quest.rewardGold;
    
    // 经验值分配
    const aliveTeam = gameState.team.filter(c => !c.dead);
    const xpPerChar = Math.floor(quest.xp / Math.max(1, aliveTeam.length));
    aliveTeam.forEach(char => {
        char.xp += xpPerChar;
        checkLevelUp(char);
    });

    // 装备奖励
    let loot = null;
    if (quest.itemChance > 0 && Math.random() < quest.itemChance) {
        const zone = ZONES[gameState.currentZone];
        const avgLevel = zone.monsters.reduce((sum, m) => sum + m.level, 0) / zone.monsters.length;
        loot = generateWildLoot(Math.floor(avgLevel));
        if (loot) {
            gameState.inventory.push(loot);
        }
    }

    // 移除任务并添加到完成列表
    gameState.activeQuests.splice(questIndex, 1);
    gameState.completedQuests.push(quest.id);

    // 更新成就
    const totalCompleted = gameState.completedQuests.length;
    updateAchievementProgress('quests', 1);

    // 显示奖励
    showQuestReward(quest, loot);

    renderQuests();
    renderActiveQuests();
    saveGame();
    updateUI();
}

// 显示任务奖励
function showQuestReward(quest, loot) {
    const modal = document.getElementById('quest-reward-modal');
    const content = document.getElementById('quest-reward-content');
    
    let html = `
        <div class="quest-reward-item">
            <h3>🎉 ${quest.name} 完成！</h3>
            <p>💰 金币: +${quest.rewardGold}</p>
            <p>⭐ 经验: +${quest.xp}</p>
            ${loot ? `<p style="color:#ffd700;">🎁 获得装备: ${loot.name}</p>` : ''}
        </div>
    `;
    
    content.innerHTML = html;
    modal.classList.remove('hidden');
}

// 关闭任务奖励
function closeQuestReward() {
    document.getElementById('quest-reward-modal').classList.add('hidden');
}

// 显示掉落模态框
function showLootModal() {
    if (pendingLoot.length === 0) return;

    const modal = document.getElementById('loot-modal');
    const content = document.getElementById('loot-content');

    let html = '';
    pendingLoot.forEach((item, index) => {
        const qualityColor = ITEM_QUALITIES[item.quality].color;
        html += `
            <div class="loot-item" style="border:2px solid ${qualityColor};margin-bottom:10px;padding:10px;background:rgba(${parseInt(qualityColor.slice(1,3),16)},${parseInt(qualityColor.slice(3,5),16)},${parseInt(qualityColor.slice(5,7),16)},0.1);border-radius:5px;">
                <h4 style="color:${qualityColor};margin:0 0 5px 0;">${item.name}</h4>
                <p style="margin:2px 0;color:#ccc;">等级: ${item.level}</p>
                <p style="margin:2px 0;color:#ccc;">部位: ${EQUIPMENT_SLOTS_CN[item.slot]}</p>
                ${item.attack ? `<p style="margin:2px 0;color:#ff6666;">攻击: +${item.attack}</p>` : ''}
                ${item.defense ? `<p style="margin:2px 0;color:#66ff66;">防御: +${item.defense}</p>` : ''}
                ${item.hp ? `<p style="margin:2px 0;color:#6666ff;">生命: +${item.hp}</p>` : ''}
                <p style="margin:5px 0 0 0;color:${qualityColor};font-size:0.9em;">${ITEM_QUALITIES[item.quality].name}</p>
            </div>
        `;
    });

    content.innerHTML = html;
    modal.classList.remove('hidden');
}

// 确认拾取
function confirmLoot() {
    // 将所有待确认的装备添加到背包
    pendingLoot.forEach(item => {
        gameState.inventory.push(item);
    });

    // 在战斗日志中显示获得信息
    const battleLog = document.getElementById('battle-log');
    if (battleLog && pendingLoot.length > 0) {
        pendingLoot.forEach(item => {
            battleLog.innerHTML += `<p class="info">💎 确认拾取: ${item.name}</p>`;
        });
        battleLog.scrollTop = battleLog.scrollHeight;
    }

    // 清空待确认列表
    pendingLoot = [];

    // 关闭模态框
    closeLootModal();

    // 保存游戏并更新UI
    saveGame();
    updateUI();
}

// 关闭掉落模态框
function closeLootModal() {
    document.getElementById('loot-modal').classList.add('hidden');
}

// 装备部位中文映射
const EQUIPMENT_SLOTS_CN = {
    weapon: '武器',
    helmet: '头盔',
    chest: '胸部',
    legs: '腿部',
    gloves: '手套',
    boots: '靴子',
    ring1: '戒指',
    ring2: '戒指',
    necklace: '项链'
};

// 钓鱼
function doFishing() {
    const cost = 10 + gameState.professions.fishing * 2;
    if (gameState.gold < cost) {
        alert('金币不足！');
        return;
    }

    gameState.gold -= cost;
    gameState.professions.fishing++;

    // 钓鱼提升全队生命值
    const hpBonus = Math.floor(gameState.professions.fishing * 0.5);
    gameState.team.forEach(char => {
        if (!char.dead) {
            const stats = calculateCharacterStats(char);
            char.hp = Math.min(stats.hp, char.hp + hpBonus);
            char.maxHp = stats.hp + hpBonus;
        }
    });

    const fishAmount = 1 + Math.floor(Math.random() * Math.max(1, Math.floor(gameState.professions.fishing / 10)));
    gameState.materials.fish += fishAmount;

    if (gameState.professions.fishing >= 100) {
        updateAchievementProgress('profession', 1);
    }

    saveGame();
    updateUI();
}

// 采矿
function doMining() {
    const cost = 10 + gameState.professions.mining * 2;
    if (gameState.gold < cost) {
        alert('金币不足！');
        return;
    }

    gameState.gold -= cost;
    gameState.professions.mining++;

    // 采矿提升全队防御力
    const defenseBonus = Math.floor(gameState.professions.mining * 0.3);

    const oreAmount = 1 + Math.floor(Math.random() * Math.max(1, Math.floor(gameState.professions.mining / 10)));
    gameState.materials.ore += oreAmount;

    if (gameState.professions.mining >= 100) {
        updateAchievementProgress('profession', 1);
    }

    saveGame();
    updateUI();
}

// 分解装备
function disenchant() {
    if (gameState.inventory.length === 0) {
        alert('没有装备可分解！');
        return;
    }

    // 分解最差的装备
    let worstItem = null;
    let worstIndex = 0;
    let worstScore = Infinity;

    gameState.inventory.forEach((item, index) => {
        const score = (item.attack || 0) + (item.defense || 0) + (item.hp || 0);
        if (score < worstScore) {
            worstScore = score;
            worstItem = item;
            worstIndex = index;
        }
    });

    if (worstItem) {
        const dustAmount = Math.floor(worstItem.level * ITEM_QUALITIES[worstItem.quality].multiplier);
        gameState.materials.dust += dustAmount;
        gameState.inventory.splice(worstIndex, 1);
        
        saveGame();
        updateUI();
    }
}

// 炸矿
function gemRefining() {
    if (gameState.materials.ore < 10) {
        alert('矿石不足（需要10个）！');
        return;
    }

    gameState.materials.ore -= 10;
    const gemAmount = 1 + Math.floor(Math.random() * 2);
    gameState.materials.gem += gemAmount;

    saveGame();
    updateUI();
}

// 升级攻击
function upgradeAttack() {
    if (gameState.upgrades.attack >= 9999) {
        alert('已达到上限！');
        return;
    }

    const cost = 100 + gameState.upgrades.attack * 50;
    if (gameState.gold < cost) {
        alert('金币不足！');
        return;
    }

    gameState.gold -= cost;
    gameState.upgrades.attack++;

    saveGame();
    updateUI();
}

// 升级防御
function upgradeDefense() {
    if (gameState.upgrades.defense >= 9999) {
        alert('已达到上限！');
        return;
    }

    const cost = 100 + gameState.upgrades.defense * 50;
    if (gameState.gold < cost) {
        alert('金币不足！');
        return;
    }

    gameState.gold -= cost;
    gameState.upgrades.defense++;

    saveGame();
    updateUI();
}

// 升级速度
function upgradeSpeed() {
    if (gameState.upgrades.speed >= 10) {
        alert('已达到上限！');
        return;
    }

    const cost = 1000 + gameState.upgrades.speed * 500;
    if (gameState.gold < cost) {
        alert('金币不足！');
        return;
    }

    gameState.gold -= cost;
    gameState.upgrades.speed++;

    saveGame();
    updateUI();
}

// 渲染技能
function renderSkills() {
    const skillsDisplay = document.getElementById('skills-display');
    skillsDisplay.innerHTML = '';

    gameState.team.filter(c => !c.dead).forEach(character => {
        const classSkills = SKILLS[character.class];
        
        const div = document.createElement('div');
        div.className = 'character-skills';
        div.innerHTML = `
            <h3>${character.name} (${CLASSES[character.class].name})</h3>
            <div class="skills-list">
                ${classSkills.map(skill => `
                    <div class="skill-item">
                        <span class="skill-name">${skill.name}</span>
                        <span class="skill-type">${skill.description} ${character.level >= skill.unlockLevel ? '✓' : `（${skill.unlockLevel}级解锁）`}</span>
                    </div>
                `).join('')}
            </div>
        `;
        skillsDisplay.appendChild(div);
    });
}

// 渲染成就
function renderAchievements() {
    const achievementsList = document.getElementById('achievements-list');
    achievementsList.innerHTML = '';

    ACHIEVEMENTS.forEach(ach => {
        const isCompleted = gameState.achievements.includes(ach.id);
        const progress = gameState.achievementsProgress[ach.type] || 0;
        
        const div = document.createElement('div');
        div.className = `achievement-item ${isCompleted ? 'completed' : ''}`;
        div.innerHTML = `
            <div class="achievement-name">${ach.name} ${isCompleted ? '✓' : ''}</div>
            <div class="achievement-description">${ach.description}</div>
            <div class="achievement-progress">进度: ${Math.min(progress, ach.target)}/${ach.target}</div>
            <div class="achievement-reward">奖励: 攻击+${ach.reward.attack} 防御+${ach.reward.defense} 生命+${ach.reward.hp}</div>
        `;
        achievementsList.appendChild(div);
    });

    // 更新成就加成显示
    const bonuses = getAchievementBonuses();
    document.getElementById('bonus-attack').textContent = bonuses.attack;
    document.getElementById('bonus-defense').textContent = bonuses.defense;
    document.getElementById('bonus-hp').textContent = bonuses.hp;
}

// 更新成就进度
function updateAchievementProgress(type, amount) {
    if (!gameState.achievementsProgress[type]) {
        gameState.achievementsProgress[type] = 0;
    }
    gameState.achievementsProgress[type] += amount;

    // 检查成就完成
    ACHIEVEMENTS.forEach(ach => {
        if (ach.type === type && !gameState.achievements.includes(ach.id)) {
            if (gameState.achievementsProgress[type] >= ach.target) {
                gameState.achievements.push(ach.id);
                alert(`🏆 成就完成：${ach.name}！`);
            }
        }
    });

    // 检查等级成就
    if (type === 'level') {
        const allLevel = gameState.team.every(c => c.level >= amount);
        if (allLevel && amount === 40 && !gameState.achievements.includes('level_40')) {
            gameState.achievements.push('level_40');
            alert(`🏆 成就完成：精英队伍！`);
        } else if (allLevel && amount === 80 && !gameState.achievements.includes('level_80')) {
            gameState.achievements.push('level_80');
            alert(`🏆 成就完成：传说队伍！`);
        } else if (allLevel && amount === 20 && !gameState.achievements.includes('level_20')) {
            gameState.achievements.push('level_20');
            alert(`🏆 成就完成：新手队伍！`);
        } else if (allLevel && amount === 60 && !gameState.achievements.includes('level_60')) {
            gameState.achievements.push('level_60');
            alert(`🏆 成就完成：精英小队！`);
        } else if (allLevel && amount === 100 && !gameState.achievements.includes('level_100')) {
            gameState.achievements.push('level_100');
            alert(`🏆 成就完成：神话队伍！`);
        }
    }
}

// 更新特殊成就
function updateSpecialAchievements() {
    // 满员战队
    if (gameState.team.length >= 5 && !gameState.achievements.includes('team_5')) {
        gameState.achievements.push('team_5');
        alert(`🏆 成就完成：满员战队！`);
    }

    // 职业收集者
    const uniqueClasses = new Set(gameState.team.map(c => c.class));
    if (uniqueClasses.size >= 10 && !gameState.achievements.includes('all_classes')) {
        gameState.achievements.push('all_classes');
        alert(`🏆 成就完成：职业收集者！`);
    }

    // 种族收集者
    const uniqueRaces = new Set(gameState.team.map(c => c.race));
    if (uniqueRaces.size >= 10 && !gameState.achievements.includes('all_races')) {
        gameState.achievements.push('all_races');
        alert(`🏆 成就完成：种族收集者！`);
    }

    // 副本征服者
    const totalDungeonClears = Object.values(gameState.dungeonChallenges).reduce((sum, count) => sum + count, 0);
    if (totalDungeonClears >= 26 && !gameState.achievements.includes('dungeon_all')) {
        gameState.achievements.push('dungeon_all');
        alert(`🏆 成就完成：副本征服者！`);
    }

    // 材料大亨
    if (gameState.materials.fish >= 1000 && gameState.materials.ore >= 1000 &&
        gameState.materials.dust >= 1000 && gameState.materials.gem >= 1000 &&
        !gameState.achievements.includes('rich_materials')) {
        gameState.achievements.push('rich_materials');
        alert(`🏆 成就完成：材料大亨！`);
    }

    // 材料神王
    if (gameState.materials.fish >= 10000 && gameState.materials.ore >= 10000 &&
        gameState.materials.dust >= 10000 && gameState.materials.gem >= 10000 &&
        !gameState.achievements.includes('rich_materials_10000')) {
        gameState.achievements.push('rich_materials_10000');
        alert(`🏆 成就完成：材料神王！`);
    }

    // 完美团队
    if (gameState.team.length >= 5 && gameState.team.every(c => c.level >= 100) &&
        !gameState.achievements.includes('perfect_team')) {
        gameState.achievements.push('perfect_team');
        alert(`🏆 成就完成：完美团队！`);
    }
}

// 更新探索区域成就
function updateZoneExploration() {
    // 这里可以添加区域探索追踪逻辑
    // 暂时简化，每次切换区域都可能触发检查
}

// 升级检查
function checkLevelUp(character) {
    const xpNeeded = character.level * 100;
    if (character.xp >= xpNeeded && character.level < 100) {
        character.xp -= xpNeeded;
        character.level++;
        const stats = calculateCharacterStats(character);
        character.maxHp = stats.hp;
        character.hp = stats.hp;
        
        // 检查等级成就
        updateAchievementProgress('level', character.level);
        
        return true;
    }
    return false;
}

// 自动战斗
let battleCount = 0;

function toggleAutoBattle() {
    if (gameState.autoBattle) {
        stopBattle();
    } else {
        gameState.autoBattle = true;
        battleCount = 0;
        document.getElementById('auto-battle').classList.add('hidden');
        document.getElementById('stop-battle').classList.remove('hidden');
        updateAutoBattleStatus(true);
        
        gameState.battleInterval = setInterval(async () => {
            if (gameState.team.filter(c => !c.dead).length === 0) {
                stopBattle();
                return;
            }
            
            await startBattle();
            battleCount++;
            updateAutoBattleStatus(true);
        }, 1000);
    }
}

function stopBattle() {
    gameState.autoBattle = false;
    if (gameState.battleInterval) {
        clearInterval(gameState.battleInterval);
        gameState.battleInterval = null;
    }
    document.getElementById('auto-battle').classList.remove('hidden');
    document.getElementById('stop-battle').classList.add('hidden');
    updateAutoBattleStatus(false);
}

function updateAutoBattleStatus(isActive) {
    const statusEl = document.getElementById('auto-status');
    const countEl = document.getElementById('battle-count');
    
    if (statusEl) {
        statusEl.textContent = `状态: ${isActive ? '⚡ 运行中' : '⏹️ 停止'}`;
        statusEl.style.color = isActive ? '#00ff88' : '#ff6b6b';
    }
    
    if (countEl) {
        countEl.textContent = `战斗次数: ${battleCount}`;
    }
}

// 切换标签
function switchTab(tabName, tabElement) {
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

    if (tabElement) {
        tabElement.classList.add('active');
    } else {
        // 如果没有传递 tabElement，查找对应的标签按钮
        const targetTab = Array.from(document.querySelectorAll('.tab')).find(tab =>
            tab.textContent.includes(tabName === 'adventure' ? '冒险' :
            tabName === 'battle' ? '战斗' :
            tabName === 'equipment' ? '装备' :
            tabName === 'skills' ? '技能' :
            tabName === 'profession' ? '专业' :
            tabName === 'upgrades' ? '强化' :
            tabName === 'achievements' ? '成就' : '')
        );
        if (targetTab) {
            targetTab.classList.add('active');
        }
    }
    document.getElementById(`${tabName}-panel`).classList.add('active');
}

// 切换帮助
function toggleHelp() {
    const modal = document.getElementById('help-modal');
    modal.classList.toggle('hidden');
}

// 保存游戏
function saveGame() {
    localStorage.setItem('wotlkRPG', JSON.stringify(gameState));
}

// 加载游戏
function loadGame() {
    const saved = localStorage.getItem('wotlkRPG');
    if (saved) {
        const loaded = JSON.parse(saved);
        gameState = { ...gameState, ...loaded };
    }
}

// 导出存档
function exportSave() {
    try {
        const data = btoa(encodeURIComponent(JSON.stringify(gameState)));
        const blob = new Blob([data], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `wotlk_save_${Date.now()}.txt`;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        alert('存档导出成功！');
    } catch (error) {
        console.error('导出失败:', error);
        alert('导出失败，请重试！');
    }
}

// 导入存档
function importSave() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt';
    input.onchange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(decodeURIComponent(atob(event.target.result)));
                gameState = { ...gameState, ...data };
                saveGame();
                updateUI();
                renderDungeons();
                renderWildMonsters();
                renderQuests();
                alert('存档导入成功！');
            } catch (error) {
                console.error('导入失败:', error);
                alert('存档文件无效！');
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

// 重置游戏
function resetGame() {
    if (confirm('确定要重置游戏吗？所有进度将丢失！')) {
        localStorage.removeItem('wotlkRPG');
        gameState = {
            gold: 100,
            team: [],
            inventory: [],
            materials: { fish: 0, ore: 0, dust: 0, gem: 0 },
            upgrades: { attack: 0, defense: 0, speed: 0 },
            professions: { fishing: 0, mining: 0 },
            achievements: [],
            achievementsProgress: {},
            selectedDungeon: null,
            autoBattle: false,
            battleInterval: null,
            dungeonChallenges: {},
            currentZone: 'northshire',
            activeQuests: [],
            completedQuests: []
        };
        exploredZones.clear();
        totalEnhancements = 0;
        autoHuntCount = 0;

        // 重启随机事件定时器
        startRandomEventTimer();

        updateUI();
        renderDungeons();
        renderWildMonsters();
        renderQuests();
        alert('游戏已重置！');
    }
}

// 上帝模式
function openGodMode() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-content" style="max-width:600px;">
            <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
            <h2>👑 上帝模式</h2>

            <div style="margin:15px 0;padding:10px;background:#1a1a2a;border:1px solid #3a3a5a;border-radius:5px;">
                <h3>💰 金币设置</h3>
                <input type="number" id="god-gold" value="${gameState.gold}" style="width:100%;padding:8px;background:#2a2a4a;border:1px solid #4a4a6a;color:#e0e0e0;border-radius:5px;">
                <button onclick="setGold()" style="margin-top:5px;padding:8px;background:linear-gradient(180deg,#4a6a4a 0%,#3a5a3a 100%);border:1px solid #6a8a6a;color:#e0e0e0;border-radius:5px;cursor:pointer;">设置金币</button>
            </div>

            <div style="margin:15px 0;padding:10px;background:#1a1a2a;border:1px solid #3a3a5a;border-radius:5px;">
                <h3>🎒 材料设置</h3>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
                    <div>
                        <label>🐟 鱼:</label>
                        <input type="number" id="god-fish" value="${gameState.materials.fish}" style="width:100%;padding:5px;background:#2a2a4a;border:1px solid #4a4a6a;color:#e0e0e0;border-radius:5px;">
                    </div>
                    <div>
                        <label>🪨 矿石:</label>
                        <input type="number" id="god-ore" value="${gameState.materials.ore}" style="width:100%;padding:5px;background:#2a2a4a;border:1px solid #4a4a6a;color:#e0e0e0;border-radius:5px;">
                    </div>
                    <div>
                        <label>✨ 灵魂之尘:</label>
                        <input type="number" id="god-dust" value="${gameState.materials.dust}" style="width:100%;padding:5px;background:#2a2a4a;border:1px solid #4a4a6a;color:#e0e0e0;border-radius:5px;">
                    </div>
                    <div>
                        <label>💎 宝石:</label>
                        <input type="number" id="god-gem" value="${gameState.materials.gem}" style="width:100%;padding:5px;background:#2a2a4a;border:1px solid #4a4a6a;color:#e0e0e0;border-radius:5px;">
                    </div>
                </div>
                <button onclick="setMaterials()" style="margin-top:5px;width:100%;padding:8px;background:linear-gradient(180deg,#4a6a4a 0%,#3a5a3a 100%);border:1px solid #6a8a6a;color:#e0e0e0;border-radius:5px;cursor:pointer;">设置材料</button>
            </div>

            <div style="margin:15px 0;padding:10px;background:#1a1a2a;border:1px solid #3a3a5a;border-radius:5px;">
                <h3>📊 强化设置</h3>
                <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;">
                    <div>
                        <label>⚔️ 攻击等级:</label>
                        <input type="number" id="god-attack" value="${gameState.upgrades.attack}" style="width:100%;padding:5px;background:#2a2a4a;border:1px solid #4a4a6a;color:#e0e0e0;border-radius:5px;">
                    </div>
                    <div>
                        <label>🛡️ 防御等级:</label>
                        <input type="number" id="god-defense" value="${gameState.upgrades.defense}" style="width:100%;padding:5px;background:#2a2a4a;border:1px solid #4a4a6a;color:#e0e0e0;border-radius:5px;">
                    </div>
                    <div>
                        <label>⚡ 速度等级:</label>
                        <input type="number" id="god-speed" value="${gameState.upgrades.speed}" style="width:100%;padding:5px;background:#2a2a4a;border:1px solid #4a4a6a;color:#e0e0e0;border-radius:5px;">
                    </div>
                </div>
                <button onclick="setUpgrades()" style="margin-top:5px;width:100%;padding:8px;background:linear-gradient(180deg,#4a6a4a 0%,#3a5a3a 100%);border:1px solid #6a8a6a;color:#e0e0e0;border-radius:5px;cursor:pointer;">设置强化</button>
            </div>

            <div style="margin:15px 0;padding:10px;background:#1a1a2a;border:1px solid #3a3a5a;border-radius:5px;">
                <h3>🎯 倍率设置</h3>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
                    <div>
                        <label>📦 装备掉率倍率:</label>
                        <input type="number" id="god-equip-drop" step="0.1" value="${gameState.multipliers.equipmentDropRate}" style="width:100%;padding:5px;background:#2a2a4a;border:1px solid #4a4a6a;color:#e0e0e0;border-radius:5px;">
                    </div>
                    <div>
                        <label>💰 金币掉率倍率:</label>
                        <input type="number" id="god-gold-drop" step="0.1" value="${gameState.multipliers.goldDropRate}" style="width:100%;padding:5px;background:#2a2a4a;border:1px solid #4a4a6a;color:#e0e0e0;border-radius:5px;">
                    </div>
                    <div>
                        <label>⭐ 经验获取倍率:</label>
                        <input type="number" id="god-xp-rate" step="0.1" value="${gameState.multipliers.xpRate}" style="width:100%;padding:5px;background:#2a2a4a;border:1px solid #4a4a6a;color:#e0e0e0;border-radius:5px;">
                    </div>
                    <div>
                        <label>📈 属性成长倍率:</label>
                        <input type="number" id="god-stat-growth" step="0.1" value="${gameState.multipliers.statGrowthRate}" style="width:100%;padding:5px;background:#2a2a4a;border:1px solid #4a4a6a;color:#e0e0e0;border-radius:5px;">
                    </div>
                </div>
                <button onclick="setMultipliers()" style="margin-top:5px;width:100%;padding:8px;background:linear-gradient(180deg,#4a6a4a 0%,#3a5a3a 100%);border:1px solid #6a8a6a;color:#e0e0e0;border-radius:5px;cursor:pointer;">设置倍率</button>
            </div>

            <div style="margin:15px 0;padding:10px;background:#1a1a2a;border:1px solid #3a3a5a;border-radius:5px;">
                <h3>🎭 角色设置</h3>
                <div id="god-characters"></div>
                <button onclick="renderGodCharacters()" style="margin-top:5px;padding:8px;background:linear-gradient(180deg,#4a6a4a 0%,#3a5a3a 100%);border:1px solid #6a8a6a;color:#e0e0e0;border-radius:5px;cursor:pointer;">刷新角色列表</button>
            </div>

            <div style="margin:15px 0;padding:10px;background:#1a1a2a;border:1px solid #3a3a5a;border-radius:5px;">
                <h3>🛡️ 装备生成</h3>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
                    <div>
                        <label>装备等级:</label>
                        <input type="number" id="god-item-level" value="50" min="1" max="80" style="width:100%;padding:5px;background:#2a2a4a;border:1px solid #4a4a6a;color:#e0e0e0;border-radius:5px;">
                    </div>
                    <div>
                        <label>装备品质:</label>
                        <select id="god-item-quality" style="width:100%;padding:5px;background:#2a2a4a;border:1px solid #4a4a6a;color:#e0e0e0;border-radius:5px;">
                            <option value="common">普通</option>
                            <option value="uncommon">优秀</option>
                            <option value="rare">精良</option>
                            <option value="epic">史诗</option>
                            <option value="legendary">传说</option>
                        </select>
                    </div>
                </div>
                <button onclick="generateGodItem()" style="margin-top:5px;padding:8px;background:linear-gradient(180deg,#4a6a4a 0%,#3a5a3a 100%);border:1px solid #6a8a6a;color:#e0e0e0;border-radius:5px;cursor:pointer;">生成装备</button>
            </div>

            <div style="margin:15px 0;padding:10px;background:#1a1a2a;border:1px solid #3a3a5a;border-radius:5px;">
                <h3>✨ 快捷操作</h3>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
                    <button onclick="maxUpgrades()" style="padding:8px;background:linear-gradient(180deg,#6a4a8a 0%,#5a3a7a 100%);border:1px solid #8a6aaa;color:#e0e0e0;border-radius:5px;cursor:pointer;">全强化满级</button>
                    <button onclick="addRandomItems(10)" style="padding:8px;background:linear-gradient(180deg,#6a4a8a 0%,#5a3a7a 100%);border:1px solid #8a6aaa;color:#e0e0e0;border-radius:5px;cursor:pointer;">随机10件装备</button>
                    <button onclick="completeAllQuests()" style="padding:8px;background:linear-gradient(180deg,#6a4a8a 0%,#5a3a7a 100%);border:1px solid #8a6aaa;color:#e0e0e0;border-radius:5px;cursor:pointer;">完成所有任务</button>
                    <button onclick="addMaxMaterials()" style="padding:8px;background:linear-gradient(180deg,#6a4a8a 0%,#5a3a7a 100%);border:1px solid #8a6aaa;color:#e0e0e0;border-radius:5px;cursor:pointer;">添加满材料</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    renderGodCharacters();
}

// 设置金币
function setGold() {
    const value = parseInt(document.getElementById('god-gold').value);
    if (!isNaN(value)) {
        gameState.gold = value;
        saveGame();
        updateUI();
        alert('金币已设置！');
    }
}

// 设置材料
function setMaterials() {
    gameState.materials.fish = parseInt(document.getElementById('god-fish').value) || 0;
    gameState.materials.ore = parseInt(document.getElementById('god-ore').value) || 0;
    gameState.materials.dust = parseInt(document.getElementById('god-dust').value) || 0;
    gameState.materials.gem = parseInt(document.getElementById('god-gem').value) || 0;
    saveGame();
    updateUI();
    alert('材料已设置！');
}

// 设置强化
function setUpgrades() {
    gameState.upgrades.attack = parseInt(document.getElementById('god-attack').value) || 0;
    gameState.upgrades.defense = parseInt(document.getElementById('god-defense').value) || 0;
    gameState.upgrades.speed = parseInt(document.getElementById('god-speed').value) || 0;
    saveGame();
    updateUI();
    alert('强化已设置！');
}

// 设置倍率
function setMultipliers() {
    gameState.multipliers.equipmentDropRate = parseFloat(document.getElementById('god-equip-drop').value) || 1.0;
    gameState.multipliers.goldDropRate = parseFloat(document.getElementById('god-gold-drop').value) || 1.0;
    gameState.multipliers.xpRate = parseFloat(document.getElementById('god-xp-rate').value) || 1.0;
    gameState.multipliers.statGrowthRate = parseFloat(document.getElementById('god-stat-growth').value) || 1.0;
    saveGame();
    updateUI();
    alert('倍率已设置！');
}

// 渲染上帝模式角色列表
function renderGodCharacters() {
    const container = document.getElementById('god-characters');
    if (!container) return;

    if (gameState.team.length === 0) {
        container.innerHTML = '<p style="color:#888;">没有角色</p>';
        return;
    }

    container.innerHTML = gameState.team.map((char, index) => `
        <div style="padding:10px;background:#2a2a4a;border:1px solid #4a4a6a;border-radius:5px;margin-bottom:10px;">
            <div style="font-weight:bold;color:#ffd700;">${char.name} (${CLASSES[char.class].name})</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:5px;margin-top:5px;">
                <div>
                    <label style="font-size:0.8em;">等级:</label>
                    <input type="number" id="god-char-${index}-level" value="${char.level}" min="1" max="100" style="width:100%;padding:3px;background:#1a1a2a;border:1px solid #3a3a5a;color:#e0e0e0;border-radius:3px;">
                </div>
                <div>
                    <label style="font-size:0.8em;">经验值:</label>
                    <input type="number" id="god-char-${index}-xp" value="${char.xp}" style="width:100%;padding:3px;background:#1a1a2a;border:1px solid #3a3a5a;color:#e0e0e0;border-radius:3px;">
                </div>
                <div>
                    <label style="font-size:0.8em;">生命值:</label>
                    <input type="number" id="god-char-${index}-hp" value="${Math.floor(char.hp)}" style="width:100%;padding:3px;background:#1a1a2a;border:1px solid #3a3a5a;color:#e0e0e0;border-radius:3px;">
                </div>
                <div>
                    <label style="font-size:0.8em;">状态:</label>
                    <select id="god-char-${index}-dead" onchange="setCharacterDead(${index})" style="width:100%;padding:3px;background:#1a1a2a;border:1px solid #3a3a5a;color:#e0e0e0;border-radius:3px;">
                        <option value="false" ${!char.dead ? 'selected' : ''}>存活</option>
                        <option value="true" ${char.dead ? 'selected' : ''}>阵亡</option>
                    </select>
                </div>
            </div>
            <button onclick="setCharacterStats(${index})" style="margin-top:5px;padding:5px;width:100%;background:linear-gradient(180deg,#4a6a4a 0%,#3a5a3a 100%);border:1px solid #6a8a6a;color:#e0e0e0;border-radius:5px;cursor:pointer;">更新</button>
        </div>
    `).join('');
}

// 设置角色状态
function setCharacterDead(index) {
    const dead = document.getElementById(`god-char-${index}-dead`).value === 'true';
    gameState.team[index].dead = dead;
    saveGame();
}

// 设置角色属性
function setCharacterStats(index) {
    const level = parseInt(document.getElementById(`god-char-${index}-level`).value) || 1;
    const xp = parseInt(document.getElementById(`god-char-${index}-xp`).value) || 0;
    const hp = parseInt(document.getElementById(`god-char-${index}-hp`).value) || 100;

    gameState.team[index].level = Math.min(100, Math.max(1, level));
    gameState.team[index].xp = xp;
    gameState.team[index].hp = hp;
    gameState.team[index].maxHp = hp;

    saveGame();
    updateUI();
    renderGodCharacters();
    alert('角色属性已更新！');
}

// 生成装备
function generateGodItem() {
    const level = parseInt(document.getElementById('god-item-level').value) || 50;
    const quality = document.getElementById('god-item-quality').value;

    const qualityInfo = ITEM_QUALITIES[quality];
    const slot = EQUIPMENT_SLOTS[Math.floor(Math.random() * EQUIPMENT_SLOTS.length)];
    const baseValue = level * 2;

    const equipment = {
        id: Date.now() + Math.random(),
        name: `${qualityInfo.name}${slot === 'weapon' ? '武器' : slot === 'helmet' ? '头盔' : slot === 'chest' ? '胸甲' : slot === 'legs' ? '护腿' : slot === 'gloves' ? '手套' : slot === 'boots' ? '靴子' : slot === 'necklace' ? '项链' : '戒指'}`,
        slot: slot,
        quality: quality,
        level: level,
        attack: slot === 'weapon' || slot === 'ring1' || slot === 'ring2' || slot === 'necklace' ? Math.floor(baseValue * qualityInfo.multiplier) : 0,
        defense: slot !== 'weapon' ? Math.floor(baseValue * qualityInfo.multiplier) : 0,
        hp: slot === 'chest' || slot === 'legs' ? Math.floor(baseValue * qualityInfo.multiplier * 2) : 0,
        enhance: 0
    };

    gameState.inventory.push(equipment);
    saveGame();
    updateUI();
    alert(`已生成装备：${equipment.name}`);
}

// 全强化满级
function maxUpgrades() {
    gameState.upgrades.attack = 9999;
    gameState.upgrades.defense = 9999;
    gameState.upgrades.speed = 10;
    saveGame();
    updateUI();
    alert('强化已全部达到满级！');
}

// 添加随机装备
function addRandomItems(count) {
    for (let i = 0; i < count; i++) {
        const level = Math.floor(Math.random() * 80) + 1;
        const qualities = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
        const quality = qualities[Math.floor(Math.random() * qualities.length)];
        const qualityInfo = ITEM_QUALITIES[quality];
        const slot = EQUIPMENT_SLOTS[Math.floor(Math.random() * EQUIPMENT_SLOTS.length)];
        const baseValue = level * 2;

        const equipment = {
            id: Date.now() + Math.random() + i,
            name: `${qualityInfo.name}${slot === 'weapon' ? '武器' : slot === 'helmet' ? '头盔' : slot === 'chest' ? '胸甲' : slot === 'legs' ? '护腿' : slot === 'gloves' ? '手套' : slot === 'boots' ? '靴子' : slot === 'necklace' ? '项链' : '戒指'}`,
            slot: slot,
            quality: quality,
            level: level,
            attack: slot === 'weapon' || slot === 'ring1' || slot === 'ring2' || slot === 'necklace' ? Math.floor(baseValue * qualityInfo.multiplier) : 0,
            defense: slot !== 'weapon' ? Math.floor(baseValue * qualityInfo.multiplier) : 0,
            hp: slot === 'chest' || slot === 'legs' ? Math.floor(baseValue * qualityInfo.multiplier * 2) : 0,
            enhance: Math.floor(Math.random() * (qualityInfo.maxEnhance + 1))
        };

        gameState.inventory.push(equipment);
    }
    saveGame();
    updateUI();
    alert(`已添加 ${count} 件随机装备！`);
}

// 完成所有任务
function completeAllQuests() {
    const zone = ZONES[gameState.currentZone];
    let completedCount = 0;

    zone.quests.forEach(quest => {
        if (!gameState.completedQuests.includes(quest.id)) {
            gameState.activeQuests.push({
                ...quest,
                progress: quest.count
            });
            completedCount++;
        }
    });

    if (completedCount > 0) {
        alert(`已完成 ${completedCount} 个任务，请在任务面板领取奖励！`);
        renderQuests();
        renderActiveQuests();
    } else {
        alert('当前区域所有任务都已完成！');
    }
}

// 添加满材料
function addMaxMaterials() {
    gameState.materials.fish = 9999;
    gameState.materials.ore = 9999;
    gameState.materials.dust = 9999;
    gameState.materials.gem = 9999;
    saveGame();
    updateUI();
    alert('材料已添加到最大值！');
}

// 关闭掉落模态框
function closeLootModal() {
    const modal = document.getElementById('loot-modal');
    if (modal) {
        modal.classList.add('hidden');
        pendingLoot = [];
    }
}

// 确认拾取
function confirmLoot() {
    if (pendingLoot.length === 0) {
        closeLootModal();
        return;
    }

    // 添加到背包
    pendingLoot.forEach(item => {
        gameState.inventory.push(item);
    });

    // 保存并更新UI
    saveGame();
    updateUI();
    
    // 关闭模态框
    closeLootModal();
}

// 关闭任务奖励模态框
function closeQuestReward() {
    const modal = document.getElementById('quest-reward-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// 切换帮助模态框
function toggleHelp() {
    const modal = document.getElementById('help-modal');
    if (modal) {
        modal.classList.toggle('hidden');
    }
}

// 初始化
window.onload = initGame;
