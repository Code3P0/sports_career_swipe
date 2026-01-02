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
  statement_id?: string; // New format
  lane_id?: string; // New format
  answer?: "yes" | "no" | "meh" | "skip"; // New format
  card_id?: string; // Legacy format
  picked?: "left" | "right"; // Legacy format
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
  // Adaptive tracking fields
  seen_statement_ids?: string[];
  lane_counts_shown?: Record<string, number>;
  answer_counts?: {
    yes: number;
    no: number;
    skip: number;
  };
  // Current statement persistence (for deterministic undo)
  current_statement_id?: string | null;
  // Deterministic presented stack (new in schema v2)
  presented_statement_ids?: string[]; // Ordered list of statements user has seen
  // Schema version for migration
  schema_version?: number;
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


