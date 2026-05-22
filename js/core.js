// ===== CORE UTILITIES =====
var GAME_VERSION = "2.0.0";
var DIFFICULTY_MULTIPLIERS = { normal: 1.0, hard: 1.35, hell: 1.8 };
var QUALITY_SETTINGS = { low: 10, medium: 20, high: 35, ultra: 50 };

function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randf(min, max) { return Math.random() * (max - min) + min; }
function randItem(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
}
function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
function lerp(a, b, t) { return a + (b - a) * t; }

// ===== DOM UTILS =====
function $(id) { return document.getElementById(id); }
function show(id) { var el = $(id); if (el) el.classList.add("show"); }
function hide(id) { var el = $(id); if (el) el.classList.remove("show"); }
function toggle(id) { var el = $(id); if (el) el.classList.toggle("show"); }
function setHTML(id, html) { var el = $(id); if (el) el.innerHTML = html; }
function setText(id, text) { var el = $(id); if (el) el.textContent = text; }

// ===== SCREEN MANAGEMENT =====
var currentScreen = null;
function switchScreen(screenId) {
    var screens = document.querySelectorAll("#gameFrame > div[id$='Screen'], #openingScreen, #floorTransition, #bossIntro, #overScreen, #victoryScreen, #importDialog");
    screens.forEach(function(s) { s.classList.remove("show"); });
    show(screenId);
    currentScreen = screenId;
    if (screenId === "battleScreen") startBattleBGM();
    else if (screenId === "mapScreen") startMapBGM();
    else if (screenId === "mainMenuScreen") startMenuBGM();
}

// ===== TOAST SYSTEM =====
function toast(msg, type) {
    type = type || "info";
    var layer = $("toastLayer");
    if (!layer) return;
    var t = document.createElement("div");
    t.className = "toast " + type;
    t.textContent = msg;
    layer.appendChild(t);
    setTimeout(function() { if (t.parentNode) t.parentNode.removeChild(t); }, 3000);
}

// ===== FLOATING TEXT =====
function floatText(text, x, y, color, size, duration) {
    duration = duration || 1200;
    size = size || "1.2em";
    var el = document.createElement("div");
    el.className = "float-text";
    el.textContent = text;
    el.style.color = color;
    el.style.fontSize = size;
    el.style.left = x + "px";
    el.style.top = y + "px";
    $("fxLayer").appendChild(el);
    setTimeout(function() { if (el.parentNode) el.parentNode.removeChild(el); }, duration);
}
function floatDmg(val, color, x, y) {
    color = color || "#ff4757";
    floatText("-" + val, x || rand(140, 260), y || rand(200, 320), color, val > 20 ? "1.5em" : "1.2em", 1500);
}
function floatHeal(val, x, y) {
    floatText("+" + val + " HP", x || rand(40, 120), y || rand(200, 320), "#2ed573", "1.2em", 1200);
}
function floatBlock(val, x, y) {
    floatText("+" + val + " 盾", x || rand(40, 120), y || rand(200, 320), "#5cadff", "1.1em", 1200);
}
function floatGold(val, x, y) {
    floatText("+" + val + " 金币", x || rand(180, 300), y || rand(100, 200), "#ffd93d", "1.1em", 1200);
}

// ===== SCREEN SHAKE =====
function screenShake(intensity) {
    if (!settings.shake) return;
    var frame = $("gameFrame");
    if (!frame) return;
    var cls = intensity === "heavy" ? "shake-heavy" : intensity === "crit" ? "shake-crit" : "shake-light";
    frame.classList.add(cls);
    setTimeout(function() { frame.classList.remove(cls); }, intensity === "crit" ? 700 : intensity === "heavy" ? 500 : 300);
}
function flashScreen(color) {
    var frame = $("gameFrame");
    if (!frame) return;
    var cls = color === "red" ? "flash-red" : "flash-gold";
    frame.classList.add(cls);
    setTimeout(function() { frame.classList.remove(cls); }, 400);
}

// ===== SETTINGS =====
var settings = {
    bgmVolume: 40,
    sfxVolume: 60,
    quality: "medium",
    storySpeed: "normal",
    shake: true
};
function loadSettings() {
    try {
        var s = localStorage.getItem("cdda_settings");
        if (s) settings = JSON.parse(s);
    } catch(e) {}
    applySettings();
}
function saveSettings() {
    try { localStorage.setItem("cdda_settings", JSON.stringify(settings)); } catch(e) {}
}
function applySettings() {
    var bgmSlider = $("bgmVolume");
    var sfxSlider = $("sfxVolume");
    var qualitySel = $("qualitySelect");
    var storySel = $("storySpeed");
    var shakeToggle = $("shakeToggle");
    if (bgmSlider) { bgmSlider.value = settings.bgmVolume; setText("bgmVolumeVal", settings.bgmVolume + "%"); }
    if (sfxSlider) { sfxSlider.value = settings.sfxVolume; setText("sfxVolumeVal", settings.sfxVolume + "%"); }
    if (qualitySel) qualitySel.value = settings.quality;
    if (storySel) storySel.value = settings.storySpeed;
    if (shakeToggle) {
        shakeToggle.className = settings.shake ? "set-toggle" : "set-toggle off";
        shakeToggle.textContent = settings.shake ? "开启" : "关闭";
    }
}
function setBgmVolume(v) { settings.bgmVolume = parseInt(v); saveSettings(); setText("bgmVolumeVal", v + "%"); updateBGMVolume(); }
function setSfxVolume(v) { settings.sfxVolume = parseInt(v); saveSettings(); setText("sfxVolumeVal", v + "%"); }
function setQuality(q) { settings.quality = q; saveSettings(); }
function setStorySpeed(s) { settings.storySpeed = s; saveSettings(); }
function toggleShake() { settings.shake = !settings.shake; saveSettings(); applySettings(); }

// ===== SAVE / LOAD =====
var SAVE_KEY = "cdda_save_v2";
var STATS_KEY = "cdda_stats";
var ACHIEVEMENTS_KEY = "cdda_achievements";

function hasSave() {
    try { return !!localStorage.getItem(SAVE_KEY); } catch(e) { return false; }
}
function saveGame() {
    try {
        var save = {
            version: GAME_VERSION,
            timestamp: Date.now(),
            state: G,
            settings: settings
        };
        localStorage.setItem(SAVE_KEY, JSON.stringify(save));
    } catch(e) { console.error("Save failed", e); }
}
function loadGame() {
    try {
        var s = localStorage.getItem(SAVE_KEY);
        if (!s) return false;
        var save = JSON.parse(s);
        if (save.state) {
            G = save.state;
            return true;
        }
    } catch(e) { console.error("Load failed", e); }
    return false;
}
function clearSave() { try { localStorage.removeItem(SAVE_KEY); } catch(e) {} }

function exportSave() {
    try {
        var data = localStorage.getItem(SAVE_KEY) || "{}";
        var b64 = btoa(unescape(encodeURIComponent(data)));
        navigator.clipboard.writeText(b64).then(function() { toast("存档已复制到剪贴板！", "success"); });
    } catch(e) { toast("导出失败: " + e.message, "error"); }
}
function importSave() { show("importDialog"); $("importTextarea").value = ""; }
function cancelImport() { hide("importDialog"); }
function confirmImport() {
    var text = $("importTextarea").value.trim();
    if (!text) { toast("请输入存档代码", "warning"); return; }
    try {
        var data = decodeURIComponent(escape(atob(text)));
        var save = JSON.parse(data);
        if (save.version && save.state) {
            localStorage.setItem(SAVE_KEY, data);
            loadGame();
            toast("存档导入成功！", "success");
            hide("importDialog");
            backToMenu();
        } else { toast("无效的存档代码", "error"); }
    } catch(e) { toast("导入失败: 格式错误", "error"); }
}
function clearAllData() {
    if (!confirm("确定要清除所有存档、设置、成就和统计数据吗？此操作不可恢复！")) return;
    try {
        localStorage.removeItem(SAVE_KEY);
        localStorage.removeItem(STATS_KEY);
        localStorage.removeItem(ACHIEVEMENTS_KEY);
        localStorage.removeItem("cdda_settings");
        toast("所有数据已清除", "success");
        setTimeout(function() { location.reload(); }, 1000);
    } catch(e) { toast("清除失败", "error"); }
}

// ===== STATS =====
var stats = {
    gamesPlayed: 0, gamesWon: 0, gamesLost: 0,
    totalDamage: 0, totalHeal: 0, totalKills: 0,
    highestDamage: 0, highestFloor: 0,
    quizCorrect: 0, quizTotal: 0,
    cardsPlayed: 0, combos: 0,
    timePlayed: 0
};
function loadStats() {
    try {
        var s = localStorage.getItem(STATS_KEY);
        if (s) { var d = JSON.parse(s); for (var k in d) stats[k] = d[k]; }
    } catch(e) {}
}
function saveStats() { try { localStorage.setItem(STATS_KEY, JSON.stringify(stats)); } catch(e) {} }
function addStat(key, val) { stats[key] = (stats[key] || 0) + (val || 1); saveStats(); }

// ===== ACHIEVEMENTS =====
var achievements = [];
function initAchievements() {
    achievements = [
        { id:"first_step", name:"第一步", desc:"完成第一场战斗", icon:"👣", unlocked:false },
        { id:"first_diff", name:"初识求导", desc:"首次使用求导卡", icon:"∂", unlocked:false },
        { id:"first_int", name:"初识积分", desc:"首次使用积分卡", icon:"∫", unlocked:false },
        { id:"first_boss", name:"BOSS杀手", desc:"首次击败BOSS", icon:"👑", unlocked:false },
        { id:"combo_master", name:"连击大师", desc:"达成5连击", icon:"⚡", unlocked:false },
        { id:"combo_god", name:"连击之神", desc:"达成10连击", icon:"🔥", unlocked:false },
        { id:"quiz_master", name:"学霸", desc:"连续答对5道数学题", icon:"📚", unlocked:false },
        { id:"quiz_god", name:"数学之神", desc:"连续答对10道数学题", icon:"🧮", unlocked:false },
        { id:"rich", name:"腰缠万贯", desc:"拥有300+金币", icon:"💰", unlocked:false },
        { id:"collector", name:"收藏家", desc:"收集10件遗物", icon:"🏺", unlocked:false },
        { id:"full_hp", name:"毫发无伤", desc:"满血击败一个BOSS", icon:"❤️", unlocked:false },
        { id:"comeback", name:"绝地反击", desc:"HP低于10时击败敌人", icon:"🩸", unlocked:false },
        { id:"overkill", name:"伤害溢出", desc:"单次造成50+伤害", icon:"💥", unlocked:false },
        { id:"overkill2", name:"毁灭打击", desc:"单次造成100+伤害", icon:"☄️", unlocked:false },
        { id:"survivor", name:"幸存者", desc:"通关第一层", icon:"🏰", unlocked:false },
        { id:"conqueror", name:"征服者", desc:"通关第二层", icon:"⚔️", unlocked:false },
        { id:"victor", name:"胜利者", desc:"通关第三层", icon:"🏆", unlocked:false },
        { id:"flawless", name:"完美通关", desc:"全程无伤通关", icon:"✨", unlocked:false },
        { id:"speedrun", name:"速通大师", desc:"30回合内通关", icon:"⏱️", unlocked:false },
        { id:"minimalist", name:"极简主义", desc:"牌组少于15张通关", icon:"📄", unlocked:false },
        { id:"maximalist", name:"囤积狂", desc:"牌组超过40张", icon:"📦", unlocked:false },
        { id:"euler_fan", name:"欧拉信徒", desc:"用欧拉通关", icon:"🧙‍♂️", unlocked:false },
        { id:"gauss_fan", name:"高斯信徒", desc:"用高斯通关", icon:"👑", unlocked:false },
        { id:"lhopital_fan", name:"洛必达信徒", desc:"用洛必达通关", icon:"⚡", unlocked:false },
        { id:"riemann_fan", name:"黎曼信徒", desc:"用黎曼通关", icon:"📈", unlocked:false },
        { id:"cauchy_fan", name:"柯西信徒", desc:"用柯西通关", icon:"🎯", unlocked:false },
        { id:"lagrange_fan", name:"拉格朗日信徒", desc:"用拉格朗日通关", icon:"⚖️", unlocked:false },
        { id:"hard_mode", name:"困难挑战", desc:"困难难度通关", icon:"🔴", unlocked:false },
        { id:"hell_mode", name:"地狱挑战", desc:"地狱难度通关", icon:"💀", unlocked:false },
        { id:"all_chars", name:"全角色通关", desc:"用所有角色各通关一次", icon:"🌟", unlocked:false },
    ];
    try {
        var s = localStorage.getItem(ACHIEVEMENTS_KEY);
        if (s) {
            var saved = JSON.parse(s);
            for (var i = 0; i < achievements.length; i++) {
                if (saved[achievements[i].id]) achievements[i].unlocked = true;
            }
        }
    } catch(e) {}
}
function unlockAchievement(id) {
    for (var i = 0; i < achievements.length; i++) {
        if (achievements[i].id === id && !achievements[i].unlocked) {
            achievements[i].unlocked = true;
            saveAchievements();
            toast("🏆 成就解锁: " + achievements[i].name, "success");
            return true;
        }
    }
    return false;
}
function saveAchievements() {
    try {
        var obj = {};
        for (var i = 0; i < achievements.length; i++) {
            if (achievements[i].unlocked) obj[achievements[i].id] = true;
        }
        localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(obj));
    } catch(e) {}
}
function checkAllCharAchievement() {
    var chars = ["euler","gauss","lhopital","riemann","cauchy","lagrange"];
    try {
        var s = localStorage.getItem(ACHIEVEMENTS_KEY);
        if (!s) return;
        var saved = JSON.parse(s);
        for (var i = 0; i < chars.length; i++) {
            if (!saved[chars[i] + "_fan"]) return;
        }
        unlockAchievement("all_chars");
    } catch(e) {}
}

// ===== TYPEWRITER =====
function typewriter(el, text, speed, onDone) {
    if (!el) return;
    speed = speed || 30;
    el.textContent = "";
    var i = 0;
    var timer = setInterval(function() {
        if (i < text.length) {
            el.textContent += text.charAt(i);
            i++;
        } else {
            clearInterval(timer);
            if (onDone) onDone();
        }
    }, speed);
    return timer;
}

// ===== PARTICLE SYSTEM =====
var particles = [];
var particleCanvas, particleCtx;
function initParticleSystem() {
    particleCanvas = $("bgCanvas");
    if (!particleCanvas) return;
    particleCtx = particleCanvas.getContext("2d");
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    spawnParticles();
    requestAnimationFrame(updateParticles);
}
function resizeCanvas() {
    if (!particleCanvas) return;
    particleCanvas.width = particleCanvas.offsetWidth || 430;
    particleCanvas.height = particleCanvas.offsetHeight || 932;
}
var particleSymbols = ["∫","∂","Σ","lim","π","∞","dx","∇","∮","δ","∴","∈","∏","∪","∩","⊂","∀","∃","∑","√"];
var particleColors = ["#4a9eff","#ff6b6b","#ffd93d","#26de81","#a55eea","#ff9ff3","#54a0ff"];
function spawnParticles() {
    var count = QUALITY_SETTINGS[settings.quality] || 20;
    particles = [];
    var w = particleCanvas ? particleCanvas.width : 430;
    var h = particleCanvas ? particleCanvas.height : 932;
    for (var i = 0; i < count; i++) {
        particles.push(createParticle(w, h));
    }
}
function createParticle(w, h) {
    return {
        x: Math.random() * w, y: Math.random() * h,
        size: Math.random() * 2 + 1,
        speedY: Math.random() * 0.4 + 0.15,
        speedX: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.25 + 0.08,
        color: particleColors[Math.floor(Math.random() * particleColors.length)],
        sym: Math.random() > 0.5 ? particleSymbols[Math.floor(Math.random() * particleSymbols.length)] : null,
        symSize: Math.random() * 10 + 10,
        rot: Math.random() * 360, rotSpeed: (Math.random() - 0.5) * 0.5,
        pulse: Math.random() * Math.PI * 2
    };
}
function updateParticles() {
    if (!particleCtx || !particleCanvas) { requestAnimationFrame(updateParticles); return; }
    var w = particleCanvas.width, h = particleCanvas.height;
    particleCtx.clearRect(0, 0, w, h);
    for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.y -= p.speedY;
        p.x += p.speedX + Math.sin(p.pulse) * 0.2;
        p.rot += p.rotSpeed;
        p.pulse += 0.02;
        if (p.y < -30) { p.y = h + 30; p.x = Math.random() * w; }
        if (p.x < -30) p.x = w + 30;
        if (p.x > w + 30) p.x = -30;
        particleCtx.globalAlpha = p.opacity * (0.8 + Math.sin(p.pulse) * 0.2);
        if (p.sym) {
            particleCtx.save();
            particleCtx.translate(p.x, p.y);
            particleCtx.rotate(p.rot * Math.PI / 180);
            particleCtx.font = p.symSize + "px serif";
            particleCtx.fillStyle = p.color;
            particleCtx.fillText(p.sym, -p.symSize/2, p.symSize/3);
            particleCtx.restore();
        } else {
            particleCtx.beginPath();
            particleCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            particleCtx.fillStyle = p.color;
            particleCtx.fill();
        }
    }
    particleCtx.globalAlpha = 1;
    requestAnimationFrame(updateParticles);
}

// ===== FX LAYER EFFECTS =====
function fxSlash(x, y, color) {
    var el = document.createElement("div");
    el.className = "fx-slash";
    el.style.left = (x - 60) + "px";
    el.style.top = (y - 2) + "px";
    el.style.background = "linear-gradient(90deg,transparent," + (color || "#5cadff") + ",transparent)";
    $("fxLayer").appendChild(el);
    setTimeout(function() { if (el.parentNode) el.parentNode.removeChild(el); }, 500);
}
function fxBurst(x, y, color, count) {
    count = count || 8;
    for (var i = 0; i < count; i++) {
        var el = document.createElement("div");
        el.className = "fx-particle";
        var size = rand(3, 8);
        el.style.width = size + "px"; el.style.height = size + "px";
        el.style.background = color || "#ffd93d";
        el.style.left = x + "px"; el.style.top = y + "px";
        var angle = (Math.PI * 2 * i) / count;
        var speed = rand(2, 6);
        var vx = Math.cos(angle) * speed;
        var vy = Math.sin(angle) * speed;
        $("fxLayer").appendChild(el);
        var px = x, py = y, op = 1;
        var anim = setInterval(function() {
            px += vx; py += vy; vy += 0.15; op -= 0.03;
            el.style.left = px + "px"; el.style.top = py + "px"; el.style.opacity = op;
            if (op <= 0) { clearInterval(anim); if (el.parentNode) el.parentNode.removeChild(el); }
        }, 30);
    }
}
function fxBeam(x, y, color) {
    var el = document.createElement("div");
    el.style.cssText = "position:absolute;left:"+x+"px;top:0;width:4px;height:100%;background:"+(color||"#ffd93d")+";pointer-events:none;z-index:950;box-shadow:0 0 20px "+(color||"#ffd93d")+";animation:beam 0.6s ease-out forwards;";
    $("fxLayer").appendChild(el);
    setTimeout(function() { if (el.parentNode) el.parentNode.removeChild(el); }, 700);
}

// ===== INIT =====
loadSettings();
loadStats();
initAchievements();
