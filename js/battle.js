// ===== BATTLE SYSTEM =====
var currentEnemy = null;
var selectedCards = [];
var chainMultiplier = 1;
var battleEnded = false;
var comboCount = 0;

function enterBattle(enemyTemplate) {
    battleEnded = false;
    comboCount = 0;
    var diffMult = DIFFICULTY_MULTIPLIERS[G.difficulty] || 1;
    currentEnemy = {
        name: enemyTemplate.name,
        hp: Math.floor(enemyTemplate.hp * diffMult),
        maxHp: Math.floor(enemyTemplate.hp * diffMult),
        func: enemyTemplate.func,
        color: enemyTemplate.color,
        desc: enemyTemplate.desc,
        pattern: enemyTemplate.pattern ? enemyTemplate.pattern.slice() : ["attack"],
        patternIdx: 0,
        cont: 100, diff: 0, deriv: 50,
        block: 0,
        vulnerable: 0, weak: 0,
        boss: enemyTemplate.boss || false,
        elite: enemyTemplate.elite || false
    };
    var funcData = getFunc(currentEnemy.func);
    currentEnemy.cont = funcData.c;
    currentEnemy.diff = funcData.d;
    currentEnemy.deriv = funcData.df;
    G.enemy = currentEnemy;
    G.turn = 1;
    G.selected = [];
    G.block = 0;
    G.firstStrike = true;
    G.firstDiff = true;
    G.cardsPlayedThisTurn = 0;
    G.chainBonus = 1;
    selectedCards = [];
    chainMultiplier = 1;

    var char = CHARACTERS[G.charId];
    if (char && char.passiveEffect) {
        var pe = char.passiveEffect();
        if (pe.seeIntent) G.seeIntent = true;
    }

    if (currentEnemy.boss) {
        var bossIdx = (G.floor - 1);
        var bossLines = [STORY_DATA.boss1, STORY_DATA.boss2, STORY_DATA.boss3][bossIdx];
        if (bossLines) {
            showDialogue(bossLines, startBattle);
            return;
        }
    }
    startBattle();
}

function startBattle() {
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
    sfx("ui");
}

function drawCards(n) {
    n = n || 1;
    for (var i = 0; i < n; i++) {
        if (G.drawPile.length === 0 && G.discardPile.length > 0) {
            G.drawPile = shuffle(G.discardPile);
            G.discardPile = [];
        }
        if (G.drawPile.length > 0) {
            G.hand.push(G.drawPile.pop());
        }
    }
    renderHand();
    updateBattleUI();
}

function renderHand() {
    var container = $("handCards");
    if (!container) return;
    var html = "";
    for (var i = 0; i < G.hand.length; i++) {
        var cid = G.hand[i];
        var card = CARD_DB[cid];
        if (!card) continue;
        var sel = selectedCards.indexOf(i) >= 0 ? "selected" : "";
        var dis = canPlayCard(card) ? "" : "disabled";
        var typeCls = "type-" + (card.type || "skill");
        var cost = getCardCost(card);
        html += '<div class="battle-card ' + sel + ' ' + dis + ' ' + typeCls + '" onclick="toggleCard(' + i + ')">';
        html += '<div class="bc-cost">' + cost + '</div>';
        html += '<div class="bc-icon">' + getCardIcon(card) + '</div>';
        html += '<div class="bc-name">' + card.name + '</div>';
        html += '<div class="bc-desc">' + card.desc + '</div>';
        html += '<div class="bc-type">' + getTypeLabel(card.type) + '</div>';
        html += '</div>';
    }
    container.innerHTML = html;
}

function getCardIcon(card) {
    var icons = { skill: "⚔️", diff: "∂", int: "∫", thm: "📐", series: "Σ", converge: "🎯", lagrange: "⚖️" };
    return icons[card.type] || "🃏";
}
function getTypeLabel(type) {
    var labels = { skill: "技能", diff: "微分", int: "积分", thm: "定理", series: "级数", converge: "收敛", lagrange: "乘子" };
    return labels[type] || type;
}

function getCardCost(card) {
    var cost = card.cost;
    if (card.type === "thm" && hasRelicEffect("thmDiscount")) cost = Math.max(1, cost - 1);
    return cost;
}

function canPlayCard(card) {
    var cost = getCardCost(card);
    var type = card.type;
    if (type === "diff") return G.diffEnergy >= cost;
    if (type === "int") return G.intEnergy >= cost;
    if (type === "thm" || type === "series" || type === "converge" || type === "lagrange") return G.energy >= cost;
    return G.energy >= cost;
}

function toggleCard(idx) {
    if (battleEnded) return;
    var card = CARD_DB[G.hand[idx]];
    if (!canPlayCard(card)) return;
    var pos = selectedCards.indexOf(idx);
    if (pos >= 0) {
        selectedCards.splice(pos, 1);
    } else {
        selectedCards.push(idx);
    }
    renderHand();
    $("btnPlay").disabled = selectedCards.length === 0;
    sfx("ui");
}

function playCards() {
    if (battleEnded || selectedCards.length === 0) return;
    selectedCards.sort(function(a, b) { return a - b; });
    comboCount = 0;
    for (var i = selectedCards.length - 1; i >= 0; i--) {
        var handIdx = selectedCards[i];
        var cid = G.hand[handIdx];
        var card = CARD_DB[cid];
        if (!card) continue;
        playCard(card, cid);
        G.discardPile.push(cid);
        G.hand.splice(handIdx, 1);
        comboCount++;
        G.cardsPlayedThisTurn++;
    }
    selectedCards = [];
    $("btnPlay").disabled = true;
    renderHand();
    updateBattleUI();
    updateComboDisplay();
    checkBattleEnd();
}

function playCard(card, cid) {
    var cost = getCardCost(card);
    if (card.type === "diff") G.diffEnergy -= cost;
    else if (card.type === "int") G.intEnergy -= cost;
    else G.energy -= cost;

    var dmg = 0, block = 0, heal = 0;
    var char = CHARACTERS[G.charId];

    // Damage calculation
    if (card.dmg !== undefined) {
        dmg = card.dmg;
        if (card.type === "diff" && G.firstDiff && G.charId === "euler") {
            var skillLvl = getSkillLevel("e1");
            var bonus = [15, 25, 40][skillLvl] || 15;
            currentEnemy.cont = Math.max(0, currentEnemy.cont - bonus);
        }
        if (card.chain && G.chainBonus > 1) dmg = Math.floor(dmg * G.chainBonus);
        if (card.type === "int" && G.charId === "gauss") {
            var sb = getSkillLevel("g1");
            dmg += [3, 6, 10][sb] || 3;
            if (currentEnemy.diff > (75 - [0, 10, 20][getSkillLevel("g2") || 0])) {
                dmg = Math.floor(dmg * 1.5);
                fxEnemyCrit(200, 300);
            }
        }
        if (card.type === "thm" && hasRelicEffect("thmDiscount")) {
            dmg = Math.floor(dmg * 1.3);
        }
        if (card.type === "series") {
            var seriesDmg = G.seriesCount * (card.seriesScale || 1);
            dmg = Math.max(dmg, seriesDmg);
            G.seriesCount = 0;
        }
        if (card.dmgScale) {
            dmg = Math.floor(currentEnemy.diff * card.dmgScale);
        }
        if (card.dmgLow !== undefined && currentEnemy.cont < 50) {
            dmg = card.dmgLow;
        }
        if (card.dmgHalf !== undefined && G.hp < G.maxHp * 0.5) {
            dmg = card.dmgHalf;
        }
        if (card.ignoreCont && currentEnemy.cont < 30) {
            dmg = Math.floor(dmg * 1.5);
        }
        if (card.energyBonus) {
            dmg += card.energyBonus * G.energy;
        }
        if (G.firstStrike && hasRelicEffect("firstStrike")) {
            dmg += 5;
        }
        if (hasRelicEffect("comboBoost")) {
            dmg += 4;
        }
        if (comboCount > 0) {
            dmg = Math.floor(dmg * (1 + comboCount * 0.15));
        }
        if (G.charId === "cauchy") {
            var seq = getSkillLevel("c2");
            dmg += [0, 2, 4, 7][seq] || 0;
        }
        if (G.charId === "lagrange") {
            dmg += getSkillLevel("lg1") || 0;
        }
        var fractal = hasRelicEffect("fractal");
        if (fractal) dmg += rand(1, 5);

        // Apply vulnerable
        if (currentEnemy.vulnerable > 0) dmg = Math.floor(dmg * 1.5);
        if (currentEnemy.weak > 0) dmg = Math.floor(dmg * 0.75);

        // Block reduction
        if (!card.ignoreBlock) {
            var actualDmg = Math.max(0, dmg - currentEnemy.block);
            currentEnemy.block = Math.max(0, currentEnemy.block - dmg);
            dmg = actualDmg;
        }

        if (dmg > 0) {
            currentEnemy.hp -= dmg;
            addStat("totalDamage", dmg);
            if (dmg > stats.highestDamage) stats.highestDamage = dmg;
            fxEnemyHit(200, 300);
            floatDmg(dmg, null, rand(160, 240), rand(260, 340));
            logBattle("<span class='log-dmg'>对" + currentEnemy.name + "造成 " + dmg + " 伤害</span>");
            if (dmg >= 50) unlockAchievement("overkill");
            if (dmg >= 100) unlockAchievement("overkill2");
        }
    }

    // Block
    if (card.block !== undefined) {
        block = card.block;
        if (hasRelicEffect("blockBoost")) block += 3;
        if (hasRelicEffect("balanced")) block += 2;
        G.block += block;
        fxBlock(80, 300);
        floatBlock(block, 60, 280);
        logBattle("<span class='log-block'>获得 " + block + " 护盾</span>");
    }

    // Heal
    if (card.heal !== undefined) {
        heal = card.heal;
        G.hp = Math.min(G.maxHp, G.hp + heal);
        fxHeal(80, 300);
        floatHeal(heal, 60, 260);
        logBattle("<span class='log-heal'>回复 " + heal + " HP</span>");
    }

    // Diff
    if (card.diff !== undefined) {
        var diffAmt = card.diff;
        if (hasRelicEffect("diffBoost")) diffAmt += 1;
        currentEnemy.cont = Math.max(0, currentEnemy.cont - diffAmt * 10);
        currentEnemy.diff = Math.min(100, currentEnemy.diff + diffAmt * 15);
        if (card.ignoreCont) currentEnemy.cont = 0;
        G.firstDiff = false;
        unlockAchievement("first_diff");
    }

    // Draw
    if (card.draw !== undefined) {
        drawCards(card.draw);
        sfx("draw");
    }

    // Series
    if (card.series !== undefined) {
        G.seriesCount += card.series;
    }

    // Skip turn
    if (card.skipTurn !== undefined) {
        if (Math.random() < card.skipTurn) currentEnemy.skipNext = true;
    }

    // Weaken
    if (card.weaken !== undefined) {
        currentEnemy.weak = Math.max(currentEnemy.weak, 2);
    }

    // Vulnerable
    if (card.vulnerable !== undefined) {
        currentEnemy.vulnerable = Math.max(currentEnemy.vulnerable, card.vulnerable);
    }

    // Energy gain
    if (card.energyGain !== undefined) {
        G.energy = Math.min(G.maxEnergy + 2, G.energy + card.energyGain);
    }

    // Convert
    if (card.convert !== undefined) {
        G.energy = Math.min(G.maxEnergy + 2, G.energy + 1);
        G.intEnergy = Math.min(G.maxIntEnergy + 2, G.intEnergy + 1);
        G.diffEnergy = Math.min(G.maxDiffEnergy + 2, G.diffEnergy + 1);
    }

    // Reset func
    if (card.reset) {
        var fd = getFunc(currentEnemy.func);
        currentEnemy.cont = fd.c;
        currentEnemy.diff = fd.d;
        currentEnemy.deriv = fd.df;
    }

    // Chain bonus
    if (card.chain) {
        G.chainBonus = 1.6;
    } else {
        G.chainBonus = 1;
    }

    // Relic on play
    if (hasRelicEffect("energyRefund") && Math.random() < 0.2) {
        G.energy++;
    }

    addStat("cardsPlayed", 1);
    sfx(card.type || "skill");
    fxCardPlay(card.type || "skill", fxCanvas ? fxCanvas.width / 2 : 215, fxCanvas ? fxCanvas.height / 2 : 400);
}

function getSkillLevel(sid) {
    if (!G.skills) return 0;
    for (var i = 0; i < G.skills.length; i++) {
        if (G.skills[i].id === sid) return G.skills[i].level;
    }
    return 0;
}

function hasRelicEffect(effect) {
    for (var i = 0; i < G.relics.length; i++) {
        if (G.relics[i].effect === effect) return true;
    }
    return false;
}

function updateComboDisplay() {
    var el = $("comboDisplay");
    if (!el) return;
    if (comboCount > 1) {
        el.textContent = "连击 x" + comboCount;
        el.classList.add("show");
        sfx("chain");
        if (comboCount >= 5) unlockAchievement("combo_master");
        if (comboCount >= 10) unlockAchievement("combo_god");
    } else {
        el.classList.remove("show");
    }
}

function logBattle(html) {
    var log = $("battleLog");
    if (!log) return;
    var entry = document.createElement("div");
    entry.className = "log-entry";
    entry.innerHTML = html;
    log.appendChild(entry);
    log.scrollTop = log.scrollHeight;
}

function updateBattleUI() {
    var char = CHARACTERS[G.charId];
    setText("playerName", char ? char.name : "数学家");
    setText("playerAvatar", char ? char.icon : "🧮");
    setText("heroAvatar", char ? char.icon : "🧮");
    setText("pht", G.hp + "/" + G.maxHp);
    var php = $("php");
    if (php) php.style.width = (G.hp / G.maxHp * 100) + "%";
    setText("energyText", G.energy + "/" + G.maxEnergy);
    setText("intEnergyText", G.intEnergy + "/" + G.maxIntEnergy);
    setText("diffEnergyText", G.diffEnergy + "/" + G.maxDiffEnergy);
    setText("turnNum", G.turn);
    setText("drawPileInfo", "抽牌堆: " + G.drawPile.length);
    setText("discardPileInfo", "弃牌堆: " + G.discardPile.length);
    setText("drawInfo", "抽5张 | 能量" + G.maxEnergy);

    if (currentEnemy) {
        var enemyEl = $("battleEnemy");
        if (enemyEl) {
            var bossCls = currentEnemy.boss ? "boss" : "";
            var funcData = getFunc(currentEnemy.func);
            enemyEl.innerHTML = '<div class="enemy-visual ' + bossCls + '" style="background:' + (currentEnemy.color || '#ff4757') + '30;border-color:' + (currentEnemy.color || '#ff4757') + '">' + getEnemyEmoji(currentEnemy.name) + '</div>' +
                '<div class="enemy-hp-wrap"><div class="enemy-hp-bar"><div class="enemy-hp-fill" style="width:' + (currentEnemy.hp / currentEnemy.maxHp * 100) + '%"></div></div></div>' +
                '<div class="enemy-name">' + currentEnemy.name + '</div>' +
                '<div class="enemy-func">' + currentEnemy.func + ' | 连续:' + currentEnemy.cont + '% | 可导:' + currentEnemy.diff + '%</div>';
        }
        var battleBg = $("battleBg");
        if (battleBg) {
            if (currentEnemy.hp / currentEnemy.maxHp < 0.3) battleBg.classList.add("danger");
            else battleBg.classList.remove("danger");
        }
    }
    updatePotionBar();
    updatePlayerBuffs();
}

function getEnemyEmoji(name) {
    var map = { "不可导之魔": "👹", "狄利克雷": "👿", "跳跃函数": "🦘", "震荡函数": "〰️", "多项式幽灵": "👻", "振荡奇点": "💫", "分段函数": "📊", "隐函数": "🌫️",
        "魏尔斯特拉斯": "🦑", "康托幽灵": "🎭", "黎曼ζ": "🔥", "傅里叶恶魔": "🌊", "拉普拉斯幽灵": "⚡", "泰勒畸变体": "🌀",
        "发散之王": "😈", "无穷大领主": "💀", "发散之源": "🌑", "级数吞噬者": "🐉", "发散母核": "☠️" };
    return map[name] || "👾";
}

function updatePlayerBuffs() {
    var el = $("playerBuffs");
    if (!el) return;
    var html = "";
    if (G.block > 0) html += '<span class="buff">🛡️ ' + G.block + '</span>';
    if (currentEnemy && currentEnemy.vulnerable > 0) html += '<span class="buff">💔 脆弱</span>';
    if (currentEnemy && currentEnemy.weak > 0) html += '<span class="buff">😰 虚弱</span>';
    if (G.chainBonus > 1) html += '<span class="buff">⛓️ 连锁</span>';
    el.innerHTML = html;
}

function updatePotionBar() {
    var el = $("potionBar");
    if (!el) return;
    var html = "";
    for (var i = 0; i < 3; i++) {
        if (G.potions[i]) {
            html += '<div class="potion-slot" onclick="usePotion(' + i + ')">' + G.potions[i].icon + '</div>';
        } else {
            html += '<div class="potion-slot empty">🫙</div>';
        }
    }
    el.innerHTML = html;
}

function usePotion(idx) {
    if (battleEnded) return;
    var potion = G.potions[idx];
    if (!potion) return;
    if (potion.effect === "heal") {
        G.hp = Math.min(G.maxHp, G.hp + potion.value);
        fxHeal(80, 300);
        floatHeal(potion.value, 60, 260);
    } else if (potion.effect === "energy") {
        G.energy = Math.min(G.maxEnergy + 3, G.energy + potion.value);
        G.intEnergy = Math.min(G.maxIntEnergy + 3, G.intEnergy + potion.value);
        G.diffEnergy = Math.min(G.maxDiffEnergy + 3, G.diffEnergy + potion.value);
    } else if (potion.effect === "dmg") {
        // Applied next attack
    } else if (potion.effect === "block") {
        G.block += potion.value;
        fxBlock(80, 300);
        floatBlock(potion.value, 60, 280);
    } else if (potion.effect === "series") {
        G.seriesCount += potion.value;
    } else if (potion.effect === "reset") {
        var fd = getFunc(currentEnemy.func);
        currentEnemy.cont = fd.c;
        currentEnemy.diff = fd.d;
    }
    G.potions.splice(idx, 1);
    updatePotionBar();
    updateBattleUI();
    sfx("potion");
}

function updateEnemyIntent() {
    var intentBox = $("intentBox");
    if (!intentBox || !currentEnemy) return;
    if (currentEnemy.skipNext) {
        intentBox.style.display = "none";
        return;
    }
    intentBox.style.display = "";
    var pattern = currentEnemy.pattern[currentEnemy.patternIdx % currentEnemy.pattern.length];
    var intentIcon = "⚔️";
    var intentText = "";
    var diffMult = DIFFICULTY_MULTIPLIERS[G.difficulty] || 1;
    if (pattern === "attack") {
        var dmg = Math.floor((8 + G.floor * 3) * diffMult);
        if (currentEnemy.boss) dmg = Math.floor(dmg * 1.5);
        if (currentEnemy.elite) dmg = Math.floor(dmg * 1.2);
        intentText = "攻击 " + dmg;
        intentIcon = "⚔️";
    } else if (pattern === "defend") {
        intentText = "防御";
        intentIcon = "🛡️";
    } else if (pattern === "buff") {
        intentText = "强化";
        intentIcon = "💪";
    } else if (pattern === "debuff") {
        intentText = "削弱";
        intentIcon = "😰";
    }
    setText("intentIcon", intentIcon);
    setText("intentText", intentText);
}

function endTurn() {
    if (battleEnded) return;
    // Discard hand
    for (var i = 0; i < G.hand.length; i++) {
        G.discardPile.push(G.hand[i]);
    }
    G.hand = [];
    selectedCards = [];
    renderHand();
    $("btnPlay").disabled = true;

    // Enemy turn
    enemyTurn();
    if (battleEnded) return;

    // Next turn
    G.turn++;
    G.totalTurns++;
    G.energy = G.maxEnergy;
    G.intEnergy = G.maxIntEnergy;
    G.diffEnergy = G.maxDiffEnergy;
    G.block = 0;
    G.firstStrike = true;
    G.firstDiff = true;
    G.cardsPlayedThisTurn = 0;
    G.chainBonus = 1;
    comboCount = 0;

    // Start of turn effects
    if (hasRelicEffect("startBlock")) {
        G.block += 8;
    }
    var norm = getSkillLevel("g3");
    var gaussChar = CHARACTERS[G.charId];
    if (norm > 0 && gaussChar && gaussChar.id === "gauss" && Math.random() < [0.25, 0.45, 0.65][norm]) {
        G.block += 5;
    }

    drawCards(5);
    updateEnemyIntent();
    updateBattleUI();
    sfx("ui");
}

function enemyTurn() {
    if (!currentEnemy) return;
    if (currentEnemy.skipNext) {
        currentEnemy.skipNext = false;
        logBattle(currentEnemy.name + " 被收敛压制，跳过了行动！");
        return;
    }
    var pattern = currentEnemy.pattern[currentEnemy.patternIdx % currentEnemy.pattern.length];
    currentEnemy.patternIdx++;
    var diffMult = DIFFICULTY_MULTIPLIERS[G.difficulty] || 1;

    if (pattern === "attack") {
        var dmg = Math.floor((8 + G.floor * 3) * diffMult);
        if (currentEnemy.boss) dmg = Math.floor(dmg * 1.5);
        if (currentEnemy.elite) dmg = Math.floor(dmg * 1.2);
        if (currentEnemy.weak > 0) dmg = Math.floor(dmg * 0.75);
        currentEnemy.weak = Math.max(0, currentEnemy.weak - 1);
        var actualDmg = Math.max(0, dmg - G.block);
        G.block = Math.max(0, G.block - dmg);
        if (actualDmg > 0) {
            G.hp -= actualDmg;
            G.noDamageTaken = false;
            fxPlayerHit(80, 300);
            floatDmg(actualDmg, "#ff4757", rand(60, 120), rand(260, 340));
            logBattle("<span class='log-dmg'>" + currentEnemy.name + " 造成 " + actualDmg + " 伤害</span>");
        } else {
            logBattle("护盾完全抵挡了攻击！");
        }
    } else if (pattern === "defend") {
        currentEnemy.block += Math.floor(10 * diffMult);
        logBattle(currentEnemy.name + " 获得了护盾");
    } else if (pattern === "buff") {
        currentEnemy.cont = Math.min(100, currentEnemy.cont + 15);
        logBattle(currentEnemy.name + " 的连续性提升了");
    } else if (pattern === "debuff") {
        G.maxEnergy = Math.max(2, G.maxEnergy - 1);
        logBattle(currentEnemy.name + " 降低了你的能量上限！");
    }

    currentEnemy.vulnerable = Math.max(0, currentEnemy.vulnerable - 1);
    updateBattleUI();
    checkBattleEnd();
}

function checkBattleEnd() {
    if (battleEnded) return;
    if (currentEnemy && currentEnemy.hp <= 0) {
        battleEnded = true;
        currentEnemy.hp = 0;
        logBattle("🎉 " + currentEnemy.name + " 被击败了！");
        sfx("win");
        addStat("totalKills", 1);
        // Endless mode
        if (typeof endlessFloor !== "undefined" && endlessFloor > 0) {
            endlessVictory();
            return;
        }
        G.gold += 15 + G.floor * 5;
        floatGold(15 + G.floor * 5, 200, 200);
        G.skillPoints += 1;
        if (currentEnemy.boss) {
            unlockAchievement("first_boss");
            G.floorClear[G.floor - 1] = true;
            if (G.floor >= 3) {
                var ending = G.noDamageTaken ? "perfect" : G.storyChoices.trueEnding ? "true" : "normal";
                showVictory(ending);
                return;
            } else {
                G.floor++;
                showFloorTransition(G.floor);
                return;
            }
        }
        setTimeout(function() { showReward(); }, 800);
        return;
    }
    if (G.hp <= 0) {
        battleEnded = true;
        G.hp = 0;
        if (typeof endlessFloor !== "undefined" && endlessFloor > 0) {
            saveEndlessRecord(endlessFloor);
            setText("overTitle", "发散...");
            setText("overSubtitle", "无尽模式 第 " + endlessFloor + " 层");
            setHTML("overStats", "最高层数: " + endlessFloor);
            setHTML("overEnding", "你在无尽模式中到达了第 " + endlessFloor + " 层。数学的征程永无止境...");
            switchScreen("overScreen");
            stopBGM();
            startDefeatBGM();
            return;
        }
        showDefeat();
    }
}

function openBattleSettings() {
    openSettings();
}
