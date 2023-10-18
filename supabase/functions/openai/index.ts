import 'xhr_polyfill';
import { serve } from 'std/server';

const system_prompt = `You are going to act as my Magic: The Gathering deck building assistant. 
I am going to submit some stringified JSON representing a deck. 
You are going to repeat and answer the following questions:
- What are the strengths of this deck composition?
- Are there any notable card synergies in this deck?
- What are the potential weaknesses of this deck?
- Can you suggest improvements or card substitutions to enhance this deck's performance?
- Any general tips or strategies for playing this type of deck?
- Finally, give the deck a letter gradefrom A to F, with a brief summary.
`;

const handler = async (req: Request) => {
  const decklist = await req.text();

  const completionConfig = {
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content: system_prompt,
      },
      {
        role: 'user',
        content: decklist,
      },
    ],
  };

  try {
    return fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(completionConfig),
    });
  } catch (err) {
    console.error(err);
    console.error(err.message);
    return new Response(err.message, { status: 500 });
  }
};

serve(handler);
