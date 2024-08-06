import * as comlink from "comlink";

import { WAClient } from "./lib/wa/client.ts";

comlink.expose(WAClient);
