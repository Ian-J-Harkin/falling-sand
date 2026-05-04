import { describe, it, expect, beforeEach, vi } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

// Simulating p5.js and global environment for the simulation logic
const code = readFileSync(resolve(__dirname, "./fallingsand.mobile.js"), "utf8");

describe("Falling Sand Simulation Logic", () => {
  let context;

  beforeEach(() => {
    // Mock global state and p5 functions
    context = {
      grid: [],
      velocityGrid: [],
      cols: 100,
      rows: 100,
      w: 5,
      width: 500,
      height: 500,
      mouseX: 0,
      mouseY: 0,
      isTouchActive: false,
      activePointerX: null,
      mouseIsPressed: false,
      floor: Math.floor,
      round: Math.round,
      max: Math.max,
      min: Math.min,
      int: (v) => parseInt(v),
      Capacitor: { Plugins: {} },
      window: { Capacitor: { Plugins: {} } }
    };

    // Inject the code into a function context
    // We modify the code slightly to use the context or just run it in a new Function
    const script = new Function("context", `
      with(context) {
        ${code}
        return {
          withinCols,
          withinRows,
          currentPointerCol,
          resizeSimulation,
          getGrid: () => grid,
          setGrid: (g) => grid = g,
          getVelocityGrid: () => velocityGrid,
          setVelocityGrid: (v) => velocityGrid = v,
          setCols: (c) => cols = c,
          setRows: (r) => rows = r,
          setMouse: (x, y) => { mouseX = x; mouseY = y; }
        };
      }
    `);
    
    Object.assign(context, script(context));
  });

  describe("Boundary Safety (Event Bleed-through Fix)", () => {
    it("should return a column index when mouse is within canvas bounds", () => {
      context.setMouse(100, 100);
      context.mouseIsPressed = true;
      expect(context.currentPointerCol()).toBe(20); // 100 / 5
    });

    it("should return null when mouse is outside canvas (negative)", () => {
      context.setMouse(-10, 100);
      context.mouseIsPressed = true;
      expect(context.currentPointerCol()).toBeNull();
    });

    it("should return null when mouse is outside canvas (beyond width)", () => {
      context.setMouse(510, 100);
      context.mouseIsPressed = true;
      expect(context.currentPointerCol()).toBeNull();
    });

    it("should return null when mouse is outside canvas (beyond height)", () => {
      context.setMouse(100, 510);
      context.mouseIsPressed = true;
      expect(context.currentPointerCol()).toBeNull();
    });
  });

  describe("Resize Anchoring (Sand Pile Preservation)", () => {
    it("should maintain sand pile at the bottom after resizing", () => {
      // Setup a 10x10 grid with one grain at the bottom-left (9, 9)
      context.setCols(10);
      context.setRows(10);
      const initialGrid = Array.from({ length: 10 }, () => Array(10).fill(0));
      initialGrid[0][9] = 200; // Grain at bottom-left
      context.setGrid(initialGrid);
      context.setVelocityGrid(Array.from({ length: 10 }, () => Array(10).fill(0)));

      // Resize to 20x20
      context.width = 100; // 20 * 5
      context.height = 100; // 20 * 5
      
      context.resizeSimulation(true);

      const newGrid = context.getGrid();
      // previousRows was 10, new rows is 20. Offset is 10.
      // previousCols was 10, new cols is 20. Offset is 5 (floor(20-10)/2)
      // Original (0, 9) should map to (0+5, 9+10) = (5, 19)
      expect(newGrid[5][19]).toBe(200);
    });
  });

  describe("Utility Functions", () => {
    it("withinCols should correctly validate indices", () => {
      context.setCols(100);
      expect(context.withinCols(0)).toBe(true);
      expect(context.withinCols(99)).toBe(true);
      expect(context.withinCols(100)).toBe(false);
      expect(context.withinCols(-1)).toBe(false);
    });

    it("withinRows should correctly validate indices", () => {
      context.setRows(100);
      expect(context.withinRows(0)).toBe(true);
      expect(context.withinRows(99)).toBe(true);
      expect(context.withinRows(100)).toBe(false);
      expect(context.withinRows(-1)).toBe(false);
    });
  });
});
