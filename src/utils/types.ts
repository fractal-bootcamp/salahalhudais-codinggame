export type Grid = number[][]; // 0=path, 1=wall, 2=special, 3=weighted
export type Position = [number, number]; // [row, col]

export type TestCase = {
  input: {
    grid: Grid;
    startRow: number;
    startCol: number;
    endRow: number;
    endCol: number;
  };
  output: Position[]; // Expected path
};

export type ProblemData = {
  grid: Grid;
  start: Position;
  end: Position;
  statement: string;
  boilerplate: string;
  testCases: TestCase[];
};