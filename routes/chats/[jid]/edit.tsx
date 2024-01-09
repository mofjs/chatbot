import { Handlers, PageProps } from "$fresh/server.ts";
import { z } from "zod";
import { Assistant, openai } from "~/utils/openai.ts";
import { Chat, chatSchema, getChat, setChat } from "~/utils/chats.ts";

const editChatSchema = chatSchema.omit({ jid: true, thread_id: true });

const replyToOptions = editChatSchema.shape.reply_to.options;

type PagePropsData = {
  chat: Chat;
  assistants: Assistant[];
  formData?: FormData;
  errors?: z.ZodFormattedError<z.infer<typeof editChatSchema>>;
};

export const handler: Handlers<PagePropsData> = {
  async GET(_req, ctx) {
    const jid = ctx.params.jid;
    const chat = await getChat(jid);
    if (!chat) return ctx.renderNotFound();
    const assistants = (await openai.beta.assistants.list()).data;
    return ctx.render({ chat, assistants });
  },
  async POST(req, ctx) {
    const jid = ctx.params.jid;
    const chat = await getChat(jid);
    if (!chat) return ctx.renderNotFound();
    const formData = await req.formData();
    const parseResult = await editChatSchema.spa(Object.fromEntries(formData));
    if (parseResult.success) {
      await setChat({ ...chat, ...parseResult.data });
      return Response.redirect(new URL("/chats", req.url), 303);
    }
    const errors = parseResult.error.format();
    const assistants = (await openai.beta.assistants.list()).data;
    return ctx.render({ chat, assistants, formData, errors }, { status: 400 });
  },
};

export default function ChatEditPage(
  { data: { chat, assistants, formData, errors } }: PageProps<PagePropsData>,
) {
  return (
    <form action="" method="post">
      <label htmlFor="name-input">
        Name
        <input
          type="text"
          name="name"
          id="name-input"
          placeholder="John Doe"
          max={256}
          defaultValue={formData?.get("name")?.toString() ?? chat.name}
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
          defaultValue={chat.jid}
          disabled
        />
      </label>
      <label htmlFor="assistant_id-input">
        Assistant
        <select
          name="assistant_id"
          id="assistant_id-input"
          defaultValue={formData?.get("assistant_id")?.toString() ??
            chat.assistant_id}
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
                chat.reply_to) === v}
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
      <button type="submit">Edit!</button>
    </form>
  );
}
