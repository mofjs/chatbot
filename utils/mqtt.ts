import { connect } from "mqtt";

export function listen(
  options: {
    host?: string;
    port?: number;
    username?: string;
    password?: string;
  },
) {
  const client = connect(options);
  client
    .once("connect", () => client.subscribe("wa/messages/in/+"))
    .on("message", (topic, message) => {
    });
}
