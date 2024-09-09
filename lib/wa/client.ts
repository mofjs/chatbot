import { Buffer } from "node:buffer";
import type {
  AnyMessageContent,
  MiscMessageGenerationOptions,
  WAMessage,
} from "https://esm.sh/@whiskeysockets/baileys@6.7.5";
import { connect, MqttClient } from "mqtt";

type onMessageHandler = (this: WAClient, m: WAMessage) => void | Promise<void>;

const BufferJSON = {
  // deno-lint-ignore no-explicit-any
  replacer: (_key: unknown, value: any) => {
    if (
      Buffer.isBuffer(value) || value instanceof Uint8Array ||
      value?.type === "Buffer"
    ) {
      return {
        type: "Buffer",
        data: Buffer.from(value?.data || value).toString("base64"),
      };
    }

    return value;
  },
  // deno-lint-ignore no-explicit-any
  reviver: (_key: unknown, value: any) => {
    if (
      typeof value === "object" && !!value &&
      (value.buffer === true || value.type === "Buffer")
    ) {
      const val = value.data || value.value;
      return typeof val === "string"
        ? Buffer.from(val, "base64")
        : Buffer.from(val || []);
    }

    return value;
  },
};

export class WAClient {
  private client: MqttClient;
  private handler?: onMessageHandler;
  private verbose?: boolean;

  constructor(url: string) {
    this.client = connect(url, { manualConnect: true })
      .on("connect", () => this.client.subscribe("wa/messages/in/+"))
      .on("message", (_topic, payload) => {
        const message = JSON.parse(
          payload.toString(),
          BufferJSON.reviver,
        ) as WAMessage;
        const event = new CustomEvent("input:" + message.key.remoteJid, {
          detail: message,
          cancelable: true,
        });
        if (dispatchEvent(event)) {
          this.handler?.bind(this)?.(message);
        }
      })
      .on("error", (error) => {
        if (this.verbose) {
          console.error(error);
        }
      });
  }

  setHandler(fn: onMessageHandler) {
    this.handler = fn;
    return this;
  }

  setVerbose(value: boolean) {
    this.verbose = value;
    return this;
  }

  async connect() {
    if (this.client.connected) return;
    const { promise, resolve } = Promise.withResolvers();
    this.client.once("connect", resolve);
    this.client.connect();
    await promise;
  }

  async send(
    jid: string,
    content: AnyMessageContent,
    options?: MiscMessageGenerationOptions,
  ) {
    await this.client.publishAsync(
      "wa/messages/out/" + jid,
      JSON.stringify([jid, content, options], BufferJSON.replacer),
    );
  }

  input(jid: string, signal?: AbortSignal): Promise<WAMessage> {
    const { promise, resolve, reject } = Promise.withResolvers<WAMessage>();
    const abortListener = () => reject(signal?.reason);
    const customListener = (event: CustomEvent<WAMessage>) => {
      resolve(event.detail);
      event.preventDefault();
      signal?.removeEventListener("abort", abortListener);
    };
    signal?.addEventListener("abort", abortListener, { once: true });
    addEventListener(
      "input:" + jid,
      customListener as EventListener,
      { capture: true, once: true, signal },
    );
    return promise;
  }
}
