
const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
const canvas2 = document.getElementById("scale_canvas");
const ctx2 = canvas2.getContext("2d");


//UIの取得
const fps_p = document.getElementById('fps');
const input_end = document.getElementById("end");
const input_tempo = document.getElementById("tempo");
const trac_name = document.getElementById("trac_name");

const attack = document.getElementById("attack");
const decay = document.getElementById("decay");
const sustain = document.getElementById("sustain");
const release = document.getElementById("release");
const new_trac_name = document.getElementById("new_trac_name");

const main = document.getElementById("main");
const sab = document.getElementById("sab");

//音
let play_now = false;
let stops = false;

let part_number = 1;
let trac_number = [document.getElementById("0")]



//fps
let lastTime = performance.now();;
let frameCount = 0;
let fps = 0;

//設計
let map_data = [];
let node_long = []
let trac_pattern = [["square"], [0.005], [0.1], [0.2], [0.5]]
let place = 0
let end_m = 4;
let map_width = 32;
let map_height = 24;
let cellHeight, cellWidth;
const scale_number = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const scale_number_ja = ["ド", "ド#", "レ", "レ#", "ミ", "ファ", "ファ#", "ソ", "ソ#", "ラ", "ラ#", "シ"];
const scale_of_noise = ["kick", "snare", "hi hat"]
let now_scale = []
let last_scale = 4;
let scale_up = 0;
let scroll_ = 0;
let shift_press = false;
let tempo = 120;
let right_click = false;
let right_point = [0, 0, 0]
let click_f_to_t = 0


let window_place = 0


function setup() {
    make_cell();
    //localStorage.clear()
    draw_scale();
    const canvas = createCanvas(1200, 400).parent('main');
    canvas.class('canvas');
    noLoop();
    cellWidth = width / map_width;
    cellHeight = height / map_height;

    canvas.elt.oncontextmenu = () => false;
}

function draw() {
    const color = "#000000"
    background(220);
    fill(color);

    if (trac_pattern[0][place] == "noise") {
        map_height = 3
        cellWidth = width / map_width;
        cellHeight = height / map_height;
    } else {
        map_height = 24
        cellWidth = width / map_width;
        cellHeight = height / map_height;
    }

    place_change();
    if (window_place == 0) {

        draw_scale();

        cell_click();
        draw_cell();
        noStroke();
        FPS_counter();

        input();




    }
}

function input() {
    end_m = Number(input_end.value)
    tempo = Number(input_tempo.value)
}

function tracname_set() {
    trac_number[place].textContent = `${trac_name.value}`;
}
function tracadd() {
    window_place = 1;
}

function trac_create() {
    if (attack.value == "" || decay.value == "" || sustain.value == "" || release.value == "" || new_trac_name.value == "") {
        alert("空白の箇所があります")
    } else {
        window_place = 0;
        const input_line = document.querySelector('input[name="musicname"]:checked');
        trac_pattern[0].push(input_line.value)
        trac_pattern[1].push(attack.value)
        trac_pattern[2].push(decay.value)
        trac_pattern[3].push(sustain.value)
        trac_pattern[4].push(release.value)
        var select = document.getElementById('wave');
        part_number += 1
        const newOption = new Option(`${new_trac_name.value}`, part_number - 1)
        newOption.id = `${part_number - 1}`
        select.appendChild(newOption)
        map_data.push([])
        node_long.push([])
    }
}

function draw_cell() {
    if (map_data[place].length <= map_width + scroll_) {
        for (let row = 0; row < map_height; row++) {
            for (let col = 0; col < map_width; col++) {
                let x = col * cellWidth;
                let y = row * cellHeight;

                strokeWeight(1)
                stroke(0);

                if (now_scale[map_height - row - 1].includes("#")) {
                    fill(200);
                } else {
                    fill(255);
                }
                rect(x + 1, y + 1, cellWidth - 1, cellHeight - 1);
            }
        }
    }
    for (let row = 0; row < map_height; row++) {
        for (let col = 0; col < map_data[place].length; col++) {
            let x = col * cellWidth - scroll_ * cellWidth;
            let y = row * cellHeight;

            strokeWeight(1)
            stroke(0);

            // マス目の位置とサイズを計算

            if (map_data[place][col] != "" && map_height - now_scale.indexOf(map_data[place][col]) - 1 == row) {
                if (node_long[place][col] != -1) {
                    fill(50, 150, 255);
                    if (node_long[place][col] == 0 || node_long[place][col] == -2) {
                        rect(x + 1, y + 1, cellWidth - 1, cellHeight - 1);
                    } else {
                        rect(x + 1, y + 1, cellWidth * node_long[place][col] - 1, cellHeight - 1);
                    }
                }
            } else {
                if (now_scale[map_height - row - 1].includes("#")) {
                    fill(200);
                } else {
                    fill(255);
                }
                rect(x + 1, y + 1, cellWidth - 1, cellHeight - 1);
            }
        }
    }
}

function make_cell() {
    map_data = [[]]
    node_long = [[]]
}

function cell_click() {
    const mc = scroll_
    if (!right_click) {
        if (mouseIsPressed && Math.floor(mouseX / (1200 / map_width)) >= 0 && Math.floor(mouseX / (1200 / map_width)) < map_width
            && Math.floor(mouseY / (400 / map_height)) >= 0 && Math.floor(mouseY / (400 / map_height)) < map_height) {
            const m_x = Math.floor(mouseX / (1200 / map_width))
            if (map_data[place][m_x + mc] != "" && map_height - now_scale.indexOf(map_data[place][m_x + mc]) - 1 == Math.floor(mouseY / (400 / map_height))) {
                if (click_f_to_t == 0) {
                    click_f_to_t = 1
                }
                if (click_f_to_t == 1) {
                    long_node_erase();
                    map_data[place][Math.floor(mouseX / (1200 / map_width)) + mc] = ""
                }
            } else {
                if (click_f_to_t == 0) {
                    click_f_to_t = 2
                }
                if (click_f_to_t == 2) {
                    if (map_data[place].length < Math.floor(mouseX / (1200 / map_width)) + mc) {
                        for (let i = 0; i <= Math.floor(mouseX / (1200 / map_width)) + mc - map_data[place].length; i++) {
                            map_data[place].push("");
                            node_long[place].push(0);
                        }
                    }
                    long_node_erase();
                    map_data[place][Math.floor(mouseX / (1200 / map_width)) + mc] = now_scale[map_height - Math.floor(mouseY / (400 / map_height)) - 1]
                    if (trac_pattern[0][place] == "noise") {
                        node_long[place][Math.floor(mouseX / (1200 / map_width)) + mc] = -2
                    } else {
                        node_long[place][Math.floor(mouseX / (1200 / map_width)) + mc] = 0
                    }
                }
            }
        }
    } else {
        if (right_point[2] <= Math.floor(mouseX / (1200 / map_width)) + mc - right_point[1] + 1) {
            right_point[2] = Math.floor(mouseX / (1200 / map_width)) - right_point[1] + 1
        }
        for (let i = 0; i < right_point[2]; i++) {
            map_data[place][right_point[1] + i + mc] = now_scale[map_height - Math.floor(mouseY / (400 / map_height)) - 1]
            node_long[place][right_point[1] + i + mc] = -1
        }
        node_long[place][right_point[1] + mc] = right_point[2]
    }
}

function long_node_erase() {
    if (node_long[place][Math.floor(mouseX / (1200 / map_width))] != 0) {
        if (node_long[place][Math.floor(mouseX / (1200 / map_width))] == -1) {
            let i = 1;
            let answer = node_long[place][Math.floor(mouseX / (1200 / map_width)) + i]
            while (answer == -1) {
                answer = node_long[place][Math.floor(mouseX / (1200 / map_width)) + i]
                if (answer == -1) {
                    map_data[place][Math.floor(mouseX / (1200 / map_width)) + i] = ""
                    node_long[place][Math.floor(mouseX / (1200 / map_width)) + i] = 0
                    i++
                }
            }
            i = 0;
            answer = node_long[place][Math.floor(mouseX / (1200 / map_width)) - i]
            while (answer == -1) {
                i++
                answer = node_long[place][Math.floor(mouseX / (1200 / map_width)) - i]
                map_data[place][Math.floor(mouseX / (1200 / map_width)) - i] = ""
                node_long[place][Math.floor(mouseX / (1200 / map_width)) - i] = 0
            }
        } else {
            let i = 1;
            let answer = node_long[place][Math.floor(mouseX / (1200 / map_width)) + i]
            while (answer == -1) {
                answer = node_long[place][Math.floor(mouseX / (1200 / map_width)) + i]
                if (answer == -1) {
                    map_data[place][Math.floor(mouseX / (1200 / map_width)) + i] = ""
                    node_long[place][Math.floor(mouseX / (1200 / map_width)) + i] = 0
                    i++
                }
            }
        }
    }
}

function draw_scale() {
    ctx.fillStyle = "#aaaaaa";
    ctx.fillRect(0, 0, 50, 400);
    ctx2.fillStyle = "#aaaaaa";
    ctx2.fillRect(0, 0, 1200, 50);

    ctx.textAlign = 'center';
    if (trac_pattern[0][place] != "noise") {
        ctx.font = `${cellHeight - 6}px sans-serif`;
    } else {
        ctx.font = `${20}}px sans-serif`;
    }
    ctx.fillStyle = 'black';

    now_scale = []
    for (let i = 0; i < map_height; i++) {
        if (trac_pattern[0][place] != "noise") {
            const a = (i + scale_up)
            now_scale.push(`${scale_number[(a % 12 + 12) % 12]}${Math.floor((i + scale_up) / 12) + last_scale}`)
            ctx.fillText(`${scale_number[(a % 12 + 12) % 12]}${Math.floor((i + scale_up) / 12) + last_scale}`, 25, (400 - cellHeight * i) - 3);
            //ctx.fillText(`${scale_number_ja[i % 12]}${Math.floor(i / 12) + last_scale}`, 25, (400 - cellHeight * i) - 3);
        } else {
            now_scale.push(`${scale_of_noise[i]}`)
            ctx.fillText(`${scale_of_noise[i]}`, 25, (400 - cellHeight * i) - cellHeight / 2);
        }
    }
    ctx2.fillStyle = 'black';
    ctx2.textAlign = 'left';
    for (let i = 0; i < map_width + 1; i++) {
        const a = (i + scroll_)
        if (a % 4 == 0) {
            ctx2.beginPath();
            ctx2.moveTo(cellWidth * i + 1, 0); // 左上から開始
            ctx2.lineTo(cellWidth * i + 1, 30); // (150, 75)まで線を引く
            if (a % 16 == 0) {
                ctx2.lineWidth = 4;
                ctx2.font = `${map_width / 2}px sans-serif`;
            } else if (a % 8 == 0) {
                ctx2.lineWidth = 2;
                ctx2.font = `${map_width / 4}px sans-serif`;
            } else if (a % 4 == 0) {
                ctx2.lineWidth = 1;
                ctx2.font = `${map_width / 4}px sans-serif`;
            }
            ctx2.strokeStyle = 'black';
            ctx2.stroke();
            ctx2.fillText(`${(a / 16) + 1}`, (cellWidth * i) + map_width / 4, 25);
        }
    }
}


function mouseWheel(event) {
    if (!shift_press) {
        scale_up -= event.delta * 0.01;
    } else {
        scroll_ -= event.delta * 0.01;
        if (scroll_ <= 0) {
            scroll_ = 0
        }
    }
    return false;
}

//-------------------------------また別のやつ

function FPS_counter() {//FPSの計測
    const currentTime = performance.now();
    const deltaTime = currentTime - lastTime;
    frameCount++;


    if (deltaTime >= 300) {
        fps = Math.floor((frameCount / deltaTime) * 100000) / 100;
        frameCount = 0;
        lastTime = currentTime;
    }
    fps_p.textContent = `${fps}fps`
}


function mouseClicked() {
    click_f_to_t = 0;
}


//-------------------------ここから下は音を出すやつ--------------------------
const eq = new Tone.EQ3({
    low: 0,
    mid: 0,
    high: 4 // 高音域を4dBブースト
})


const snareSynth = new Tone.NoiseSynth({
    noise: {
        type: 'white' // ホワイトノイズを使用
    },
    envelope: {
        attack: 0.001, // 瞬間的な立ち上がり
        decay: 0.2,    // 0.3秒で減衰
        sustain: 0,    // 維持しない
        release: 0.2
    }
}).toDestination();


const filter_hi = new Tone.Filter({
    frequency: 800,    // 80Hz付近の低音域を狙う
    type: "bandpass",
    Q: 1.5            // 少し強調する
});
const hi_hatSynth = new Tone.NoiseSynth({
    noise: {
        type: 'white' // ホワイトノイズを使用
    },
    envelope: {
        attack: 0.001, // 瞬間的な立ち上がり
        decay: 0.03,    // 0.3秒で減衰
        sustain: 0,    // 維持しない
        release: 0.03
    }
}).connect(filter_hi).toDestination();


const noiseGain = new Tone.Gain(4);
const filter = new Tone.Filter({
    frequency: 80,    // 80Hz付近の低音域を狙う
    type: "bandpass",
    Q: 1.5            // 少し強調する
});
const kickSynth = new Tone.MembraneSynth({
    pitchDecay: 0.008, // ピッチの減衰速度 (速いほど良い)
    octaves: 2,        // スイープするオクターブ幅
    envelope: {
        attack: 0.001,
        decay: 0.4,    // 少し長めの減衰
        sustain: 0.01,
        release: 0.4
    }
}).connect(eq).connect(noiseGain).toDestination();
// noiseGain.toDestination();



document.getElementById('startButton').addEventListener('click', async () => {
    if (!play_now) {
        play_now = true;
        await Tone.start();
        console.log("開始")
        playMusic();
    } else {
        stops = true;
    }
});


function place_change() {
    var select = document.getElementById('wave');
    select.onchange = function () {
        place = Number(this.value);
    }
    if (window_place == 0) {
        main.style.display = "block";
        sab.style.display = "none";
    } else if (window_place == 1) {
        main.style.display = "none";
        sab.style.display = "block";
    }
}



function playMusic() {

    let music_wave = []
    for (let i = 0; i < part_number; i++) {

        if (trac_pattern[0][i] == "noise") {
            music_wave.push(NaN)
        } else {
            music_wave.push(new Tone.Synth({
                oscillator: {
                    type: trac_pattern[0][i]
                },
                envelope: {
                    attack: trac_pattern[1][i], // 立ち上がりを速く
                    decay: trac_pattern[2][i],    // 減衰を速く
                    sustain: trac_pattern[3][i],  // 維持レベルを低く
                    release: trac_pattern[4][i]   // 余韻を短く
                }
            }).toDestination())
        }
    }
    // const events = [
    //     ["0:0:0", { note: "D4", duration: "8n" }],
    //     ["0:0:2", { note: "G4", duration: "8n" }],
    //     ["0:1:0", { note: "A4", duration: "8n" }],
    //     ["0:1:2", { note: "C5", duration: "8n" }],
    //     ["0:2:0", { note: "A4", duration: "8n" }],
    //     ["0:2:2", { note: "G4", duration: "8n" }],
    //     ["0:3:0", { note: "D4", duration: "8n" }],
    //     ["0:3:2", { note: "G4", duration: "8n" }],
    //     ["0:4:0", { note: "A4", duration: "8n" }],
    //     ["0:4:2", { note: "C5", duration: "8n" }],
    //     ["0:5:0", { note: "A4", duration: "8n" }],
    //     ["0:5:2", { note: "G4", duration: "8n" }],
    //     ["0:6:0", { note: "E4", duration: "8n" }],
    //     ["0:6:2", { note: "F4", duration: "8n" }],
    //     ["0:7:0", { note: "E4", duration: "8n" }],
    //     ["0:7:2", { note: "C4", duration: "8n" }],
    // ];

    events = []


    for (let i = 0; i < map_data.length; i++) {
        events.push([])
        for (let col = 0; col < map_data[i].length; col++) {
            if (map_data[i][col] != "") {
                if (node_long[i][col] == 0 || node_long[i][col] == -2) {
                    events[i].push([`0:0:${col}`, { note: `${map_data[i][col]}`, duration: "16n" }])
                } else if (node_long[i][col] != -1) {
                    const long_16n = Tone.Time('16n').toSeconds();
                    const nots_long = long_16n * node_long[i][col];
                    events[i].push([`0:0:${col}`, { note: `${map_data[i][col]}}`, duration: nots_long }])
                }
            }
        }
    }




    let part = []
    for (let i = 0; i < part_number; i++) {
        part.push(new Tone.Part((time, value) => {
            if (value.note != null) {
                if (trac_pattern[0][i] != "noise") {
                    music_wave[i].triggerAttackRelease(value.note, value.duration, time);
                } else {
                    if (value.note == "hi hat") {
                        hi_hatSynth.triggerAttackRelease(value.duration, time);
                    } else if (value.note == "snare") {
                        kickSynth.triggerAttackRelease("A2", value.duration, time);
                        snareSynth.triggerAttackRelease(value.duration, time);
                    } else if (value.note == "kick") {
                        kickSynth.triggerAttackRelease("A1", value.duration, time);
                    }
                }
            }
            if (stops) {
                Tone.Transport.stop();
                part[i].stop();
                play_now = false;
                stops = false;
                console.log("終了")
            }
        }, events[i]))

        part[i].loop = false;
        part[i].loopEnd = `${end_m}m`;
    }

    // Tone.Part の作成


    const totalDuration = `${end_m}m`;
    Tone.Transport.scheduleOnce((time) => {
        console.log("指定時刻に到達しました。停止します。");
        Tone.Transport.stop();
        for (let i = 0; i < part.length; i++) {
            part[i].stop()
        }
        play_now = false;
    }, totalDuration);


    Tone.Transport.bpm.value = tempo;
    Tone.Transport.start(); // 再生開始
    for (let i = 0; i < part.length; i++) {
        part[i].start(0)
    }
}

async function keyDownHandler(e) {
    if (e.key === " ") {
        if (!play_now) {
            play_now = true;
            await Tone.start();
            console.log("開始")
            playMusic();
        } else {
            stops = true;
        }
    }
    if (e.key === "d") {
        alert(map_data.length)
        alert(part_number)
    }
    if (e.key === "Shift") {
        shift_press = true;
    }
}
async function keyUpHandler(e) {
    if (e.key === "Shift") {
        shift_press = false;
    }
}

//マウス
function mousePressed() {
    if (mouseButton === RIGHT) {
        if (trac_pattern[0][place] != "nosie") {
            right_click = true;
            right_point = [Math.floor(mouseY / (400 / map_height)), Math.floor(mouseX / (1200 / map_width)), 0]
        }
    }
}
function mouseReleased() {
    if (mouseButton === RIGHT) {
        right_click = false
    }
}

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);


setInterval(draw, 16);