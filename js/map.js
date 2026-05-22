// ===== MAP SYSTEM =====
var FLOOR_CONFIG = [
    { name: "第一层：函数的哀鸣", nodes: 8, enemies: 4, elites: 1, events: 2, shops: 1, rests: 1 },
    { name: "第二层：极限的边缘", nodes: 10, enemies: 5, elites: 1, events: 2, shops: 1, rests: 1 },
    { name: "第三层：无穷的深渊", nodes: 12, enemies: 6, elites: 2, events: 2, shops: 1, rests: 1 }
];

function initMap() {
    var config = FLOOR_CONFIG[G.floor - 1] || FLOOR_CONFIG[0];
    var nodes = [];
    var rowCount = Math.ceil(config.nodes / 3);
    var currentRow = 0;
    var nodeTypes = [];
    // Build node types
    for (var i = 0; i < config.enemies; i++) nodeTypes.push("enemy");
    for (var i = 0; i < config.elites; i++) nodeTypes.push("elite");
    for (var i = 0; i < config.events; i++) nodeTypes.push("event");
    for (var i = 0; i < config.shops; i++) nodeTypes.push("shop");
    for (var i = 0; i < config.rests; i++) nodeTypes.push("rest");
    while (nodeTypes.length < config.nodes) nodeTypes.push("enemy");
    nodeTypes = shuffle(nodeTypes);
    nodeTypes.push("boss");

    var idx = 0;
    for (var r = 0; r <= rowCount; r++) {
        var count = r === rowCount ? 1 : rand(2, 3);
        var row = [];
        for (var c = 0; c < count; c++) {
            var type = r === rowCount ? "boss" : nodeTypes[idx++];
            row.push({
                id: "n" + r + "_" + c,
                type: type,
                row: r,
                col: c,
                visited: false,
                available: r === 0
            });
        }
        nodes.push(row);
    }
    G.map = nodes;
    G.currentNode = null;
    setText("mapFloor", config.name);
    setText("mapFloorNum", "🏰 " + G.floor + "/3");
    renderMap();
    switchScreen("mapScreen");
    startMapBGM();
}

function renderMap() {
    if (typeof renderMapWithLines === "function") {
        renderMapWithLines();
        return;
    }
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
            html += '<div class="map-node ' + cls + '" onclick="clickMapNode(' + r + ',' + c + ')">';
            html += icon;
            html += '<div class="map-node-label">' + getMapNodeLabel(node.type) + '</div>';
            html += '</div>';
        }
        html += '</div>';
    }
    grid.innerHTML = html;
    updateMapProgress();
}

function getMapNodeIcon(type) {
    var icons = { enemy: "👹", elite: "💀", event: "❓", shop: "🏪", rest: "🔥", boss: "👿" };
    return icons[type] || "❓";
}
function getMapNodeLabel(type) {
    var labels = { enemy: "战斗", elite: "精英", event: "事件", shop: "商店", rest: "休息", boss: "BOSS" };
    return labels[type] || type;
}

function clickMapNode(r, c) {
    var node = G.map[r][c];
    if (!node.available || node.visited) return;
    sfx("step");
    G.currentNode = node;
    node.visited = true;
    // Unlock next row
    if (r + 1 < G.map.length) {
        var nextRow = G.map[r + 1];
        for (var i = 0; i < nextRow.length; i++) {
            nextRow[i].available = true;
        }
    }
    renderMap();

    if (node.type === "enemy" || node.type === "elite" || node.type === "boss") {
        var diffMult = DIFFICULTY_MULTIPLIERS[G.difficulty] || 1;
        var pool = node.type === "boss" ? ENEMIES.bosses : node.type === "elite" ? ENEMIES.elite : ENEMIES.normal;
        var template = randItem(pool);
        if (node.type === "boss") {
            showBossIntro(template);
        } else {
            // Quiz before battle
            showQuiz(function(passed) {
                if (passed) enterBattle(template);
                else {
                    G.hp -= Math.floor(5 * diffMult);
                    toast("答题失败！受到 " + Math.floor(5 * diffMult) + " 伤害", "error");
                    updateMapStats();
                    if (G.hp <= 0) showDefeat();
                    else enterBattle(template);
                }
            });
        }
    } else if (node.type === "event") {
        showEvent();
    } else if (node.type === "shop") {
        openShop();
    } else if (node.type === "rest") {
        openRest();
    }
}

function updateMapProgress() {
    var fill = $("mapProgressFill");
    if (!fill) return;
    var nodes = G.map;
    var total = 0, visited = 0;
    for (var r = 0; r < nodes.length; r++) {
        for (var c = 0; c < nodes[r].length; c++) {
            total++;
            if (nodes[r][c].visited) visited++;
        }
    }
    fill.style.width = (visited / total * 100) + "%";
}

function updateMapStats() {
    setText("mapHp", "❤️ " + G.hp + "/" + G.maxHp);
    setText("mapGold", "💰 " + G.gold);
    setText("mapDeck", "📚 " + G.deck.length);
}

// ===== QUIZ =====
var quizCallback = null;
var currentQuiz = null;
var quizTimer = null;

function showQuiz(onDone) {
    quizCallback = onDone;
    var diff = G.difficulty === "hell" ? 3 : G.difficulty === "hard" ? 2 : 1;
    var pool = QUIZ_QUESTIONS.filter(function(q) { return q.diff <= diff + 1; });
    currentQuiz = randItem(pool);
    setText("quizDifficulty", "难度: " + (diff === 1 ? "普通" : diff === 2 ? "困难" : "地狱"));
    setHTML("quizQuestion", currentQuiz.q);
    var optsHtml = "";
    for (var i = 0; i < currentQuiz.options.length; i++) {
        optsHtml += '<div class="quiz-option" onclick="answerQuiz(' + i + ')">' + escapeHtml(currentQuiz.options[i]) + '</div>';
    }
    setHTML("quizOptions", optsHtml);
    setHTML("quizResult", "");
    switchScreen("quizScreen");
    sfx("quiz");
    startQuizTimer();
}

function startQuizTimer() {
    if (quizTimer) clearInterval(quizTimer);
    var fill = $("quizTimerFill");
    if (!fill) return;
    var width = 100;
    quizTimer = setInterval(function() {
        width -= 1;
        fill.style.width = width + "%";
        if (width <= 0) {
            clearInterval(quizTimer);
            answerQuiz(-1);
        }
    }, 150);
}

function answerQuiz(idx) {
    if (quizTimer) clearInterval(quizTimer);
    var correct = idx === currentQuiz.ans;
    var opts = document.querySelectorAll(".quiz-option");
    for (var i = 0; i < opts.length; i++) {
        opts[i].onclick = null;
        if (i === currentQuiz.ans) opts[i].classList.add("correct");
        else if (i === idx && !correct) opts[i].classList.add("wrong");
    }
    var resultEl = $("quizResult");
    if (correct) {
        G.quizStreak++;
        resultEl.textContent = "✅ 正确！连对: " + G.quizStreak;
        resultEl.className = "quiz-result correct";
        sfx("correct");
        addStat("quizCorrect", 1);
        if (G.quizStreak >= 5) unlockAchievement("quiz_master");
        if (G.quizStreak >= 10) unlockAchievement("quiz_god");
    } else {
        G.quizStreak = 0;
        resultEl.textContent = idx < 0 ? "⏰ 超时！" : "❌ 错误！";
        resultEl.className = "quiz-result wrong";
        sfx("wrong");
    }
    addStat("quizTotal", 1);
    setText("quizStreak", "连对: " + G.quizStreak);
    setTimeout(function() {
        hide("quizScreen");
        if (quizCallback) quizCallback(correct);
    }, 1200);
}

// ===== EVENT =====
var currentEvent = null;

function showEvent() {
    currentEvent = randItem(EVENTS);
    setText("eventIcon", currentEvent.title.split(" ")[0]);
    setText("eventTitle", currentEvent.title.split(" ").slice(1).join(" "));
    setText("eventDesc", currentEvent.desc);
    var choicesHtml = "";
    for (var i = 0; i < currentEvent.choices.length; i++) {
        choicesHtml += '<div class="event-choice" onclick="chooseEvent(' + i + ')">' + escapeHtml(currentEvent.choices[i].text) + '</div>';
    }
    setHTML("eventChoices", choicesHtml);
    $("eventResult").style.display = "none";
    $("eventContinue").style.display = "none";
    switchScreen("eventScreen");
    sfx("ui");
}

function chooseEvent(idx) {
    var choice = currentEvent.choices[idx];
    var good = Math.random() < 0.6;
    var resultEl = $("eventResult");
    var continueBtn = $("eventContinue");
    if (choice.result === "leave" || choice.result === "avoid" || choice.result === "dodge") {
        resultEl.textContent = "你选择了离开。";
        resultEl.style.display = "";
        continueBtn.style.display = "";
        setHTML("eventChoices", "");
        return;
    }
    if (good && choice.good) {
        resultEl.textContent = choice.good;
        applyEventResult(choice.result, true);
    } else if (!good && choice.bad) {
        resultEl.textContent = choice.bad;
        applyEventResult(choice.result, false);
    } else {
        resultEl.textContent = good ? (choice.good || "无事发生。") : (choice.bad || "无事发生。");
        if (good) applyEventResult(choice.result, true);
    }
    resultEl.style.display = "";
    continueBtn.style.display = "";
    setHTML("eventChoices", "");
}

function applyEventResult(result, good) {
    if (!good) {
        if (result === "apply") G.hp -= 5;
        if (result === "study") G.hp -= 8;
        if (result === "poly") G.hp -= 10;
        if (result === "transform") G.hp -= 6;
        if (result === "explore") G.hp -= 12;
        if (result === "read") G.hp -= 8;
        if (result === "absorb") G.hp -= 10;
        if (result === "channel") G.hp -= 6;
        if (result === "dim") G.hp -= 8;
        if (result === "sac") G.hp -= 5;
    } else {
        if (result === "apply") addRandomCard();
        if (result === "study") addRandomRelic();
        if (result === "poly") G.hp = Math.min(G.maxHp, G.hp + 15);
        if (result === "break") G.gold += 25;
        if (result === "transform") G.gold += 20;
        if (result === "inverse") G.hp = Math.min(G.maxHp, G.hp + 10);
        if (result === "hypo") addRandomRelic();
        if (result === "leg") { G.gold += 15; G.hp = Math.min(G.maxHp, G.hp + 5); }
        if (result === "explore") G.gold += 30;
        if (result === "calc") addRandomCard("rare");
        if (result === "read") G.skillPoints += 2;
        if (result === "take") addRandomRelic();
        if (result === "burn") G.gold += 20;
        if (result === "absorb") G.maxEnergy = Math.min(6, G.maxEnergy + 1);
        if (result === "channel") { /* damage current enemy - not in battle */ }
        if (result === "dim") { G.potions.push(randItem(POTIONS)); G.potions.push(randItem(POTIONS)); }
        if (result === "converge") G.hp = Math.min(G.maxHp, G.hp + 20);
    }
    updateMapStats();
}

function finishEvent() {
    hide("eventScreen");
    show("mapScreen");
    sfx("ui");
}

// ===== SHOP =====
var shopItems = [];
var shopTab = "cards";

function openShop() {
    shopTab = "cards";
    generateShop();
    renderShop();
    setText("shopGold", "💰 " + G.gold);
    switchScreen("shopScreen");
    sfx("shop");
}

function generateShop() {
    shopItems = { cards: [], potions: [], relics: [] };
    var cardIds = Object.keys(CARD_DB);
    for (var i = 0; i < 4; i++) {
        var cid = randItem(cardIds);
        var card = CARD_DB[cid];
        var price = (card.rarity === "common" ? 40 : card.rarity === "uncommon" ? 70 : card.rarity === "rare" ? 100 : 130);
        shopItems.cards.push({ id: cid, card: card, price: price });
    }
    for (var i = 0; i < 2; i++) {
        var potion = randItem(POTIONS);
        shopItems.potions.push({ potion: potion, price: potion.rarity === "common" ? 30 : potion.rarity === "uncommon" ? 50 : 80 });
    }
    for (var i = 0; i < 2; i++) {
        var relic = randItem(RELICS);
        shopItems.relics.push({ relic: relic, price: relic.rarity === "common" ? 60 : relic.rarity === "uncommon" ? 90 : relic.rarity === "rare" ? 120 : relic.rarity === "epic" ? 150 : 200 });
    }
}

function renderShop() {
    var content = $("shopContent");
    if (!content) return;
    var html = "";
    var items = shopItems[shopTab];
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var icon, name, desc, price;
        if (shopTab === "cards") {
            icon = getCardIcon(item.card);
            name = item.card.name;
            desc = item.card.desc;
            price = item.price;
        } else if (shopTab === "potions") {
            icon = item.potion.icon;
            name = item.potion.name;
            desc = item.potion.desc;
            price = item.price;
        } else {
            icon = item.relic.icon;
            name = item.relic.name;
            desc = item.relic.desc;
            price = item.price;
        }
        var canBuy = G.gold >= price;
        html += '<div class="shop-item ' + (canBuy ? "" : "disabled") + '" onclick="buyShopItem(' + i + ')">';
        html += '<div class="shop-item-icon" style="border-color:' + (shopTab === "cards" ? (item.card.type === "diff" ? "#4a9eff" : item.card.type === "int" ? "#ff6b6b" : "#ffd93d") : "rgba(255,255,255,0.2)") + '">' + icon + '</div>';
        html += '<div class="shop-item-info"><div class="shop-item-name">' + name + '</div><div class="shop-item-desc">' + desc + '</div></div>';
        html += '<div class="shop-item-price">💰 ' + price + '</div>';
        html += '</div>';
    }
    content.innerHTML = html;
}

function switchShopTab(tab) {
    shopTab = tab;
    var tabs = document.querySelectorAll(".shop-tab");
    for (var i = 0; i < tabs.length; i++) tabs[i].classList.remove("active");
    var active = document.querySelector('.shop-tab[onclick="switchShopTab(\'' + tab + '\')"]');
    if (active) active.classList.add("active");
    renderShop();
    sfx("ui");
}

function buyShopItem(idx) {
    var item = shopItems[shopTab][idx];
    if (!item) return;
    var price = item.price || item.card ? item.card.price : 0;
    if (G.gold < price) { toast("金币不足！", "warning"); return; }
    G.gold -= price;
    if (shopTab === "cards") G.deck.push(item.id);
    else if (shopTab === "potions") {
        if (G.potions.length >= 3) { toast("药水栏已满！", "warning"); G.gold += price; return; }
        G.potions.push(item.potion);
    } else if (shopTab === "relics") {
        addRelic(item.relic);
    }
    shopItems[shopTab].splice(idx, 1);
    setText("shopGold", "💰 " + G.gold);
    renderShop();
    updateMapStats();
    sfx("shop");
}

function leaveShop() {
    hide("shopScreen");
    show("mapScreen");
    sfx("ui");
}

// ===== REST =====
function openRest() {
    var html = "";
    html += '<div class="rest-option" onclick="restHeal()"><div>🔥 恢复</div><div class="ro-desc">回复 30% 最大 HP</div></div>';
    html += '<div class="rest-option" onclick="restUpgrade()"><div>🔨 强化</div><div class="ro-desc">升级一张卡牌</div></div>';
    html += '<div class="rest-option" onclick="restRemove()"><div>🗑️ 精简</div><div class="ro-desc">移除一张卡牌（花费 25 金币）</div></div>';
    setHTML("restOptions", html);
    switchScreen("restScreen");
    sfx("ui");
}

function restHeal() {
    G.hp = Math.min(G.maxHp, Math.floor(G.hp + G.maxHp * 0.3));
    toast("回复了 " + Math.floor(G.maxHp * 0.3) + " HP", "success");
    leaveRest();
}

function restUpgrade() {
    showSelectCard(G.deck, function(cid) {
        toast("卡牌升级功能已触发（演示版）", "success");
        leaveRest();
    }, "选择一张卡牌升级");
}

function restRemove() {
    if (G.gold < 25) { toast("金币不足！", "warning"); return; }
    showSelectCard(G.deck, function(cid) {
        G.gold -= 25;
        var idx = G.deck.indexOf(cid);
        if (idx >= 0) G.deck.splice(idx, 1);
        toast("移除了卡牌", "success");
        leaveRest();
    }, "选择一张卡牌移除（25金币）");
}

function leaveRest() {
    hide("restScreen");
    show("mapScreen");
    sfx("ui");
}

// ===== REWARD =====
function showReward() {
    var cardIds = Object.keys(CARD_DB);
    var rewards = [];
    for (var i = 0; i < 3; i++) {
        rewards.push(randItem(cardIds));
    }
    var html = "";
    for (var i = 0; i < rewards.length; i++) {
        var card = CARD_DB[rewards[i]];
        html += '<div class="reward-card" onclick="takeReward(\'' + rewards[i] + '\')">';
        html += '<div class="rc-icon">' + getCardIcon(card) + '</div>';
        html += '<div class="rc-name">' + card.name + '</div>';
        html += '<div class="rc-desc">' + card.desc + '</div>';
        html += '</div>';
    }
    setHTML("rewardCards", html);
    var extraHtml = "";
    if (Math.random() < 0.3) {
        var potion = randItem(POTIONS);
        extraHtml += '<div class="reward-extra" onclick="takePotionReward()">' + potion.icon + " " + potion.name + '</div>';
        G._tempPotion = potion;
    }
    if (Math.random() < 0.15) {
        var relic = randItem(RELICS);
        extraHtml += '<div class="reward-extra" onclick="takeRelicReward()">' + relic.icon + " " + relic.name + '</div>';
        G._tempRelic = relic;
    }
    setHTML("rewardExtras", extraHtml);
    switchScreen("rewardScreen");
    sfx("win");
}

function takeReward(cid) {
    G.deck.push(cid);
    hide("rewardScreen");
    show("mapScreen");
    updateMapStats();
    sfx("ui");
}

function takePotionReward() {
    if (G.potions.length < 3 && G._tempPotion) {
        G.potions.push(G._tempPotion);
        G._tempPotion = null;
    }
    updateMapStats();
}

function takeRelicReward() {
    if (G._tempRelic) {
        addRelic(G._tempRelic);
        G._tempRelic = null;
    }
}

function skipReward() {
    hide("rewardScreen");
    show("mapScreen");
    sfx("ui");
}

// ===== SELECT CARD =====
var selectCardCb = null;
var selectCardList = [];

function showSelectCard(cards, onSelect, title) {
    selectCardCb = onSelect;
    selectCardList = cards || [];
    setText("selectCardTitle", title || "选择一张卡牌");
    var html = "";
    for (var i = 0; i < selectCardList.length; i++) {
        var card = CARD_DB[selectCardList[i]];
        if (!card) continue;
        html += '<div class="sc-item" onclick="confirmSelectCard(' + i + ')">';
        html += '<div class="sc-icon">' + getCardIcon(card) + '</div>';
        html += '<div class="sc-name">' + card.name + '</div>';
        html += '</div>';
    }
    setHTML("selectCardGrid", html);
    switchScreen("selectCardScreen");
}

function confirmSelectCard(idx) {
    if (selectCardCb) selectCardCb(selectCardList[idx]);
    selectCardCb = null;
    selectCardList = [];
    hide("selectCardScreen");
}

function closeSelectCard() {
    selectCardCb = null;
    hide("selectCardScreen");
}

// ===== RELIC =====
function addRelic(relic) {
    G.relics.push(relic);
    toast("获得遗物: " + relic.name, "success");
    sfx("relic");
    if (G.relics.length >= 10) unlockAchievement("collector");
}

function addRandomCard(rarity) {
    var ids = Object.keys(CARD_DB);
    if (rarity) ids = ids.filter(function(id) { return CARD_DB[id].rarity === rarity; });
    if (ids.length === 0) ids = Object.keys(CARD_DB);
    G.deck.push(randItem(ids));
    toast("获得新卡牌！", "success");
}

function addRandomRelic() {
    addRelic(randItem(RELICS));
}
