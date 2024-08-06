import { AIPluginTool } from "@langchain/community/tools/aiplugin";
import { DuckDuckGoSearch } from "@langchain/community/tools/duckduckgo_search";
import { WikipediaQueryRun } from "@langchain/community/tools/wikipedia_query_run";
import { RequestsGetTool, RequestsPostTool } from "langchain/tools";
import { z } from "zod";

type CreateToolsInput = z.infer<typeof CreateToolsInput>;
export const CreateToolsInput = z.union([
  z.object({
    type: z.literal("request_get").or(z.literal("request_post")),
    headers: z.record(z.any()).default({}),
    maxOutputLength: z.number().optional(),
  }),
  z.object({
    type: z.literal("ai_plugin"),
    url: z.string(),
  }),
  z.object({
    type: z.literal("duckduckgo_search"),
    maxResults: z.number().optional(),
    searchOptions: z.record(z.any()).optional(),
  }),
  z.object({
    type: z.literal("wikipedia"),
    baseUrl: z.string().optional(),
    maxDocContentLength: z.number().optional(),
    topKResults: z.number().optional(),
  }),
  z.object({
    type: z.literal("dall_e"),
    model: z.enum(["dall-e-2", "dall-e-3"]).optional(),
    n: z.number().optional(),
    quality: z.enum(["standard", "hd"]).optional(),
    responseFormat: z.enum(["url", "b64_json"]).optional(),
    size: z.enum(["256x256", "512x512", "1024x1024", "1792x1024", "1024x1792"])
      .optional(),
    style: z.enum(["natural", "vivid"]).optional(),
  }),
]);

export function createTools(...inputs: CreateToolsInput[]) {
  return Promise.all(
    inputs.map(async (input) => {
      switch (input.type) {
        case "request_get": {
          const { headers, maxOutputLength } = input;
          return new RequestsGetTool(headers, { maxOutputLength });
        }
        case "request_post": {
          const { headers, maxOutputLength } = input;
          return new RequestsPostTool(headers, { maxOutputLength });
        }
        case "ai_plugin":
          return AIPluginTool.fromPluginUrl(input.url);
        case "duckduckgo_search": {
          const { type: _, ...params } = input;
          return new DuckDuckGoSearch(params);
        }
        case "wikipedia": {
          const { type: _, ...params } = input;
          return new WikipediaQueryRun(params);
        }
        case "dall_e": {
          const { DallEAPIWrapper } = await import("npm:@langchain/openai");
          const { type: _, ...fields } = input;
          return new DallEAPIWrapper(fields);
        }
      }
    }).filter(Boolean),
  );
}
