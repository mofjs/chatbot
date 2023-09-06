import { defineRoute } from "$fresh/server.ts";

export default defineRoute((req, ctx) => {
  return (
    <article className="grid">
      <div>
        <hgroup>
          <h1>Login</h1>
          <p>
            Silakan masuk menggunakan <em>username</em> dan <em>password</em>.
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
              Ingat saya
            </label>
          </fieldset>
          <button type="submit" className="contrast">Login</button>
        </form>
      </div>
      <div></div>
    </article>
  );
});
