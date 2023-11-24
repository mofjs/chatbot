import { OpenAI } from "openai";
import { env } from "./env.ts";

export const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });
