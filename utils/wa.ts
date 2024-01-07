import { z } from "zod";
import mqtt from "mqtt";
import { env } from "~/utils/env.ts";

export const WAMessageSchema = z.object({
  key: z.object({ remoteJid: z.string().optional() }),
  message: z.object({
    conversation: z.string().optional().nullable(),
    extendedTextMessage: z.object({
      text: z.string().optional().nullable(),
      contextInfo: z.object({
        stanzaId: z.string().optional().nullable(),
        participant: z.string().optional().nullable(),
        mentionedJid: z.array(z.string()).optional().nullable(),
      }).optional().nullable(),
    }).optional().nullable(),
  }),
});

export type WAMessage = z.infer<typeof WAMessageSchema>;

let client: mqtt.MqttClient;

export function listen(handler: (payload: WAMessage) => void) {
  client = mqtt.connect(env.WA_URL, { manualConnect: true })
    .once("connect", () => client.subscribe("wa/messages/in/+"))
    .on("message", (_topic, payload) => {
      const data = JSON.parse(payload.toString());
      const parseResult = WAMessageSchema.safeParse(data);
      if (parseResult.success) {
        handler(parseResult.data);
      }
    })
    .on("error", console.error)
    .connect();
}

export function send(remoteJid: string, text: string) {
  if (!client.connected) client.reconnect();
  client.publish("wa/messages/out/" + remoteJid, JSON.stringify({ text }));
}
