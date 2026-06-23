# Loupe — Product Strategy

## Positioning

**Name:** Loupe *(working title — final name TBD)*

**Tagline:** Every piece has a story. Keep it.

**One-sentence description:** Loupe keeps the story behind every piece of jewelry you own, so it's never lost to memory.

**The problem:** The meaning behind a piece of jewelry — who gave it, when, why, what it meant — usually lives in one person's memory alone. It's never written down anywhere. When that person forgets a detail, or isn't around to ask, the story disappears, even though the object remains.

**The solution:** A simple, low-friction catalog built around sentiment first — capture the story while it's known, find any piece instantly by photographing it, and eventually pass the whole collection's history to the next generation.

---

## Target user

Someone with a meaningful jewelry collection — heirloom pieces from relatives, gifts marking occasions, a mix of sentimental and everyday items — who has no current system for tracking what they have or why it matters. Starting from zero, building the catalog gradually over weeks rather than all at once.

The household is the access unit, consistent with the technical model, even though the first real use case is a single person.

---

## Why this approach (lessons carried from a prior project)

This isn't the first product attempt — a prior project (a household recipe app) went from a personal tool to a real, evolving product with real users and real lessons. Several of those lessons shape this product's foundation directly:

- **Multi-tenancy from day one, not retrofitted.** Adding households after months of single-user data required a careful migration. This time, the household model exists before the first real item is ever added.
- **Capture behavioral data before the feature that uses it is built.** A prior project's `cook_sessions` table existed before any cook-history UI did, and that early data became valuable once the UI finally arrived. The camera-lookup feature here follows the same instinct — every lookup attempt is logged from day one, regardless of whether a single analytics view exists yet.
- **Ship the minimum lovable version first, refine from real usage.** A prior project's most interesting features (a "Made it" signal, voice-guided cooking) came directly from watching real beta behavior, not from upfront guessing. The camera-matching feature here is explicitly scoped as "narrow to a few good candidates," not "guaranteed exact match" — an honest target that can improve over time with real data, rather than an overpromise that has to be walked back.

---

## What "useful" means here — success criteria before scale

Before any thought of other users or monetization, this product succeeds if:

1. The primary user adds pieces gradually, without the app ever feeling like a chore
2. The camera-lookup feature, even in its early "few candidates" form, feels like a genuine shortcut compared to scrolling a list
3. At least a few stories get captured that would otherwise have stayed unwritten
4. The primary user would, unprompted, want to show this to her daughter

If those four things are true, the foundation is sound regardless of whether this ever becomes a product for other households.

---

## Business model (exploratory — not the day-one focus)

Unlike a prior project, this one's productization path is intentionally not the first priority. Sentiment and genuine usefulness to one real person come first. The schema and auth model are built so a path to "more households" exists later without rework — but pricing, tiers, and distribution are deliberately undecided until the core experience is proven.

If pursued later, likely shape based on prior product learnings:

- Household as the billing unit (same pattern as before)
- A generous free tier — the full sentiment-capture experience, possibly capped by item count
- A paid tier unlocking practical features — appraisal document storage, multi-household sharing, advanced camera-matching
- Graduated, grandfathered pricing for early adopters, consistent with the philosophy used previously

Deliberately not decided yet: specific price points, free tier limits, distribution strategy (PWA vs. App Store). These get revisited once the core experience has been used and trusted by the first real household.

---

## The camera-lookup feature — the most novel part of this product

**The vision:** see a piece of jewelry, photograph it, and immediately get the story — without scrolling, without remembering what you named it.

**The honest technical target:** true single-exact-match recognition is a hard problem even for well-resourced products — two similar rings can look nearly identical to a model without a clean reference photo and consistent lighting. The realistic and still valuable target is a short, accurate list of candidates (photo + headline) that the user taps to confirm. This is treated as the real design goal, not a fallback.

**Why multiple reference photos per item matter:** a single reference photo captures one angle and one lighting condition. The photo taken in the moment of lookup is unpredictable. Multiple reference angles per item — including close-ups of distinguishing features like engravings — meaningfully improve match quality over a single photo.

**Why every attempt is logged from day one:** matching quality is something to measure and improve over time, not something to get right once and forget. The `lookup_attempts` table (candidates shown, what was selected, whether the top candidate was correct) exists before any dashboard does, so when it's time to improve the matching prompt or approach, real usage data is already there — same instinct as a prior project's early behavioral-data tables.

---

## The flexible data model — built for what comes next

Items store category-specific details as flexible attribute rows rather than rigid columns. This is a deliberate bet: the same underlying structure (an item, its photos, its attributes, its story) should be able to support a completely different domain — a family heirloom archive spanning photographs, letters, scrapbooks, and household objects — without restructuring the database.

The cost of this decision is a slightly more abstract Layer 1 than a simpler "just add jewelry columns" approach would be. The benefit is that "version this into something bigger" is a fork-and-relabel exercise rather than a rewrite, if and when that's the right next step.

---

## Messaging (to develop)

Not yet developed — will be shaped by what the primary user says, unprompted, once she's actually used it for a while. Key question to revisit: what does she say when describing this to someone else?

---

## Name and brand

**Working name:** Loupe
**Status:** Not finalized — placeholder until the product is proven with its first real user.
**Decision timing:** Revisit naming once sentiment-first usage is validated, consistent with how naming was sequenced on a prior project.
