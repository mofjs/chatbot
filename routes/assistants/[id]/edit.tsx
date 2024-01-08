import { Handlers, PageProps } from "$fresh/server.ts";
import { z } from "zod";
import { openai } from "~/utils/openai.ts";

const assistantEditSchema = z.object({
  name: z.string().max(256).optional(),
  description: z.string().max(512).optional(),
  instructions: z.string().max(32768).optional(),
  model: z.string(),
});

type PagePropsData = {
  assistant: Awaited<ReturnType<typeof openai.beta.assistants.retrieve>>;
  models: Awaited<ReturnType<typeof openai.models.list>>;
  errors?: z.ZodFormattedError<z.infer<typeof assistantEditSchema>>;
};

export const handler: Handlers<PagePropsData> = {
  GET: async (_req, ctx) => {
    const assistant_id = ctx.params.id;
    const assistant = await openai.beta.assistants.retrieve(assistant_id);
    const models = await openai.models.list();
    return ctx.render({ assistant, models });
  },
  POST: async (req, ctx) => {
    const assistant_id = ctx.params.id;
    const formData = await req.formData();
    const parseResult = await assistantEditSchema.spa(
      Object.fromEntries(formData),
    );
    if (parseResult.success) {
      await openai.beta.assistants.update(assistant_id, parseResult.data);
      return Response.redirect(new URL("/assistants", req.url), 302);
    } else {
      const assistant = await openai.beta.assistants.retrieve(assistant_id);
      const models = await openai.models.list();
      return ctx.render({
        assistant,
        models,
        errors: parseResult.error.format(),
      }, { status: 400 });
    }
  },
};

export default function EditAssistantPage(
  { data: { assistant, models, errors } }: PageProps<PagePropsData>,
) {
  return (
    <form action="" method="post">
      <label htmlFor="name-input">
        Name
        <input
          type="text"
          name="name"
          id="name-input"
          placeholder="The name of the assistant."
          max={256}
          defaultValue={assistant.name ?? undefined}
          aria-invalid={errors?.name?._errors.length ? true : undefined}
          aria-describedby={errors?.name?._errors.length
            ? "name-error"
            : undefined}
        />
        {!!errors?.name?._errors.length && (
          <small id="name-error">{errors.name._errors.join(" | ")}</small>
        )}
      </label>
      <label htmlFor="description-input">
        Description
        <textarea
          name="description"
          id="description-input"
          placeholder="The description of the assistant."
          cols={80}
          rows={2}
          max={512}
          defaultValue={assistant.description ?? undefined}
          aria-invalid={errors?.description?._errors.length ? true : undefined}
          aria-describedby={errors?.description?._errors.length
            ? "description-error"
            : undefined}
        />
        {!!errors?.description?._errors.length && (
          <small id="description-error">
            {errors.description._errors.join(" | ")}
          </small>
        )}
      </label>
      <label htmlFor="instructions-input">
        Instruction
        <textarea
          name="instructions"
          id="instructions-input"
          placeholder="The system instructions that the assistant uses."
          cols={80}
          rows={5}
          max={32768}
          defaultValue={assistant.instructions ?? undefined}
          aria-invalid={errors?.instructions?._errors.length ? true : undefined}
          aria-describedby={errors?.instructions?._errors.length
            ? "instructions-error"
            : undefined}
        />
        {!!errors?.instructions?._errors.length && (
          <small id="instructions-error">
            {errors.instructions._errors.join(" | ")}
          </small>
        )}
      </label>
      <label htmlFor="model-input">
        Model
        <select
          name="model"
          id="model-input"
          defaultValue={assistant.model}
          aria-invalid={errors?.model?._errors.length ? true : undefined}
          aria-describedby={errors?.model?._errors.length
            ? "model-error"
            : undefined}
        >
          {models.data.map((v) => (
            <option value={v.id}>
              {v.id} ({v.owned_by})
            </option>
          ))}
        </select>
        {!!errors?.model?._errors.length && (
          <small id="model-error">
            {errors.model._errors.join(" | ")}
          </small>
        )}
      </label>
      <button type="submit">Edit!</button>
    </form>
  );
}
