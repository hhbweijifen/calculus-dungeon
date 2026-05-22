// ===== MAIN ENTRY =====
document.addEventListener("DOMContentLoaded", initGame);

function initGame() {
    loadSettings();
    loadStats();
    initAchievements();
    initParticleSystem();
    initRenderer();
    renderMainMenu();
    switchScreen("mainMenuScreen");
    startMenuBGM();
    updateContinueButton();
    $("dialogueScreen").addEventListener("click", advanceDialogue);
}

function renderMainMenu() {
    var btn = $("btnContinue");
    if (btn) btn.style.display = hasSave() ? "" : "none";
}

function updateContinueButton() {
    var btn = $("btnContinue");
    if (btn) btn.style.display = hasSave() ? "" : "none";
}

function backToMenu() {
    stopBGM();
    startMenuBGM();
    renderMainMenu();
    switchScreen("mainMenuScreen");
}

// ===== START GAME =====
function startNewGame() {
    initAudio();
    resetG();
    saveGame();
    showOpening();
}

function continueGame() {
    initAudio();
    if (loadGame()) {
        if (G.enemy && G.enemy.hp > 0) {
            currentEnemy = G.enemy;
            switchScreen("battleScreen");
            startBattleBGM();
        } else {
            switchScreen("mapScreen");
            renderMap();
            startMapBGM();
        }
    } else {
        toast("没有存档！", "warning");
    }
}

// ===== CHARACTER SELECT =====
var selectedChar = null;
var selectedDiff = "normal";

function startCharSelect() {
    selectedChar = null;
    var startBtn = $("csStartBtn");
    if (startBtn) startBtn.onclick = confirmCharSelect;
    switchScreen("charSelectScreen");
    renderCharSelect();
    sfx("ui");
}

function renderCharSelect() {
    var grid = $("charGrid");
    if (!grid) return;
    var html = "";
    var ids = ["euler", "gauss", "lhopital", "riemann", "cauchy", "lagrange"];
    for (var i = 0; i < ids.length; i++) {
        var ch = CHARACTERS[ids[i]];
        var sel = selectedChar === ids[i] ? "selected" : "";
        html += '<div class="cs-card ' + sel + '" onclick="selectChar(\'' + ids[i] + '\')">';
        html += '<div class="cs-avatar" style="background:' + ch.bg + '">' + ch.icon + '</div>';
        html += '<div class="cs-info">';
        html += '<div class="cs-name">' + ch.name + '</div>';
        html += '<div class="cs-role">' + ch.title + '</div>';
        html += '<div class="cs-desc">' + ch.desc + '</div>';
        html += '<div class="cs-passive">被动: ' + ch.passive + '</div>';
        html += '</div></div>';
    }
    grid.innerHTML = html;
    var detail = $("charDetail");
    if (selectedChar && detail) {
        var ch = CHARACTERS[selectedChar];
        var dhtml = '<div class="cs-detail-title">技能树</div><div class="cs-skill-list">';
        for (var i = 0; i < ch.skills.length; i++) {
            var sk = ch.skills[i];
            dhtml += '<div class="cs-skill-item"><span class="cs-skill-icon">⭐</span><span class="cs-skill-name">' + sk.name + '</span><span class="cs-skill-desc">' + sk.desc + '</span></div>';
        }
        dhtml += '</div>';
        detail.innerHTML = dhtml;
        detail.classList.add("show");
    } else if (detail) {
        detail.classList.remove("show");
    }
    var startBtn = $("csStartBtn");
    if (startBtn) {
        if (selectedChar) { startBtn.classList.add("active"); startBtn.disabled = false; }
        else { startBtn.classList.remove("active"); startBtn.disabled = true; }
    }
}

function selectChar(id) {
    selectedChar = id;
    renderCharSelect();
    sfx("ui");
}

function setDifficulty(diff) {
    selectedDiff = diff;
    var btns = document.querySelectorAll(".cs-diff-btn");
    for (var i = 0; i < btns.length; i++) btns[i].classList.remove("active");
    var active = document.querySelector('.cs-diff-btn[data-diff="' + diff + '"]');
    if (active) active.classList.add("active");
    sfx("ui");
}

function confirmCharSelect() {
    if (!selectedChar) return;
    G.charId = selectedChar;
    G.difficulty = selectedDiff;
    var ch = CHARACTERS[selectedChar];
    G.maxHp = ch.maxHp;
    G.hp = G.maxHp;
    G.deck = ch.starter.slice();
    G.skills = [];
    for (var i = 0; i < ch.skills.length; i++) {
        G.skills.push({ id: ch.skills[i].id, level: 0 });
    }
    saveGame();
    showFloorTransition(1, "第一层：函数的哀鸣", "函数的哀鸣在走廊中回荡...");
    sfx("ui");
}

// ===== SKILL BOOK =====
function openSkillBook() {
    var char = CHARACTERS[G.charId];
    setText("skillPoints", "⭐ 技能点: " + G.skillPoints);
    var tree = $("skillTree");
    if (!tree || !char) return;
    var html = "";
    for (var i = 0; i < char.skills.length; i++) {
        var sk = char.skills[i];
        var gs = null;
        for (var sidx = 0; sidx < G.skills.length; sidx++) {
            if (G.skills[sidx].id === sk.id) { gs = G.skills[sidx]; break; }
        }
        var level = gs ? gs.level : 0;
        var cls = level >= sk.maxLevel ? "maxed" : level > 0 ? "unlocked" : "";
        html += '<div class="skill-node ' + cls + '">';
        html += '<div class="skill-icon">⭐</div>';
        html += '<div class="skill-info">';
        html += '<div class="skill-name">' + sk.name + '</div>';
        html += '<div class="skill-level">等级: ' + level + "/" + sk.maxLevel + '</div>';
        html += '<div class="skill-effect">' + sk.desc + '</div>';
        html += '</div>';
        html += '<button class="skill-upgrade-btn" ' + (G.skillPoints <= 0 || level >= sk.maxLevel ? "disabled" : "") + ' onclick="upgradeSkill(\'' + sk.id + '\')">升级</button>';
        html += '</div>';
    }
    tree.innerHTML = html;
    switchScreen("skillScreen");
    sfx("ui");
}

function upgradeSkill(sid) {
    if (G.skillPoints <= 0) return;
    for (var i = 0; i < G.skills.length; i++) {
        if (G.skills[i].id === sid) {
            var char = CHARACTERS[G.charId];
            var max = 0;
            for (var j = 0; j < char.skills.length; j++) {
                if (char.skills[j].id === sid) { max = char.skills[j].maxLevel; break; }
            }
            if (G.skills[i].level >= max) return;
            G.skills[i].level++;
            G.skillPoints--;
            sfx("upgrade");
            openSkillBook();
            saveGame();
            return;
        }
    }
}

function closeSkillBook() {
    hide("skillScreen");
    show("mapScreen");
    sfx("ui");
}

// ===== DECK VIEW =====
function openDeckView() {
    setText("deckCount", "共 " + G.deck.length + " 张");
    var grid = $("deckGrid");
    if (!grid) return;
    var counts = {};
    for (var i = 0; i < G.deck.length; i++) {
        counts[G.deck[i]] = (counts[G.deck[i]] || 0) + 1;
    }
    var html = "";
    for (var cid in counts) {
        var card = CARD_DB[cid];
        if (!card) continue;
        html += '<div class="deck-card">';
        html += '<div class="dc-icon">' + getCardIcon(card) + '</div>';
        html += '<div class="dc-name">' + card.name + '</div>';
        html += '<div class="dc-count">x' + counts[cid] + '</div>';
        html += '</div>';
    }
    grid.innerHTML = html;
    switchScreen("deckViewScreen");
    sfx("ui");
}

function closeDeckView() {
    hide("deckViewScreen");
    show("mapScreen");
    sfx("ui");
}

// ===== RELIC BAG =====
function openRelicBag() {
    setText("relicCount", G.relics.length + " / 20");
    var grid = $("relicGrid");
    if (!grid) return;
    var html = "";
    for (var i = 0; i < G.relics.length; i++) {
        var r = G.relics[i];
        html += '<div class="relic-item">';
        html += '<div class="ri-icon">' + r.icon + '</div>';
        html += '<div class="ri-name">' + r.name + '</div>';
        html += '</div>';
    }
    grid.innerHTML = html;
    switchScreen("relicScreen");
    sfx("ui");
}

function closeRelicBag() {
    hide("relicScreen");
    show("mapScreen");
    sfx("ui");
}

// ===== ACHIEVEMENTS =====
function openAchievements() {
    var grid = $("achGrid");
    if (!grid) return;
    var unlocked = 0;
    var html = "";
    for (var i = 0; i < achievements.length; i++) {
        var a = achievements[i];
        if (a.unlocked) unlocked++;
        html += '<div class="ach-item ' + (a.unlocked ? "unlocked" : "locked") + '">';
        html += '<div class="ach-icon">' + a.icon + '</div>';
        html += '<div class="ach-info">';
        html += '<div class="ach-name">' + a.name + '</div>';
        html += '<div class="ach-desc">' + a.desc + '</div>';
        if (a.unlocked) html += '<div class="ach-unlock">✅ 已解锁</div>';
        html += '</div></div>';
    }
    grid.innerHTML = html;
    setText("achProgress", unlocked + " / " + achievements.length);
    switchScreen("achievementScreen");
    sfx("ui");
}

function closeAchievements() {
    hide("achievementScreen");
    if (currentScreen === "mainMenuScreen") show("mainMenuScreen");
    else show("mapScreen");
    sfx("ui");
}

// ===== STATS =====
function openStats() {
    var grid = $("statsGrid");
    if (!grid) return;
    var data = [
        { label: "总游戏", value: stats.gamesPlayed },
        { label: "胜利", value: stats.gamesWon },
        { label: "失败", value: stats.gamesLost },
        { label: "总伤害", value: stats.totalDamage },
        { label: "最高伤害", value: stats.highestDamage },
        { label: "击杀数", value: stats.totalKills },
        { label: "答题正确", value: stats.quizCorrect + "/" + stats.quizTotal },
        { label: "出牌数", value: stats.cardsPlayed },
    ];
    var html = "";
    for (var i = 0; i < data.length; i++) {
        html += '<div class="stat-box"><div class="stat-value">' + data[i].value + '</div><div class="stat-label">' + data[i].label + '</div></div>';
    }
    grid.innerHTML = html;
    switchScreen("statsScreen");
    sfx("ui");
}

function closeStats() {
    hide("statsScreen");
    if (currentScreen === "mainMenuScreen") show("mainMenuScreen");
    else show("mapScreen");
    sfx("ui");
}

// ===== SETTINGS =====
function openSettings() {
    applySettings();
    switchScreen("settingsScreen");
    sfx("ui");
}

function closeSettings() {
    hide("settingsScreen");
    if (currentScreen === "mainMenuScreen") show("mainMenuScreen");
    else show("mapScreen");
    sfx("ui");
}

// ===== CREDITS =====
function openCredits() {
    switchScreen("creditsScreen");
    sfx("ui");
}
function closeCredits() {
    hide("creditsScreen");
    show("mainMenuScreen");
    sfx("ui");
}

// ===== ENDLESS MODE =====
function openEndlessSelect() {
    selectedChar = null;
    switchScreen("charSelectScreen");
    renderCharSelect();
    // Modify the start button for endless mode
    var startBtn = $("csStartBtn");
    if (startBtn) startBtn.onclick = confirmEndlessChar;
    sfx("ui");
}

function confirmEndlessChar() {
    if (!selectedChar) return;
    startEndlessMode();
}

// ===== DAILY CHALLENGE =====
// handled in extras.js

// ===== IMPORT DIALOG (handled in core.js) =====
// Export/Import functions are in core.js

// ===== GLOBAL KEYBOARD SHORTCUTS =====
document.addEventListener("keydown", function(e) {
    if (e.key === "Escape") {
        if (currentScreen === "settingsScreen") closeSettings();
        else if (currentScreen === "achievementScreen") closeAchievements();
        else if (currentScreen === "statsScreen") closeStats();
        else if (currentScreen === "creditsScreen") closeCredits();
        else if (currentScreen === "skillScreen") closeSkillBook();
        else if (currentScreen === "deckViewScreen") closeDeckView();
        else if (currentScreen === "relicScreen") closeRelicBag();
        else if (currentScreen === "selectCardScreen") closeSelectCard();
    }
    if (e.key === "Enter" && currentScreen === "battleScreen") {
        if (selectedCards.length > 0) playCards();
    }
    if (e.key === "e" && currentScreen === "battleScreen") {
        endTurn();
    }
});

// ===== AUTO SAVE =====
setInterval(function() {
    if (currentScreen && currentScreen !== "mainMenuScreen" && currentScreen !== "openingScreen") {
        saveGame();
    }
}, 30000);
