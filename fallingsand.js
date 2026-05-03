// Falling Sand
// The Coding Train / Daniel Shiffman
// https://thecodingtrain.com/challenges/180-falling-sand
// https://youtu.be/L4u7Zy_b868

// Create a 2D array
// Sorry if you are used to matrix math!
// How would you do this with a
// higher order function????

function make2DArray(cols, rows) {
  let arr = new Array(cols);
  for (let i = 0; i < arr.length; i++) {
    arr[i] = new Array(rows);
    // Fill the array with 0s
    for (let j = 0; j < arr[i].length; j++) {
      arr[i][j] = 0;
    }
  }
  return arr;
}

// The grid
let grid;
let velocityGrid;

// How big is each square?
let w = 5;
let cols, rows;
let hueValue = 200;
let brushSize = 5;
let streamGrowthFrames = 6;
let mouseHoldFrames = 0;
let lastMouseCol = null;

let gravity = 0.1;

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
    });
  }

  if (resetButton) {
    resetButton.addEventListener("click", () => {
      resetControls();
      clearSimulation();
    });
  }

  resetControls();
}

// Check if a row is within the bounds
function withinCols(i) {
  return i >= 0 && i <= cols - 1;
}

// Check if a column is within the bounds
function withinRows(j) {
  return j >= 0 && j <= rows - 1;
}

function setup() {
  let canvas = createCanvas(600, 500);
  let canvasHost = document.getElementById("canvas-host");
  if (canvasHost) {
    canvas.parent("canvas-host");
  }
  colorMode(HSB, 360, 255, 255);
  cols = width / w;
  rows = height / w;
  clearSimulation();
  setupControls();
}

function mouseDragged() {}

function currentStreamWidth() {
  let minimumWidth = min(3, brushSize);
  let maxWidth = max(minimumWidth, brushSize);
  let widthSteps = floor(mouseHoldFrames / streamGrowthFrames);
  let desiredWidth = minimumWidth + widthSteps * 2;

  if (desiredWidth % 2 === 0) {
    desiredWidth -= 1;
  }

  return min(maxWidth, desiredWidth);
}

function draw() {
  background(0);

  if (mouseIsPressed) {
    let mouseCol = floor(mouseX / w);

    if (mouseCol === lastMouseCol) {
      mouseHoldFrames += 1;
    } else {
      mouseHoldFrames = 0;
      lastMouseCol = mouseCol;
    }

    // Emit from the top and widen only when the mouse stays on the same column.
    let matrix = currentStreamWidth();
    let extent = floor(matrix / 2);
    let sourceRow = extent;

    for (let i = -extent; i <= extent; i++) {
      for (let j = -extent; j <= extent; j++) {
        if (random(1) < 0.75) {
          let col = mouseCol + i;
          let row = sourceRow + j;
          if (withinCols(col) && withinRows(row)) {
            grid[col][row] = hueValue;
            velocityGrid[col][row] = 1;
          }
        }
      }
    }
    // Change the color of the sand over time
    hueValue += 0.5;
    if (hueValue > 360) {
      hueValue = 1;
    }
  } else {
    mouseHoldFrames = 0;
    lastMouseCol = null;
  }

  //frameRate(1);

  // Draw the sand
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      noStroke();
      if (grid[i][j] > 0) {
        fill(grid[i][j], 255, 255);
        let x = i * w;
        let y = j * w;
        square(x, y, w);
      }
    }
  }

  // Create a 2D array for the next frame of animation
  let nextGrid = make2DArray(cols, rows);
  let nextVelocityGrid = make2DArray(cols, rows);

  // Check every cell
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      // What is the state?
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
