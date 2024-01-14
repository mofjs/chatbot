import { IS_BROWSER } from "$fresh/runtime.ts";
import { computed, effect, signal } from "@preact/signals";
import { ComponentChildren } from "preact";

const dialogContentSignal = signal<ComponentChildren | null>(null);
const isAnimatingSignal = signal(false);
const isOpenSignal = computed(() =>
  !!dialogContentSignal.value || isAnimatingSignal.value
);

if (IS_BROWSER) {
  const rootEl = document.documentElement;
  effect(() =>
    rootEl.classList.add(
      dialogContentSignal.value ? "modal-is-opening" : "modal-is-closing",
    )
  );

  effect(() => {
    if (isOpenSignal.value) {
      rootEl.classList.add("modal-is-open");
    } else {
      rootEl.classList.remove("modal-is-open");
    }
  });

  rootEl.addEventListener("animationend", () => {
    rootEl.classList.remove("modal-is-opening", "modal-is-closing");
    isAnimatingSignal.value = false;
  });
}

export function showDialog(content: ComponentChildren) {
  dialogContentSignal.value = content;
  isAnimatingSignal.value = true;
}

export function closeDialog() {
  dialogContentSignal.value = null;
  isAnimatingSignal.value = true;
}

export default function ModalDialog() {
  return (
    <dialog open={isOpenSignal}>
      <article>
        {dialogContentSignal.value}
      </article>
    </dialog>
  );
}
