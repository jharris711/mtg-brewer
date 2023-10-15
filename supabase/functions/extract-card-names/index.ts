import 'xhr_polyfill';
import { serve } from 'std/server';

/**
 * Extracts card names from a decklist string that follows the format:
 * "1 Card Name (Set Name)".
 *
 * @param decklist - The decklist string to extract card names from.
 * @returns An array of card names extracted from the decklist string.
 */
function extractCardNames(decklist: string): string[] {
  const cardNameRegex = /^[0-9]+\s(.+?)\s\(.+$/gm;
  const cardNames: string[] = [];
  let match;
  while ((match = cardNameRegex.exec(decklist)) !== null) {
    cardNames.push(match[1]);
  }
  return cardNames;
}

const handler = async (req: Request) => {
  const decklist = await req.text();

  try {
    const cardNames = extractCardNames(decklist);

    const data = {
      cardNames: cardNames,
    };

    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error(err);
    return new Response(err.message, { status: 500 });
  }
};

serve(handler);
