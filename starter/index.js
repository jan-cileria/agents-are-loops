import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

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

console.log('Hallo World');