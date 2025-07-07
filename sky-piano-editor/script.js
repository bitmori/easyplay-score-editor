let sheet = [[]];
let bpm = 120;
let currentFrame = 0;
let framesPerRow = 6;

const container = document.getElementById("container");
const frameNum = document.getElementById("frame-num");
const jsonOutput = document.getElementById("json-output");
const bpmInput = document.getElementById("bpm");

function indexToRC(index) {
  const row = Math.floor(index / 5);
  const col = index % 5;
  return row * 10 + col;
}

function toggleTheme() {
  const body = document.body;
  body.className = body.className === "dark" ? "light" : "dark";
}

function setDotColor(color) {
  document.documentElement.style.setProperty("--dot-color", color);
}

function updateGrid(val) {
  framesPerRow = parseInt(val);
  render();
}

function updateJson() {
  bpm = parseInt(bpmInput.value) || 120;
  const data = { bpm, sheet };
  jsonOutput.textContent = JSON.stringify(data, null, 2);
}

function render() {
  container.innerHTML = "";
  container.style.gridTemplateColumns = `repeat(${framesPerRow}, auto)`;
  sheet.forEach((keys, i) => {
    if (i > 0 && i % 32 === 0) {
      const sep = document.createElement("div");
      sep.className = "page-break";
      container.appendChild(sep);
    }
    const frame = document.createElement("div");
    frame.className = "frame";
    if (i === currentFrame) frame.classList.add("highlight");

    for (let j = 0; j < 15; j++) {
      const key = document.createElement("div");
      key.className = "key";
      const rc = indexToRC(j);
      if (keys.includes(rc)) {
        const dot = document.createElement("div");
        dot.className = "dot";
        key.appendChild(dot);
      }
      key.onclick = () => {
        const idx = keys.indexOf(rc);
        if (idx >= 0) {
          keys.splice(idx, 1);
        } else {
          keys.push(rc);
        }
        render();
        updateJson();
      };
      frame.appendChild(key);
    }
    container.appendChild(frame);
  });
  frameNum.textContent = currentFrame + 1;
  updateJson();
}

function prevFrame() {
  if (currentFrame > 0) currentFrame--;
  render();
}

function nextFrame() {
  if (currentFrame < sheet.length - 1) currentFrame++;
  render();
}

function jumpToStart() {
  currentFrame = 0;
  render();
}

function jumpToEnd() {
  currentFrame = sheet.length - 1;
  render();
}

function addFrame() {
  sheet.push([]);
  currentFrame = sheet.length - 1;
  render();
}

function addPage() {
  for (let i = 0; i < 32; i++) sheet.push([]);
  currentFrame = sheet.length - 32;
  render();
}

function deleteFrame() {
  if (sheet.length <= 1) return alert("至少保留一帧");
  sheet.splice(currentFrame, 1);
  if (currentFrame >= sheet.length) currentFrame = sheet.length - 1;
  render();
}

function cloneLastRow() {
  const row = Math.floor((sheet.length - 1) / framesPerRow);
  const start = row * framesPerRow;
  const end = Math.min(start + framesPerRow, sheet.length);
  const lastRow = sheet.slice(start, end);
  lastRow.forEach(f => sheet.push([...f]));
  currentFrame = sheet.length - lastRow.length;
  render();
}

function copyJson() {
  const text = JSON.stringify({ bpm, sheet }, null, 2);
  navigator.clipboard.writeText(text).then(() => alert("谱子已复制！"));
}

function importSheet(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      if (Array.isArray(data)) {
        sheet = data;
        bpm = 120;
      } else {
        sheet = data.sheet;
        bpm = data.bpm || 120;
      }
      currentFrame = 0;
      bpmInput.value = bpm;
      render();
    } catch (e) {
      alert("导入失败：" + e.message);
    }
  };
  reader.readAsText(file);
}

// 初始渲染
render();