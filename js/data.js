// ===== CHARACTER DATA =====
var CHARACTERS = {
    euler: {
        name: "欧拉", title: "微分流派", icon: "🧙‍♂️", color: "#4a9eff", bg: "linear-gradient(135deg,#4a9eff,#1a5fb4)",
        desc: "不断对怪物函数求导，降低连续性。擅长控制战局，让敌人变得脆弱。",
        passive: "每回合首次求导额外降低15%连续性",
        passiveEffect: function() { return { firstDiffBonus: 15 }; },
        starter: ["strike","defend","defend","d1","d1","d2","d3","i1","t1","calc"],
        maxHp: 80,
        skills: [
            { id:"e1", name:"微分直觉", level:0, maxLevel:3, desc:"每回合首次求导额外降低连续性", effect:"diffBonus", values:[0,20,35,55] },
            { id:"e2", name:"链式精通", level:0, maxLevel:3, desc:"链式法则加成提升至70%/90%/130%", effect:"chainBonus", values:[0,70,90,130] },
            { id:"e3", name:"解析之眼", level:0, maxLevel:3, desc:"战斗开始时查看敌人意图", effect:"seeIntent", values:[0,1,1,1] }
        ]
    },
    gauss: {
        name: "高斯", title: "积分流派", icon: "👑", color: "#ff6b6b", bg: "linear-gradient(135deg,#ff6b6b,#c0392b)",
        desc: "根据怪物可导性造成爆发伤害。敌人越光滑，你的伤害越高。",
        passive: "积分卡基础伤害+3，可导性>75%时暴击",
        passiveEffect: function() { return { intBonus: 3, intCrit: 75 }; },
        starter: ["strike","strike","defend","defend","i1","i1","i2","i3","d1","calc"],
        maxHp: 80,
        skills: [
            { id:"g1", name:"积分强化", level:0, maxLevel:3, desc:"积分卡基础伤害+3/+6/+10", effect:"intBonus", values:[0,3,6,10] },
            { id:"g2", name:"光滑判定", level:0, maxLevel:3, desc:"可导性>65%/55%/45%即可暴击", effect:"smoothCrit", values:[100,65,55,45] },
            { id:"g3", name:"正态分布", level:0, maxLevel:3, desc:"回合开始时有25%/45%/65%概率获得5护盾", effect:"normalShield", values:[0,25,45,65] }
        ]
    },
    lhopital: {
        name: "洛必达", title: "定理流派", icon: "⚡", color: "#ffd93d", bg: "linear-gradient(135deg,#ffd93d,#b7950b)",
        desc: "当怪物满足特定条件时，触发毁灭性定理效果。高风险高回报。",
        passive: "定理卡费用-1，条件触发时伤害x2.5",
        passiveEffect: function() { return { thmDiscount: true, thmDouble: true }; },
        starter: ["strike","defend","defend","t1","t1","t2","d2","i2","calc","calc"],
        maxHp: 75,
        skills: [
            { id:"l1", name:"极限突破", level:0, maxLevel:3, desc:"定理卡费用-1（最低1）", effect:"thmDiscount", values:[0,1,1,1] },
            { id:"l2", name:"未定式征服", level:0, maxLevel:3, desc:"条件触发时伤害x2/x2.5/x3.5", effect:"conditionDmg", values:[1,2,2.5,3.5] },
            { id:"l3", name:"洛必达法则", level:0, maxLevel:3, desc:"HP低于50%时伤害+4/+8/+15", effect:"lowHpBonus", values:[0,4,8,15] }
        ]
    },
    riemann: {
        name: "黎曼", title: "级数流派", icon: "📈", color: "#6bcb77", bg: "linear-gradient(135deg,#6bcb77,#27ae60)",
        desc: "召唤数学级数辅助战斗，越战越强，累积的级数可造成毁灭性打击。",
        passive: "每打出3张卡，下张级数卡伤害+50%",
        passiveEffect: function() { return { seriesBoost: 50, seriesThreshold: 3 }; },
        starter: ["strike","defend","s1","s1","s2","i1","d1","t1","calc","calc"],
        maxHp: 70,
        skills: [
            { id:"r1", name:"级数求和", level:0, maxLevel:3, desc:"级数卡基础伤害+2/+5/+8", effect:"seriesBonus", values:[0,2,5,8] },
            { id:"r2", name:"收敛加速", level:0, maxLevel:3, desc:"级数累积速度+1/+2/+3", effect:"seriesSpeed", values:[0,1,2,3] },
            { id:"r3", name:"发散护盾", level:0, maxLevel:3, desc:"级数伤害溢出时获得护盾", effect:"seriesBlock", values:[0,30,50,80] }
        ]
    },
    cauchy: {
        name: "柯西", title: "收敛流派", icon: "🎯", color: "#a55eea", bg: "linear-gradient(135deg,#a55eea,#8e44ad)",
        desc: "控制敌人的收敛状态，让敌人陷入停滞与混乱。",
        passive: "敌人每回合有20%概率跳过行动",
        passiveEffect: function() { return { skipChance: 20 }; },
        starter: ["strike","defend","defend","c1","c1","i2","d2","t1","calc","calc"],
        maxHp: 85,
        skills: [
            { id:"c1", name:"收敛压制", level:0, maxLevel:3, desc:"跳过行动概率+10%/+20%/+30%", effect:"skipBoost", values:[0,10,20,30] },
            { id:"c2", name:"柯西序列", level:0, maxLevel:3, desc:"连续出牌时伤害+2/+4/+7", effect:"sequenceDmg", values:[0,2,4,7] },
            { id:"c3", name:"完备空间", level:0, maxLevel:3, desc:"HP上限+5/+10/+15", effect:"hpBonus", values:[0,5,10,15] }
        ]
    },
    lagrange: {
        name: "拉格朗日", title: "乘子流派", icon: "⚖️", color: "#ffa502", bg: "linear-gradient(135deg,#ffa502,#e67e22)",
        desc: "资源转换与优化大师，可以将一种能量转化为另一种，灵活应变。",
        passive: "每回合可将1点任意能量转化为另一种",
        passiveEffect: function() { return { convert: true }; },
        starter: ["strike","defend","lg1","lg1","i1","d1","t1","calc","calc","calc"],
        maxHp: 75,
        skills: [
            { id:"lg1", name:"乘子强化", level:0, maxLevel:3, desc:"能量转换量+1/+2/+3", effect:"convertBonus", values:[0,1,2,3] },
            { id:"lg2", name:"优化算法", level:0, maxLevel:3, desc:"抽牌+1/+1/+2", effect:"drawBonus", values:[0,1,1,2] },
            { id:"lg3", name:"极值定理", level:0, maxLevel:3, desc:"手牌上限+1/+2/+3", effect:"handLimit", values:[0,1,2,3] }
        ]
    }
};

// ===== CARD DATABASE =====
var CARD_DB = {
    // Skill
    strike: { name:"打击", type:"skill", cost:1, desc:"造成6伤害", dmg:6, fx:"slash", rarity:"common" },
    defend: { name:"防御", type:"skill", cost:1, desc:"获得8护盾", block:8, fx:"block", rarity:"common" },
    calc: { name:"计算", type:"skill", cost:1, desc:"造成4伤害，抽1张", dmg:4, draw:1, fx:"slash", rarity:"common" },
    analyze: { name:"分析", type:"skill", cost:1, desc:"抽2张，下回合抽牌+1", draw:2, nextDraw:1, fx:"draw", rarity:"uncommon" },
    proof: { name:"反证法", type:"skill", cost:2, desc:"获得12护盾，敌人下回合伤害-3", block:12, enemyDmgDown:3, fx:"block", rarity:"uncommon" },
    induction: { name:"数学归纳", type:"skill", cost:2, desc:"造成5伤害，重复3次", dmg:5, repeat:3, fx:"slash", rarity:"rare" },
    // Diff
    d1: { name:"求导", type:"diff", cost:1, desc:"求导+造成5伤", dmg:5, diff:1, fx:"derivative", rarity:"common" },
    d2: { name:"高阶导", type:"diff", cost:2, desc:"求导2次+造成8伤", dmg:8, diff:2, fx:"derivative", rarity:"common" },
    d3: { name:"链式法则", type:"diff", cost:1, desc:"求导，下张卡+60%", diff:1, chain:true, fx:"chain", rarity:"uncommon" },
    taylor: { name:"泰勒展开", type:"diff", cost:2, desc:"造成14伤，抽1张", dmg:14, draw:1, fx:"derivative", rarity:"uncommon" },
    limit: { name:"极限逼近", type:"diff", cost:1, desc:"造成5伤，获得5护盾", dmg:5, block:5, fx:"derivative", rarity:"common" },
    implicit: { name:"隐函数", type:"diff", cost:2, desc:"求导3次，无视连续性", diff:3, ignoreCont:true, fx:"derivative", rarity:"rare" },
    // Int
    i1: { name:"不定积分", type:"int", cost:1, desc:"可导时14伤/否则4伤", dmg:14, dmgLow:4, fx:"integral", rarity:"common" },
    i2: { name:"定积分", type:"int", cost:2, desc:"连续低时22伤/否则8伤", dmg:22, dmgLow:8, fx:"integral", rarity:"common" },
    i3: { name:"分部积分", type:"int", cost:2, desc:"造成12伤，回复5HP", dmg:12, heal:5, fx:"integral", rarity:"uncommon" },
    substitution: { name:"换元法", type:"int", cost:1, desc:"造成8伤，抽1张", dmg:8, draw:1, fx:"integral", rarity:"common" },
    improper: { name:"反常积分", type:"int", cost:3, desc:"造成28伤，能量每点+4", dmg:28, energyBonus:4, fx:"integral", rarity:"rare" },
    lebesgue: { name:"勒贝格积分", type:"int", cost:2, desc:"可测时25伤/否则6伤", dmg:25, dmgLow:6, fx:"integral", rarity:"rare" },
    // Thm
    t1: { name:"中值定理", type:"thm", cost:1, desc:"造成10伤，敌人脆弱2", dmg:10, vulnerable:2, fx:"thm", rarity:"common" },
    t2: { name:"洛必达", type:"thm", cost:2, desc:"连续<30%时28伤/否则10伤", dmg:28, dmgLow:10, fx:"lhopital", rarity:"uncommon" },
    t3: { name:"牛顿-莱布尼茨", type:"thm", cost:2, desc:"可导性x1.3=伤害", dmgScale:1.3, fx:"integral", rarity:"uncommon" },
    cauchy: { name:"柯西收敛", type:"thm", cost:1, desc:"获得10护盾，抽1张", block:10, draw:1, fx:"block", rarity:"common" },
    squeeze: { name:"夹逼定理", type:"thm", cost:1, desc:"造成8伤，HP<50%时15伤", dmg:8, dmgHalf:15, fx:"thm", rarity:"common" },
    fundamental: { name:"微积分基本定理", type:"thm", cost:3, desc:"造成22伤，重置函数", dmg:22, reset:true, fx:"thm", rarity:"rare" },
    green: { name:"格林公式", type:"thm", cost:2, desc:"造成15伤，获得10护盾", dmg:15, block:10, fx:"thm", rarity:"rare" },
    // Series
    s1: { name:"几何级数", type:"series", cost:1, desc:"造成6伤，级数+1", dmg:6, series:1, fx:"series", rarity:"common" },
    s2: { name:"调和级数", type:"series", cost:2, desc:"造成10伤，级数+2", dmg:10, series:2, fx:"series", rarity:"common" },
    s3: { name:"幂级数", type:"series", cost:2, desc:"级数x2=伤害", seriesScale:2, fx:"series", rarity:"uncommon" },
    s4: { name:"傅里叶级数", type:"series", cost:3, desc:"级数x3，无视防御", seriesScale:3, ignoreBlock:true, fx:"series", rarity:"rare" },
    // Converge
    c1: { name:"柯西判敛", type:"converge", cost:1, desc:"敌人下回合50%跳过", skipTurn:0.5, fx:"converge", rarity:"common" },
    c2: { name:"单调有界", type:"converge", cost:2, desc:"敌人攻击-40%", weaken:0.4, fx:"converge", rarity:"uncommon" },
    // Lagrange
    lg1: { name:"拉格朗日点", type:"lagrange", cost:1, desc:"转化2点能量", convert:2, fx:"convert", rarity:"common" },
    lg2: { name:"乘子爆发", type:"lagrange", cost:2, desc:"造成15伤，能量+1", dmg:15, energyGain:1, fx:"convert", rarity:"uncommon" }
};

// ===== FUNCTION FORMS =====
var FUNC_FORMS = {
    "f(x)=|x|": { c:100, d:0, df:50, nextDiff:"f(x)=sign(x)" },
    "f(x)=sign(x)": { c:0, d:0, df:80, nextDiff:"f(x)=0" },
    "f(x)=0": { c:100, d:100, df:0, nextDiff:"f(x)=0" },
    "f(x)=x²": { c:100, d:100, df:30, nextDiff:"f(x)=2x" },
    "f(x)=2x": { c:100, d:100, df:20, nextDiff:"f(x)=2" },
    "f(x)=2": { c:100, d:100, df:10, nextDiff:"f(x)=0" },
    "f(x)=sin(x)": { c:100, d:100, df:35, nextDiff:"f(x)=cos(x)" },
    "f(x)=cos(x)": { c:100, d:100, df:35, nextDiff:"f(x)=-sin(x)" },
    "f(x)=-sin(x)": { c:100, d:100, df:35, nextDiff:"f(x)=-cos(x)" },
    "f(x)=-cos(x)": { c:100, d:100, df:35, nextDiff:"f(x)=sin(x)" },
    "f(x)=Dirichlet": { c:0, d:0, df:80, nextDiff:"f(x)=0" },
    "f(x)=eˣ": { c:100, d:100, df:25, nextDiff:"f(x)=eˣ" },
    "f(x)=ln(x)": { c:100, d:100, df:40, nextDiff:"f(x)=1/x" },
    "f(x)=1/x": { c:0, d:0, df:60, nextDiff:"f(x)=-1/x²" },
    "f(x)=tan(x)": { c:0, d:0, df:50, nextDiff:"f(x)=sec²(x)" }
};
function getFunc(name) { return FUNC_FORMS[name] || { c:50, d:50, df:50, nextDiff:"f(x)=0" }; }

// ===== ENEMIES =====
var ENEMIES = {
    normal: [
        { name:"不可导之魔", hp:45, func:"f(x)=|x|", color:"#ff4757", desc:"绝对值函数，零点不可导", pattern:["attack","attack","defend"], icon:"👹" },
        { name:"狄利克雷", hp:40, func:"f(x)=Dirichlet", color:"#a55eea", desc:"处处不连续，处处不可导", pattern:["attack","buff","attack"], icon:"👾" },
        { name:"跳跃函数", hp:50, func:"f(x)=sign(x)", color:"#ffa502", desc:"左右极限存在但不相等", pattern:["defend","attack","attack"], icon:"🦎" },
        { name:"震荡函数", hp:42, func:"f(x)=sin(x)", color:"#26de81", desc:"无限震荡，难以捉摸", pattern:["attack","debuff","attack"], icon:"🐍" },
        { name:"多项式幽灵", hp:48, func:"f(x)=x²", color:"#4a9eff", desc:"光滑但不断膨胀", pattern:["buff","attack","defend"], icon:"👻" },
        { name:"振荡奇点", hp:44, func:"f(x)=tan(x)", color:"#ff9ff3", desc:"在奇点处趋于无穷", pattern:["attack","attack","buff"], icon:"🦑" },
        { name:"分段函数", hp:52, func:"f(x)=|x|", color:"#54a0ff", desc:"在不同区间表现各异", pattern:["defend","buff","attack","attack"], icon:"🦀" },
        { name:"隐函数", hp:46, func:"f(x)=ln(x)", color:"#1dd1a1", desc:"隐藏的真相难以求导", pattern:["debuff","attack","defend"], icon:"🦉" }
    ],
    elite: [
        { name:"魏尔斯特拉斯", hp:90, func:"f(x)=sin(x)", color:"#26de81", desc:"连续但处处不可导的诡异函数", pattern:["attack","buff","attack","defend"], elite:true, icon:"🐉" },
        { name:"康托幽灵", hp:85, func:"f(x)=|x|", color:"#4a9eff", desc:"魔鬼阶梯的化身，分形之恶", pattern:["defend","attack","attack","buff"], elite:true, icon:"🦇" },
        { name:"黎曼ζ", hp:95, func:"f(x)=x²", color:"#ff6b6b", desc:"解析延拓的守护者", pattern:["buff","attack","debuff","attack"], elite:true, icon:"🦂" },
        { name:"傅里叶恶魔", hp:100, func:"f(x)=sin(x)", color:"#a55eea", desc:"将一切拆解为波的恶魔", pattern:["attack","debuff","buff","attack"], elite:true, icon:"🐲" },
        { name:"拉普拉斯幽灵", hp:88, func:"f(x)=eˣ", color:"#ffd93d", desc:"变换域中的幽灵", pattern:["buff","attack","attack","defend"], elite:true, icon:"👺" },
        { name:"泰勒畸变体", hp:92, func:"f(x)=x²", color:"#ff9ff3", desc:"无穷阶展开的畸形产物", pattern:["debuff","attack","buff","attack"], elite:true, icon:"🦠" }
    ],
    bosses: [
        { name:"发散之王", hp:160, func:"f(x)=Dirichlet", color:"#ff4757", desc:"发散瘟疫的源头", pattern:["attack","buff","attack","debuff","defend"], boss:true, floor:1, icon:"👿" },
        { name:"无穷大领主", hp:200, func:"f(x)=eˣ", color:"#ffd93d", desc:"指数增长的暴君", pattern:["buff","attack","attack","debuff","attack"], boss:true, floor:2, icon:"😈" },
        { name:"发散之源", hp:280, func:"f(x)=Dirichlet", color:"#a55eea", desc:"数学的终极噩梦", pattern:["attack","buff","debuff","attack","defend","buff"], boss:true, floor:3, icon:"💀" },
        { name:"级数吞噬者", hp:240, func:"f(x)=1/x", color:"#6bcb77", desc:"吞噬一切级数的怪物", pattern:["buff","debuff","attack","attack","defend"], boss:true, floor:2, icon:"🐙" },
        { name:"发散母核", hp:350, func:"f(x)=Dirichlet", color:"#ff4757", desc:"真·最终BOSS，发散的根源", pattern:["attack","buff","debuff","attack","buff","defend"], boss:true, floor:3, icon:"☠️" }
    ]
};

// ===== RELICS =====
var RELICS = [
    { name:"旧笔记本", icon:"📓", desc:"每回合抽牌+1", effect:"drawPlus", rarity:"common" },
    { name:"破损眼镜", icon:"👓", desc:"求导卡额外降低8%连续性", effect:"diffBoost", rarity:"common" },
    { name:"黎曼猜想", icon:"❓", desc:"积分卡伤害+4", effect:"intBoost", rarity:"uncommon" },
    { name:"欧拉公式", icon:"🧮", desc:"定理卡费用-1（最低1）", effect:"thmDiscount", rarity:"uncommon" },
    { name:"泰勒余项", icon:"📝", desc:"战斗开始时获得8护盾", effect:"startBlock", rarity:"common" },
    { name:"柯西不等式", icon:"⚖️", desc:"每回合首次攻击伤害+5", effect:"firstStrike", rarity:"uncommon" },
    { name:"费马手稿", icon:"📜", desc:"敌人意图始终可见", effect:"seeIntent", rarity:"rare" },
    { name:"阿基米德杠杆", icon:"🏗️", desc:"防御卡护盾+3", effect:"blockBoost", rarity:"common" },
    { name:"牛顿苹果", icon:"🍎", desc:"重力额外造成3伤害", effect:"gravityDmg", rarity:"uncommon" },
    { name:"哥德尔不完备", icon:"🔲", desc:"每3回合获得1能量", effect:"energyCycle", rarity:"rare" },
    { name:"图灵机", icon:"🤖", desc:"计算卡额外抽1张", effect:"calcDraw", rarity:"uncommon" },
    { name:"帕斯卡三角", icon:"🔺", desc:"连击伤害+4", effect:"comboBoost", rarity:"uncommon" },
    { name:"伯努利方程", icon:"🌊", desc:"流体额外降低敌人连续性", effect:"flowDiff", rarity:"rare" },
    { name:"笛卡尔坐标", icon:"📐", desc:"手牌上限+2", effect:"handLimit", rarity:"rare" },
    { name:"希尔伯特空间", icon:"🌌", desc:"可导性判定-10%门槛", effect:"smoothReq", rarity:"epic" },
    { name:"伽罗瓦群", icon:"🔮", desc:"出牌后20%概率返还能量", effect:"energyRefund", rarity:"epic" },
    { name:"庞加莱猜想", icon:"🌍", desc:"HP上限+15，回复效率+20%", effect:"hpBoost", rarity:"legendary" },
    { name:"纳什均衡", icon:"⚖️", desc:"攻击和防御同时+2", effect:"balanced", rarity:"legendary" },
    { name:"曼德博集合", icon:"🌀", desc:"分形：每次攻击追加1~5随机伤害", effect:"fractal", rarity:"epic" },
    { name:"丘成桐猜想", icon:"⭐", desc:"级数卡伤害+5，级数累积+1", effect:"seriesBoost", rarity:"legendary" }
];

// ===== EVENTS =====
var EVENTS = [
    { title:"📜 柯西中值定理", desc:"你发现了一道古老的中值定理封印，它可以改变周围的数学法则。",
      choices:[
        { text:"应用定理", result:"apply", good:"定理之力涌入！获得一张随机卡牌。", bad:"定理反噬！失去5HP。" },
        { text:"绕过它", result:"avoid", good:"你谨慎地绕过了封印。", bad:"" },
        { text:"深入研究", result:"study", good:"领悟深刻！获得一件遗物。", bad:"精神消耗！失去8HP。" }
      ] },
    { title:"⚖️ 拉格朗日插值", desc:"墙上有无数数据点在发光，它们似乎在等待一个多项式来连接。",
      choices:[
        { text:"构造多项式", result:"poly", good:"完美的插值！回复15HP。", bad:"过拟合了！失去10HP。" },
        { text:"破坏数据", result:"break", good:"获得25金币。", bad:"" },
        { text:"离开", result:"leave", good:"", bad:"" }
      ] },
    { title:"🔮 傅里叶变换", desc:"一个发光的积分符号在脉动，它将时域转换为频域。",
      choices:[
        { text:"执行变换", result:"transform", good:"频域清晰！获得20金币。", bad:"变换失败！失去6HP。" },
        { text:"逆变换", result:"inverse", good:"时间倒流！回复10HP。", bad:"" },
        { text:"避开", result:"avoid", good:"", bad:"" }
      ] },
    { title:"📐 勾股定理祭坛", desc:"一个直角三角形祭坛，三边散发着不同颜色的光芒。",
      choices:[
        { text:"触摸斜边", result:"hypo", good:"最长的边给予最多！获得遗物。", bad:"" },
        { text:"触摸直角边", result:"leg", good:"稳定的支撑！获得15金币和5HP。", bad:"" },
        { text:"献祭计算", result:"sac", good:"", bad:"失去5HP。" }
      ] },
    { title:"🌀 曼德博迷宫", desc:"一个无限递归的迷宫在你面前展开，每个角落都有相同的图案。",
      choices:[
        { text:"深入探索", result:"explore", good:"发现分形核心！获得30金币。", bad:"迷失在递归中！失去12HP。" },
        { text:"计算维度", result:"calc", good:"维度计算正确！获得一张稀有卡牌。", bad:"" },
        { text:"离开", result:"leave", good:"", bad:"" }
      ] },
    { title:"📖 欧拉的遗言", desc:"一本古老的手册漂浮在空中，上面写满了欧拉的手迹。",
      choices:[
        { text:"阅读手稿", result:"read", good:"领悟欧拉智慧！技能点+2。", bad:"知识过载！失去8HP。" },
        { text:"带走手稿", result:"take", good:"获得遗物：欧拉手稿。", bad:"" },
        { text:"烧毁手稿", result:"burn", good:"获得20金币。（为什么要这么做？）", bad:"" }
      ] },
    { title:"⚡ 高斯的闪电", desc:"一道紫色闪电划过天空，那是高斯留下的力量。",
      choices:[
        { text:"吸收闪电", result:"absorb", good:"获得能量+1（永久）！", bad:"能量过载！失去10HP。" },
        { text:"躲避", result:"dodge", good:"闪电擦肩而过。", bad:"" },
        { text:"引导闪电", result:"channel", good:"造成20伤害给当前敌人！", bad:"引导失败！失去6HP。" }
      ] },
    { title:"🌌 希尔伯特空间", desc:"你进入了一个无限维的空间，这里的一切都在同时存在。",
      choices:[
        { text:"探索维度", result:"dim", good:"发现新维度！获得药水x2。", bad:"维度错乱！失去8HP。" },
        { text:"收敛思维", result:"converge", good:"思维收敛！回复20HP。", bad:"" },
        { text:"离开", result:"leave", good:"", bad:"" }
      ] }
];

// ===== POTIONS =====
var POTIONS = [
    { name:"治疗药水", icon:"❤️", desc:"回复25HP", effect:"heal", value:25, rarity:"common" },
    { name:"能量药水", icon:"⚡", desc:"本回合三种能量各+2", effect:"energy", value:2, rarity:"common" },
    { name:"攻击药水", icon:"⚔️", desc:"本回合伤害+8", effect:"dmg", value:8, rarity:"uncommon" },
    { name:"护盾药水", icon:"🛡️", desc:"获得15护盾", effect:"block", value:15, rarity:"common" },
    { name:"级数药水", icon:"📈", desc:"级数+5", effect:"series", value:5, rarity:"uncommon" },
    { name:"转换药水", icon:"🔄", desc:"将敌人连续性重置为100%", effect:"reset", value:0, rarity:"rare" }
];

// ===== QUIZ QUESTIONS =====
var QUIZ_QUESTIONS = [
    { q: "∫ x dx = ?", options: ["x²/2 + C", "x + C", "1 + C", "x² + C"], ans: 0, diff: 1 },
    { q: "d/dx(x²) = ?", options: ["x", "2x", "x²", "2"], ans: 1, diff: 1 },
    { q: "lim(x→0) sin(x)/x = ?", options: ["0", "1", "∞", "不存在"], ans: 1, diff: 1 },
    { q: "∫ x·eˣ dx = ?", options: ["eˣ(x-1)+C", "xeˣ+C", "eˣ+C", "x²eˣ+C"], ans: 0, diff: 2 },
    { q: "d/dx(ln(x²)) = ?", options: ["1/x", "2/x", "x", "2x"], ans: 1, diff: 2 },
    { q: "∫ 1/(1+x²) dx = ?", options: ["ln|1+x²|+C", "arctan(x)+C", "1/(2x)+C", "√(1+x²)+C"], ans: 1, diff: 2 },
    { q: "lim(x→∞) (1+1/x)ˣ = ?", options: ["1", "e", "∞", "0"], ans: 1, diff: 2 },
    { q: "d/dx(sin(x²)) = ?", options: ["cos(x²)", "2x·cos(x²)", "x·cos(x²)", "2cos(x)"], ans: 1, diff: 2 },
    { q: "∫ cos(x)·e^(sin(x)) dx = ?", options: ["e^(sin(x))+C", "sin(x)·eˣ+C", "cos(x)·eˣ+C", "eˣ+C"], ans: 0, diff: 2 },
    { q: "∫₀^π x·sin(x) dx = ?", options: ["π", "2", "π/2", "0"], ans: 0, diff: 3 },
    { q: "d/dx(eˣ·sin(x)) = ?", options: ["eˣ(cos(x)+sin(x))", "eˣ·sin(x)", "eˣ·cos(x)", "eˣ(sin(x)-cos(x))"], ans: 0, diff: 3 },
    { q: "lim(x→0⁺) x·ln(x) = ?", options: ["0", "1", "∞", "-∞"], ans: 0, diff: 3 },
    { q: "∫ x·ln(x) dx = ?", options: ["x²ln(x)/2 - x²/4 + C", "x²ln(x) + C", "x·ln(x) + C", "x²/2 + C"], ans: 0, diff: 3 },
    { q: "d/dx(arctan(x)) = ?", options: ["1/(1+x²)", "1/√(1-x²)", "sec²(x)", "-1/(1+x²)"], ans: 0, diff: 2 },
    { q: "∫ sec²(x) dx = ?", options: ["tan(x)+C", "sec(x)+C", "cos(x)+C", "sin(x)+C"], ans: 0, diff: 2 },
    { q: "lim(x→0) (eˣ-1-x)/x² = ?", options: ["0", "1/2", "1", "∞"], ans: 1, diff: 3 },
    { q: "d/dx(xˣ) = ?", options: ["xˣ(1+ln(x))", "x·xˣ⁻¹", "xˣ·ln(x)", "eˣ"], ans: 0, diff: 3 },
    { q: "∫₀^∞ e⁻ˣ dx = ?", options: ["1", "0", "∞", "e"], ans: 0, diff: 2 },
    { q: "d²/dx²(sin(x)) = ?", options: ["sin(x)", "-sin(x)", "cos(x)", "-cos(x)"], ans: 1, diff: 2 },
    { q: "∫ 1/√(1-x²) dx = ?", options: ["arcsin(x)+C", "arctan(x)+C", "ln|x|+C", "√(1-x²)+C"], ans: 0, diff: 2 },
    { q: "lim(x→1) (x³-1)/(x²-1) = ?", options: ["1", "3/2", "2", "0"], ans: 1, diff: 2 },
    { q: "∫ tan(x) dx = ?", options: ["-ln|cos(x)|+C", "ln|sin(x)|+C", "sec(x)+C", "cos(x)+C"], ans: 0, diff: 2 },
    { q: "d/dx(cosh(x)) = ?", options: ["sinh(x)", "cosh(x)", "tanh(x)", "-sinh(x)"], ans: 0, diff: 3 },
    { q: "∫₀^(π/2) sin²(x) dx = ?", options: ["π/4", "π/2", "1", "0"], ans: 0, diff: 3 },
    { q: "lim(x→∞) sin(x)/x = ?", options: ["1", "0", "∞", "不存在"], ans: 1, diff: 2 },
    { q: "∫ eˣ·cos(x) dx = ?", options: ["eˣ(cos(x)+sin(x))/2 + C", "eˣ·cos(x) + C", "eˣ·sin(x) + C", "eˣ/2 + C"], ans: 0, diff: 3 },
    { q: "d/dx(ln|sin(x)|) = ?", options: ["cot(x)", "tan(x)", "1/sin(x)", "cos(x)"], ans: 0, diff: 3 },
    { q: "∫ x²·eˣ dx = ?", options: ["eˣ(x²-2x+2)+C", "x²eˣ+C", "eˣ·x²/2+C", "2xeˣ+C"], ans: 0, diff: 3 },
    { q: "级数 Σ(1/n²) 收敛到 ?", options: ["π²/6", "π²/3", "1", "发散"], ans: 0, diff: 3 },
    { q: "格林公式联系的是 ?", options: ["线积分与二重积分", "面积与周长", "导数与积分", "级数与函数"], ans: 0, diff: 3 }
];

// ===== STORY DATA =====
var STORY_DATA = {
    prologue: [
        { speaker: "旁白", portrait: "📜", text: "公元2147年，人类文明的数学大厦轰然崩塌。名为『发散瘟疫』的灾难席卷全球——曾经严谨的数学法则变成了狂暴的怪物。" },
        { speaker: "旁白", portrait: "📜", text: "当最后一个定理被证伪，当极限不再收敛，当导数失去了方向——世界开始发散。" },
        { speaker: "???", portrait: "💀", text: "数学...已经死了...没有人能阻止发散..." },
        { speaker: "旁白", portrait: "📜", text: "但在废墟之中，还有最后的希望。六位伟大的数学家——欧拉、高斯、洛必达、黎曼、柯西、拉格朗日——他们的精神凝聚成了传承。" },
        { speaker: "旁白", portrait: "📜", text: "你，是最后一位继承者。你将在微积分地牢中战斗，用求导削弱敌人的连续性，用积分引爆它们的弱点，用定理给予致命一击。" },
        { speaker: "旁白", portrait: "📜", text: "地牢有三层，每层都有更强大的敌人在等待。只有收敛所有发散，才能拯救这个世界。" }
    ],
    floor1_start: [
        { speaker: "欧拉", portrait: "🧙‍♂️", text: "第一层...函数的哀鸣。这里是发散瘟疫最先侵蚀的地方。" },
        { speaker: "高斯", portrait: "👑", text: "小心，这里的怪物还保留着函数的形态，但它们已经不再遵循任何数学法则。" }
    ],
    floor2_start: [
        { speaker: "黎曼", portrait: "📈", text: "第二层...极限的边缘。这里的敌人已经超越了常规的理解。" },
        { speaker: "柯西", portrait: "🎯", text: "收敛与发散的界限在这里变得模糊。保持清醒，不要被无穷吞噬。" }
    ],
    floor3_start: [
        { speaker: "拉格朗日", portrait: "⚖️", text: "第三层...无穷的深渊。这是最危险的地方。" },
        { speaker: "洛必达", portrait: "⚡", text: "发散之源就在这里。只有击败它，世界才能重新收敛。" }
    ],
    boss1: [
        { speaker: "发散之王", portrait: "👿", text: "哈哈哈...又一个自以为是的数学家！你以为你能阻止发散吗？" },
        { speaker: "发散之王", portrait: "👿", text: "我是狄利克雷的化身，处处不连续，处处不可导！你的求导对我无效！" }
    ],
    boss2: [
        { speaker: "无穷大领主", portrait: "😈", text: "指数增长...永无止境...你不过是常数，而我趋向无穷！" },
        { speaker: "无穷大领主", portrait: "😈", text: "感受指数爆炸的恐惧吧！eˣ的增长速度，你永远追不上！" }
    ],
    boss3: [
        { speaker: "发散之源", portrait: "💀", text: "终于...最后的数学家..." },
        { speaker: "发散之源", portrait: "💀", text: "你以为击败了我的仆从就能胜利？我才是发散的本质——不可定义，不可描述，不可战胜！" },
        { speaker: "???", portrait: "✨", text: "不...数学永远不会死。只要还有人相信定理，相信证明，相信收敛——希望就存在！" }
    ],
    endings: {
        normal: { title: "暂时收敛", text: "你击败了发散之源，世界的数学法则开始恢复。但这只是暂时的...发散的种子还埋在深处，等待下一次爆发。" },
        true: { title: "真正的收敛", text: "你发现了发散瘟疫的真正源头——不是数学的失败，而是人类对数学的遗忘。你用证明唤醒了世界的记忆，数学重新成为人类文明的基石。" },
        tragedy: { title: "牺牲", text: "你在最后的战斗中倒下了。但你的精神化作了数学定理，永远守护着这个世界。后人会记住你——最后的数学家。" },
        perfect: { title: "数学之神", text: "完美！你以无伤之躯征服了所有挑战。你的名字被刻在了数学史的顶端，与欧拉、高斯、黎曼并列。你是新的传奇！" }
    }
};

// ===== GAME STATE =====
var G = {
    charId: null, difficulty: "normal",
    hp: 80, maxHp: 80, gold: 100,
    deck: [], drawPile: [], hand: [], discardPile: [],
    relics: [], potions: [],
    floor: 1, map: [], currentNode: null,
    energy: 3, maxEnergy: 3,
    intEnergy: 3, maxIntEnergy: 3,
    diffEnergy: 3, maxDiffEnergy: 3,
    block: 0,
    enemy: null, turn: 1,
    selected: [], chainBonus: 1,
    enemyVulnerable: 0, enemyWeak: 0, enemyRitual: 0,
    firstStrike: true, firstDiff: true, seeIntent: false,
    quizPending: false, quizStreak: 0,
    skillPoints: 0, skills: null,
    comboMode: false, seriesCount: 0,
    cardsPlayedThisTurn: 0, totalTurns: 0,
    noDamageTaken: true, floorClear: [false, false, false],
    endingType: "normal",
    storyChoices: {}
};
function resetG() {
    G = {
        charId: null, difficulty: G.difficulty || "normal",
        hp: 80, maxHp: 80, gold: 100,
        deck: [], drawPile: [], hand: [], discardPile: [],
        relics: [], potions: [],
        floor: 1, map: [], currentNode: null,
        energy: 3, maxEnergy: 3,
        intEnergy: 3, maxIntEnergy: 3,
        diffEnergy: 3, maxDiffEnergy: 3,
        block: 0,
        enemy: null, turn: 1,
        selected: [], chainBonus: 1,
        enemyVulnerable: 0, enemyWeak: 0, enemyRitual: 0,
        firstStrike: true, firstDiff: true, seeIntent: false,
        quizPending: false, quizStreak: 0,
        skillPoints: 0, skills: null,
        comboMode: false, seriesCount: 0,
        cardsPlayedThisTurn: 0, totalTurns: 0,
        noDamageTaken: true, floorClear: [false, false, false],
        endingType: "normal",
        storyChoices: {}
    };
}
