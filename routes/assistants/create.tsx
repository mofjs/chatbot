import { Handlers, PageProps } from "$fresh/server.ts";
import { z } from "zod";
import { Model, openai } from "~/utils/openai.ts";
import {
  FunctionTool,
  functionToolSchema,
  listFunctionTools,
} from "~/utils/function-tool.ts";

const DEFAULT_MODEL = "gpt-3.5-turbo";

const assistantToolSchema = z.union([
  z.object({ type: z.enum(["code_interpreter", "retrieval"]) }),
  z.object({
    type: z.literal("function"),
    function: functionToolSchema.omit({ "script": true }),
  }),
]);

const createAssistantSchema = z.object({
  name: z.string().max(256).optional(),
  description: z.string().max(512).optional(),
  instructions: z.string().max(32768).optional(),
  model: z.string(),
  tools: z.array(
    z.string().transform((arg, ctx) => {
      try {
        return assistantToolSchema.parse(JSON.parse(arg));
      } catch (error) {
        if (error instanceof SyntaxError) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: error.message,
            fatal: true,
          });
        }
        if (error instanceof z.ZodError) {
          error.issues.forEach((issue) => ctx.addIssue(issue));
        }
        return z.NEVER;
      }
    }),
  ),
});

type PagePropsData = {
  models: Model[];
  functionTools: FunctionTool[];
  formData?: FormData;
  errors?: z.ZodFormattedError<z.input<typeof createAssistantSchema>>;
};

export const handler: Handlers<PagePropsData> = {
  async GET(_req, ctx) {
    const models = (await openai.models.list()).data;
    const functionTools = await listFunctionTools();
    return ctx.render({ models, functionTools });
  },
  async POST(req, ctx) {
    const formData = await req.formData();
    const parseResult = await createAssistantSchema.safeParseAsync(
      { ...Object.fromEntries(formData), tools: formData.getAll("tools") },
    );
    if (parseResult.success) {
      await openai.beta.assistants.create(parseResult.data);
      return Response.redirect(new URL("/assistants", req.url), 303);
    } else {
      const errors = parseResult.error.format();
      const models = (await openai.models.list()).data;
      const functionTools = await listFunctionTools();
      return ctx.render({ models, functionTools, formData, errors }, {
        status: 400,
      });
    }
  },
};

export default function CreateAssistantPage(
  { data: { models, functionTools, formData, errors } }: PageProps<
    PagePropsData
  >,
) {
  return (
    <form action="" method="post">
      <h2 className="text-center">Create a new Assistant</h2>
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
          defaultValue={formData?.get("instructions")?.toString()}
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
      <fieldset>
        <legend>Tools</legend>
        {["code_interpreter", "retrieval"].map((t) => {
          const id = t + "-input";
          const value = JSON.stringify({ type: t });
          return (
            <label htmlFor={id}>
              <input
                type="checkbox"
                name="tools"
                id={id}
                role="switch"
                value={value}
                defaultChecked={formData?.getAll("tools").some((v) =>
                  v.toString() === value
                )}
              />
              {t}
            </label>
          );
        })}
        <hr />
        <legend>Functions</legend>
        {functionTools.map(({ name, description, parameters }) => {
          const id = name + "-input";
          const value = JSON.stringify({
            type: "function",
            function: { name, description, parameters },
          });
          return (
            <label htmlFor={id}>
              <input
                type="checkbox"
                name="tools"
                id={id}
                role="switch"
                value={value}
                defaultChecked={formData?.getAll("tools").some((v) =>
                  v.toString() === value
                )}
              />
              {name}
            </label>
          );
        })}
        {!!errors?.tools?._errors.length && (
          <small id="tools-error">
            {errors.tools._errors.join(" | ")}
          </small>
        )}
      </fieldset>
      <button type="submit">Create!</button>
    </form>
  );
}
