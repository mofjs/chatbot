import { OpenAI } from "openai";
import { env } from "./env.ts";

export const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });
export type Model = OpenAI.Models.Model;
export type Assistant = OpenAI.Beta.Assistant;
export type FileObject = OpenAI.Files.FileObject;
