// DO NOT EDIT. This file is generated by Fresh.
// This file SHOULD be checked into source version control.
// This file is automatically updated during development when running `dev.ts`.

import * as $_404 from "./routes/_404.tsx";
import * as $_500 from "./routes/_500.tsx";
import * as $_app from "./routes/_app.tsx";
import * as $_layout from "./routes/_layout.tsx";
import * as $_middleware from "./routes/_middleware.ts";
import * as $assistants_id_edit from "./routes/assistants/[id]/edit.tsx";
import * as $assistants_id_index from "./routes/assistants/[id]/index.tsx";
import * as $assistants_layout from "./routes/assistants/_layout.tsx";
import * as $assistants_create from "./routes/assistants/create.tsx";
import * as $assistants_index from "./routes/assistants/index.tsx";
import * as $chats_jid_index from "./routes/chats/[jid]/index.tsx";
import * as $chats_layout from "./routes/chats/_layout.tsx";
import * as $chats_create from "./routes/chats/create.tsx";
import * as $chats_index from "./routes/chats/index.tsx";
import * as $index from "./routes/index.tsx";

import { type Manifest } from "$fresh/server.ts";

const manifest = {
  routes: {
    "./routes/_404.tsx": $_404,
    "./routes/_500.tsx": $_500,
    "./routes/_app.tsx": $_app,
    "./routes/_layout.tsx": $_layout,
    "./routes/_middleware.ts": $_middleware,
    "./routes/assistants/[id]/edit.tsx": $assistants_id_edit,
    "./routes/assistants/[id]/index.tsx": $assistants_id_index,
    "./routes/assistants/_layout.tsx": $assistants_layout,
    "./routes/assistants/create.tsx": $assistants_create,
    "./routes/assistants/index.tsx": $assistants_index,
    "./routes/chats/[jid]/index.tsx": $chats_jid_index,
    "./routes/chats/_layout.tsx": $chats_layout,
    "./routes/chats/create.tsx": $chats_create,
    "./routes/chats/index.tsx": $chats_index,
    "./routes/index.tsx": $index,
  },
  islands: {},
  baseUrl: import.meta.url,
} satisfies Manifest;

export default manifest;
