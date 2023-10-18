import 'xhr_polyfill';
import { serve } from 'std/server';
import { createClient } from 'supabase';

/**
 * Handles incoming requests to process a deck list.
 * @param req - The incoming request object.
 * @returns A response object containing the processed deck list.
 */
const handler = async (req: Request) => {
  const decklist = await req.text();

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  );

  /**
   * Extract the card names from the decklist.
   */
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

  /**
   * Loop over the deck and get the card data for each card.
   */
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

  const deckForChatgpt = jsonDeck.map((card) => ({
    id: card.id,
    name: card.name,
    mana_cost: card.mana_cost,
    cmc: card.cmc,
    type_line: card.type_line,
    oracle_text: card.oracle_text,
    power: card.power,
    toughness: card.toughness,
    colors: card.colors,
    color_identity: card.color_identity,
  }));

  /**
   * Call OpenAI's chat endpoint to process the decklist.
   */
  const { data: chatCompletion, error: chatError } =
    await supabaseClient.functions.invoke('openai', {
      body: deckForChatgpt,
    });

  if (chatError) {
    return new Response(chatError.message, {
      status: 500,
    });
  }

  return new Response(JSON.stringify(chatCompletion), {
    status: 200,
  });
};

serve(handler);
