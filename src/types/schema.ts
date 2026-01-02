// Types based on docs/schema.json

export type Lane = {
  id: string;
  name: string;
  description: string;
  tags: string[];
};

export type Figure = {
  id: string;
  name: string;
  primary_lane_id: string;
  secondary_lane_id: string;
  tags: string[];
  vignette: string;
  tradeoff: string;
  why_it_matches_template: string;
};

export type CardSide = {
  title: string;
  body: string;
  lane_ids: string[];
  tags: string[];
};

export type Card = {
  id: string;
  type: "lane_scenario" | "figure_shadow";
  left: CardSide;
  right: CardSide;
};

export type HistoryEntry = {
  card_id: string;
  picked: "left" | "right";
  timestamp_iso: string;
};

export type Convergence = {
  top_lane_id: string;
  runner_up_lane_id: string;
  rating_gap: number;
  confidence_pct: number;
};

export type RunState = {
  round: number;
  max_rounds: number;
  lane_ratings: Record<string, number>;
  history: HistoryEntry[];
  convergence?: Convergence;
};

export type NorthStarFigure = {
  figure_id: string;
  why: string;
};

export type Result = {
  primary_lane_id: string;
  primary_confidence_pct: number;
  runner_up_lane_id: string;
  runner_up_confidence_pct: number;
  why_you_matched: string[];
  north_star_figures: NorthStarFigure[];
  quest_7_day: {
    artifacts: string[];
    outreach_actions: string[];
    reflection_prompt: string;
  };
};


