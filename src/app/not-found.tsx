import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";

/** Keep this route server-renderable: no event handlers or dynamic href props. */
export default function NotFound() {
  return (
    <section className="not-found shell">
      <span className="not-found-icon"><Sparkles size={30} aria-hidden="true" /></span>
      <span className="eyebrow">404 · LOST IN THE CLOUDS</span>
      <h1>This page took<br /><span>a little detour.</span></h1>
      <p>Looks like the page you’re looking for isn’t here.</p>
      <Link href="/" className="button button-pink"><ArrowLeft size={16} aria-hidden="true" /> Back home</Link>
    </section>
  );
}
