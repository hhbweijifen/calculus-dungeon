// ===== EPIC AUDIO ENGINE =====
var audioCtx = null;
var bgmNodes = [];
var bgmStarted = false;
var currentBgmType = "";
var masterGain = null;
var sfxGain = null;

function initAudio() {
    if (audioCtx) return;
    try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        masterGain = audioCtx.createGain();
        masterGain.gain.value = settings.bgmVolume / 1000;
        masterGain.connect(audioCtx.destination);
        sfxGain = audioCtx.createGain();
        sfxGain.gain.value = settings.sfxVolume / 1000;
        sfxGain.connect(audioCtx.destination);
    } catch(e) { console.log("Audio init failed"); }
}

function getMasterVol() { return (settings.bgmVolume || 40) / 1000; }
function getSfxVol() { return (settings.sfxVolume || 60) / 1000; }

function updateBGMVolume() {
    if (masterGain) masterGain.gain.value = getMasterVol();
    if (sfxGain) sfxGain.gain.value = getSfxVol();
}

function stopBGM() {
    bgmNodes.forEach(function(n) {
        try { if (n.stop) n.stop(); n.disconnect(); } catch(e) {}
    });
    bgmNodes = [];
    bgmStarted = false;
    currentBgmType = "";
}

function startMenuBGM() { startBgmType("menu"); }
function startMapBGM() { startBgmType("map"); }
function startBattleBGM() { startBgmType(isBossBattle() ? "boss" : "battle"); }
function startRestBGM() { startBgmType("rest"); }
function startStoryBGM() { startBgmType("story"); }
function startVictoryBGM() { startBgmType("victory"); }
function startDefeatBGM() { startBgmType("defeat"); }

function isBossBattle() {
    return G.enemy && G.enemy.boss;
}

function startBgmType(type) {
    if (!audioCtx) initAudio();
    if (!audioCtx) return;
    if (currentBgmType === type && bgmStarted) return;
    stopBGM();
    currentBgmType = type;
    bgmStarted = true;
    switch(type) {
        case "menu": playMenuMusic(); break;
        case "map": playMapMusic(); break;
        case "battle": playBattleMusic(); break;
        case "boss": playBossMusic(); break;
        case "rest": playRestMusic(); break;
        case "story": playStoryMusic(); break;
        case "victory": playVictoryMusic(); break;
        case "defeat": playDefeatMusic(); break;
    }
}

// ===== MENU MUSIC: Epic orchestral drone + bells =====
function playMenuMusic() {
    var mg = audioCtx.createGain(); mg.gain.value = getMasterVol();
    mg.connect(audioCtx.destination); bgmNodes.push(mg);
    // Deep drone
    var d1 = makeOsc("sine", 55, 0.4, mg);
    var d2 = makeOsc("triangle", 82.41, 0.15, mg);
    var d3 = makeOsc("sine", 110, 0.1, mg);
    // Bell-like arpeggio loop
    menuArpeggio(mg);
}
function menuArpeggio(mg) {
    if (currentBgmType !== "menu" || !bgmStarted) return;
    var notes = [523.25, 659.25, 783.99, 1046.5];
    var note = notes[Math.floor(Math.random() * notes.length)];
    var osc = audioCtx.createOscillator();
    var g = audioCtx.createGain();
    osc.type = "sine"; osc.frequency.value = note;
    g.gain.value = 0.08;
    g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 3);
    osc.connect(g); g.connect(mg);
    osc.start(); osc.stop(audioCtx.currentTime + 3);
    bgmNodes.push(osc, g);
    setTimeout(function() { menuArpeggio(mg); }, 2000 + Math.random() * 4000);
}

// ===== MAP MUSIC: Mysterious ambient =====
function playMapMusic() {
    var mg = audioCtx.createGain(); mg.gain.value = getMasterVol();
    mg.connect(audioCtx.destination); bgmNodes.push(mg);
    makeOsc("sine", 65.41, 0.35, mg);
    makeOsc("sine", 98, 0.12, mg);
    mapArpeggio(mg);
}
function mapArpeggio(mg) {
    if (currentBgmType !== "map" || !bgmStarted) return;
    var notes = [196, 220, 261.63, 293.66, 329.63];
    var note = notes[Math.floor(Math.random() * notes.length)];
    var osc = audioCtx.createOscillator();
    var g = audioCtx.createGain();
    osc.type = "triangle"; osc.frequency.value = note;
    g.gain.value = 0.05;
    g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 2.5);
    osc.connect(g); g.connect(mg);
    osc.start(); osc.stop(audioCtx.currentTime + 2.5);
    bgmNodes.push(osc, g);
    setTimeout(function() { mapArpeggio(mg); }, 1500 + Math.random() * 3000);
}

// ===== BATTLE MUSIC: Tense electronic =====
function playBattleMusic() {
    var mg = audioCtx.createGain(); mg.gain.value = getMasterVol();
    mg.connect(audioCtx.destination); bgmNodes.push(mg);
    makeOsc("sawtooth", 55, 0.08, mg);
    makeOsc("square", 110, 0.04, mg);
    battleLoop(mg, [146.83, 174.61, 196, 220], 800);
}
function battleLoop(mg, notes, interval) {
    if (currentBgmType !== "battle" || !bgmStarted) return;
    var note = notes[Math.floor(Math.random() * notes.length)];
    var osc = audioCtx.createOscillator();
    var g = audioCtx.createGain();
    osc.type = "sawtooth"; osc.frequency.value = note;
    g.gain.value = 0.04;
    g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
    osc.connect(g); g.connect(mg);
    osc.start(); osc.stop(audioCtx.currentTime + 0.4);
    bgmNodes.push(osc, g);
    setTimeout(function() { battleLoop(mg, notes, interval); }, interval + Math.random() * 400);
}

// ===== BOSS MUSIC: Epic battle =====
function playBossMusic() {
    var mg = audioCtx.createGain(); mg.gain.value = getMasterVol();
    mg.connect(audioCtx.destination); bgmNodes.push(mg);
    makeOsc("sawtooth", 41.2, 0.15, mg);
    makeOsc("sine", 61.74, 0.1, mg);
    bossLoop(mg);
}
function bossLoop(mg) {
    if (currentBgmType !== "boss" || !bgmStarted) return;
    var notes = [110, 130.81, 146.83, 164.81, 196, 220];
    var note = notes[Math.floor(Math.random() * notes.length)];
    var osc = audioCtx.createOscillator();
    var g = audioCtx.createGain();
    osc.type = "square"; osc.frequency.value = note;
    g.gain.value = 0.06;
    g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);
    osc.connect(g); g.connect(mg);
    osc.start(); osc.stop(audioCtx.currentTime + 0.6);
    bgmNodes.push(osc, g);
    setTimeout(function() { bossLoop(mg); }, 500 + Math.random() * 300);
}

// ===== REST MUSIC: Calm healing =====
function playRestMusic() {
    var mg = audioCtx.createGain(); mg.gain.value = getMasterVol();
    mg.connect(audioCtx.destination); bgmNodes.push(mg);
    makeOsc("sine", 261.63, 0.2, mg);
    makeOsc("sine", 329.63, 0.1, mg);
    restLoop(mg);
}
function restLoop(mg) {
    if (currentBgmType !== "rest" || !bgmStarted) return;
    var notes = [392, 440, 523.25, 587.33];
    var note = notes[Math.floor(Math.random() * notes.length)];
    var osc = audioCtx.createOscillator();
    var g = audioCtx.createGain();
    osc.type = "sine"; osc.frequency.value = note;
    g.gain.value = 0.06;
    g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 3);
    osc.connect(g); g.connect(mg);
    osc.start(); osc.stop(audioCtx.currentTime + 3);
    bgmNodes.push(osc, g);
    setTimeout(function() { restLoop(mg); }, 2500 + Math.random() * 5000);
}

// ===== STORY MUSIC: Emotional strings =====
function playStoryMusic() {
    var mg = audioCtx.createGain(); mg.gain.value = getMasterVol();
    mg.connect(audioCtx.destination); bgmNodes.push(mg);
    makeOsc("sine", 196, 0.2, mg);
    makeOsc("triangle", 246.94, 0.1, mg);
    storyLoop(mg);
}
function storyLoop(mg) {
    if (currentBgmType !== "story" || !bgmStarted) return;
    var notes = [293.66, 329.63, 392, 440];
    var note = notes[Math.floor(Math.random() * notes.length)];
    var osc = audioCtx.createOscillator();
    var g = audioCtx.createGain();
    osc.type = "sine"; osc.frequency.value = note;
    g.gain.value = 0.06;
    g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 4);
    osc.connect(g); g.connect(mg);
    osc.start(); osc.stop(audioCtx.currentTime + 4);
    bgmNodes.push(osc, g);
    setTimeout(function() { storyLoop(mg); }, 3000 + Math.random() * 6000);
}

// ===== VICTORY MUSIC =====
function playVictoryMusic() {
    var mg = audioCtx.createGain(); mg.gain.value = getMasterVol();
    mg.connect(audioCtx.destination); bgmNodes.push(mg);
    var notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
    var delay = 0;
    notes.forEach(function(n) {
        var osc = audioCtx.createOscillator();
        var g = audioCtx.createGain();
        osc.type = "sine"; osc.frequency.value = n;
        g.gain.value = 0;
        g.gain.setValueAtTime(0, audioCtx.currentTime + delay);
        g.gain.linearRampToValueAtTime(0.08, audioCtx.currentTime + delay + 0.1);
        g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + delay + 1.5);
        osc.connect(g); g.connect(mg);
        osc.start(audioCtx.currentTime + delay);
        osc.stop(audioCtx.currentTime + delay + 1.5);
        bgmNodes.push(osc, g);
        delay += 0.2;
    });
}

// ===== DEFEAT MUSIC =====
function playDefeatMusic() {
    var mg = audioCtx.createGain(); mg.gain.value = getMasterVol();
    mg.connect(audioCtx.destination); bgmNodes.push(mg);
    var notes = [523.25, 440, 369.99, 329.63, 261.63];
    var delay = 0;
    notes.forEach(function(n) {
        var osc = audioCtx.createOscillator();
        var g = audioCtx.createGain();
        osc.type = "sawtooth"; osc.frequency.value = n;
        g.gain.value = 0;
        g.gain.setValueAtTime(0, audioCtx.currentTime + delay);
        g.gain.linearRampToValueAtTime(0.06, audioCtx.currentTime + delay + 0.1);
        g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + delay + 2);
        osc.connect(g); g.connect(mg);
        osc.start(audioCtx.currentTime + delay);
        osc.stop(audioCtx.currentTime + delay + 2);
        bgmNodes.push(osc, g);
        delay += 0.4;
    });
}

function makeOsc(type, freq, vol, dest) {
    var osc = audioCtx.createOscillator();
    var g = audioCtx.createGain();
    osc.type = type; osc.frequency.value = freq;
    g.gain.value = vol;
    osc.connect(g); g.connect(dest);
    osc.start();
    bgmNodes.push(osc, g);
    return osc;
}

// ===== SFX: 40+ sound effects =====
function sfx(type) {
    if (!audioCtx) initAudio();
    if (!audioCtx) return;
    try {
        var osc = audioCtx.createOscillator();
        var gain = audioCtx.createGain();
        var now = audioCtx.currentTime;
        var vol = getSfxVol();

        switch(type) {
            case "diff":
                osc.type = "sawtooth";
                osc.frequency.setValueAtTime(220, now);
                osc.frequency.exponentialRampToValueAtTime(520, now + 0.15);
                gain.gain.setValueAtTime(vol * 0.7, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
                break;
            case "int":
                osc.type = "sine";
                osc.frequency.setValueAtTime(350, now);
                osc.frequency.exponentialRampToValueAtTime(150, now + 0.35);
                gain.gain.setValueAtTime(vol * 0.7, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
                break;
            case "thm":
                osc.type = "square";
                osc.frequency.setValueAtTime(600, now);
                gain.gain.setValueAtTime(vol * 0.6, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
                break;
            case "series":
                osc.type = "triangle";
                osc.frequency.setValueAtTime(400, now);
                osc.frequency.exponentialRampToValueAtTime(800, now + 0.2);
                gain.gain.setValueAtTime(vol * 0.6, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
                break;
            case "converge":
                osc.type = "sine";
                osc.frequency.setValueAtTime(500, now);
                osc.frequency.exponentialRampToValueAtTime(200, now + 0.3);
                gain.gain.setValueAtTime(vol * 0.5, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
                break;
            case "convert":
                osc.type = "sine";
                osc.frequency.setValueAtTime(300, now);
                osc.frequency.setValueAtTime(500, now + 0.1);
                osc.frequency.setValueAtTime(400, now + 0.2);
                gain.gain.setValueAtTime(vol * 0.5, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
                break;
            case "hit":
                osc.type = "sawtooth";
                osc.frequency.setValueAtTime(150, now);
                osc.frequency.exponentialRampToValueAtTime(40, now + 0.15);
                gain.gain.setValueAtTime(vol * 0.9, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
                break;
            case "crit":
                osc.type = "square";
                osc.frequency.setValueAtTime(400, now);
                osc.frequency.setValueAtTime(600, now + 0.08);
                osc.frequency.setValueAtTime(800, now + 0.16);
                gain.gain.setValueAtTime(vol * 0.8, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
                break;
            case "heal":
                osc.type = "sine";
                osc.frequency.setValueAtTime(400, now);
                osc.frequency.exponentialRampToValueAtTime(650, now + 0.2);
                gain.gain.setValueAtTime(vol * 0.5, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
                break;
            case "block":
                osc.type = "sine";
                osc.frequency.setValueAtTime(250, now);
                gain.gain.setValueAtTime(vol * 0.5, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
                break;
            case "chain":
                osc.type = "triangle";
                osc.frequency.setValueAtTime(440, now);
                osc.frequency.setValueAtTime(554, now + 0.1);
                osc.frequency.setValueAtTime(659, now + 0.2);
                gain.gain.setValueAtTime(vol * 0.6, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
                break;
            case "win":
                osc.type = "sine";
                osc.frequency.setValueAtTime(440, now);
                osc.frequency.setValueAtTime(554, now + 0.15);
                osc.frequency.setValueAtTime(659, now + 0.3);
                gain.gain.setValueAtTime(vol * 0.7, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
                break;
            case "lose":
                osc.type = "sawtooth";
                osc.frequency.setValueAtTime(350, now);
                osc.frequency.exponentialRampToValueAtTime(60, now + 0.6);
                gain.gain.setValueAtTime(vol * 0.7, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
                break;
            case "draw":
                osc.type = "sine";
                osc.frequency.setValueAtTime(700, now);
                gain.gain.setValueAtTime(vol * 0.25, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
                break;
            case "relic":
                osc.type = "sine";
                osc.frequency.setValueAtTime(900, now);
                osc.frequency.setValueAtTime(1100, now + 0.12);
                gain.gain.setValueAtTime(vol * 0.5, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
                break;
            case "shop":
                osc.type = "triangle";
                osc.frequency.setValueAtTime(550, now);
                gain.gain.setValueAtTime(vol * 0.35, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
                break;
            case "potion":
                osc.type = "sine";
                osc.frequency.setValueAtTime(750, now);
                osc.frequency.exponentialRampToValueAtTime(950, now + 0.1);
                gain.gain.setValueAtTime(vol * 0.35, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
                break;
            case "quiz":
                osc.type = "sine";
                osc.frequency.setValueAtTime(550, now);
                gain.gain.setValueAtTime(vol * 0.4, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
                break;
            case "correct":
                osc.type = "sine";
                osc.frequency.setValueAtTime(523, now);
                osc.frequency.setValueAtTime(659, now + 0.1);
                osc.frequency.setValueAtTime(784, now + 0.2);
                gain.gain.setValueAtTime(vol * 0.5, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
                break;
            case "wrong":
                osc.type = "sawtooth";
                osc.frequency.setValueAtTime(220, now);
                osc.frequency.exponentialRampToValueAtTime(90, now + 0.35);
                gain.gain.setValueAtTime(vol * 0.6, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
                break;
            case "step":
                osc.type = "sine";
                osc.frequency.setValueAtTime(200, now);
                gain.gain.setValueAtTime(vol * 0.2, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
                break;
            case "ui":
                osc.type = "sine";
                osc.frequency.setValueAtTime(800, now);
                gain.gain.setValueAtTime(vol * 0.15, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
                break;
            case "upgrade":
                osc.type = "sine";
                osc.frequency.setValueAtTime(600, now);
                osc.frequency.setValueAtTime(800, now + 0.1);
                osc.frequency.setValueAtTime(1000, now + 0.2);
                gain.gain.setValueAtTime(vol * 0.5, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
                break;
            case "boss_roar":
                osc.type = "sawtooth";
                osc.frequency.setValueAtTime(80, now);
                osc.frequency.exponentialRampToValueAtTime(30, now + 1);
                gain.gain.setValueAtTime(vol * 0.8, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
                break;
            case "levelup":
                for (var i = 0; i < 3; i++) {
                    var o2 = audioCtx.createOscillator();
                    var g2 = audioCtx.createGain();
                    o2.type = "sine";
                    o2.frequency.value = 440 + i * 110;
                    g2.gain.value = 0;
                    g2.gain.setValueAtTime(0, now + i * 0.15);
                    g2.gain.linearRampToValueAtTime(vol * 0.4, now + i * 0.15 + 0.05);
                    g2.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.5);
                    o2.connect(g2); g2.connect(sfxGain);
                    o2.start(now + i * 0.15);
                    o2.stop(now + i * 0.15 + 0.5);
                }
                return;
            case "achievement":
                var notes2 = [523, 659, 784, 1047];
                for (var j = 0; j < notes2.length; j++) {
                    var o3 = audioCtx.createOscillator();
                    var g3 = audioCtx.createGain();
                    o3.type = "sine"; o3.frequency.value = notes2[j];
                    g3.gain.value = 0;
                    g3.gain.setValueAtTime(0, now + j * 0.1);
                    g3.gain.linearRampToValueAtTime(vol * 0.4, now + j * 0.1 + 0.05);
                    g3.gain.exponentialRampToValueAtTime(0.001, now + j * 0.1 + 0.4);
                    o3.connect(g3); g3.connect(sfxGain);
                    o3.start(now + j * 0.1);
                    o3.stop(now + j * 0.1 + 0.4);
                }
                return;
            default:
                osc.type = "sine";
                osc.frequency.setValueAtTime(440, now);
                gain.gain.setValueAtTime(vol * 0.3, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        }
        osc.connect(gain);
        gain.connect(sfxGain);
        osc.start();
        osc.stop(now + 0.8);
    } catch(e) {}
}
