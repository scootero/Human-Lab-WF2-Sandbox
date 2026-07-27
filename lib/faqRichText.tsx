import type { ReactNode } from "react";

/**
 * Renders FAQ answers with a single safe link syntax for controlled app-package copy:
 *   [Privacy Policy](/privacy)
 *
 * Allowed hrefs: site-relative paths starting with `/` (letters, digits, `/`, `_`, `-` only).
 * No HTML, no images, no unrestricted markdown.
 */
const LINK_RE = /\[([^\]]+)\]\((\/[a-zA-Z0-9/_-]*)\)/g;

function isSafeHref(href: string): boolean {
  return /^\/[a-zA-Z0-9/_-]*$/.test(href);
}

export function renderFaqAnswer(answer: string): ReactNode {
  if (!answer) return null;

  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  const re = new RegExp(LINK_RE.source, "g");

  while ((match = re.exec(answer)) !== null) {
    const [full, label, href] = match;
    if (match.index > lastIndex) {
      nodes.push(answer.slice(lastIndex, match.index));
    }
    if (isSafeHref(href)) {
      nodes.push(
        <a
          key={`${match.index}-${href}`}
          href={href}
          className="underline underline-offset-2 transition-colors hover:text-[var(--foreground)]"
        >
          {label}
        </a>
      );
    } else {
      nodes.push(full);
    }
    lastIndex = match.index + full.length;
  }

  if (lastIndex < answer.length) {
    nodes.push(answer.slice(lastIndex));
  }

  return nodes.length ? nodes : answer;
}
