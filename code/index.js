import 'dotenv/config';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

async function askClaudeAI(query) {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    console.error('Error: ANTHROPIC_API_KEY environment variable is not set');
    process.exit(1);
  }

  const anthropic = new Anthropic({ apiKey });

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [{ role: 'user', content: query }],
    });

    return message.content[0].text;
  } catch (error) {
    console.error('Error calling Anthropic:', error.message);
    process.exit(1);
  }
}

async function askOpenAI(query) {
  // Get API key from environment variable
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    console.error('Error: OPENAI_API_KEY environment variable is not set');
    console.log('Please set it with: export OPENAI_API_KEY=your_api_key');
    process.exit(1);
  }

  const openai = new OpenAI({
    apiKey: apiKey,
  });

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: query,
        },
      ],
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error calling OpenAI:', error.message);
    process.exit(1);
  }
}

console.log('Hallo World');

// Simple Loop
// for(let i = 0; i < 10; i++) {
//   console.log(`item ${i}`);
// }

// Simple LLM Call

// (async () => {
//   const initialQuery = 'What is the capital of France?';
//   const response = await askOpenAI(initialQuery);
//   console.log(response);
// })();

// plan-then-execute pattern

// (async () => {

//   const initialQuery = `
//     I want to build a house. 
//     Create a list of tasks to complete the project. Each task should be the usage of a tool.

//     # Tools
//     Hands, Hammer, Saw, Drill, Screwdriver

//     # Output
//     The list must be in JSON format. 
//     The JSON must be valid and the list can be empty.
//     Just return JSON, no other text.

//     # Restrictions
//     You can only use the tools listed above.
//     You can only use the resources listed above.
//     You can only use the tools and resources listed above.
//     You can only use the tools and resources listed above.

//     # Example

//     [{
//       "Task": "Gather materials",
//       "Tool": "Hands",
//     },
//     {
//       "Task": "Cut Wood",
//       "Tool": "Saw",
//     }]      
//   `;
//   const response = await askOpenAI(initialQuery);
//   const tasks = JSON.parse(response);

//   for(const task of tasks) { 
//     console.log(`I am going to ${task.Task} using the ${task.Tool} and the ${task.Resource}`);
//     await sleep(1000);
//   }
//   console.log(response);
// })();

// Agent Loop
// while not done:
// observe → think (LLM) → act → observe result → repeat

(async () => {

  let state = { goal: "build a house", history: [], done: false };
  while(!state.done) {
    const nextAction = await askOpenAI(`You are an agent trying to achieve a goal.
        You have access to these tools: Hands, Hammer, Saw, Drill, Screwdriver

        Respond with JSON only, in one of two formats:

        If you have a next action:
        { "tool": "<tool_name>", "input": "<input for the tool>", "done": false }

        If the goal is achieved:
        { "done": true, "result": "<final answer or summary>" }

        Goal: ${state.goal}

        History so far:
        ${state.history.map(h => `- Called ${h.action.tool}("${h.action.input}") → ${h.observation}`).join('\n') || '(none yet)'}

        What is the next action?
    `);

    const action = JSON.parse(nextAction);
    if (action.done) {
      state.done = true;
      state.result = action.result;
      console.log(`done!`);
      break;
    }

    const observation = "Was successfull";
    state =  {
      ...state,
      history: [...state.history, { action, observation }],
    };

    console.log(nextAction);
  }
})();

// import Agent from './agent.js';

// (async () => {
//   const agent = new Agent({
//     tools: {
//       Hands:       async (input) => `Used hands to ${input}. Done.`,
//       Hammer:      async (input) => `Hammered ${input}. Done.`,
//       Saw:         async (input) => `Sawed ${input}. Done.`,
//       Drill:       async (input) => `Drilled ${input}. Done.`,
//       Screwdriver: async (input) => `Screwed ${input}. Done.`,
//     },
//   });

//   const state = await agent.run(
//     'Build a house using only these resources: Wood, Steel, Concrete, Glass. ' +
//     'And only these tools: Hands, Hammer, Saw, Drill, Screwdriver.'
//   );

//   console.log('\n--- Final Result ---');
//   console.log(state.result);
// })();
