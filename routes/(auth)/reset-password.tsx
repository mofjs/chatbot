import { defineRoute } from "$fresh/server.ts";

export default defineRoute(() => {
  return (
    <>
      <hgroup>
        <h1>Reset Password</h1>
        <p>Enter your email address to reset your password.</p>
      </hgroup>
      <form action="/reset-password" method="post">
        <input
          type="email"
          name="email"
          id="email-input"
          autocomplete="email"
          placeholder="admin@mof.js"
          required
        />
        <button type="submit" className="contrast">Send Reset Link</button>
      </form>
    </>
  );
});
