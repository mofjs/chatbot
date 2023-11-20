import { z } from "zod";

const envSchema = z.object({
  "WEB_ADMIN_USERNAME": z.string().default("admin"),
  "WEB_ADMIN_PASSWORD": z.string().min(6, "Password minimal has 6 characters."),
  "OPENAI_API_KEY": z.string(),
  "WA_URL": z.string().url(),
});

export const env = envSchema.parse(Deno.env.toObject());
