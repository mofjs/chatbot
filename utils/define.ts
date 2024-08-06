import { createDefine } from "fresh";

interface State {
  title?: string;
  description?: string;
}

export const define = createDefine<State>();
