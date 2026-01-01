export type Lane = {
  id: string;
  name: string;
  description: string;
  tags: string[];
};

export type CardSide = {
  title: string;
  body: string;
  lane_ids: string[];
  tags: string[];
};

export type CardType = "lane_scenario" | "figure_shadow";

export type Card = {
  id: string;
  type: CardType;
  left: CardSide;
  right: CardSide;
};

export type RunHistoryItem = {
  card_id: string;
  picked: "left" | "right";
  timestamp_iso: string;
};

export type RunState = {
  round: number;
  max_rounds: number;
  lane_ratings: Record<string, number>;
  history: RunHistoryItem[];
  convergence: {
    top_lane_id: string;
    runner_up_lane_id: string;
    rating_gap: number;
    confidence_pct: number;
  };
};

