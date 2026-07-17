import { z } from 'zod';

/**
 * The Unit schema — the content model from the seed §3 / handoff §4.
 * This is the single shape the whole app consumes. Content is validated
 * against it at build time; invalid or duplicate ids fail the build
 * (acceptance criterion §9.9).
 */

export const UNIT_TYPES = [
  'concept',
  'procedure',
  'guardrail',
  'antipattern',
  'decision',
  'runbook',
  'glossary',
  'culture',
] as const;

export const TIERS = ['all', 'admin', 'product-design', 'engineer'] as const;

export const FORMATS = ['card', 'carousel', 'story', 'reel'] as const;

// Deploy classes (seed §3, v0.3) — the one axis on which deployment content
// branches. A unit's `appliesTo` names the class(es) it's relevant to.
export const DEPLOY_CLASSES = ['container-image', 'managed-source'] as const;

export const UnitTypeEnum = z.enum(UNIT_TYPES);
export const TierEnum = z.enum(TIERS);
export const FormatEnum = z.enum(FORMATS);
export const DeployClassEnum = z.enum(DEPLOY_CLASSES);
export const LevelEnum = z.union([z.literal(1), z.literal(2), z.literal(3)]);

export const CarouselSlideSchema = z.object({
  heading: z.string(),
  body: z.string(),
});

export const UnitSchema = z
  .object({
    id: z.string().min(1),
    title: z.string().min(1),
    type: UnitTypeEnum,
    tier: TierEnum,
    level: LevelEnum,
    topics: z.array(z.string()).default([]),
    format: FormatEnum,
    collection: z.string().min(1),
    prereqs: z.array(z.string()).default([]),
    related: z.array(z.string()).default([]),

    // Deploy-class relevance tag (seed §3, v0.3). Omitted = universal (shown to
    // everyone). Filtering by this is relevance-by-deployment-context, NOT the
    // seed-prohibited "learning style" routing.
    appliesTo: z.array(DeployClassEnum).optional(),

    // Authored sequence index from the seed — preserves the intended order
    // within a level (the file layer is otherwise read alphabetically).
    order: z.number().int().default(0),

    hook: z.string().min(1),
    body: z.string().default(''),
    carousel: z.array(CarouselSlideSchema).optional(),
    visual: z.string().optional(),
    next: z.string().optional(),

    // Retrieval fields — turn each unit into a test item (seed §3, v0.2).
    // Optional: not every unit has them yet (seed §9). Render gracefully when absent.
    prompt: z.string().optional(),
    answer: z.string().optional(),
    distractors: z.array(z.string()).optional(),
    misconception: z.string().optional(),
  })
  .strict();

export type UnitType = (typeof UNIT_TYPES)[number];
export type Tier = (typeof TIERS)[number];
export type Format = (typeof FORMATS)[number];
export type DeployClass = (typeof DEPLOY_CLASSES)[number];
export type Level = 1 | 2 | 3;
export type CarouselSlide = z.infer<typeof CarouselSlideSchema>;
export type Unit = z.infer<typeof UnitSchema>;

/**
 * A collection = a Highlight (seed §4). id/title/tier/order come from the
 * seed; colour/letter are this design system's identity for the collection.
 */
export const CollectionSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  tier: z.array(TierEnum),
  order: z.number().int(),
});

export type SeedCollection = z.infer<typeof CollectionSchema>;

export interface Collection extends SeedCollection {
  color: string;
  letter: string;
}
