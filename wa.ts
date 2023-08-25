import {
  AnyMessageContent,
  MiscMessageGenerationOptions,
  WAProto,
} from "https://esm.sh/@whiskeysockets/baileys@6.4.0";

export type Message = WAProto.IWebMessageInfo;

export type Reply = [AnyMessageContent, MiscMessageGenerationOptions?];

const API_URL = "http://localhost:3000/messages/";

export async function getMessage(jid: string, mid: string): Promise<Message> {
  const response = await fetch(API_URL + `${jid}/${mid}`);
  if (!response.ok) throw new Error("Response status is not OK.");
  return response.json();
}

export async function getQuotedMessages(message: Message) {
  const result = [message];
  while (true) {
    const first = result.at(0);
    const remoteJid = first?.key.remoteJid ?? "";
    const id = first?.message?.extendedTextMessage?.contextInfo?.stanzaId;
    if (!id) break;
    const message = await getMessage(remoteJid, id);
    result.unshift(message);
  }
  return result;
}
