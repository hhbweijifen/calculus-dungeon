// ===== EXTRAS: ENDLESS MODE + DAILY CHALLENGE + LEADERBOARD =====

// ===== ENDLESS MODE =====
var endlessFloor = 1;
var endlessSeed = 0;

function startEndlessMode() {
    initAudio();
    resetG();
    endlessFloor = 1;
    endlessSeed = Date.now();
    G.charId = selectedChar || "euler";
    G.difficulty = "hell";
    var ch = CHARACTERS[G.charId];
    G.maxHp = ch.maxHp;
    G.hp = G.maxHp;
    G.deck = ch.starter.slice();
    G.skills = [];
    for (var i = 0; i < ch.skills.length; i++) {
        G.skills.push({ id: ch.skills[i].id, level: 3 });
    }
    G.gold = 200;
    enterEndlessFloor();
    sfx("ui");
}

function enterEndlessFloor() {
    var diffMult = 1 + endlessFloor * 0.15;
    var pool = ENEMIES.normal;
    if (endlessFloor % 5 === 0) pool = ENEMIES.bosses;
    else if (endlessFloor % 3 === 0) pool = ENEMIES.elite;
    var template = randItem(pool);
    var enemy = {
        name: template.name + " Lv." + endlessFloor,
        hp: Math.floor(template.hp * diffMult),
        func: template.func,
        color: template.color,
        desc: template.desc,
        pattern: template.pattern ? template.pattern.slice() : ["attack"],
        patternIdx: 0,
        cont: 100, diff: 0, deriv: 50,
        block: 0,
        vulnerable: 0, weak: 0,
        boss: endlessFloor % 5 === 0,
        elite: endlessFloor % 3 === 0
    };
    var fd = getFunc(enemy.func);
    enemy.cont = fd.c;
    enemy.diff = fd.d;
    enemy.deriv = fd.df;
    currentEnemy = enemy;
    G.enemy = enemy;
    G.turn = 1;
    G.selected = [];
    G.block = 0;
    G.firstStrike = true;
    G.firstDiff = true;
    G.cardsPlayedThisTurn = 0;
    G.chainBonus = 1;
    selectedCards = [];
    chainMultiplier = 1;
    battleEnded = false;
    comboCount = 0;
    switchScreen("battleScreen");
    G.drawPile = shuffle(G.deck.slice());
    G.discardPile = [];
    G.hand = [];
    G.energy = G.maxEnergy;
    G.intEnergy = G.maxIntEnergy;
    G.diffEnergy = G.maxDiffEnergy;
    updateBattleUI();
    drawCards(5);
    updateEnemyIntent();
    startBattleBGM();
    logBattle("=== 无尽模式 第 " + endlessFloor + " 层 ===");
}

function endlessVictory() {
    battleEnded = true;
    addStat("totalKills", 1);
    G.gold += 10 + endlessFloor * 2;
    G.skillPoints += 1;
    endlessFloor++;
    // Heal a bit
    G.hp = Math.min(G.maxHp, Math.floor(G.hp + G.maxHp * 0.1));
    // Random reward
    if (Math.random() < 0.5) addRandomCard();
    if (Math.random() < 0.2) addRandomRelic();
    if (Math.random() < 0.3 && G.potions.length < 3) G.potions.push(randItem(POTIONS));
    toast("第 " + (endlessFloor - 1) + " 层通关！", "success");
    sfx("win");
    saveEndlessRecord(endlessFloor - 1);
    setTimeout(function() {
        var choice = confirm("是否继续挑战第 " + endlessFloor + " 层？");
        if (choice) enterEndlessFloor();
        else backToMenu();
    }, 1000);
}

function saveEndlessRecord(floor) {
    try {
        var key = "cdda_endless";
        var records = JSON.parse(localStorage.getItem(key) || "[]");
        records.push({ char: G.charId, floor: floor, date: Date.now() });
        records.sort(function(a, b) { return b.floor - a.floor; });
        records = records.slice(0, 20);
        localStorage.setItem(key, JSON.stringify(records));
    } catch(e) {}
}

function getEndlessRecords() {
    try {
        return JSON.parse(localStorage.getItem("cdda_endless") || "[]");
    } catch(e) { return []; }
}

// ===== DAILY CHALLENGE =====
function getDailySeed() {
    var d = new Date();
    return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

function startDailyChallenge() {
    initAudio();
    var seed = getDailySeed();
    Math.random = seededRandom(seed);
    resetG();
    G.charId = ["euler", "gauss", "lhopital", "riemann", "cauchy", "lagrange"][seed % 6];
    G.difficulty = "hard";
    var ch = CHARACTERS[G.charId];
    G.maxHp = ch.maxHp;
    G.hp = G.maxHp;
    G.deck = ch.starter.slice();
    // Add 3 random cards
    var allIds = Object.keys(CARD_DB);
    for (var i = 0; i < 3; i++) G.deck.push(randItem(allIds));
    G.gold = 80;
    G.skills = [];
    for (var i = 0; i < ch.skills.length; i++) {
        G.skills.push({ id: ch.skills[i].id, level: 0 });
    }
    saveGame();
    showFloorTransition(1, "每日挑战", "今日种子: " + seed);
    sfx("ui");
}

function seededRandom(seed) {
    var s = seed;
    return function() {
        s = (s * 9301 + 49297) % 233280;
        return s / 233280;
    };
}

function saveDailyRecord(floor, turns) {
    try {
        var key = "cdda_daily_" + getDailySeed();
        var best = JSON.parse(localStorage.getItem(key) || "null");
        if (!best || floor > best.floor || (floor === best.floor && turns < best.turns)) {
            localStorage.setItem(key, JSON.stringify({ floor: floor, turns: turns, char: G.charId }));
            toast("新纪录！", "success");
        }
    } catch(e) {}
}

// ===== ENHANCED MAP LINES =====
function renderMapWithLines() {
    var grid = $("mapGrid");
    if (!grid) return;
    var html = "";
    var nodes = G.map;
    var totalRows = nodes.length;
    for (var r = 0; r < totalRows; r++) {
        html += '<div class="map-row">';
        var row = nodes[r];
        for (var c = 0; c < row.length; c++) {
            var node = row[c];
            var icon = getMapNodeIcon(node.type);
            var cls = "";
            if (G.currentNode && G.currentNode.id === node.id) cls = "current";
            else if (node.visited) cls = "visited";
            else if (node.available) cls = "available";
            if (node.type === "boss") cls += " boss";
            html += '<div class="map-node ' + cls + '" id="' + node.id + '" onclick="clickMapNode(' + r + ',' + c + ')">';
            html += icon;
            html += '<div class="map-node-label">' + getMapNodeLabel(node.type) + '</div>';
            html += '</div>';
        }
        html += '</div>';
    }
    grid.innerHTML = html;
    // Draw lines after render
    setTimeout(drawMapLines, 50);
    updateMapProgress();
}

function drawMapLines() {
    var nodes = G.map;
    var existing = document.querySelectorAll(".map-line");
    for (var i = 0; i < existing.length; i++) existing[i].remove();
    var grid = $("mapGrid");
    if (!grid) return;
    var gridRect = grid.getBoundingClientRect();
    for (var r = 0; r < nodes.length - 1; r++) {
        var row = nodes[r];
        var nextRow = nodes[r + 1];
        for (var c = 0; c < row.length; c++) {
            var nodeA = row[c];
            var elA = $(nodeA.id);
            if (!elA) continue;
            var rectA = elA.getBoundingClientRect();
            var ax = rectA.left + rectA.width / 2 - gridRect.left;
            var ay = rectA.top + rectA.height / 2 - gridRect.top;
            for (var nc = 0; nc < nextRow.length; nc++) {
                var nodeB = nextRow[nc];
                var elB = $(nodeB.id);
                if (!elB) continue;
                var rectB = elB.getBoundingClientRect();
                var bx = rectB.left + rectB.width / 2 - gridRect.left;
                var by = rectB.top + rectB.height / 2 - gridRect.top;
                var line = document.createElement("div");
                line.className = "map-line";
                if (nodeA.visited && nodeB.available) line.classList.add("active");
                var dx = bx - ax;
                var dy = by - ay;
                var len = Math.sqrt(dx * dx + dy * dy);
                var angle = Math.atan2(dy, dx) * 180 / Math.PI;
                line.style.width = len + "px";
                line.style.height = "2px";
                line.style.left = ax + "px";
                line.style.top = ay + "px";
                line.style.transform = "rotate(" + angle + "deg)";
                line.style.transformOrigin = "0 50%";
                grid.appendChild(line);
            }
        }
    }
}

// ===== ENHANCED EFFECTS =====
function fxDamageNumber(val, x, y, isCrit) {
    var el = document.createElement("div");
    el.className = "float-text " + (isCrit ? "float-crit" : "float-dmg");
    el.textContent = "-" + val;
    el.style.left = x + "px";
    el.style.top = y + "px";
    $("fxLayer").appendChild(el);
    if (isCrit) {
        screenShake("heavy");
        flashScreen("red");
    }
    setTimeout(function() { if (el.parentNode) el.parentNode.removeChild(el); }, 1500);
}

function fxHealNumber(val, x, y) {
    var el = document.createElement("div");
    el.className = "float-text float-heal";
    el.textContent = "+" + val + " HP";
    el.style.left = x + "px";
    el.style.top = y + "px";
    $("fxLayer").appendChild(el);
    setTimeout(function() { if (el.parentNode) el.parentNode.removeChild(el); }, 1200);
}

// ===== COMBAT LOG FILTER =====
var logFilter = "all";
function setLogFilter(type) {
    logFilter = type;
    var log = $("battleLog");
    if (!log) return;
    var entries = log.querySelectorAll(".log-entry");
    for (var i = 0; i < entries.length; i++) {
        var e = entries[i];
        if (type === "all") e.style.display = "";
        else if (type === "dmg" && e.querySelector(".log-dmg")) e.style.display = "";
        else if (type === "heal" && e.querySelector(".log-heal")) e.style.display = "";
        else if (type === "block" && e.querySelector(".log-block")) e.style.display = "";
        else e.style.display = "none";
    }
}
