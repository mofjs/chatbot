import { Handlers, PageProps } from "$fresh/server.ts";
import { z, ZodFormattedError } from "zod";
import { chatSchema, setChat } from "~/utils/chats.ts";
import { openai } from "~/utils/openai.ts";

const createChatSchema = chatSchema.omit({ thread_id: true });

const replyToOptions = createChatSchema.shape.reply_to.options;

type PagePropsData = {
  assistants: Awaited<ReturnType<typeof openai.beta.assistants.list>>;
  formData?: FormData;
  errors?: ZodFormattedError<z.infer<typeof createChatSchema>>;
};

export const handler: Handlers<PagePropsData> = {
  GET: async (_req, ctx) => {
    const assistants = await openai.beta.assistants.list();
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
      return Response.redirect(new URL("/chats", req.url), 302);
    } else {
      const assistants = await openai.beta.assistants.list();
      return ctx.render({
        assistants,
        formData,
        errors: parseResult.error.format(),
      }, { status: 400 });
    }
  },
};

export default function CreateChatPage(
  { data: { assistants, formData } }: PageProps<PagePropsData>,
) {
  return (
    <>
      <h2>Create a new Chat</h2>
      <form action="" method="post">
        <label htmlFor="name-input">
          Name
          <input
            type="text"
            name="name"
            id="name-input"
            placeholder="John Doe"
            max={256}
            defaultValue={formData?.get("name")?.toString()}
          />
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
          />
        </label>
        <label htmlFor="assistant_id-input">
          Assistant
          <select
            name="assistant_id"
            id="assistant_id-input"
            defaultValue={formData?.get("assistant_id")?.toString() ??
              assistants.data.at(0)?.id}
          >
            {assistants.data.map((a) => (
              <option value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
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
        </fieldset>
        <button type="submit">Create!</button>
      </form>
    </>
  );
}
