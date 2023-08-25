import "https://deno.land/std@0.196.0/dotenv/load.ts";
import { Assistant } from "./assistant.ts";

const REMOTE_JIDS = Deno.env.get("REMOTE_JIDS");

function main(_args: string[]) {
  const jids = REMOTE_JIDS?.split(",").map((jid) => jid.trim());
  jids?.forEach((jid) => {
    new Assistant(jid);
  });
}

if (import.meta.main) {
  main(Deno.args);
}
