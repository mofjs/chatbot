import { Handlers, PageProps } from "$fresh/server.ts";
import { z } from "zod";
import { functionToolSchema, setFunctionTool } from "~/utils/function-tool.ts";

type PagePropsData = {
  formData?: FormData;
  errors?: z.ZodFormattedError<z.input<typeof functionToolSchema>>;
};

export const handler: Handlers<PagePropsData> = {
  GET(_req, ctx) {
    return ctx.render({});
  },
  async POST(req, ctx) {
    const formData = await req.formData();
    const parseResult = await functionToolSchema.spa(
      Object.fromEntries(formData),
    );
    if (parseResult.success) {
      const functionTool = parseResult.data;
      await setFunctionTool(functionTool);
      return Response.redirect(new URL("/function-tools", req.url), 303);
    } else {
      const errors = parseResult.error.format();
      return ctx.render({
        formData,
        errors,
      }, { status: 400 });
    }
  },
};

export default function CreateFunctionToolPage(
  { data: { formData, errors } }: PageProps<PagePropsData>,
) {
  return (
    <form action="" method="post">
      <h2 className="text-center">Create a new Function Tool</h2>
      <label htmlFor="name-input">
        Name
        <input
          id="name-input"
          name="name"
          type="text"
          placeholder="Function_Name"
          max={64}
          required
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
          id="description-input"
          name="description"
          placeholder="A description of what the function does."
          cols={80}
          rows={2}
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
      <label htmlFor="parameters">
        Parameters
        <textarea
          id="parameters-input"
          name="parameters"
          placeholder={`{"type": "string"}`}
          cols={80}
          rows={5}
          defaultValue={formData?.get("parameters")?.toString()}
          aria-invalid={errors?.parameters?._errors.length ? true : undefined}
          aria-describedby={errors?.parameters?._errors.length
            ? "parameters-error"
            : undefined}
        />
        {!!errors?.parameters?._errors.length && (
          <small id="parameters-error">
            {errors.parameters._errors.join(" | ")}
          </small>
        )}
      </label>
      <label htmlFor="script">
        Script
        <textarea
          id="script-input"
          name="script"
          placeholder={`console.log("Hello world.");`}
          cols={80}
          rows={5}
          defaultValue={formData?.get("script")?.toString()}
          aria-invalid={errors?.script?._errors.length ? true : undefined}
          aria-describedby={errors?.script?._errors.length
            ? "script-error"
            : undefined}
        />
        {!!errors?.script?._errors.length && (
          <small id="script-error">
            {errors.script._errors.join(" | ")}
          </small>
        )}
      </label>
      <button type="submit">Create!</button>
    </form>
  );
}
