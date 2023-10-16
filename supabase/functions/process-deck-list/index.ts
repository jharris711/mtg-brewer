import 'xhr_polyfill';
import { serve } from 'std/server';
import { createClient } from 'supabase';

const handler = async (req: Request) => {
  const decklist = await req.text();

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  );

  const {
    data: { cardNames },
    error,
  } = await supabaseClient.functions.invoke('extract-card-names', {
    body: decklist,
  });

  if (error) {
    return new Response(error.message, {
      status: 500,
    });
  }

  // deno-lint-ignore no-explicit-any
  const jsonDeck: Record<string, any>[] = [];

  for (const cardName of cardNames) {
    // Use this to respect the guidelines set in the Scryfall docs
    await new Promise((resolve) => setTimeout(resolve, 500));

    const { data, error: getCardDataError } =
      await supabaseClient.functions.invoke('get-card-data', {
        body: cardName,
      });

    if (getCardDataError) {
      return new Response(getCardDataError.message, {
        status: 500,
      });
    }

    jsonDeck.push(data);
  }

  return new Response(JSON.stringify(jsonDeck), {
    status: 200,
  });
};

serve(handler);
