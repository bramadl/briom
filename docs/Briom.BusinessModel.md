# Briom – Business Model

> For internal review / early investor conversation
>

## What is Briom?

Briom is a **moderated AI deliberation platform** — a single room where multiple AI models (GPT, Claude, Gemini, and others) discuss a topic together, guided by a human moderator.

Instead of switching between 5 browser tabs and copy-pasting context manually, the user opens one room, invites the AI perspectives they want, and steers the conversation.

**The user is the moderator. The AIs deliberate. The insight emerges.**

---

## The Problem It Solves

Power users of AI today are context-switching constantly — opening GPT for one angle, Claude for another, Gemini for a third. They become the bridge between disconnected intelligences: copy-pasting context, relaying arguments, synthesizing manually.

This is cognitively exhausting and produces shallow synthesis.

Briom collapses that workflow into one room.

---

## Current State (MVP)

- Live at briom.vercel.app
- Early access: 100 user cap
- Stack: Next.js fullstack, Supabase (auth + realtime), Vercel, OpenRouter
- Models available: free-tier models (GPT-OSS, Gemma, Llama, Qwen, etc.)
- Constraints: 5 rooms/moderator, 4 participants/room

**Cost to run at 100 users today: ~$0/month** (free models only)

---

## The Infrastructure Economics Challenge

### Why Flat Pricing Fails for Multi-Agent Rooms

In a standard single-agent chat app, token consumption scales linearly — O(N). In Briom's multi-agent deliberation room, token consumption scales **quadratically — O(N²)** due to sequential state inheritance.

Every turn requires passing the full conversation history back to the model:

```txt
Turn 1  (input):  500 tokens   → output: 200 tokens
Turn 2  (input):  700 tokens   → output: 200 tokens  (inherits Turn 1)
Turn 10 (input):  5,000 tokens → output: 200 tokens  (inherits Turns 1–9)
Turn 20 (input):  15,000 tokens → output: 200 tokens (inherits Turns 1–19)
```

A flat price per turn creates severe negative-margin risk as sessions deepen. A strictly variable, consumption-based pricing engine is required.

---

## Revenue Model: Briom Credits (BCr)

### Currency Architecture

Penting:
**1 Briom Credit (BCr) = Rp 50**

Credits are the single currency for all AI usage in Briom. Every AI turn costs credits dynamically based on actual token consumption reported by OpenRouter — not a flat estimate.

Free models cost 0 credits. Paid models deduct credits proportionally per turn.

### Dynamic Deduction Formula

Instead of maintaining a manual database of shifting model prices, Briom reads the verified cost payload (`usage.cost` in USD) returned natively by OpenRouter on every completed turn:

```txt
BCr Deduction = (OpenRouter USD Cost × FX Rate × Markup) / BCr Peg Value
             = (usage.cost × 16,000 × 3) / 50
```

This means:

- No manual price table maintenance
- Automatically adjusts as context grows deeper
- Remains margin-positive regardless of model tier or session length

### Consumption Scenarios

**Scenario A — Early turn (GPT-4o Mini, short context):**

```txt
Context:          ~1,000 tokens
OR cost:          $0.00015
IDR with markup:  $0.00015 × 16,000 × 3 = Rp 7.20
BCr deducted:     7.20 ÷ 50 = 0.14 BCr
```

**Scenario B — Deep turn 20 (GPT-4o Mini, accumulated history):**

```txt
Context:          ~15,000 tokens + 500 output
OR cost:          $0.00180
IDR with markup:  $0.00180 × 16,000 × 3 = Rp 86.40
BCr deducted:     86.40 ÷ 50 = 1.73 BCr
```

Regardless of session depth or model tier shifts, Briom remains structurally margin-positive on every turn.

### FX Risk Mitigation

The base rate of Rp 16,000/USD is reviewed periodically. A ±10% FX buffer is maintained in the markup to absorb short-term Rupiah fluctuation without requiring immediate repricing.

### Credit Packages

| Package | Price (IDR) | Credits (BCr) | Best For |
| --- | --- | --- | --- |
| Free | Rp 0 | Unlimited (free models only) | Exploration |
| Starter | Rp 15,000 | 300 BCr | First paid model experience |
| Pro | Rp 50,000 | 1,200 BCr | Regular knowledge worker |
| Power | Rp 150,000 | 4,000 BCr | Heavy research / enterprise |

*Entry point is intentionally low (price of one coffee) to minimize friction to first purchase.*

---

## Why Credits, Not Subscription?

**Subscription flat rate** = Briom gambles against power users. If everyone picks Claude Opus and runs 200-turn sessions, margin collapses.

**Credit system** = Briom is margin-positive on every single turn, automatically. Three additional advantages:

**Risk elimination** — pricing is bound directly to raw token usage via `usage.cost`. No financial exposure from high-intensity sessions.

**No churn anxiety** — recurring subscriptions create fatigue when usage fluctuates. Credits carry no expiration pressure, lowering friction for return purchases.

**Enterprise readiness** — a credit ledger transforms naturally into corporate team budgets: allocate a pool of BCr across an organization, track per-seat consumption, enable B2B white-label billing infrastructure from day one.

---

## Unit Economics

### Per-User Cost Floor & Ceiling (monthly)

**Floor** — free models only:

- Cost to Briom: Rp 0 / Revenue: Rp 0 / Margin: Rp 0
- Value: user onboarding and retention at zero cost

**Ceiling** — 200 turns, Claude Sonnet, long context:

- Cost to Briom: ~Rp 74,000
- User revenue recouped: ~Rp 221,000
- Net unit margin: **+Rp 147,000/user**

### 100-User MVP Projections (tiered conversion scenarios)

| Performance Tier | Paid Conversion | Monthly Revenue | Net Operating Margin |
| --- | --- | --- | --- |
| Pessimistic | 5% (5 users) | Rp 750,000 | Rp 200,000 |
| Baseline | 20% (20 users) | Rp 3,000,000 | Rp 1,500,000 |
| Target | 60% (60 users) | Rp 7,500,000 | Rp 4,250,000 |

*Infrastructure flat cost: ~Rp 750,000/month (Vercel + Supabase at current scale).*

Note: 60% conversion is achievable only with strong product-market fit and active community. 5–20% is the realistic expectation for a cold early-access cohort.

---

## Constraints as Product Design

The current limits are not just cost controls — they are **product philosophy**:

- **5 rooms** — deliberation spaces, not infinite chat history
- **4 participants** — enough diversity, not noise
- **Sequential turns** — one voice at a time, followable discussion

These constraints make Briom feel like a structured thinking tool, not another AI chat app.

---

## What's Next

**Near-term (v0.0.2):**

- File/document attachment (context injection into deliberation)
- Usage dashboard (credits remaining, turns used)
- Credit top-up flow (Stripe or local payment gateway)

**Medium-term:**

- Unlock paid AI models (GPT-4o, Claude Sonnet, Gemini Pro)
- Room templates (strategy, research, product critique)
- Export/summary of deliberation

**Long-term:**

- Team rooms (multiple human moderators, shared credit pool)
- API access for developers
- White-label for enterprise knowledge work

---

## The Bet

The future of AI is not one perfect model.

It is humans orchestrating collaborative reasoning between multiple AI perspectives — and knowing how to steer that conversation toward insight.

Briom is building the room where that happens.

---

*Built solo. Deployed. Real users. Honest math.*
