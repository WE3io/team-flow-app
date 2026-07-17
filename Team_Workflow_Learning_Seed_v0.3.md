# Team Workflow Learning Seed — v0.3

**Purpose.** A single, structured source of truth for a team's Git / trunk-based workflow, AI-assisted coding practice, and how work ships. Every downstream format — the snackable mobile platform first, others later — is *rendered from this seed*. Each idea is authored once here; a team picks the units and format needed for each situation.

**What changed in v0.3.** De-branded the whole seed for use by any team: removed first-person/consulting voice throughout (the Purpose, the §1 Goal, the IA table, and units including `sh-what-why` and `sh-ai-tools`); tools now appear only as neutral examples. Introduced **deploy classes** as the single branching axis — `container-image` and `managed-source` — and a new optional, enum-constrained schema field `appliesTo` (§3) that composes with `tier` as relevance filtering (explicitly not learning-style routing). Reframed `eng-ghcr` and `eng-coolify-singleimage` from one platform's specifics to principles and tagged them `[container-image]` (ids unchanged, per the stable-slug rule); genericised `eng-pipeline` into a class-agnostic spine that points to the class units; added a new unit `eng-managed-source`. Reworded `break-neverdo` and `break-escalate` from asserted environment ("we've disabled force-push", "branch protection stops it") to recommended/conditional phrasing — which also removes false confidence for teams that haven't configured those yet. §6 governance and the Leitner scheduler are unchanged.

**Status.** The content model, information architecture, Instagram-primitive mapping, and design governance are complete. Twenty-five units are written — one complete learning path plus at least one example of every type and format, now including both deploy classes. The remaining units are listed, unwritten, in the Population Manifest.

**A note on correctness.** This seed teaches the *improved* workflow, not the first-draft guide it grew out of. Where the original said "never look at code, only the preview," or implied a formatter makes code safe, or told people to paste Git errors into an AI and run whatever it suggests, this corrects those.

---

## 1. Goal & Inclusion Standard

This section is the acceptance test. Nothing enters the seed without passing it. It exists so content can be verified *before* inclusion rather than curated after bloat.

### The outcome this document serves

**Ultimately:** to enable every member of a mixed-skill team — non-technical admin through senior engineer — to *adopt and correctly, safely practise* a shared Git / TBD / AI-assisted workflow, each to the depth their role requires, because a team only gets the benefits by actually working this way, not by being told about it. The load-bearing words are **practise** (behaviour, not exposure), **safely** (the guardrails and escalation matter more than the happy path), and **to the depth their role requires** (tier-appropriate).

**Therefore the seed itself must be:** a single, correct, current source of truth, structured as atomic tagged units, from which any learning format can be rendered without re-authoring — and structured so the *delivered* content produces durable, applied capability rather than one-time comprehension. That last clause is why learning science is in scope at all.

### Inclusion test

A candidate earns a place only if it passes all six:

1. **Role.** It is either (a) workflow knowledge a defined tier must *know or do* — curriculum — or (b) governance of *how* that knowledge is taught, sequenced, or rendered — design governance. Neither, and it's out.
2. **Correct & current.** Accurate; reflects the improved workflow, not the flawed original; and for tool facts, verified against current sources.
3. **Tier-targeted.** A clear audience and level. Never "everyone, everything."
4. **Atomic & transformable.** One idea; fits the schema; renders to at least one format unchanged.
5. **Changes a behaviour or a decision.** Not merely interesting. This is the anti-bloat criterion — "complexity without purpose" made operational.
6. **Non-duplicative.** Replaces or links rather than repeats.

### How the learning-science findings were adjudicated

They pass under role **1(b), design governance**: they shape how units teach and how the platform delivers, so they live in §6 as build directives. They are deliberately **not** rendered as learner-facing curriculum. A team never needs to study the testing effect — the platform embodies it. The schema's retrieval fields (§3) are infrastructure under the same role.

---

## 2. Content principles

How every unit is *authored*. (Distinct from §6, which governs how the system *teaches*.)

- **One idea per unit.** If a unit needs "and," it's probably two units.
- **Lead with a hook.** The first line has to stop a thumb mid-scroll. In question-first delivery (§6) the hook and the `prompt` are usually the same sharpened line.
- **Plain language scales with audience.** Non-technical tiers use no jargon that isn't in the Glossary. Engineer-tier units can assume more.
- **Active voice, short sentences.** "Open a pull request," not "A pull request should be opened."
- **Always end with a next action or next unit.** Snackable learning is a chain, not a page.
- **British English throughout.**

---

## 3. The content model (unit schema)

Every unit is a block of structured metadata plus content. This is also the shape the platform's data layer consumes.

| Field | Meaning | Values |
|---|---|---|
| `id` | Stable slug, never changes | e.g. `flow-branch` |
| `title` | Short display title | free text |
| `type` | What kind of knowledge this is | `concept` · `procedure` · `guardrail` · `antipattern` · `decision` · `runbook` · `glossary` · `culture` |
| `tier` | Who it's for | `all` · `admin` · `product-design` · `engineer` |
| `level` | Where it sits in the learning order | `1` orientation · `2` everyday · `3` deeper |
| `topics` | Tags for search and filtering | e.g. `[branching, pr-review, ai-code]` |
| `format` | Natural render primitive | `card` · `carousel` · `story` · `reel` |
| `collection` | Curated set it belongs to (= a Highlight) | see §4 |
| `prereqs` | Units to understand first | list of `id`s |
| `related` | See-also units | list of `id`s |
| `appliesTo` | Deploy classes a unit is relevant to (omitted = universal) | optional array of `container-image` · `managed-source` |

**Content fields** that follow the metadata:

- **Hook** — the scroll-stopper. One line.
- **Body** — the content. A few sentences, or a short list.
- **Carousel** — for `format: carousel`: ordered slides, each a micro-heading plus one line.
- **Visual** — a note describing the graphic, screenshot, or (for reels) the storyboard. The brief for whoever makes the asset. Must carry information, never decoration (§6).
- **Next** — the action to take, or the unit to read next.

**Retrieval fields** (new in v0.2) — these turn each unit into a test item, so question-first delivery and quizzing render from the same source:

- **Prompt** — the unit posed as a question, shown *before* the answer (drives tap-to-reveal). Usually a sharper form of the Hook.
- **Answer** — the recall target / correct response.
- **Distractors** *(optional)* — plausible wrong options, for multiple-choice checks.
- **Misconception** *(optional)* — the specific wrong belief this unit exists to correct. Feedback targets it directly. Especially useful for `antipattern` units.

**Deploy-class tag** (new in v0.3) — most units are universal and carry no `appliesTo`. Deploy units are tagged with the class(es) they apply to, because *how a project ships* is the one axis that genuinely branches:

- **container-image** — CI builds one image, scans that artefact, pushes it to a registry, and the host pulls it. Examples: e.g. Coolify, Render, Fly.
- **managed-source** — the platform builds straight from the repo; previews and trunk→prod are automatic. Examples: e.g. Vercel, Netlify, Cloudflare Pages.

`appliesTo` composes with `tier`: a unit is shown when the learner's tier is in scope **and** (`appliesTo` is empty **or** includes the learner's deploy class). This is relevance filtering by deployment context — **not** learning-style routing (§6 prohibits that). Universal units stay untagged; the value, when present, must be one of the two class strings above (a mistyped class fails validation). The picker and filters that consume this are app-side; until they ship, every unit renders to everyone.

### Worked example (fully annotated, with retrieval fields)

```yaml
id: flow-branch
title: Start a branch
type: procedure
tier: product-design
level: 2
topics: [branching, everyday-flow, gui]
format: card
collection: everyday-flow
prereqs: [sh-core-loop]
related: [flow-commit, glo-branch]
```
**Hook:** Never work directly on `main`. Make a branch first — it's your safe sandbox.
**Body:** In GitHub Desktop or your editor's Git panel, pull the latest `main`, then create a branch named `your-initials/what-you're-doing` — e.g. `sk/hero-redesign`. Everything you do now is isolated until you choose to share it. Use the buttons; you don't need the command line.
**Prompt:** You're about to start a new piece of work. What's the very first thing you do?
**Answer:** Pull the latest `main`, then create a short-lived branch named `your-initials/description`. You never work on `main` directly.
**Misconception:** "Small changes can go straight onto `main` to save time."
**Visual:** Screenshot of the "New branch" dialog with the naming convention called out.
**Next:** `flow-commit`.

---

## 4. Information architecture

Content is organised into **collections**. Each collection is also a **Highlight** on the platform — a curated, evergreen set, as opposed to the scrolling feed.

| # | Collection (`collection` id) | For | Covers |
|---|---|---|---|
| 1 | Start Here (`start-here`) | all | Orientation: what this is, why the trunk, the core loop, the golden rules, how AI tools are used, the one escalation rule. |
| 2 | The Everyday Flow (`everyday-flow`) | product-design · all | The daily cycle: branch → commit → PR → preview → review → merge → delete. |
| 3 | Reviewing Well (`reviewing`) | all | What a preview tells you and what it hides; how to review without reading code; who to tag. |
| 4 | Working with AI Tools (`ai-tools`) | all | Guardrails for AI coding tools: small changes, secrets, formatting-vs-linting-vs-security. |
| 5 | When Git Breaks (`git-breaks`) | all | The escalation rule, what never to do, safe recoveries. Built for lookup under stress. |
| 6 | Feature Flags (`feature-flags`) | product-design · engineer | What a flag is, one-flag-one-purpose, retiring flags, the cautionary tale. |
| 7 | For Engineers (`engineers`) | engineer | The deeper layer: the CI pipeline, building and shipping by deploy class, branch protection, the non-code distinction. |
| 8 | Non-Code & Design Work (`non-code`) | product-design | Mergeable text vs binaries, Figma as design source, why docs repos are lighter. |
| 9 | Glossary (`glossary`) | all | One tiny card per term. |

### Three access modes the platform must support

A feed is superb for **reinforcement and culture** but weak on its own for two jobs a team will need, so the model carries structure for all three, and the UI should expose all three:

1. **Directed path** — "I'm new, show me the ordered route." Driven by `tier` + `level`. Start Here → The Everyday Flow is the first path.
2. **Browse / serendipity** — the feed and topic filters. Driven by `topics` and `format`.
3. **Lookup under stress** — "Git just broke, what do I do *now*?" Driven by `type: runbook` and search. Must be fast and never buried in a feed.

---

## 5. Instagram-primitive mapping

| Seed concept | Instagram primitive | Notes |
|---|---|---|
| `format: card` | Feed post | Visual + hook + body. The atom. |
| `format: carousel` | Carousel post | Swipe through slides. Procedures and short lists. |
| `format: story` | Story | Ephemeral nudge / single tip. Often a guardrail, or a spaced-repetition "card of the day." |
| `format: reel` | Reel | Short screen-recording demo. The `Visual` field is the storyboard. |
| `collection` | Highlight | Curated evergreen set, pinned to the profile. |
| all units | Profile grid | The browsable library. |
| `tier` | Filtered feed | Show me only what's for my role. |
| `level` | Learning-path order | Sequences a path within a tier. |
| `prompt`/`answer` | Tap-to-reveal card | The tap is a retrieval act (§6). |
| user bookmark | Saved | "Pick and choose" — personal collections per person. |

---

## 6. Learning Design Principles (design governance)

These are directives for whoever builds and renders the platform. They are verified against the §1 inclusion test and passed under role 1(b). Each embodies a robust learning-science finding; the platform embodies them so the team doesn't have to know them. Keep this section terse — it is not a literature review. Evidence strength is tagged; the evidence base is noted at the end.

**Bet the platform on these two.**

- **Units are question-first.** Deliver the `prompt` before the `answer`; the default interaction is tap-to-reveal, not read. A tap is an act of recall, and recall is what builds durable memory. `[evidence: high]`
- **Concepts resurface on a spaced schedule.** The feed/notification engine schedules each unit's return at expanding intervals; never show-once-and-retire. Streaks are legitimate here because a daily return *is* spacing — reward returning, not vanity metrics. `[evidence: high]`

**Build these in.**

- **Interleave within a session.** Mix `type`s and `topics`; don't serve a whole collection in one block. Exception: give novices some blocked practice in a brand-new topic before interleaving — so this is tier-aware. `[evidence: moderate-high, domain-dependent]`
- **Every visual carries information.** Use the `visual` field for content, never decoration. Decorative or stock imagery adds cognitive load and can actively reduce learning. `[evidence: moderate-high]`
- **Pair every rule with a concrete instance.** Abstract statement plus a specific example, always (the seed already does this — keep doing it). `[evidence: moderate-high]`
- **Scaffold by tier; strip it for experts.** Non-technical tiers get full worked-example detail; the engineer tier gets less — the same scaffolding that helps a novice becomes noise for an expert. `[evidence: moderate-high]`

**Cheap add-ons.**

- **Prompt elaboration where natural.** "Why does this matter here?" or "say it back in your own words." `[evidence: moderate]`
- **Feedback is immediate and specific**, and targets the named `misconception` when there is one. `[evidence: moderate-high]`
- **Surface the fluency gap.** An optional "how confident are you?" before a retrieval check exposes the difference between *feeling* you know something and *being able to recall* it. `[evidence: moderate]`

**Prohibitions — what the build must NOT do.**

- **Never tag or route content by "learning style" / modality preference.** Matching instruction to visual/auditory/kinesthetic preference is robustly unsupported. Dual coding — words plus informative visuals, for *everyone* — is the real principle; learning styles is the counterfeit. `[myth]`
- **Never use the "learning pyramid" percentages** (10% of what we read, 90% of what we teach, etc.). Fabricated; no scientific basis. `[no basis]`
- **Never treat engagement as the success metric.** Time-in-app, likes and smooth scrolling feel like learning and are not — the same fluency illusion that makes highlighting and re-reading feel productive while doing little. Measure retrieval success and on-the-job behaviour change. `[established]`

*Evidence base (for anyone verifying): Dunlosky et al. 2013 (Psychological Science in the Public Interest) rate practice testing and distributed practice the two highest-utility techniques of ten; Roediger & Karpicke on the testing effect; Bjork on desirable difficulties; Pashler et al. 2008 and the Waddington et al. 2024 meta-analysis (21 studies, ~1,700 learners, negligible effect) on the learning-styles myth; Sweller on cognitive load and expertise reversal; Mayer and Paivio on dual coding. Most foundational work is lab-based with declarative material; transfer to procedural workplace skill is well-supported in principle but real-world effects are typically smaller.*

---

## 7. Downstream formats this seed feeds

Same units, different render, chosen per need:

- **The snackable platform** (first) — feed, carousels, stories, reels, Highlights, tap-to-reveal.
- **Onboarding path** — `tier` + `level` filtered into an ordered checklist for a new joiner.
- **Reference card / cheat-sheet** — the `procedure` and `runbook` units, printed one-per-card.
- **Team huddle deck** — a `carousel` collection on a screen.
- **Quiz / knowledge check** — the `prompt` / `answer` / `distractors` fields, rendered directly.
- **"When Git breaks" runbook** — the `git-breaks` collection as a searchable page.

---

## 8. The units (first tranche)

### Collection: Start Here

```yaml
id: sh-what-why
title: What this is, and why everyone works on one branch
type: concept
tier: all
level: 1
topics: [trunk, tbd, orientation]
format: card
collection: start-here
prereqs: []
related: [sh-core-loop, glo-trunk]
```
**Hook:** Everyone builds on one shared branch, on purpose. Here's why that's faster, not scarier.
**Body:** `main` is the single source of truth — the version that's live or ready to go live. Instead of hiding work away in long-lived side branches that drift apart and collide weeks later, everyone merges small changes back into `main` frequently. Because AI tools produce changes in minutes, integrating often is what stops the team's work falling out of sync.
**Visual:** Simple diagram — one trunk line, small branches peeling off and merging back within a day.
**Next:** `sh-core-loop` — the whole workflow in six swipes.

```yaml
id: sh-core-loop
title: The whole workflow in six steps
type: procedure
tier: all
level: 1
topics: [everyday-flow, orientation]
format: carousel
collection: start-here
prereqs: [sh-what-why]
related: [flow-branch, flow-commit, flow-pr, flow-preview, flow-review-merge]
```
**Hook:** The entire cycle, start to finish. Learn this and you know the shape of everything.
**Carousel:**
1. **Branch** — Pull the latest `main`, make a short-lived branch. Your sandbox.
2. **Build** — Make your change, with your AI tools. Keep it small.
3. **Commit** — Save your progress in small steps as you go.
4. **Open a PR** — Share it early with a pull request. A preview link appears.
5. **Review** — A teammate checks the preview, the automated checks go green.
6. **Merge & delete** — Merge into `main`, delete your branch. Done.
**Visual:** Six-panel carousel, one icon per step, consistent colour system.
**Next:** `sh-golden-rules` — the five rules that keep it safe.

```yaml
id: sh-golden-rules
title: The five golden rules
type: guardrail
tier: all
level: 1
topics: [safety, everyday-flow]
format: carousel
collection: start-here
prereqs: [sh-core-loop]
related: [ai-small, break-escalate]
```
**Hook:** Follow these five and you'll almost never get into trouble.
**Carousel:**
1. **Never commit straight to `main`.** Always branch first.
2. **Keep changes small.** A branch should live hours, not days.
3. **Open a PR early.** Don't wait until it's "finished."
4. **Never merge when the checks are red.** Red means stop.
5. **Delete your branch after merging.** Keep the place tidy.
**Visual:** Five bold rule-cards, numbered, swipeable.
**Next:** `sh-ai-tools` — how AI fits in.

```yaml
id: sh-ai-tools
title: How AI tools fit in
type: concept
tier: all
level: 1
topics: [ai-code, orientation]
format: card
collection: start-here
prereqs: []
related: [ai-format-lint-security, ai-secrets, ai-small]
```
**Hook:** AI coding tools (v0, Cursor, Claude, Copilot) write real code that ships. That's the point — and the responsibility.
**Body:** AI tools let product and design people shape working code, not just mock-ups. But AI is fast, not careful — it can produce bloated, insecure, or subtly wrong code that looks fine. So the workflow wraps every change in cheap safety nets: small pull requests, a human glance, and automated checks. The tools give speed; the workflow gives safety. You need both.
**Visual:** AI coding tools flowing into a "PR + checks" gate.
**Next:** `sh-escalation` — the one rule to remember when something goes wrong.

```yaml
id: sh-escalation
title: If Git looks scary, stop
type: culture
tier: all
level: 1
topics: [safety, git-breaks]
format: story
collection: start-here
prereqs: []
related: [break-escalate, break-neverdo]
```
**Hook:** The single most important rule: when Git confuses you, stop and ping an engineer. Always.
**Body:** You will never be blamed for asking. You *can* cause real damage by running a command you don't understand — especially anything an AI suggests to "fix" a broken state. Guessing is the risk; asking is free. Stop, screenshot, ask.
**Visual:** Bold text-card, calm colour, a single "🛟 ask" motif.
**Next:** `break-neverdo` — the commands never to run on a guess.

---

### Collection: The Everyday Flow

```yaml
id: flow-branch
title: Start a branch
type: procedure
tier: product-design
level: 2
topics: [branching, everyday-flow, gui]
format: card
collection: everyday-flow
prereqs: [sh-core-loop]
related: [flow-commit, glo-branch]
```
**Hook:** Never work directly on `main`. Make a branch first — it's your safe sandbox.
**Body:** In GitHub Desktop or your editor's Git panel, pull the latest `main`, then create a branch named `your-initials/what-you're-doing` — e.g. `sk/hero-redesign`. Everything you do now is isolated until you choose to share it. Use the buttons; you don't need the command line.
**Prompt:** You're about to start a new piece of work. What's the very first thing you do?
**Answer:** Pull the latest `main`, then create a short-lived branch named `your-initials/description`. You never work on `main` directly.
**Misconception:** "Small changes can go straight onto `main` to save time."
**Visual:** Screenshot of the "New branch" dialog with the naming convention called out.
**Next:** `flow-commit`.

```yaml
id: flow-commit
title: Save little and often
type: procedure
tier: product-design
level: 2
topics: [commits, everyday-flow, ai-code]
format: card
collection: everyday-flow
prereqs: [flow-branch]
related: [flow-pr, glo-commit]
```
**Hook:** Don't wait until it's done. Save your progress in small steps.
**Body:** A commit is a "save point." Make one each time you finish a small, sensible chunk, rather than one giant save at the end. Let your AI tool write the commit message by describing what changed — that's a good use of it. Small commits make it easy to see what happened and to undo just one thing if needed.
**Visual:** A tidy commit history, each message short and clear.
**Next:** `flow-pr`.

```yaml
id: flow-pr
title: Open a pull request early
type: procedure
tier: product-design
level: 2
topics: [pr-review, everyday-flow]
format: reel
collection: everyday-flow
prereqs: [flow-commit]
related: [flow-preview, glo-pr]
```
**Hook:** A pull request isn't the finish line — it's how you start the conversation.
**Body:** As soon as one logical piece works, push your branch and open a pull request (PR). A PR is a formal request to merge your work into `main`, and a space for the team to review it. Open it early — ideally the same day you branched — so feedback comes while the work is small.
**Visual (reel storyboard):** 20-second screen capture — push branch → "Compare & pull request" button → fill title → "Create pull request" → the preview link and checks appear. Captioned, no voice-over needed.
**Next:** `flow-preview`.

```yaml
id: flow-preview
title: Use the preview link
type: procedure
tier: all
level: 2
topics: [previews, pr-review, everyday-flow]
format: card
collection: everyday-flow
prereqs: [flow-pr]
related: [rev-preview-limits, glo-preview]
```
**Hook:** Every PR gets its own live, clickable version of the change. Click it.
**Body:** A preview is built for each PR at its own URL, with the link posted as a comment. Open it and use the actual thing — click through the change as a user would. This is how design and product review what shipped without digging through code. (What a preview *can't* tell you: see `rev-preview-limits`.)
**Visual:** A PR with the preview-URL comment highlighted.
**Next:** `flow-review-merge`.

```yaml
id: flow-review-merge
title: Review, merge, delete
type: procedure
tier: product-design
level: 2
topics: [pr-review, merging, everyday-flow]
format: card
collection: everyday-flow
prereqs: [flow-preview]
related: [rev-who-to-tag, glo-merge]
```
**Hook:** Green checks, a teammate's thumbs-up, then merge — and bin the branch.
**Body:** Tag a reviewer (jump on a quick huddle if it's easier), confirm the preview looks right and the automated checks are green, then approve and merge into `main`. Immediately delete the branch — it's served its purpose. If the checks are red, don't merge; fix or ask first.
**Visual:** The merge button, green checks above it, "Delete branch" prompt after.
**Next:** Back to `flow-branch` for the next change — this loop is the job.

---

### Collection: Reviewing Well

```yaml
id: rev-preview-limits
title: What a preview shows — and what it hides
type: concept
tier: all
level: 2
topics: [pr-review, previews, ai-code, safety]
format: carousel
collection: reviewing
prereqs: [flow-preview]
related: [ai-secrets, ai-format-lint-security]
```
**Hook:** "It looked fine in the preview" is not the same as "it's safe to merge." Here's the gap.
**Body:** A preview shows you the finished surface on the happy path. That's perfect for judging the experience — and blind to several things that can still be broken underneath.
**Carousel:**
1. **A preview shows:** the UI, the copy, the layout, the click-through. Judge these with confidence.
2. **A preview hides:** secrets accidentally left in the code.
3. **A preview hides:** security holes — a page can render perfectly and still be unsafe.
4. **A preview hides:** logic that breaks off the happy path, or a dodgy dependency.
5. **So:** you judge the experience; the automated checks and an engineer judge the rest. Both matter.
**Visual:** Split card — glossy UI on one side, an iceberg of hidden risks below.
**Next:** `rev-who-to-tag`.

```yaml
id: rev-who-to-tag
title: Who needs to look at this?
type: procedure
tier: all
level: 2
topics: [pr-review, codeowners]
format: card
collection: reviewing
prereqs: [rev-preview-limits]
related: [flow-review-merge]
```
**Hook:** Content change? A peer can approve. Touches login, data, or money? An engineer must.
**Body:** For copy, visuals and docs, a relevant teammate reviewing the preview is enough. For anything touching authentication, user data, payments, or server logic, an engineer has to review the code — the system routes these automatically to the right people (that's what CODEOWNERS does). If in doubt, tag an engineer; it's never wrong.
**Visual:** A decision arrow — "what did you change?" → two paths.
**Next:** `flow-review-merge`.

---

### Collection: Working with AI Tools

```yaml
id: ai-format-lint-security
title: Three different safety nets (and why a formatter isn't enough)
type: concept
tier: all
level: 2
topics: [ai-code, tooling, safety]
format: carousel
collection: ai-tools
prereqs: [sh-ai-tools]
related: [rev-preview-limits, eng-pipeline]
```
**Hook:** "The formatter passed" tells you nothing about whether the code is safe. They're different jobs.
**Body:** People conflate these three. They catch completely different problems, and you need all three.
**Carousel:**
1. **Formatting** (e.g. Prettier) — makes code *look* consistent. Spacing and style only. Zero to do with whether it works or is safe.
2. **Linting & types** (e.g. ESLint + TypeScript) — catches *bugs*: dead code, unsafe patterns, type mismatches.
3. **Security scanning** — catches *danger*: leaked secrets, known vulnerabilities, dodgy or hallucinated dependencies.
4. **The point:** a tidy-looking file can be buggy and insecure. A good pipeline runs all three so you don't have to hold it in your head.
**Prompt:** Your AI tool's code passed the formatter. Is it safe to ship?
**Answer:** No — formatting only makes code *look* consistent. Safety needs linting/types (for bugs) and security scanning (for vulnerabilities, secrets, bad dependencies). Three different nets.
**Distractors:** ["Yes — a passing formatter means the code is clean", "Yes — if it's formatted and it renders in the preview"]
**Misconception:** "A tidy, well-formatted file is a safe file."
**Visual:** Three nets stacked, each catching a different shape falling through.
**Next:** `ai-secrets`.

```yaml
id: ai-secrets
title: Secrets never go in the code
type: guardrail
tier: all
level: 2
topics: [ai-code, security, secrets]
format: story
collection: ai-tools
prereqs: [sh-ai-tools]
related: [rev-preview-limits]
```
**Hook:** An API key pasted into code doesn't just leak — Git remembers it forever.
**Body:** Passwords, API keys and tokens must never be typed into code files, even briefly. Once committed, a secret lives in the project's history even after you delete it, and a preview can expose it to anyone. Secrets go in the proper place (environment variables / the secrets store). If an AI tool suggests hard-coding a key, don't — ask an engineer where it should live.
**Visual:** A key dropped into code, then "🔒 → env" as the correct path.
**Next:** `ai-small`.

```yaml
id: ai-small
title: Keep AI changes small enough to check
type: guardrail
tier: all
level: 2
topics: [ai-code, pr-review]
format: card
collection: ai-tools
prereqs: [sh-ai-tools]
related: [flow-pr, sh-golden-rules]
```
**Hook:** AI can generate 500 lines in a second. Nobody can review 500 lines properly in a second.
**Body:** The faster the tool, the smaller your pull requests should be. A huge AI-generated change is a change nobody truly reviewed — the exact way messy or unsafe code slips into `main`. Break work into small pieces, each its own PR. Small is reviewable; reviewable is safe.
**Visual:** Two PRs side by side — a tidy 30-line one, ticked; a 600-line wall, flagged.
**Next:** `rev-preview-limits`.

---

### Collection: When Git Breaks

```yaml
id: break-escalate
title: The safe first move
type: runbook
tier: all
level: 2
topics: [git-breaks, safety]
format: card
collection: git-breaks
prereqs: []
related: [sh-escalation, break-neverdo]
```
**Hook:** Something's gone wrong in Git. Do this, in order.
**Body:**
1. **Stop.** Don't run more commands hoping to fix it.
2. **Screenshot** the message.
3. **Ping an engineer** with the screenshot and what you were doing.
Your local mess almost never affects anyone else, and if `main` is protected, it stops there. There is no rush and no shame. Asking is the correct, professional move.
**Visual:** Three-step card, calm palette.
**Next:** `break-neverdo`.

```yaml
id: break-neverdo
title: Commands to never run on a guess
type: antipattern
tier: all
level: 2
topics: [git-breaks, safety, ai-code]
format: card
collection: git-breaks
prereqs: [break-escalate]
related: [sh-escalation]
```
**Hook:** If an AI tells you to run `git reset --hard` or `git push --force`, stop. These destroy work.
**Body:** Pasting a Git error into an AI and running whatever it suggests is dangerous, because AIs readily suggest history-rewriting commands. `git reset --hard` permanently deletes changes; `git push --force` can wipe teammates' work off the shared branch. Force-push should be disabled on protected branches; where it is, the worst can't happen by accident — but the habit still matters. Safe, reversible options exist (undo *with* a new change, set work aside, make a backup branch), and an engineer will pick the right one in seconds. When in doubt: ask, don't run.
**Prompt:** Git is in a mess and your AI assistant suggests running `git reset --hard`. Do you run it?
**Answer:** No. Stop and ping an engineer. That command permanently deletes work, and a follow-up force-push can destroy teammates' work. Safe, reversible options exist.
**Distractors:** ["Yes — the AI understands the error better than I do", "Yes — and push --force afterwards to make it stick"]
**Misconception:** "An AI's suggested fix for a Git error is safe to run without understanding it."
**Visual:** Two commands with a bold ⛔, and "ask an engineer" as the green alternative.
**Next:** `sh-escalation`.

---

### Collection: Feature Flags

```yaml
id: ff-basics
title: What a feature flag is, and the one rule
type: concept
tier: product-design
level: 3
topics: [feature-flags, deploy]
format: card
collection: feature-flags
prereqs: []
related: [ff-knight, glo-flag]
```
**Hook:** A switch that turns a feature on or off without changing the code that's live.
**Body:** Feature flags let a team merge unfinished work safely (hidden behind an "off" switch) and turn features on for some users, or off instantly if something's wrong (a "kill switch"). Use a flag service (e.g. Unleash, LaunchDarkly). The discipline that matters: **one flag, one purpose, and delete it the moment the rollout is done.** Old flags left lying around are how accidents happen.
**Visual:** A labelled toggle, "on for 10% of users."
**Next:** `ff-knight`.

```yaml
id: ff-knight
title: The $440 million flag
type: antipattern
tier: all
level: 3
topics: [feature-flags, safety]
format: card
collection: feature-flags
prereqs: [ff-basics]
related: [ff-basics]
```
**Hook:** A single flag nobody cleaned up cost one firm $440 million in 45 minutes.
**Body:** In 2012, Knight Capital reused an old, un-retired feature flag for new code. When a deploy went out unevenly, that flag switched on long-dead code on some servers — and in about three-quarters of an hour it ran up roughly a $440M loss and effectively ended the company. The lesson isn't "flags are dangerous." It's "stale flags are dangerous." Retire them.
**Visual:** A stark timeline — 09:30 deploy → 10:15 catastrophe.
**Next:** `ff-basics`.

---

### Collection: For Engineers

```yaml
id: eng-pipeline
title: The pipeline, in order
type: procedure
tier: engineer
level: 3
topics: [ci, deploy, ai-code]
format: carousel
collection: engineers
prereqs: []
related: [eng-ghcr, eng-coolify-singleimage, eng-managed-source, ai-format-lint-security]
```
**Hook:** Gates first, deploy last. The deploy step only runs if everything before it is green.
**Carousel:**
1. **Lint & format** (e.g. Biome, or ESLint + Prettier) — style and obvious bugs.
2. **Type-check** (e.g. `tsc`) — no type errors reach `main`.
3. **Test** (e.g. Vitest for units/components, Playwright for end-to-end).
4. **Verify** — all checks green is the gate to merge. Red means stop.
5. **Build & deploy** — the back half varies by deploy class: *container-image* builds and scans an image the host pulls; *managed-source* lets the platform build from the repo. See your deploy-class unit.
**Visual:** A gated pipeline — shared checks, then a class-specific build/deploy tail.
**Next:** Your deploy-class unit — `eng-ghcr` + `eng-coolify-singleimage` (container-image), or `eng-managed-source` (managed-source).

```yaml
id: eng-ghcr
title: Build once, scan, then deploy the artefact
type: concept
tier: engineer
level: 3
topics: [ci, deploy, registry]
format: card
collection: engineers
prereqs: [eng-pipeline]
related: [eng-coolify-singleimage]
appliesTo: [container-image]
```
**Hook:** Build the image once in CI and have the host *pull* it — never build on the production box.
**Body:** The principle: CI builds the image, scans the artefact you're about to ship, pushes it to a registry, and the host pulls that exact image. Two reasons: you scan the exact artefact you ship (rebuilding on the server would ship something you didn't scan), and you keep heavy build load off the production box (builds can and do crash small servers). Example detail: with GitHub Actions the registry is often GHCR (`ghcr.io`); a private image needs a one-time `docker login` on the host, or the pull fails with `unauthorized`.
**Visual:** CI → scan → registry → host pulls. Build never touches the production box.
**Next:** `eng-coolify-singleimage`.

```yaml
id: eng-coolify-singleimage
title: The container-host shape
type: decision
tier: engineer
level: 3
topics: [deploy, container-image, zero-downtime]
format: card
collection: engineers
prereqs: [eng-ghcr]
related: [eng-pipeline]
appliesTo: [container-image]
```
**Hook:** On an image-pull host, zero-downtime deploys only work if you follow one shape. Break it and you get outages.
**Body:** For image-pull hosts (e.g. Coolify, Render, Fly), rolling zero-downtime updates require a single image, a passing health-check endpoint, and the default container naming. They **break** with multi-service Compose deployments and with host port mappings (which disable the health check). So: one deployable app = one container with a real `/health` route, default naming, no host port map. Keep stateful services (Postgres, Redis, a flag service) as *separate* resources — which also stops an app deploy needlessly restarting the database. Note: self-orchestrated platforms (Kubernetes, Docker Compose, ECS/Nomad) follow the same build-once-scan-pull principle but adapt the runtime specifics — pods/services/ingress, and port mapping is normal there — so this single-container/no-port-map shape is the image-pull-host case, not universal to all container deploys.
**Visual:** ✅ single container + health check vs ⛔ multi-service blob + host port map.
**Next:** `eng-pipeline`.

```yaml
id: eng-managed-source
title: Managed-source deploys
type: concept
tier: engineer
level: 3
topics: [deploy, managed-source, ci]
format: card
collection: engineers
prereqs: [eng-pipeline]
related: [eng-pipeline]
appliesTo: [managed-source]
```
**Hook:** On a managed-source platform the platform builds from the repo — so pin your inputs and scan the source, because there's no image you control.
**Body:** The platform builds and deploys straight from the repo (e.g. Vercel, Netlify, Cloudflare Pages), and previews plus trunk→prod are automatic — a preview per PR, production on merge. Two consequences. Pin your build inputs for reproducibility — runtime and framework versions and build config ("framework preset" is one platform's term) — so a build is the same next month as it is today. And scan **source + dependencies** rather than an image, because there is no image artefact you control; a committed lockfile plus dependency and secret scanning is the equivalent of image scanning here.
**Visual:** Repo → platform builds → preview per PR, prod on merge. Scan source + deps; pin the preset.
**Next:** That's the managed-source back half of `eng-pipeline`.

---

### Collection: Non-Code & Design Work

```yaml
id: nc-mergeable-binary
title: Text merges. Binaries don't.
type: concept
tier: product-design
level: 2
topics: [non-code, design, git-basics]
format: carousel
collection: non-code
prereqs: []
related: [glo-conflict]
```
**Hook:** Git is brilliant with words and code, and hopeless with design binaries. Here's the rule.
**Carousel:**
1. **Mergeable** — Markdown, code, plain text. Two people can edit and Git combines it. Full workflow applies.
2. **Not mergeable** — `.fig`, `.psd`, `.sketch`, big images. Git can't merge or shrink them; two edits just clobber each other.
3. **So design source lives in Figma** — use Figma's own branching and version history. Only *exports* (SVG, tokens, specs) go into Git.
4. **And docs/research repos are lighter** — they need review, but no builds, previews, or deploy machinery. Match the rigour to the repo's job.
**Visual:** Two columns — "Git loves this" / "keep this in Figma."
**Next:** `glossary`.

---

### Collection: Glossary

```yaml
id: glossary-core
title: The words, in one place
type: glossary
tier: all
level: 1
topics: [glossary]
format: card
collection: glossary
prereqs: []
related: []
```
**Hook:** Every term used here, in a sentence. (Each row renders as its own tiny card.)
**Body:**
- **Trunk / `main`** — the single shared branch that's live or ready to go live.
- **Branch** — your private copy of the code to work in safely.
- **Commit** — a save point, with a short note on what changed.
- **Pull request (PR)** — a request to merge your branch into `main`, and the place it gets reviewed.
- **Merge** — combining your branch's changes back into `main`.
- **Conflict** — when two changes touch the same lines and Git needs a human to choose.
- **CI / checks / "the gates"** — automated tests and scans that must pass before merging.
- **Preview** — a live, clickable version of a PR at its own link.
- **Feature flag** — a switch that turns a feature on or off without changing live code.
- **Deploy class** — how a project ships: *container-image* (CI builds an image, scans it, the host pulls it) or *managed-source* (the platform builds straight from the repo).
**Visual:** A clean term-per-card set; tappable, searchable.
**Next:** Back to `start-here`.

---

## 9. Population manifest

Written above ✅ · outlined and awaiting content ⬜. This is the map to "comprehensive."

**Retrieval fields:** demonstrated on `flow-branch`, `ai-format-lint-security`, `break-neverdo`. To be populated across all remaining units in the full-population pass, per §6.

| Collection | Units |
|---|---|
| Start Here | ✅ sh-what-why · ✅ sh-core-loop · ✅ sh-golden-rules · ✅ sh-ai-tools · ✅ sh-escalation |
| The Everyday Flow | ✅ flow-branch · ✅ flow-commit · ✅ flow-pr · ✅ flow-preview · ✅ flow-review-merge · ⬜ flow-sync-main · ⬜ flow-draft-pr |
| Reviewing Well | ✅ rev-preview-limits · ✅ rev-who-to-tag · ⬜ rev-give-good-feedback · ⬜ rev-approve-vs-request-changes |
| Working with AI Tools | ✅ ai-format-lint-security · ✅ ai-secrets · ✅ ai-small · ⬜ ai-hallucinated-deps · ⬜ ai-dont-trust-blindly · ⬜ ai-licence-check |
| When Git Breaks | ✅ break-escalate · ✅ break-neverdo · ⬜ break-merge-conflict-basics · ⬜ break-undo-a-commit-safely · ⬜ break-wrong-branch |
| Feature Flags | ✅ ff-basics · ✅ ff-knight · ⬜ ff-kill-switch · ⬜ ff-gradual-rollout · ⬜ ff-retire-checklist |
| For Engineers | ✅ eng-pipeline · ✅ eng-ghcr `[container-image]` · ✅ eng-coolify-singleimage `[container-image]` · ✅ eng-managed-source `[managed-source]` · ⬜ eng-branch-protection · ⬜ eng-codeowners · ⬜ eng-previews-security · ⬜ eng-observability · ⬜ eng-monorepo-structure |
| Non-Code & Design | ✅ nc-mergeable-binary · ⬜ nc-figma-branching · ⬜ nc-what-goes-in-git · ⬜ nc-lfs-when-needed |
| Glossary | ✅ glossary-core · ⬜ glossary-advanced (rebase, squash, stash, tag, CODEOWNERS, LFS, SAST/SCA) |

**Coverage of this tranche:** one complete path (Start Here → The Everyday Flow), every content `type`, every `format`, all four tiers, both deploy classes, and the retrieval fields proven on three units. Enough to build and test the platform's rendering — including question-first delivery and class filtering — against real content before the full corpus is written.

---

## Changelog

- **v0.3** — Full de-brand for any-team use; `appliesTo` deploy-class tag (`container-image` / `managed-source`); `eng-ghcr` and `eng-coolify-singleimage` reframed to principles (ids kept); new `eng-managed-source`; `eng-pipeline` genericised to a class-agnostic spine; `break-neverdo` / `break-escalate` reworded to conditional phrasing. §6 and the scheduler unchanged.
- **v0.2** — Added §1 Goal & Inclusion Standard; retrieval fields (`prompt` / `answer` / `distractors` / `misconception`); §6 Learning Design Principles; retrieval fields demonstrated on three units.
- **v0.1** — Initial seed: content model, information architecture, Instagram-primitive mapping, first tranche of units.
