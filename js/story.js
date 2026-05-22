// ===== STORY / DIALOGUE SYSTEM =====
var storyIndex = 0;
var currentStoryLines = [];
var typewriterTimer = null;

function showOpening() {
    initAudio();
    startStoryBGM();
    storyIndex = 0;
    currentStoryLines = STORY_DATA.prologue;
    renderStory();
    switchScreen("openingScreen");
}

function renderStory() {
    var container = $("storyContainer");
    if (!container) return;
    var html = "";
    for (var i = 0; i < currentStoryLines.length; i++) {
        var line = currentStoryLines[i];
        html += '<div class="story-chapter">';
        html += '<div class="chapter-title">' + escapeHtml(line.speaker) + '</div>';
        html += '<div class="story-text">' + formatStoryText(line.text) + '</div>';
        html += '</div>';
    }
    html += '<div class="story-nav">';
    html += '<button class="story-nav-btn" onclick="startCharSelect()">开始选择数学家</button>';
    html += '</div>';
    container.innerHTML = html;
}

function formatStoryText(text) {
    return escapeHtml(text)
        .replace(/\{hl\}(.*?)\{\/hl\}/g, '<span class="hl">$1</span>')
        .replace(/\{dg\}(.*?)\{\/dg\}/g, '<span class="dg">$1</span>')
        .replace(/\{mg\}(.*?)\{\/mg\}/g, '<span class="mg">$1</span>')
        .replace(/\{df\}(.*?)\{\/df\}/g, '<span class="df">$1</span>')
        .replace(/\{it\}(.*?)\{\/it\}/g, '<span class="it">$1</span>')
        .replace(/\{sr\}(.*?)\{\/sr\}/g, '<span class="sr">$1</span>');
}

function escapeHtml(text) {
    var div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

// ===== DIALOGUE =====
var dialogueQueue = [];
var dialogueIndex = 0;
var dialogueCb = null;

function showDialogue(lines, onDone) {
    dialogueQueue = lines || [];
    dialogueIndex = 0;
    dialogueCb = onDone;
    switchScreen("dialogueScreen");
    nextDialogueLine();
}

function nextDialogueLine() {
    if (dialogueIndex >= dialogueQueue.length) {
        hide("dialogueScreen");
        if (dialogueCb) dialogueCb();
        return;
    }
    var line = dialogueQueue[dialogueIndex];
    var portrait = $("diaPortrait");
    var nameEl = $("diaName");
    var textEl = $("diaText");
    var choicesEl = $("diaChoices");
    if (portrait) portrait.textContent = line.portrait || "📜";
    if (nameEl) nameEl.textContent = line.speaker || "";
    if (choicesEl) choicesEl.innerHTML = "";
    if (textEl) {
        var speed = settings.storySpeed === "fast" ? 15 : settings.storySpeed === "slow" ? 50 : 30;
        if (typewriterTimer) clearInterval(typewriterTimer);
        typewriterTimer = typewriter(textEl, line.text || "", speed, function() {
            if (line.choices && line.choices.length > 0) {
                renderDialogueChoices(line.choices);
            }
        });
    }
}

function renderDialogueChoices(choices) {
    var el = $("diaChoices");
    if (!el) return;
    var html = "";
    for (var i = 0; i < choices.length; i++) {
        html += '<div class="dia-choice" onclick="chooseDialogue(' + i + ')">' + escapeHtml(choices[i].text) + '</div>';
    }
    el.innerHTML = html;
}

function chooseDialogue(idx) {
    var line = dialogueQueue[dialogueIndex];
    if (line.choices && line.choices[idx]) {
        var choice = line.choices[idx];
        if (choice.key) G.storyChoices[choice.key] = choice.value || true;
    }
    dialogueIndex++;
    nextDialogueLine();
}

function advanceDialogue() {
    var textEl = $("diaText");
    if (textEl && typewriterTimer) {
        var line = dialogueQueue[dialogueIndex];
        if (line) {
            clearInterval(typewriterTimer);
            typewriterTimer = null;
            textEl.textContent = line.text || "";
            if (line.choices && line.choices.length > 0) {
                renderDialogueChoices(line.choices);
                return;
            }
        }
    }
    dialogueIndex++;
    nextDialogueLine();
}

// ===== FLOOR INTRO =====
function showFloorTransition(floorNum, floorName, desc) {
    setText("ftNum", floorName || "第" + floorNum + "层");
    setText("ftName", floorName || "");
    setText("ftDesc", desc || "更深的黑暗在等待...");
    switchScreen("floorTransition");
    setTimeout(function() {
        if (floorNum === 1) showDialogue(STORY_DATA.floor1_start, initMap);
        else if (floorNum === 2) showDialogue(STORY_DATA.floor2_start, initMap);
        else if (floorNum === 3) showDialogue(STORY_DATA.floor3_start, initMap);
        else initMap();
    }, 2500);
}

// ===== BOSS INTRO =====
function showBossIntro(enemy) {
    var eye = $("biEye");
    var nameEl = $("biName");
    var titleEl = $("biTitle");
    var funcEl = $("biFunc");
    if (eye) eye.style.animation = "none";
    if (nameEl) nameEl.textContent = enemy.name;
    if (titleEl) titleEl.textContent = enemy.desc;
    if (funcEl) funcEl.textContent = enemy.func;
    switchScreen("bossIntro");
    if (eye) { eye.offsetHeight; eye.style.animation = ""; }
    setTimeout(function() {
        hide("bossIntro");
        enterBattle(enemy);
    }, 3500);
}

// ===== ENDING =====
function showVictory(endingType) {
    stopBGM();
    startVictoryBGM();
    var ending = STORY_DATA.endings[endingType] || STORY_DATA.endings.normal;
    setText("vicTitle", "收敛！");
    setText("vicSubtitle", ending.title);
    var statsHtml = "通关层数: " + G.floor + " | 总回合: " + G.totalTurns + " | 金币: " + G.gold;
    setHTML("vicStats", statsHtml);
    setHTML("vicEnding", escapeHtml(ending.text));
    switchScreen("victoryScreen");
    unlockAchievement("victor");
    if (endingType === "perfect") unlockAchievement("flawless");
    if (endingType === "true") { /* true ending */ }
    if (G.totalTurns <= 30) unlockAchievement("speedrun");
    if (G.deck.length < 15) unlockAchievement("minimalist");
    if (G.noDamageTaken) unlockAchievement("flawless");
    addStat("gamesWon", 1);
    var charFan = G.charId + "_fan";
    unlockAchievement(charFan);
    checkAllCharAchievement();
    if (G.difficulty === "hard") unlockAchievement("hard_mode");
    if (G.difficulty === "hell") unlockAchievement("hell_mode");
    saveStats();
}

function showDefeat() {
    stopBGM();
    startDefeatBGM();
    setText("overTitle", "发散...");
    setText("overSubtitle", "数学的光芒尚未熄灭");
    var statsHtml = "到达层数: " + G.floor + " | 存活回合: " + G.totalTurns;
    setHTML("overStats", statsHtml);
    var ending = STORY_DATA.endings.tragedy;
    setHTML("overEnding", escapeHtml(ending.text));
    switchScreen("overScreen");
    addStat("gamesLost", 1);
    saveStats();
}

function restartGame() {
    clearSave();
    backToMenu();
}
