import React from "react";
import { Grid, Position } from "~/utils/types";

interface GridComponentProps {
  grid: Grid;
  start: Position;
  end: Position;
  visited: Position[];
  path: Position[];
}

const GridComponent: React.FC<GridComponentProps> = ({
  grid,
  start,
  end,
  visited,
  path,
}) => {
  // Helper function to safely check if a position matches coordinates
  const isPositionMatch = (pos: Position | undefined, r: number, c: number): boolean => {
    return Array.isArray(pos) && pos.length === 2 && pos[0] === r && pos[1] === c;
  };

  

  const getCellColor = (cell: number, r: number, c: number) => {
    if (r === start[0] && c === start[1]) return "bg-green-400";
    if (r === end[0] && c === end[1]) return "bg-red-400";
    if (path.some(pos => isPositionMatch(pos, r, c))) return "bg-yellow-300";
    if (visited.some(pos => isPositionMatch(pos, r, c))) return "bg-blue-200";
    
    switch (cell) {
      case 1: return "bg-gray-800"; // wall
      case 2: return "bg-purple-400"; // special (keys/targets)
      case 3: return "bg-orange-200"; // weighted cost
      default: return "bg-white"; // path
    }
  };

  return (
    <div
      className="grid h-full w-full gap-0 p-4"
      style={{
        gridTemplateColumns: `repeat(${grid[0]?.length || 20}, 1fr)`,
        aspectRatio: "1/1",
        maxHeight: "calc(100vh - 300px)", // Account for other UI elements
        margin: "0 auto"
      }}
    >
      {grid.map((row, r) =>
        row.map((cell, c) => (
          <div
            key={`${r}-${c}`}
            className={`aspect-square border-[0.5px] border-gray-200 transition-colors duration-500 ${
              getCellColor(cell, r, c)
            }`}
          />
        ))
      )}
    </div>
  );
};

export default GridComponent;