import { defineRoute } from "$fresh/src/server/defines.ts";

export default defineRoute((req, ctx) => {
  return (
    <>
      <a role="button" href="/assistants/create">Create new Assistant.</a>
      <table>
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Name & Description</th>
            <th scope="col">CreatedAt</th>
          </tr>
        </thead>
        <tbody>
          {}
          {}
        </tbody>
      </table>
    </>
  );
});
