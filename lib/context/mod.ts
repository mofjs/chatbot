import { Assistant } from "../assistant/mod.ts";

const REMOTE_JIDS = Deno.env.get("REMOTE_JIDS");

export class Context {
  private static context: Context;
  private assistants: Assistant[];

  constructor(jids: string[] = []) {
    this.assistants = jids.map((jid) => new Assistant(jid));
  }

  static init() {
    Context.context = new Context(
      REMOTE_JIDS?.split(",").map((jid) => jid.trim()),
    );
  }

  static instance() {
    if (this.context) return this.context;
    else throw new Error("Context is not initialized!");
  }
}
