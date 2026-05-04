// Mobile-oriented Falling Sand shell.
const { Haptics, StatusBar } = (window.Capacitor && window.Capacitor.Plugins) ? window.Capacitor.Plugins : {};

// Set initial Status Bar style
if (StatusBar && StatusBar.setOverlaysWebView) {
  StatusBar.setOverlaysWebView({ overlay: true });
}

function make2DArray(cols, rows) {
  let arr = new Array(cols);
  for (let i = 0; i < arr.length; i++) {
    arr[i] = new Array(rows);
    for (let j = 0; j < arr[i].length; j++) {
      arr[i][j] = 0;
    }
  }
  return arr;
}

let grid;
let velocityGrid;

let w = 5;
let cols, rows;
let hueValue = 200;
let brushSize = 5;
let streamGrowthFrames = 6;
let pointerHoldFrames = 0;
let lastPointerCol = null;
let gravity = 0.1;
let activePointerX = null;
let isTouchActive = false;

function clearSimulation() {
  grid = make2DArray(cols, rows);
  velocityGrid = make2DArray(cols, rows);
}

function syncControlValue(id, value, digits = 0) {
  let element = document.getElementById(id);
  if (element) {
    element.textContent = Number(value).toFixed(digits);
  }
}

function updateBrushSize(value) {
  brushSize = int(value);
  syncControlValue("brush-size-value", brushSize);
}

function updateStreamGrowthFrames(value) {
  streamGrowthFrames = int(value);
  let element = document.getElementById("stream-growth-value");
  if (element) {
    element.textContent = `${streamGrowthFrames}f`;
  }
}

function updateGravity(value) {
  gravity = Number(value);
  syncControlValue("gravity-value", gravity, 2);
}

function resetControls() {
  let brushInput = document.getElementById("brush-size");
  let growthInput = document.getElementById("stream-growth");
  let gravityInput = document.getElementById("gravity");

  if (brushInput) {
    brushInput.value = 5;
  }
  if (growthInput) {
    growthInput.value = 6;
  }
  if (gravityInput) {
    gravityInput.value = 0.1;
  }

  updateBrushSize(5);
  updateStreamGrowthFrames(6);
  updateGravity(0.1);
}

function setupUI() {
  const panel = document.getElementById("ui-panel");
  const toggle = document.getElementById("panel-toggle");
  const status = document.getElementById("panel-status");

  if (toggle && panel) {
    toggle.addEventListener("click", () => {
      panel.classList.toggle("expanded");
      if (status) {
        status.textContent = panel.classList.contains("expanded")
          ? "Tap to collapse"
          : "Tap to configure";
      }

      // Trigger p5 resize after transition
      setTimeout(() => {
        windowResized();
      }, 400);
    });
  }
}

function setupControls() {
  let brushInput = document.getElementById("brush-size");
  let growthInput = document.getElementById("stream-growth");
  let gravityInput = document.getElementById("gravity");
  let clearButton = document.getElementById("clear-sand");
  let resetButton = document.getElementById("reset-settings");

  if (brushInput) {
    brushInput.addEventListener("input", (event) => {
      updateBrushSize(event.target.value);
    });
  }
  if (growthInput) {
    growthInput.addEventListener("input", (event) => {
      updateStreamGrowthFrames(event.target.value);
    });
  }
  if (gravityInput) {
    gravityInput.addEventListener("input", (event) => {
      updateGravity(event.target.value);
    });
  }
  if (clearButton) {
    clearButton.addEventListener("click", () => {
      clearSimulation();
      if (Haptics) {
        Haptics.impact({ style: "MEDIUM" });
      }
    });
  }
  if (resetButton) {
    resetButton.addEventListener("click", () => {
      resetControls();
      clearSimulation();
      if (Haptics) {
        Haptics.notification({ type: "SUCCESS" });
      }
    });
  }

  resetControls();
  setupUI();
}

function withinCols(i) {
  return i >= 0 && i <= cols - 1;
}

function withinRows(j) {
  return j >= 0 && j <= rows - 1;
}

function getCanvasSize() {
  let host = document.getElementById("canvas-host");
  let hostWidth = host ? host.clientWidth : window.innerWidth - 24;
  let hostHeight = host ? host.clientHeight : window.innerHeight * 0.55;
  let canvasWidth = max(280, floor(hostWidth));
  let canvasHeight = max(320, floor(hostHeight));
  return { canvasWidth, canvasHeight };
}

function resizeSimulation(preserveState = false) {
  let previousGrid = grid;
  let previousVelocityGrid = velocityGrid;
  let previousCols = cols;
  let previousRows = rows;

  cols = floor(width / w);
  rows = floor(height / w);
  clearSimulation();

  if (!preserveState || !previousGrid || !previousVelocityGrid) {
    return;
  }

  let previousColScale = max(previousCols - 1, 1);
  let previousRowScale = max(previousRows - 1, 1);
  let nextColScale = max(cols - 1, 1);
  let nextRowScale = max(rows - 1, 1);

  for (let i = 0; i < previousCols; i++) {
    for (let j = 0; j < previousRows; j++) {
      if (previousGrid[i][j] === 0) {
        continue;
      }

      let mappedCol = round((i / previousColScale) * nextColScale);
      let mappedRow = round((j / previousRowScale) * nextRowScale);

      if (!withinCols(mappedCol) || !withinRows(mappedRow)) {
        continue;
      }

      if (
        grid[mappedCol][mappedRow] === 0 ||
        previousVelocityGrid[i][j] > velocityGrid[mappedCol][mappedRow]
      ) {
        grid[mappedCol][mappedRow] = previousGrid[i][j];
        velocityGrid[mappedCol][mappedRow] = previousVelocityGrid[i][j];
      }
    }
  }
}

function setup() {
  let size = getCanvasSize();
  let canvas = createCanvas(size.canvasWidth, size.canvasHeight);
  let canvasHost = document.getElementById("canvas-host");
  if (canvasHost) {
    canvas.parent("canvas-host");
  }
  colorMode(HSB, 360, 255, 255);
  resizeSimulation();
  setupControls();
}

function windowResized() {
  let size = getCanvasSize();
  resizeCanvas(size.canvasWidth, size.canvasHeight);
  resizeSimulation(true);
}

function touchStarted() {
  updateActiveTouch();
  return false;
}

function touchMoved() {
  updateActiveTouch();
  return false;
}

function touchEnded() {
  activePointerX = null;
  isTouchActive = false;
  pointerHoldFrames = 0;
  lastPointerCol = null;
  return false;
}

function updateActiveTouch() {
  if (touches.length > 0) {
    activePointerX = touches[0].x;
    isTouchActive = true;
  }
}

function currentStreamWidth() {
  let minimumWidth = min(3, brushSize);
  let maxWidth = max(minimumWidth, brushSize);
  let widthSteps = floor(pointerHoldFrames / streamGrowthFrames);
  let desiredWidth = minimumWidth + widthSteps * 2;

  if (desiredWidth % 2 === 0) {
    desiredWidth -= 1;
  }

  return min(maxWidth, desiredWidth);
}

function currentPointerCol() {
  if (isTouchActive && activePointerX !== null) {
    return floor(activePointerX / w);
  }

  if (mouseIsPressed) {
    return floor(mouseX / w);
  }

  return null;
}

function emitSandAt(col) {
  let matrix = currentStreamWidth();
  let extent = floor(matrix / 2);
  let sourceRow = extent;

  for (let i = -extent; i <= extent; i++) {
    for (let j = -extent; j <= extent; j++) {
      if (random(1) < 0.75) {
        let drawCol = col + i;
        let drawRow = sourceRow + j;
        if (withinCols(drawCol) && withinRows(drawRow)) {
          grid[drawCol][drawRow] = hueValue;
          velocityGrid[drawCol][drawRow] = 1;
        }
      }
    }
  }
}

function draw() {
  background(0);

  let pointerCol = currentPointerCol();
  if (pointerCol !== null) {
    if (pointerCol === lastPointerCol) {
      pointerHoldFrames += 1;
    } else {
      pointerHoldFrames = 0;
      lastPointerCol = pointerCol;
    }

    emitSandAt(pointerCol);

    hueValue += 0.5;
    if (hueValue > 360) {
      hueValue = 1;
    }
  } else {
    pointerHoldFrames = 0;
    lastPointerCol = null;
  }

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      noStroke();
      if (grid[i][j] > 0) {
        fill(grid[i][j], 255, 255);
        square(i * w, j * w, w);
      }
    }
  }

  let nextGrid = make2DArray(cols, rows);
  let nextVelocityGrid = make2DArray(cols, rows);

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      let state = grid[i][j];
      let velocity = velocityGrid[i][j];
      let moved = false;
      if (state > 0) {
        let newPos = min(rows - 1, int(j + velocity));
        for (let y = newPos; y > j; y--) {
          let below = grid[i][y];
          let dir = 1;
          if (random(1) < 0.5) {
            dir *= -1;
          }
          let belowA = -1;
          let belowB = -1;
          if (withinCols(i + dir)) belowA = grid[i + dir][y];
          if (withinCols(i - dir)) belowB = grid[i - dir][y];

          if (below === 0) {
            nextGrid[i][y] = state;
            nextVelocityGrid[i][y] = velocity + gravity;
            moved = true;
            break;
          } else if (belowA === 0) {
            nextGrid[i + dir][y] = state;
            nextVelocityGrid[i + dir][y] = velocity + gravity;
            moved = true;
            break;
          } else if (belowB === 0) {
            nextGrid[i - dir][y] = state;
            nextVelocityGrid[i - dir][y] = velocity + gravity;
            moved = true;
            break;
          }
        }
      }

      if (state > 0 && !moved) {
        nextGrid[i][j] = grid[i][j];
        nextVelocityGrid[i][j] = velocityGrid[i][j] + gravity;
      }
    }
  }

  grid = nextGrid;
  velocityGrid = nextVelocityGrid;
}