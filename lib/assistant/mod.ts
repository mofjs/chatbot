import ReconnectingWebsocket from "reconnecting-websocket";
import { chat, ChatMessage } from "./chat.ts";
import { getQuotedMessages, Message, Reply } from "./wa.ts";
import { callFunction, FUNCTIONS_DEFINITION } from "../functions/mod.ts";

const BOT_NAME = Deno.env.get("BOT_NAME") ?? "AsistenKeu";
const PHONE_NUMBER = Deno.env.get("PHONE_NUMBER");
const SELF_MENTION = "@" + PHONE_NUMBER;
const SELF_JID = PHONE_NUMBER + "@s.whatsapp.net";

const SYSTEM_MESSAGES: ChatMessage[] = [
  {
    role: "system",
    content: `You are a helpful assistant named ${BOT_NAME}.`,
  },
  {
    role: "system",
    content: "Only answer in 50 words or less.",
  },
  {
    role: "system",
    content: "Answer the question in Bahasa Indonesia or Javanese."
  }
];

const WEBSOCKET_URL = "ws://localhost:3000/";

export class Assistant {
  private privateMode: boolean;
  private socket: ReconnectingWebsocket;
  private chatHistory: ChatMessage[];
  private debounceId?: number;

  constructor(private jid: string) {
    this.privateMode = !jid.endsWith("@g.us");
    this.socket = this.connect();
    this.chatHistory = [];
  }

  private connect() {
    const socket = new ReconnectingWebsocket(WEBSOCKET_URL + this.jid);
    socket.onopen = (_ev) => {
      console.log(`Assitant listening to messages from ${this.jid}!`);
    };
    socket.onmessage = (ev) => {
      const messageInfo: Message = JSON.parse(ev.data);
      this.onMessage(messageInfo);
    };
    socket.onclose = (_ev) => {
      console.log(`Connection closed to messages from ${this.jid}!`);
    };
    return socket;
  }

  private async onMessage(messageInfo: Message) {
    const reply = this.privateMode
      ? await this.replyPrivate(messageInfo)
      : await this.replyGroup(messageInfo);
    if (reply) this.socket.send(JSON.stringify(reply));
  }

  private async replyGroup(messageInfo: Message): Promise<Reply | void> {
    const contextInfo = messageInfo.message?.extendedTextMessage?.contextInfo;
    if (
      contextInfo?.mentionedJid?.includes(SELF_JID) ||
      contextInfo?.participant === SELF_JID
    ) {
      const messages = await getQuotedMessages(messageInfo);
      const chats: ChatMessage[] = messages.map(({ key, message }) => ({
        role: key.fromMe ? "assistant" : "user",
        content:
          message?.extendedTextMessage?.text?.replaceAll(
            SELF_MENTION,
            BOT_NAME
          ) ?? "",
      }));
      const text = await chat([...SYSTEM_MESSAGES, ...chats], {
        max_tokens: 500,
        functions_definition: FUNCTIONS_DEFINITION,
        call_function: callFunction,
      }).catch((err) => `[ERROR] ${err}.`);
      return [{ text }, { quoted: messageInfo }];
    }
  }

  private async replyPrivate(messageInfo: Message) {
    const content =
      messageInfo.message?.conversation ??
      messageInfo.message?.extendedTextMessage?.text ??
      "";
    this.chatHistory.push({
      role: "user",
      content: content.replaceAll(SELF_MENTION, BOT_NAME) ?? "",
    });
    const text = await this.debouncedChat([
      ...SYSTEM_MESSAGES,
      ...this.chatHistory.slice(-5),
    ]);
    this.chatHistory.push({
      role: "assistant",
      content: text,
    });
    return [{ text }];
  }

  private debouncedChat(chatMessages: ChatMessage[]) {
    return new Promise<string>((resolve) => {
      clearTimeout(this.debounceId);
      this.debounceId = setTimeout(async () => {
        try {
          const text = await chat(chatMessages, {
            max_tokens: 500,
            functions_definition: FUNCTIONS_DEFINITION,
            call_function: callFunction,
          });
          resolve(text);
        } catch (error) {
          resolve(`[ERROR] ${error}.`);
        }
      }, 1000);
    });
  }
}
