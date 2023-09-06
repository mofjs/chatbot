import { DDG_SEARCH_DEF, ddg_search } from "./ddg.ts";
import { GET_DAFTAR_PERATURAN_DEF, getDaftarPeraturan } from "./jdih.ts";

export type ChatFunction = {
  name: string;
  description?: string;
  parameters: Record<string, unknown>;
};

export const FUNCTIONS_DEFINITION: ChatFunction[] = [
  {
    name: "now",
    description: "Get current time",
    parameters: {
      type: "object",
      properties: {
        locale: {
          type: "string",
          description:
            "A string with a BCP 47 language tag, or an array of such strings. e.g. 'id-ID' for Bahasa Indonesia.",
        },
      },
    },
  },
  GET_DAFTAR_PERATURAN_DEF,
  DDG_SEARCH_DEF
];

export function callFunction(name: string, args: Record<string, unknown>) {
  if (name === "now")
    return new Date().toLocaleString(args["locale"] as string);
  if (name === GET_DAFTAR_PERATURAN_DEF.name) return getDaftarPeraturan(args);
  if (name === DDG_SEARCH_DEF.name) return ddg_search(args);
}
