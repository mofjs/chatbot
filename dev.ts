#!/usr/bin/env -S deno run -A --unstable --watch=static/,routes/

import { Builder } from "fresh/dev";
import { app } from "~/main.ts";

const builder = new Builder();

if (import.meta.main) {
  if (Deno.args.includes("build")) await builder.build(app);
  else await builder.listen(app);
}
