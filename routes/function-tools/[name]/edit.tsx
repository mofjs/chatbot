import { Handlers, PageProps } from "$fresh/server.ts";
import { z } from "zod";
import {
  FunctionTool,
  functionToolSchema,
  setFunctionTool,
} from "~/utils/function-tool.ts";
import CodeEditor from "~/islands/CodeEditor.tsx";

const editFunctionToolSchema = functionToolSchema.omit({ name: true });

type ContextState = {
  functionTool: FunctionTool;
};

type PagePropsData = {
  formData?: FormData;
  errors?: z.ZodFormattedError<z.input<typeof editFunctionToolSchema>>;
};

export const handler: Handlers<PagePropsData, ContextState> = {
  GET(_req, ctx) {
    return ctx.render({});
  },
  async POST(req, ctx) {
    const formData = await req.formData();
    const parseResult = await editFunctionToolSchema.spa(
      Object.fromEntries(formData),
    );
    if (parseResult.success) {
      await setFunctionTool({
        name: ctx.state.functionTool.name,
        ...parseResult.data,
      });
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

export default function EditFunctionToolPage(
  { data: { formData, errors }, state: { functionTool } }: PageProps<
    PagePropsData,
    ContextState
  >,
) {
  return (
    <form action="" method="post">
      <h2 className="text-center">Edit Function Tool</h2>
      <label htmlFor="name-input">
        Name
        <input
          id="name-input"
          name="name"
          type="text"
          placeholder="Function_Name"
          max={64}
          defaultValue={functionTool.name}
          disabled
        />
      </label>
      <label htmlFor="description-input">
        Description
        <textarea
          id="description-input"
          name="description"
          placeholder="A description of what the function does."
          cols={80}
          rows={2}
          defaultValue={formData?.get("description")?.toString() ??
            functionTool.description}
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
      <label htmlFor="parameters-input">
        Parameters
        <CodeEditor
          id="parameters-input"
          name="parameters"
          placeholder={`{"type": "string"}`}
          cols={80}
          rows={5}
          defaultValue={formData?.get("parameters")?.toString() ??
            JSON.stringify(functionTool.parameters, undefined, 4)}
          aria-invalid={errors?.parameters?._errors.length ? true : undefined}
          aria-describedby={errors?.parameters?._errors.length
            ? "parameters-error"
            : undefined}
          language="json"
        />
        {!!errors?.parameters?._errors.length && (
          <small id="parameters-error">
            {errors.parameters._errors.join(" | ")}
          </small>
        )}
      </label>
      <label htmlFor="script-input">
        Script
        <CodeEditor
          id="script-input"
          name="script"
          placeholder={`console.log("Hello world.");`}
          cols={80}
          rows={5}
          defaultValue={formData?.get("script")?.toString() ??
            functionTool.script}
          aria-invalid={errors?.script?._errors.length ? true : undefined}
          aria-describedby={errors?.script?._errors.length
            ? "script-error"
            : undefined}
          language="typescript"
        />
        {!!errors?.script?._errors.length && (
          <small id="script-error">
            {errors.script._errors.join(" | ")}
          </small>
        )}
      </label>
      <button type="submit">Edit!</button>
    </form>
  );
}
