import "@std/dotenv/load";

import { App, fsRoutes, staticFiles } from "fresh";
import * as comlink from "comlink";

export const app = new App().use(staticFiles());

await fsRoutes(app, {
  loadIsland: (path) => import(`./islands/${path}`),
  loadRoute: (path) => import(`./routes/${path}`),
});

if (import.meta.main) {
  const worker = comlink.wrap(
    new Worker(
      import.meta.resolve("./worker.ts"),
      { type: "module" },
    ),
  );
  app.use((ctx) => {
    (ctx.state as Record<string, unknown>).worker = worker;
    return ctx.next();
  });
  await app.listen();
}
