import 'xhr_polyfill';
import { serve } from 'std/server';

/**
 * Retrieves data for a Magic: The Gathering card from the Scryfall API.
 * @param req - The request object containing the name of the card to retrieve.
 * @returns A Promise that resolves to the response from the Scryfall API.
 */
const handler = async (req: Request) => {
  const name = await req.text();

  const scryfall_url = encodeURI(
    `https://api.scryfall.com/cards/named?exact=${name}`
  );

  return fetch(scryfall_url);
};

serve(handler);
