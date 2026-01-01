import type { Card } from "@/types/schema";

export const CARDS = [
  {
    id: "card_001_sponsor_churn_vs_activation_redesign",
    type: "lane_scenario",
    left: {
      title: "Renegotiate the renewal",
      body: "A sponsor is about to churn. You jump into the renewal call, tighten terms, and secure the signature.",
      lane_ids: ["partnerships_sponsorships"],
      tags: ["renewals", "sales", "relationship"],
    },
    right: {
      title: "Redesign the activation",
      body: "You rework the activation plan so it drives measurable impact, then pitch the new plan to keep them.",
      lane_ids: ["partnerships_sponsorships", "product_fan_experience"],
      tags: ["activation", "measurement", "fan-experience"],
    },
  },
  {
    id: "card_002_series_format_vs_distribution_plan",
    type: "lane_scenario",
    left: {
      title: "Choose the series format",
      body: "You pick a repeatable format that can ship weekly and build a loyal audience.",
      lane_ids: ["media_content_strategy"],
      tags: ["formats", "programming"],
    },
    right: {
      title: "Build the distribution plan",
      body: "You map channels, timing, and hooks to drive reach and consistent viewership.",
      lane_ids: ["media_content_strategy", "growth_ticketing_crm"],
      tags: ["distribution", "growth", "channels"],
    },
  },
  {
    id: "card_003_event_ops_vs_membership_program",
    type: "lane_scenario",
    left: {
      title: "Run the live event",
      body: "You coordinate vendors, staffing, and day-of ops so everything runs on time.",
      lane_ids: ["community_membership_events"],
      tags: ["events", "ops", "logistics"],
    },
    right: {
      title: "Design the membership program",
      body: "You plan benefits, tiers, and cadence that keeps the community engaged year-round.",
      lane_ids: ["community_membership_events", "growth_ticketing_crm"],
      tags: ["membership", "retention", "programming"],
    },
  },
  {
    id: "card_004_pricing_test_vs_crm_retention",
    type: "lane_scenario",
    left: {
      title: "Run a pricing experiment",
      body: "You design an A/B test on ticket bundles and monitor conversion and revenue.",
      lane_ids: ["growth_ticketing_crm"],
      tags: ["pricing", "experiments", "funnels"],
    },
    right: {
      title: "Improve retention in CRM",
      body: "You segment fans, refine messaging, and reduce churn with smarter cadence.",
      lane_ids: ["growth_ticketing_crm"],
      tags: ["crm", "retention", "segmentation"],
    },
  },
  {
    id: "card_005_compliance_fire_drill_vs_relationships",
    type: "lane_scenario",
    left: {
      title: "Solve the compliance fire drill",
      body: "A last-minute NIL issue pops up. You verify rules and get everyone aligned fast.",
      lane_ids: ["nil_college_ops"],
      tags: ["compliance", "rules", "coordination"],
    },
    right: {
      title: "Manage the relationships",
      body: "You keep athletes, staff, and partners in sync through proactive communication.",
      lane_ids: ["nil_college_ops", "partnerships_sponsorships"],
      tags: ["relationships", "communication", "trust"],
    },
  },
  {
    id: "card_006_creator_deal_terms_vs_launch_rollout",
    type: "lane_scenario",
    left: {
      title: "Negotiate deal terms",
      body: "You hammer out deliverables, usage rights, and win-win incentives.",
      lane_ids: ["talent_creator_partnerships"],
      tags: ["negotiation", "deal-terms", "contracts"],
    },
    right: {
      title: "Plan the launch rollout",
      body: "You coordinate content, timeline, and partners so the collab lands cleanly.",
      lane_ids: ["talent_creator_partnerships", "media_content_strategy"],
      tags: ["launch", "coordination", "content"],
    },
  },
  {
    id: "card_007_operating_cadence_vs_problem_framing",
    type: "lane_scenario",
    left: {
      title: "Set the operating cadence",
      body: "You define meetings, metrics, and owners so work moves every week.",
      lane_ids: ["bizops_strategy"],
      tags: ["cadence", "ops", "execution"],
    },
    right: {
      title: "Frame the problem clearly",
      body: "You synthesize inputs into a crisp question and align the team on tradeoffs.",
      lane_ids: ["bizops_strategy"],
      tags: ["problem-framing", "alignment", "tradeoffs"],
    },
  },
  {
    id: "card_008_user_research_vs_ship_feature",
    type: "lane_scenario",
    left: {
      title: "Do quick user research",
      body: "You talk to fans and watch them use the product to find friction.",
      lane_ids: ["product_fan_experience"],
      tags: ["research", "insights", "ux"],
    },
    right: {
      title: "Ship the next feature",
      body: "You scope the smallest version, build it, and get it in users’ hands.",
      lane_ids: ["product_fan_experience"],
      tags: ["shipping", "iteration", "delivery"],
    },
  },
  {
    id: "card_009_shadow_sponsorship_lead_vs_shadow_growth_manager",
    type: "figure_shadow",
    left: {
      title: "Shadow a sponsorship lead",
      body: "Back-to-back calls, packaging inventory, and turning “maybe” into “yes.”",
      lane_ids: ["partnerships_sponsorships"],
      tags: ["relationship", "sales", "packaging"],
    },
    right: {
      title: "Shadow a growth manager",
      body: "Dashboards, experiments, and tuning the funnel until conversion moves.",
      lane_ids: ["growth_ticketing_crm"],
      tags: ["metrics", "experiments", "funnels"],
    },
  },
  {
    id: "card_010_shadow_content_strategist_vs_shadow_product_manager",
    type: "figure_shadow",
    left: {
      title: "Shadow a content strategist",
      body: "Plan formats, refine hooks, and ship a schedule that compounds attention.",
      lane_ids: ["media_content_strategy"],
      tags: ["programming", "formats", "distribution"],
    },
    right: {
      title: "Shadow a product manager",
      body: "Talk to users, write a lightweight spec, and ship an improvement by Friday.",
      lane_ids: ["product_fan_experience"],
      tags: ["product", "ux", "shipping"],
    },
  },
] satisfies Card[];

