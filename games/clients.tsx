"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import type { FinishResult, GameClientProps, GameId, Lang } from "@/shared/game";
import { WordResultBody } from "./word/results";
import { shareText as wordShare } from "./word/share";
import { shareText as countryShare } from "./country/share";
import { shareText as crosswordShare } from "./crossword/share";
import { shareText as rareShare } from "./rare/share";
import { shareText as commonShare } from "./common/share";

type Client = {
  Component: ComponentType<GameClientProps<never>>;
  share: (details: Record<string, unknown>, lang: Lang) => string;
  /** Optional extra block on the results screen (e.g. Word's guess distribution). */
  ResultBody?: ComponentType<{ day: string; variant: string; result: FinishResult; lang: Lang }>;
};

const load = (fn: () => Promise<{ default: ComponentType<GameClientProps<never>> }>) =>
  dynamic(fn, { ssr: false, loading: () => <p className="muted">…</p> });

export const CLIENTS: Record<GameId, Client> = {
  word: { Component: load(() => import("./word/client")), share: wordShare, ResultBody: WordResultBody },
  country: { Component: load(() => import("./country/client")), share: countryShare },
  crossword: { Component: load(() => import("./crossword/client")), share: crosswordShare },
  rare: { Component: load(() => import("./rare/client")), share: rareShare },
  common: { Component: load(() => import("./common/client")), share: commonShare },
};
