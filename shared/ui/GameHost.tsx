"use client";

import { useCallback, useState } from "react";
import { CLIENTS } from "@/games/clients";
import { METAS } from "@/games/metas";
import { parseVariant, type FinishResult, type GameId } from "../game";
import { useLang } from "./lang";
import { ResultPanel } from "./ResultPanel";
import { recordLocalPlay } from "./local-streak";
import { ResultExtras } from "./ResultExtras";

export function GameHost({
  game,
  puzzle,
  puzzleId,
  day,
  variant,
  existing,
}: {
  game: GameId;
  puzzle: unknown;
  puzzleId: string;
  day: string;
  variant: string;
  existing: FinishResult | null;
}) {
  const { lang, t } = useLang();
  const [result, setResult] = useState<FinishResult | null>(existing);
  const [error, setError] = useState<string | null>(null);
  const { Component, share, ResultBody } = CLIENTS[game];
  const meta = METAS[game];

  const onFinish = useCallback(
    async (payload: unknown): Promise<FinishResult | { error: string }> => {
      try {
        const res = await fetch("/api/results", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ game, day, variant, payload }),
        });
        const data = (await res.json()) as FinishResult | { error: string };
        if ("error" in data) setError(data.error);
        else {
          setResult(data);
          if (!data.isCatchUp) recordLocalPlay(game, day);
        }
        return data;
      } catch {
        setError(t.error);
        return { error: t.error };
      }
    },
    [game, day, variant, t.error],
  );

  return (
    <div className="game-host">
      {!existing && (
        <Component
          puzzle={puzzle as never}
          puzzleId={puzzleId}
          day={day}
          variant={parseVariant(variant)}
          lang={lang}
          onFinish={onFinish}
        />
      )}
      {error && <p className="error">{error}</p>}
      {result && (
        <ResultPanel
          meta={meta}
          result={result}
          day={day}
          shareBody={share(result.details, lang)}
          extra={<ResultExtras game={game} day={day} result={result} />}
        >
          {ResultBody && <ResultBody day={day} variant={variant} result={result} lang={lang} />}
        </ResultPanel>
      )}
    </div>
  );
}
