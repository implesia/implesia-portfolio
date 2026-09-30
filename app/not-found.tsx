import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Not found — Tushar Hossen",
};

// Not a <main>: the root layout starts <html> gated, and `html.gated main` stays hidden until the gate opens.
export default function NotFound() {
  return (
    <div className="lost" role="main">
      <p className="index">404 — Off the map</p>
      <h1>
        Lost in the <em>storm.</em>
      </h1>
      <p className="lost-note">This page does not exist. The rest of the site does.</p>
      <a className="btn btn-solid" href="/">
        Take me back
      </a>
    </div>
  );
}
