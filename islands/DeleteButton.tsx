import { createRef } from "preact";
import { useCallback } from "preact/hooks";
import { useSignal } from "@preact/signals";
import { SignalLike } from "$fresh/src/types.ts";

type DeleteButtonProps = {
  inputs: Record<string, string>;
  description?: string;
  className?: string | SignalLike<string | undefined> | undefined;
};

export default function DeleteButton(
  { inputs, description, className }: DeleteButtonProps,
) {
  const formRef = createRef<HTMLFormElement>();
  const isOpen = useSignal<boolean | undefined>(undefined);
  const openModal = useCallback((event: MouseEvent) => {
    event.preventDefault();
    isOpen.value = true;
    document.documentElement.addEventListener("animationend", () => {
      document.documentElement.classList.remove(
        "modal-is-opening",
      );
    }, {
      once: true,
    });
    document.documentElement.classList.add(
      "modal-is-open",
      "modal-is-opening",
    );
    return false;
  }, [isOpen]);
  const closeModal = useCallback(() => {
    document.documentElement.addEventListener("animationend", () => {
      document.documentElement.classList.remove(
        "modal-is-open",
        "modal-is-closing",
      );
      isOpen.value = false;
    }, {
      once: true,
    });
    document.documentElement.classList.add(
      "modal-is-closing",
    );
  }, [isOpen]);
  return (
    <>
      <dialog open={isOpen}>
        <article>
          <h2>Confirm Delete!</h2>
          <p>Are you sure you want to delete this?</p>
          <p>{description}</p>
          <footer>
            <button
              type="button"
              className="secondary"
              onClick={closeModal}
            >
              Cancel
            </button>
            <button
              type="button"
              className="bg-delete"
              onClick={() => {
                formRef.current?.submit();
              }}
            >
              Delete!
            </button>
          </footer>
        </article>
      </dialog>
      <form
        action=""
        method="post"
        ref={formRef}
        className={className}
      >
        <input type="hidden" name="action" value="delete" />
        {Object.entries(inputs).map(([name, value]) => (
          <input type="hidden" {...{ name, value }} />
        ))}
        <button
          type="submit"
          className="bg-delete"
          data-tooltip="Delete"
          onClick={openModal}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            viewBox="0 0 16 16"
          >
            <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5m-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5M4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06m6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528M8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5" />
          </svg>
        </button>
      </form>
    </>
  );
}
