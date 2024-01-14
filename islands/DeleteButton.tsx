import { createRef, JSX } from "preact";
import { closeDialog, showDialog } from "~/islands/ModalDialog.tsx";

type Props = JSX.HTMLAttributes<HTMLFormElement> & {
  inputs: Record<string, string>;
  description?: string;
};

export default function DeleteButton(
  { inputs, description, ...props }: Props,
) {
  const formRef = createRef<HTMLFormElement>();
  const dialogContent = (
    <>
      <h2>Confirm Delete!</h2>
      <p>Are you sure you want to delete this?</p>
      <p>{description}</p>
      <footer>
        <button
          type="button"
          className="secondary"
          onClick={closeDialog}
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
    </>
  );
  return (
    <form
      action=""
      method="post"
      ref={formRef}
      {...props}
    >
      <input type="hidden" name="action" value="delete" />
      {Object.entries(inputs).map(([name, value]) => (
        <input type="hidden" {...{ name, value }} />
      ))}
      <button
        type="submit"
        className="bg-delete"
        data-tooltip="Delete"
        onClick={(e) => {
          e.preventDefault();
          showDialog(dialogContent);
          return false;
        }}
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
  );
}
