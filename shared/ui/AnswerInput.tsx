"use client";

import { useMemo, useRef, useState } from "react";
import { suggest, type MatchIndex } from "../matcher";

// Text input with suggestions while typing (Country Guess, Rare/Common Answers).
export function AnswerInput({
  index,
  onSubmit,
  placeholder,
  submitLabel,
  disabled,
  autoFocus,
  showSuggestions = true,
}: {
  index?: MatchIndex;
  onSubmit: (text: string) => void;
  placeholder: string;
  submitLabel: string;
  disabled?: boolean;
  autoFocus?: boolean;
  showSuggestions?: boolean;
}) {
  const [value, setValue] = useState("");
  const [active, setActive] = useState(-1);
  const ref = useRef<HTMLInputElement>(null);
  const items = useMemo(
    () => (index && showSuggestions ? suggest(index, value, 6) : []),
    [index, value, showSuggestions],
  );

  function send(text: string) {
    const v = text.trim();
    if (!v || disabled) return;
    onSubmit(v);
    setValue("");
    setActive(-1);
    ref.current?.focus();
  }

  return (
    <form
      className="answer-input"
      onSubmit={(e) => {
        e.preventDefault();
        send(active >= 0 && items[active] ? items[active].display : value);
      }}
    >
      <div className="row gap">
        <input
          ref={ref}
          className="input"
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="send"
          onChange={(e) => {
            setValue(e.target.value);
            setActive(-1);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActive((a) => Math.min(items.length - 1, a + 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((a) => Math.max(-1, a - 1));
            }
          }}
          aria-autocomplete="list"
        />
        <button className="btn primary" type="submit" disabled={disabled || !value.trim()}>
          {submitLabel}
        </button>
      </div>
      {items.length > 0 && (
        <ul className="suggestions" role="listbox">
          {items.map((it, i) => (
            <li key={it.id + it.display}>
              <button
                type="button"
                className={i === active ? "active" : ""}
                onClick={() => send(it.display)}
                role="option"
                aria-selected={i === active}
              >
                {it.display}
              </button>
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}
