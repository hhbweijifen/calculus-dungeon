// ===== CANVAS RENDERER =====
var fxCanvas, fxCtx;
var bgCanvas2, bgCtx2;

function initRenderer() {
    fxCanvas = $("fxCanvas");
    if (fxCanvas) {
        fxCtx = fxCanvas.getContext("2d");
        resizeFxCanvas();
        window.addEventListener("resize", resizeFxCanvas);
    }
    bgCanvas2 = $("bgCanvas");
    if (bgCanvas2) {
        bgCtx2 = bgCanvas2.getContext("2d");
    }
}
function resizeFxCanvas() {
    if (!fxCanvas) return;
    fxCanvas.width = fxCanvas.offsetWidth || 430;
    fxCanvas.height = fxCanvas.offsetHeight || 932;
}

// ===== FUNCTION GRAPH DRAWING =====
function drawFunctionGraph(funcName, canvasId, color) {
    var canvas = canvasId ? $(canvasId) : bgCanvas2;
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = color || "rgba(255,255,255,0.2)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    var fn = getFuncPlot(funcName);
    var scaleX = w / 12;
    var scaleY = h / 6;
    var offsetY = h / 2;
    for (var px = 0; px < w; px += 2) {
        var x = (px - w / 2) / scaleX;
        var y = fn(x);
        var py = offsetY - y * scaleY;
        if (px === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
    }
    ctx.stroke();
}
function getFuncPlot(name) {
    if (name.indexOf("|x|") >= 0) return function(x) { return Math.abs(x); };
    if (name.indexOf("sign") >= 0) return function(x) { return x > 0 ? 1 : x < 0 ? -1 : 0; };
    if (name.indexOf("x\u00b2") >= 0) return function(x) { return x * x; };
    if (name.indexOf("2x") >= 0 && name.indexOf("sin") < 0) return function(x) { return 2 * x; };
    if (name.indexOf("sin") >= 0 && name.indexOf("x\u00b2") < 0) return function(x) { return Math.sin(x * 2); };
    if (name.indexOf("cos") >= 0) return function(x) { return Math.cos(x * 2); };
    if (name.indexOf("e\u02e3") >= 0) return function(x) { return Math.exp(x * 0.5); };
    if (name.indexOf("ln") >= 0) return function(x) { return x > 0.1 ? Math.log(x) * 0.5 : -3; };
    if (name.indexOf("1/x") >= 0) return function(x) { return Math.abs(x) > 0.2 ? 1 / x : (x > 0 ? 5 : -5); };
    if (name.indexOf("tan") >= 0) return function(x) { return Math.tan(x); };
    return function(x) { return 0; };
}

// ===== BATTLE FX =====
function fxCardPlay(type, x, y) {
    var colors = { diff: "#4a9eff", int: "#ff6b6b", thm: "#ffd93d", series: "#6bcb77", converge: "#a55eea", lagrange: "#ffa502", skill: "#ffffff" };
    var c = colors[type] || "#ffffff";
    fxBurst(x, y, c, 12);
    if (type === "diff") fxSlash(x, y, c);
    if (type === "int") fxSwirl(x, y, c);
    if (type === "thm") fxBeam(x, y, c);
}
function fxSwirl(x, y, color) {
    if (!fxCtx) return;
    var count = 20;
    for (var i = 0; i < count; i++) {
        var angle = (Math.PI * 2 * i) / count;
        var r = 5;
        var px = x + Math.cos(angle) * r;
        var py = y + Math.sin(angle) * r;
        var particle = { x: px, y: py, vx: Math.cos(angle) * 3, vy: Math.sin(angle) * 3, life: 1, color: color || "#ff6b6b" };
        swirlParticles.push(particle);
    }
}
var swirlParticles = [];
function updateSwirlParticles() {
    if (!fxCtx || swirlParticles.length === 0) { requestAnimationFrame(updateSwirlParticles); return; }
    fxCtx.clearRect(0, 0, fxCanvas.width, fxCanvas.height);
    for (var i = swirlParticles.length - 1; i >= 0; i--) {
        var p = swirlParticles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.95;
        p.vy *= 0.95;
        p.life -= 0.02;
        fxCtx.globalAlpha = p.life;
        fxCtx.fillStyle = p.color;
        fxCtx.beginPath();
        fxCtx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        fxCtx.fill();
        if (p.life <= 0) swirlParticles.splice(i, 1);
    }
    fxCtx.globalAlpha = 1;
    requestAnimationFrame(updateSwirlParticles);
}
requestAnimationFrame(updateSwirlParticles);

function fxEnemyHit(x, y) {
    fxBurst(x, y, "#ff4757", 16);
    screenShake("light");
}
function fxEnemyCrit(x, y) {
    fxBurst(x, y, "#ffd93d", 24);
    screenShake("crit");
    flashScreen("red");
}
function fxPlayerHit(x, y) {
    fxBurst(x, y, "#ff4757", 10);
    screenShake("light");
}
function fxHeal(x, y) {
    fxBurst(x, y, "#2ed573", 12);
}
function fxBlock(x, y) {
    fxBurst(x, y, "#5cadff", 10);
}
function fxGold(x, y) {
    fxBurst(x, y, "#ffd93d", 10);
}
function fxLevelUp() {
    fxBurst(fxCanvas ? fxCanvas.width / 2 : 215, fxCanvas ? fxCanvas.height / 2 : 400, "#ffd93d", 30);
}
