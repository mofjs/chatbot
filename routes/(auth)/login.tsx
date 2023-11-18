import { defineRoute } from "$fresh/server.ts";

export default defineRoute((req, ctx) => {
  return (
    <>
      <hgroup>
        <h1>Login</h1>
        <p>
          Please login using <em>username</em> and <em>password</em>.
        </p>
      </hgroup>
      <form action="">
        <input
          type="text"
          name="username"
          id="username-input"
          autocomplete="username"
          placeholder="admin"
          required
        />
        <input
          type="password"
          name="password"
          id="password-input"
          autocomplete="current-password"
          placeholder="* * * * *"
          required
        />
        <fieldset>
          <label htmlFor="remember-input">
            <input
              type="checkbox"
              role="switch"
              id="remember-input"
              name="remember"
            />
            Remember me
          </label>
        </fieldset>
        <button type="submit" className="contrast">Login</button>
      </form>
      <a href="/reset-password">Forget password?</a>
    </>
  );
});
