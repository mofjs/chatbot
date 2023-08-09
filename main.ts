import "https://deno.land/std@0.196.0/dotenv/load.ts";
import { assistant } from "./assistant.ts";

const REMOTE_JID = Deno.env.get("REMOTE_JID");

const WEBSOCKET_URL = "ws://localhost:3000/";

function main(_args: string[]) {
  const socket = new WebSocket(WEBSOCKET_URL + REMOTE_JID);
  socket.onopen = (_ev) => {
    console.log("Server connected!");
  };
  socket.onmessage = async (ev) => {
    const message = JSON.parse(ev.data);
    const reply = await assistant(message);
    if (reply) socket.send(JSON.stringify(reply));
  };
  socket.onclose = (_ev) => {
    console.log("Connection closed!");
  };
}

if (import.meta.main) {
  main(Deno.args);
}
