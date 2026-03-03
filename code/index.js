import OpenAI from 'openai';

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

    console.log('\nOpenAI response:');
    console.log(completion.choices[0].message.content);
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

(async () => {

  const initialQuery = `
    I want to build a house. 
    Create a list of tasks to complete the project. Each task should be the usage of a tool.

    # Tools
    Hands, Hammer, Saw, Drill, Screwdriver

    # Output
    The list must be in JSON format. 
    The JSON must be valid and the list can be empty.
    Just return JSON, no other text.

    # Restrictions
    You can only use the tools listed above.
    You can only use the resources listed above.
    You can only use the tools and resources listed above.
    You can only use the tools and resources listed above.

    # Example

    [{
      "Task": "Gather materials",
      "Tool": "Hands",
    },
    {
      "Task": "Cut Wood",
      "Tool": "Saw",
    }]      
  `;
  const response = await askOpenAI(initialQuery);
  const tasks = JSON.parse(response);

  for(const task of tasks) { 
    console.log(`I am going to ${task.Task} using the ${task.Tool} and the ${task.Resource}`);
    await sleep(1000);
  }
  console.log(response);
})();

// Agent Loop

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
