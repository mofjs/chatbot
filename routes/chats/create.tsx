import { Handlers, PageProps } from "$fresh/server.ts";
import { z } from "zod";
import { chatSchema, setChat } from "~/utils/chats.ts";
import { Assistant, openai } from "~/utils/openai.ts";

const createChatSchema = chatSchema.omit({ thread_id: true });

const replyToOptions = createChatSchema.shape.reply_to.options;

type PagePropsData = {
  assistants: Assistant[];
  formData?: FormData;
  errors?: z.ZodFormattedError<z.infer<typeof createChatSchema>>;
};

export const handler: Handlers<PagePropsData> = {
  GET: async (_req, ctx) => {
    const assistants = (await openai.beta.assistants.list()).data;
    return ctx.render({ assistants });
  },
  POST: async (req, ctx) => {
    const formData = await req.formData();
    const parseResult = await createChatSchema.spa(
      Object.fromEntries(formData),
    );
    if (parseResult.success) {
      const chatData = parseResult.data;
      const thread = await openai.beta.threads.create({
        metadata: { jid: chatData.jid },
      });
      await setChat({ ...chatData, thread_id: thread.id });
      return Response.redirect(new URL("/chats", req.url), 303);
    } else {
      const errors = parseResult.error.format();
      const assistants = (await openai.beta.assistants.list()).data;
      return ctx.render({
        assistants,
        formData,
        errors,
      }, { status: 400 });
    }
  },
};

export default function CreateChatPage(
  { data: { assistants, formData, errors } }: PageProps<PagePropsData>,
) {
  return (
    <form action="" method="post">
      <h2 className="text-center">Create a new Chat</h2>
      <label htmlFor="name-input">
        Name
        <input
          type="text"
          name="name"
          id="name-input"
          placeholder="John Doe"
          max={256}
          defaultValue={formData?.get("name")?.toString()}
          aria-invalid={errors?.name?._errors.length ? true : undefined}
          aria-describedby={errors?.name?._errors.length
            ? "name-error"
            : undefined}
        />
        {!!errors?.name?._errors.length && (
          <small id="name-error">{errors.name._errors.join(" | ")}</small>
        )}
      </label>
      <label htmlFor="jid-input">
        JID
        <input
          type="text"
          name="jid"
          id="jid-input"
          placeholder="62xxxxx@s.whatsapp.net"
          max={256}
          defaultValue={formData?.get("jid")?.toString()}
          aria-invalid={errors?.jid?._errors.length ? true : undefined}
          aria-describedby={errors?.jid?._errors.length
            ? "jid-error"
            : undefined}
        />
        {!!errors?.jid?._errors.length && (
          <small id="jid-error">
            {errors.jid._errors.join(" | ")}
          </small>
        )}
      </label>
      <label htmlFor="assistant_id-input">
        Assistant
        <select
          name="assistant_id"
          id="assistant_id-input"
          defaultValue={formData?.get("assistant_id")?.toString() ??
            assistants.at(0)?.id}
          aria-invalid={errors?.assistant_id?._errors.length ? true : undefined}
          aria-describedby={errors?.assistant_id?._errors.length
            ? "assistant_id-error"
            : undefined}
        >
          {assistants.map((a) => (
            <option value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
        {!!errors?.assistant_id?._errors.length && (
          <small id="assistant_id-error">
            {errors.assistant_id._errors.join(" | ")}
          </small>
        )}
      </label>
      <fieldset>
        <legend>Reply to</legend>
        {replyToOptions.map((v) => (
          <div>
            <input
              type="radio"
              id={`${v}-input`}
              name="reply_to"
              value={v}
              defaultChecked={(formData?.get("reply_to")?.toString() ??
                "all") === v}
            />
            <label htmlFor={`${v}-input`}>
              {v.replaceAll("_", " ").toUpperCase()}
            </label>
          </div>
        ))}
        {!!errors?.reply_to?._errors.length && (
          <small id="reply_to-error">
            {errors.reply_to._errors.join(" | ")}
          </small>
        )}
      </fieldset>
      <button type="submit">Create!</button>
    </form>
  );
}
