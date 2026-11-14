"use client";

import { useState } from "react";
import { absolute } from "../site";

/** Copies text (or, if `relative` is given, the public site address + that path). */
export function CopyButton({ text, label, done, relative }: { text: string; label: string; done: string; relative?: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      className="btn ghost small"
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(relative ? absolute(relative) : text);
          setOk(true);
          setTimeout(() => setOk(false), 1500);
        } catch {
          /* clipboard blocked */
        }
      }}
    >
      {ok ? done : label}
    </button>
  );
}
