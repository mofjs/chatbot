import { search, SafeSearchType } from "https://esm.sh/duck-duck-scrape@2.2.4";

export const DDG_SEARCH_DEF = {
  name: "ddg_search",
  description: "Search the internet using DuckDuckGo search engine.",
  parameters: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "Keywords or something to search for. e.g. 'Soup recipe'",
      },
    },
  },
};

export async function ddg_search({ query }: Record<string, unknown>) {
  const result = await search(query as string, {
    safeSearch: SafeSearchType.STRICT,
  });
  return result.results.slice(0, 3);
}
