import type { Lane } from "@/types/schema";

export const LANES = [
  {
    id: "partnerships_sponsorships",
    name: "Partnerships / Sponsorships",
    description: "Sell, package, and renew sponsor partnerships and activations.",
    tags: ["sales", "relationship", "activation", "renewals"],
  },
  {
    id: "media_content_strategy",
    name: "Media / Content Strategy",
    description: "Pick formats, programming, and distribution to grow audience.",
    tags: ["programming", "distribution", "formats", "storytelling"],
  },
  {
    id: "community_membership_events",
    name: "Community / Membership / Events",
    description: "Build community through programming, events, and operations.",
    tags: ["community", "events", "ops", "membership"],
  },
  {
    id: "growth_ticketing_crm",
    name: "Growth / Ticketing / CRM",
    description: "Design funnels, pricing, and retention loops for fans.",
    tags: ["growth", "pricing", "crm", "retention"],
  },
  {
    id: "nil_college_ops",
    name: "NIL / College Athletics Ops",
    description: "Execute within rules while managing relationships and logistics.",
    tags: ["compliance", "operations", "relationships", "college"],
  },
  {
    id: "talent_creator_partnerships",
    name: "Talent / Creator Partnerships",
    description: "Align talent, negotiate terms, and roll out creator deals.",
    tags: ["talent", "deals", "negotiation", "launch"],
  },
  {
    id: "bizops_strategy",
    name: "BizOps / Strategy",
    description: "Frame problems, set cadence, and drive cross-functional execution.",
    tags: ["strategy", "execution", "systems", "cross-functional"],
  },
  {
    id: "product_fan_experience",
    name: "Product / Fan Experience",
    description: "Ship fan-facing features backed by user research and iteration.",
    tags: ["product", "ux", "research", "shipping"],
  },
] satisfies Lane[];

