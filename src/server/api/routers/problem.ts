import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { OpenAI } from "openai";
import { ProblemData } from "~/utils/types";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const problemTypes = [
  {
    type: "shortest_path",
    description: "Find the shortest path between two points while avoiding walls"
  },
  {
    type: "collect_keys",
    description: "Collect all keys (marked as 2) before reaching the exit"
  },
  {
    type: "weighted_path",
    description: "Find the path with minimum total cost (cells contain different weights)"
  },
  {
    type: "multiple_targets",
    description: "Visit all target points (marked as 2) in any order"
  }
];

export const problemRouter = createTRPCRouter({
  getProblem: publicProcedure.query(async () => {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a JSON API that generates creative pathfinding problems. Return only valid JSON without any additional text or explanation."
        },
        {
          role: "user",
          content: `Generate a pathfinding problem as a JSON object. Choose randomly from these types:
${problemTypes.map(t => `- ${t.type}: ${t.description}`).join('\n')}

The response should follow this structure:
{
  "grid": number[][],        // 20x20 grid where: 0=path, 1=wall, 2=special (keys/targets), 3=weighted cost
  "start": [number, number],
  "end": [number, number],
  "statement": string,       // Clear problem description with specific goals
  "boilerplate": string,    // Starter code with appropriate function signature
  "testCases": {
    "input": {
      "grid": number[][],
      "startRow": number,
      "startCol": number,
      "endRow": number,
      "endCol": number
    },
    "output": [number, number][]
  }[]
}

Make the problems engaging with interesting grid layouts and clear goals. Ensure all positions are valid and at least one solution exists.`
        },
      ],
      temperature: 0.7,
    });

    try {
      const content = response.choices[0]?.message.content;
      if (!content) {
        throw new Error("No content received from OpenAI");
      }
      
      const data = JSON.parse(content) as ProblemData;
      return data;
    } catch (error) {
      console.error("Failed to parse OpenAI response:", error);
      throw new Error("Failed to generate problem");
    }
  }),
});

export const appRouter = createTRPCRouter({
  problem: problemRouter,
});

export type AppRouter = typeof appRouter;