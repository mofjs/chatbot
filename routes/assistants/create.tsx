import { Handlers, PageProps } from "$fresh/server.ts";
import { z } from "zod";
import { Model, openai } from "~/utils/openai.ts";

const DEFAULT_MODEL = "gpt-3.5-turbo";

const createAssistantSchema = z.object({
  name: z.string().max(256).optional(),
  description: z.string().max(512).optional(),
  instructions: z.string().max(32768).optional(),
  model: z.string(),
});

type PagePropsData = {
  models: Model[];
  formData?: FormData;
  errors?: z.ZodFormattedError<z.infer<typeof createAssistantSchema>>;
};

export const handler: Handlers<PagePropsData> = {
  async GET(_req, ctx) {
    const models = (await openai.models.list()).data;
    return ctx.render({ models });
  },
  async POST(req, ctx) {
    const formData = await req.formData();
    const parseResult = await createAssistantSchema.safeParseAsync(
      Object.fromEntries(formData),
    );
    if (parseResult.success) {
      await openai.beta.assistants.create(parseResult.data);
      return Response.redirect(new URL("/assistants", req.url), 302);
    } else {
      const errors = parseResult.error.format();
      const models = (await openai.models.list()).data;
      return ctx.render({ models, formData, errors }, { status: 400 });
    }
  },
};

export default function CreateAssistantPage(
  { data: { models, formData, errors } }: PageProps<PagePropsData>,
) {
  return (
    <>
      <h2>Create a new Assistant</h2>
      <form action="" method="post">
        <label htmlFor="name-input">
          Name
          <input
            type="text"
            name="name"
            id="name-input"
            placeholder="The name of the assistant."
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
        <label htmlFor="description-input">
          Description
          <textarea
            name="description"
            id="description-input"
            placeholder="The description of the assistant."
            cols={80}
            rows={2}
            max={512}
            defaultValue={formData?.get("description")?.toString()}
            aria-invalid={errors?.description?._errors.length
              ? true
              : undefined}
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
            defaultValue={formData?.get("instructions")?.toString()}
            aria-invalid={errors?.instructions?._errors.length
              ? true
              : undefined}
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
            defaultValue={formData?.get("model")?.toString() ?? DEFAULT_MODEL}
            aria-invalid={errors?.model?._errors.length ? true : undefined}
            aria-describedby={errors?.model?._errors.length
              ? "model-error"
              : undefined}
          >
            {models.map((v) => (
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
        <button type="submit">Create!</button>
      </form>
    </>
  );
}
