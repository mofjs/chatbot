import { BaseListChatMessageHistory } from "@langchain/core/chat_history";
import {
  BaseMessage,
  mapStoredMessageToChatMessage,
} from "@langchain/core/messages";
import { ulid } from "@std/ulid";

export class DenoKvChatMessageHistory extends BaseListChatMessageHistory {
  constructor(private kv: Deno.Kv, private sessionId: string) {
    super();
  }
  async getMessages(): Promise<BaseMessage[]> {
    const list = this.kv.list<string>({ prefix: ["messages", this.sessionId] });
    const messages = await Array.fromAsync(list);
    return messages
      .map(({ value }) => JSON.parse(value))
      .map(mapStoredMessageToChatMessage);
  }
  async addMessage(message: BaseMessage): Promise<void> {
    const uid = ulid();
    const stored = message.toDict();
    await this.kv.set(
      ["messages", this.sessionId, uid],
      JSON.stringify(stored),
    );
  }
  lc_namespace = ["lib", "agent", "chat_history"];
}
