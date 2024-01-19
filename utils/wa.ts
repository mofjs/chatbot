import { z } from "zod";
import { connect, MqttClient } from "mqtt";
import { parseArgs } from "$std/cli/parse_args.ts";
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

const WAListableSchema = z.object({
  sections: z.array(
    z.object({
      rows: z.array(
        z.object({
          rowId: z.string(),
          title: z.string(),
          description: z.string(),
        }).partial(),
      ),
      title: z.string(),
    }).partial(),
  ),
  title: z.string(),
  buttonText: z.string(),
}).partial();

const WAButtonableSchema = z.object({
  buttons: z.array(
    z.object({
      buttonId: z.string(),
      buttonText: z.object({ displayText: z.string() }).partial(),
      nativeFlowInfo: z.object({ name: z.string(), paramsJson: z.string() })
        .partial(),
    }).partial(),
  ),
}).partial();

const WARegularMessageContentSchema = z.union([
  z.object({ text: z.string() }).extend(WAListableSchema.shape).extend(
    WAButtonableSchema.shape,
  ),
  z.object({
    location: z.object({
      name: z.string(),
      degreesLatitude: z.number(),
      degreesLongitude: z.number(),
      address: z.string(),
      url: z.string(),
    }).partial(),
  }),
  z.object({
    buttonReply: z.object({
      displayText: z.string(),
      id: z.string(),
      index: z.number(),
    }),
    type: z.enum(["template", "plain"]),
  }),
  z.object({
    listReply: z.object({
      title: z.string(),
      description: z.string(),
      listType: z.union([z.literal(0), z.literal(1)]),
      singleSelectReply: z.object({
        selectedRowId: z.string().optional(),
      }),
    }).partial(),
  }),
]);

export const WASendMessageSchema = z.object({
  jid: z.string(),
  content: WARegularMessageContentSchema,
  options: z.object({ quoted: WAMessageSchema, timestamp: z.date() }).partial()
    .optional(),
});

export type WAMessage = z.infer<typeof WAMessageSchema>;

export type WASendMessage = z.infer<typeof WASendMessageSchema>;

let client: MqttClient;

export function listen(handler: (payload: WAMessage) => void) {
  client = connect(env.WA_URL, { manualConnect: true })
    .once("connect", () => client.subscribe("wa/messages/in/+"))
    .on("message", (_topic, payload) => {
      const data = JSON.parse(payload.toString());
      const parseResult = WAMessageSchema.safeParse(data);
      if (parseResult.success) {
        handler(parseResult.data);
      } else {
        if (
          parseArgs(Deno.args, {
            boolean: ["verbose"],
          }).verbose
        ) {
          console.error(parseResult.error);
        }
      }
    })
    .on("error", console.error)
    .connect();
}

export function send({ jid, content, options }: WASendMessage) {
  if (!client.connected) client.reconnect();
  client.publish(
    "wa/messages/out/" + jid,
    JSON.stringify([jid, content, options]),
  );
}
