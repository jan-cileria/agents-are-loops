import OpenAI from 'openai';

class Agent {
  constructor({ tools = {}, maxIterations = 10 } = {}) {
    this.tools = tools;
    this.maxIterations = maxIterations;
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  async run(goal) {
    let state = {
      goal,
      history: [],
      done: false,
      result: null,
    };

    for (let i = 0; i < this.maxIterations; i++) {
      console.log(`\n--- Iteration ${i + 1} ---`);

      const action = await this.askLLM(state);

      if (action.done) {
        state.done = true;
        state.result = action.result;
        break;
      }

      const observation = await this.executeTool(action);
      state = this.updateState(state, action, observation);
    }

    return state;
  }

  async askLLM(state) {
    const systemPrompt = `You are an agent trying to achieve a goal.
You have access to these tools: ${Object.keys(this.tools).join(', ')}.

Respond with JSON only, in one of two formats:

If you have a next action:
{ "tool": "<tool_name>", "input": "<input for the tool>", "done": false }

If the goal is achieved:
{ "done": true, "result": "<final answer or summary>" }`;

    const userPrompt = `Goal: ${state.goal}

History so far:
${state.history.map(h => `- Called ${h.action.tool}("${h.action.input}") → ${h.observation}`).join('\n') || '(none yet)'}

What is the next action?`;

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4',
      max_tokens: 512,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    });

    return JSON.parse(completion.choices[0].message.content);
  }

  async executeTool(action) {
    const tool = this.tools[action.tool];

    if (!tool) {
      return `Error: unknown tool "${action.tool}"`;
    }

    try {
      const result = await tool(action.input);
      console.log(`Tool "${action.tool}" called with "${action.input}" → ${result}`);
      return result;
    } catch (err) {
      return `Error: ${err.message}`;
    }
  }

  updateState(state, action, observation) {
    return {
      ...state,
      history: [...state.history, { action, observation }],
    };
  }
}

export default Agent;
