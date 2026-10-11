import { Link } from "react-router";

export const meta = () => [
  { title: "Privacy - personality-test" },
  {
    content:
      "This site keeps your answers in your browser. No account, no upload, and no server-side storage of answers.",
    name: "description",
  },
];

const Privacy = () => (
  <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 p-4 py-10">
    <header className="flex flex-col gap-3">
      <h1 className="font-heading text-3xl font-semibold tracking-tight">
        Privacy
      </h1>
      <p className="text-muted-foreground max-w-prose text-pretty">
        Your answers stay in your browser. There is no account, no upload, and
        no server-side copy.
      </p>
    </header>

    <section className="flex flex-col gap-3">
      <h2 className="font-heading text-xl font-semibold tracking-tight">
        What is stored, and where
      </h2>
      <ul className="flex max-w-prose list-disc flex-col gap-2 pl-5">
        <li>
          Your answers and your finished results are stored in this browser, in
          local storage. They are not uploaded.
        </li>
        <li>There is no account, no email address, and no login.</li>
        <li>
          Clearing the site data in your browser deletes everything this site
          stored.
        </li>
      </ul>
    </section>

    <section className="flex flex-col gap-3">
      <h2 className="font-heading text-xl font-semibold tracking-tight">
        Sharing a result
      </h2>
      <p className="max-w-prose">
        A share link carries the result inside the part of the address after the{" "}
        <code>#</code> symbol. A browser never sends that part to a server, so
        the result stays between you and the person you send it to.
      </p>
      <p className="text-muted-foreground max-w-prose">
        Treat a share link like a private key. Anyone who has the link can read
        the result.
      </p>
    </section>

    <section className="flex flex-col gap-3">
      <h2 className="font-heading text-xl font-semibold tracking-tight">
        Analytics
      </h2>
      <p className="max-w-prose">
        The site runs no advertising and no cross-site tracking. Page counts, if
        added later, will come from a cookieless analytics service, and this
        page will say so before it is switched on.
      </p>
    </section>

    <section className="flex flex-col gap-3">
      <h2 className="font-heading text-xl font-semibold tracking-tight">
        What the site can see
      </h2>
      <p className="max-w-prose">
        Like any website, the host records the request that serves a page. That
        record covers the page address, not your answers. Because answers never
        leave the browser, they are absent from every server log.
      </p>
    </section>

    <p>
      <Link className="underline underline-offset-4" to="/">
        Back to the tests
      </Link>
    </p>
  </main>
);

export default Privacy;
