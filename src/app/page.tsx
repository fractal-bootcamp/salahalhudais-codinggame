"use client";
import React, { useState, useEffect } from "react";
import { api } from "~/trpc/react";
import GridComponent from "./_components/GridComponent";
import EditorComponent from "./_components/EditorComponent";
import { ProblemData, Position } from "~/utils/types";

declare global {
  interface Window {
    pathInterval?: NodeJS.Timeout;
  }
}

const Home: React.FC = () => {
  const [grid, setGrid] = useState<number[][]>([]);
  const [start, setStart] = useState<Position>([0, 0]);
  const [end, setEnd] = useState<Position>([0, 0]);
  const [problemStatement, setProblemStatement] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [testCases, setTestCases] = useState<any[]>([]);
  const [visited, setVisited] = useState<Position[]>([]);
  const [path, setPath] = useState<Position[]>([]);
  const [testResults, setTestResults] = useState<string[]>([]);

  const { data, refetch } = api.problem.getProblem.useQuery(undefined, {
    enabled: false,
  });

  // Fetch problem on mount
  useEffect(() => {
    refetch();
  }, [refetch]);

  // Update state when new problem data arrives
  useEffect(() => {
    if (data) {
      setGrid(data.grid);
      setStart(data.start);
      setEnd(data.end);
      setProblemStatement(data.statement);
      setCode(data.boilerplate);
      setTestCases(data.testCases);
      setVisited([]);
      setPath([]);
      setTestResults([]);
    }
  }, [data]);

  const runCode = () => {
    const visitedNodes: Position[] = [];
    const visit = (row: number, col: number) => {
      visitedNodes.push([row, col]);
    };

    try {
      const userFunction = new Function(
        "grid",
        "startRow",
        "startCol",
        "endRow",
        "endCol",
        "visit",
        code + "\nreturn findPath(grid, startRow, startCol, endRow, endCol, visit);"
      );

      const result = userFunction(
        grid,
        start[0],
        start[1],
        end[0],
        end[1],
        (row: number, col: number) => visit(row, col)
      );

      if (result) {
        animate(visitedNodes, result);
      } else {
        setTestResults(["No path found"]);
      }
    } catch (error) {
      setTestResults([`Compilation Error: ${error instanceof Error ? error.message : "Unknown error"}`]);
    }
  };

  const testCode = () => {
    const visitedNodes: Position[] = [];
    const visit = (row: number, col: number) => {
      visitedNodes.push([row, col]);
    };
    
    const results = testCases.map(({ input, output }, index) => {
      try {
        const userFunction = new Function(
          "grid",
          "startRow",
          "startCol",
          "endRow",
          "endCol",
          "visit",
          code + "\nreturn findPath(grid, startRow, startCol, endRow, endCol, visit);"
        );
        const result = userFunction(
          input.grid,
          input.startRow,
          input.startCol,
          input.endRow,
          input.endCol,
          (row: number, col: number) => visit(row, col)
        );

        const isCorrect = JSON.stringify(result) === JSON.stringify(output);
        if (index === 0 && result) {
          animate(visitedNodes, result);
        }
        return isCorrect ? "✅ Pass" : "❌ Fail";
      } catch (error) {
        return "❌ Error";
      }
    });
    setTestResults(results);
  };

  const animate = (visitedNodes: Position[], path: Position[]) => {
    // Clear any existing animation
    if (window.pathInterval) {
      clearInterval(window.pathInterval);
    }
    setVisited([]);
    setPath([]);

    // Animate the visited nodes first
    let visitedIdx = 0;
    window.pathInterval = setInterval(() => {
      if (visitedIdx < visitedNodes.length) {
        setVisited(prev => [...prev, visitedNodes[visitedIdx]]);
        visitedIdx++;
      } else {
        // Once visited animation is done, show the path
        clearInterval(window.pathInterval);
        
        // Small delay before showing path
        setTimeout(() => {
          let pathIdx = 0;
          window.pathInterval = setInterval(() => {
            if (pathIdx < path.length) {
              setPath(prev => [...prev, path[pathIdx]]);
              pathIdx++;
            } else {
              clearInterval(window.pathInterval);
            }
          }, 50); // Path animation speed
        }, 100); // Delay between visited and path animations
      }
    }, 20); // Visited nodes animation speed
  };

  return (
    <div className="flex flex-col h-screen p-4 bg-gray-50">
      {/* Problem Statement Section - At the top */}
      <div className="w-full p-4 mb-4">
        <div className="bg-white p-4 rounded-lg shadow-lg">
          <p className="text-gray-800">{problemStatement || "Loading..."}</p>
        </div>
      </div>

      {/* Grid and Editor Container - Side by side */}
      <div className="flex flex-1 space-x-4">
        {/* Grid Section */}
        <div className="w-1/2 flex items-center justify-center p-4 bg-white shadow-lg rounded-lg">
          <GridComponent
            grid={grid}
            start={start}
            end={end}
            visited={visited}
            path={path}
          />
        </div>

        {/* Editor and Controls Section */}
        <div className="w-1/2 p-4 flex flex-col bg-white rounded-lg shadow-lg">
          <EditorComponent code={code} setCode={setCode} />
          <div className="mt-4 flex space-x-2">
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
              onClick={runCode}
            >
              Run
            </button>
            <button
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
              onClick={testCode}
            >
              Test
            </button>
            <button
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
              onClick={() => refetch()}
            >
              New Problem
            </button>
          </div>
          <div className="mt-2">
            {testResults.map((result, index) => (
              <p 
                key={index} 
                className={`mt-1 ${
                  result.includes("Pass") ? "text-green-600" : "text-red-600"
                }`}
              >
                {result}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;