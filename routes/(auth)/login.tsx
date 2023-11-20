import { Handlers, PageProps } from "$fresh/server.ts";
import { z } from "zod";
import { env } from "../../utils/env.ts";

const loginSchema = z.object({
  username: z.string().trim().min(1),
  password: z.string().min(6),
  remember: z.coerce.boolean(),
});

class InvalidCredentialError extends Error {}

export const handler: Handlers<LoginPageData> = {
  GET(req, ctx) {
    return ctx.render({});
  },
  async POST(req, ctx) {
    const formData = await req.formData();
    try {
      const { username, password } = loginSchema.parse(
        Object.fromEntries(formData),
      );
      if (
        username === env.WEB_ADMIN_USERNAME &&
        password === env.WEB_ADMIN_PASSWORD
      ) {
        return new Response(null, {
          status: 302,
          headers: { "Location": "/" },
        });
      }
      throw new InvalidCredentialError();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.format();
        return ctx.render({ formData, errors }, { status: 400 });
      }
      if (error instanceof InvalidCredentialError) {
        return ctx.render({ formData }, { status: 401 });
      }
      throw error;
    }
  },
};

type LoginPageData = {
  formData?: FormData;
  errors?: z.ZodFormattedError<
    { username: string; password: string; remember: boolean }
  >;
};

export default function LoginPage(
  { data: { formData, errors } }: PageProps<LoginPageData>,
) {
  return (
    <>
      <hgroup>
        <h1>Login</h1>
        <p>
          Please login using <em>username</em> and <em>password</em>.
        </p>
      </hgroup>
      <form method="POST">
        <input
          type="text"
          name="username"
          id="username-input"
          autocomplete="username"
          placeholder="admin"
          value={formData?.get("username")?.toString()}
          aria-invalid={errors?.username && true}
          required
        />
        {errors?.username?._errors.map((err) => (
          <small className="danger">{err}</small>
        ))}
        <input
          type="password"
          name="password"
          id="password-input"
          autocomplete="current-password"
          placeholder="* * * * *"
          value={formData?.get("password")?.toString()}
          aria-invalid={errors?.password && true}
          required
        />
        {errors?.password?._errors.map((err) => (
          <small className="danger">{err}</small>
        ))}
        <fieldset>
          <label htmlFor="remember-input">
            <input
              type="checkbox"
              role="switch"
              id="remember-input"
              name="remember"
              value="on"
              checked={!!formData?.get("remember")}
            />
            Remember me
          </label>
        </fieldset>
        <button type="submit" className="contrast">Login</button>
      </form>
      <a href="/reset-password">Forget password?</a>
    </>
  );
}
