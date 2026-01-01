"use client";

import { useEffect, useMemo, useState } from "react";
import { CARDS } from "@/data/cards";
import type { Card, RunState } from "@/types/schema";
import {
  createEmptyRunState,
  readRunStateFromStorage,
  writeRunStateToStorage,
} from "@/lib/runState";
import styles from "./play.module.css";

export default function PlayPage() {
  const card: Card = useMemo(() => CARDS[0], []);
  const [runState, setRunState] = useState<RunState>(() => createEmptyRunState());

  useEffect(() => {
    const existing = readRunStateFromStorage();
    if (existing) return;

    const fresh = createEmptyRunState();
    writeRunStateToStorage(fresh);
    console.log("[runState] initialized", fresh);
  }, []);

  function onPick(picked: "left" | "right") {
    const base = readRunStateFromStorage() ?? runState;

    const next: RunState = {
      ...base,
      round: Math.min(base.round + 1, base.max_rounds),
      history: [
        ...base.history,
        {
          card_id: card.id,
          picked,
          timestamp_iso: new Date().toISOString(),
        },
      ],
    };

    writeRunStateToStorage(next);
    setRunState(next);
    console.log("[runState] updated", next);
  }

  const round = runState.round;
  const maxRounds = runState.max_rounds;
  const progressPct = Math.max(
    0,
    Math.min(100, Math.round((round / maxRounds) * 100))
  );

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.roundText}>Round {round}/{maxRounds}</div>
        <div
          className={styles.progressTrack}
          aria-label="Progress"
          role="progressbar"
          aria-valuenow={progressPct}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className={styles.progressFill}
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </header>

      <main className={styles.main}>
        <button
          type="button"
          className={styles.choiceCard}
          onClick={() => onPick("left")}
        >
          <div className={styles.choiceTitle}>{card.left.title}</div>
          <div className={styles.choiceBody}>{card.left.body}</div>
          <div className={styles.choiceHint}>Tap left</div>
        </button>

        <button
          type="button"
          className={styles.choiceCard}
          onClick={() => onPick("right")}
        >
          <div className={styles.choiceTitle}>{card.right.title}</div>
          <div className={styles.choiceBody}>{card.right.body}</div>
          <div className={styles.choiceHint}>Tap right</div>
        </button>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerText}>
          Tapping either card appends to localStorage history (no scoring yet).
        </div>
      </footer>
    </div>
  );
}

