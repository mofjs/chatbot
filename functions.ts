import { getDaftarPeraturan } from "./jdih.ts";

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
  {
    name: "get_daftar_peraturan",
    description:
      "Get list of regulations (Peraturan) by it's title (judul), type (bentuk) , number (nomor) and year (tahun).",
    parameters: {
      type: "object",
      properties: {
        judul: {
          type: "string",
          description:
            "The title (judul) you want to look-up. e.g. 'Pajak PPh 21'",
        },
        bentuk: {
          type: "string",
          enum: ["uu", "perppu", "pp", "perpres", "pmk"],
          description:
            "Filter the result by it's type (bentuk) of the regulation (peraturan). eg. 'uu' for Undang-Undang, 'pp' for Peraturan Pemerintah, 'perpres' for Peraturan Presiden and 'pmk' for Peraturan Menteri Keuangan",
        },
        nomor: {
          type: "number",
          description:
            "Filter the result by it's number (nomor) of regulation.",
        },
        tahun: {
          type: "number",
          description: "Filter the result by it's year (tahun) of regulation.",
        },
      },
    },
  },
];

export function callFunction(name: string, args: Record<string, unknown>) {
  if (name === "now")
    return new Date().toLocaleString(args["locale"] as string);
  if (name === "get_daftar_peraturan") return getDaftarPeraturan(args);
}
