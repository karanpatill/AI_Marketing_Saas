# Automarc - Master SaaS Strategy & Economics

This document contains the complete technical architecture, pricing strategy, and growth mechanics for Automarc.

## 1. The Dual-Phase Tech Stack
To ensure $0 upfront costs during development and seamless scaling in production.

**Phase 1: Bootstrapping ($0 Budget)**
*   **Brain (Strategy):** Google Gemini 1.5 Flash API (100% Free Tier)
*   **Image Engine:** Pollinations.ai / Hugging Face (Free)
*   **Storage:** Supabase Storage (Free Tier)
*   **Queue/CRON:** Trigger.dev (Free Hobby Tier)

**Phase 2: Production (Paying Customers)**
*   **Brain (Strategy):** Anthropic Claude 3.5 Sonnet (The ultimate anti-slop engine)
*   **Image Engine:** OpenAI DALL-E 3 (~$0.04 / image)
*   **Video Engine:** Higgsfield API (Best-in-class controllable video generation)
*   **Storage:** Cloudflare R2 (Zero egress fees)

---

## 2. Token System & Generation Costs (Updated Real API Economics)
Backend logic auto-scales the cost based on the format complexity.
*   **Base Token Value:** 1 Token = ~₹3 API Cost.
*   **1 Static Post (DALL-E 3):** Costs 1 Token (API Cost: ~₹3)
*   **1 Carousel (4 slides):** Costs 4 Tokens (API Cost: ~₹12)
*   **1 Cinematic Video (10s Veo/Higgsfield):** Costs 27 Tokens (API Cost: ~₹80)

---

## 3. SaaS Subscription Plans (AI Marketing OS)
The platform is an "Autopilot Marketing OS". You pay for a 30-day automated calendar, and the pricing tiers are controlled by the *mix* of content types you get. Every paid plan also includes free manual tokens for on-demand studio generation.

*   **Starter OS (₹1,499/mo):** Unbeatable value for small businesses.
    *   *30-Day Mix:* 15 Static + 10 Carousels + **5 Cinematic Videos**.
    *   *Free Bonus:* **50 Manual Tokens**.
    *   *Cost to Serve:* ~₹565 (Auto-pilot) + ~₹150 (Tokens) = ₹715 API Cost.
    *   *Net Profit:* **₹784 / user (52% Margin)**

*   **Pro OS (₹2,999/mo):** High-growth video-heavy engine.
    *   *30-Day Mix:* 5 Static + 10 Carousels + **15 Cinematic Videos** (A cinematic video every other day).
    *   *Free Bonus:* **150 Manual Tokens**.
    *   *Cost to Serve:* ~₹1,335 (Auto-pilot) + ~₹450 (Tokens) = ₹1,785 API Cost.
    *   *Net Profit:* **₹1,214 / user (40% Margin)**

*   **Agency OS (₹9,999/mo):** Ultimate multi-brand powerhouse.
    *   *Capacity:* Manages up to 5 Brands simultaneously (150 posts total).
    *   *Mix per Brand:* 10 Static + 10 Carousels + **10 Cinematic Videos** (50 videos/mo total).
    *   *Free Bonus:* **500 Manual Tokens**.
    *   *Cost to Serve (5 Brands):* ~₹4,750 (Auto-pilot) + ~₹1,500 (Tokens) = ₹6,250 API Cost.
    *   *Net Profit:* **₹3,749 / user (37% Margin)**

---

## 4. The Micro-Transaction Goldmines

### A. Token Top-Up Packs (For Heavy Users)
*   **100 Tokens Pack:** Sell for **₹799**.
    *   *API Cost:* ~₹300
    *   *Net Profit:* **₹499 (62% Margin)**

### B. The Infinite "₹50 Loop" (Freemium Growth Hack)
1. Free users generate amazing posts but they have an "Automarc" watermark.
2. They click Download/Post. Popup appears: *"Unlock Full HD, Remove Watermark, and get 10 Bonus Tokens for just ₹50."*
3. They pay via UPI (frictionless).
4. *Economics:* Revenue: ₹50. API Cost for 10 new tokens: ~₹30. Net Profit: ₹20.
5. They use the 10 tokens, get watermarks again, and repeat the ₹50 payment until they upgrade to the ₹4,999 Growth OS plan.

---

## 5. The "Anti-Slop" Agentic Architecture (The Moat)
Automarc does not use a basic "give me 30 posts" prompt. It uses a **Multi-Agent Pipeline** in Trigger.dev to ensure agency-quality, non-boring content.

**The Trigger.dev Pipeline:**
1.  **Brand Strategist Agent:** Reads the user's industry and builds a "Brand DNA" object (visual language, tone, avoided words).
2.  **Idea Factory Agent:** Generates 100 raw "Hook Mechanics" (e.g., Bollywood Recontextualization, Expectation vs Reality, POV).
3.  **Anti-Slop Evaluator:** An AI Critic that ruthlessly deletes any hook that sounds corporate, generic, or "AI-generated". Passes only the top 30 ideas.
4.  **Format Orchestrator:** Maps the 30 ideas to a strict schedule (Static → Carousel → Video) and writes the exact captions and DALL-E/Higgsfield prompts.

---

## 6. Cost Optimization Architecture (Daily Execution)
*   **The Monthly Planner:** The pipeline above runs *once a month*. It generates text only (JSON Plan) and saves it to the database. (Very cheap).
*   **The Daily Generator:** A daily CRON job runs at 6:00 AM, looks at today's JSON plan, and *only then* calls DALL-E / Higgsfield to generate the media.
*   **Why?** Prevents API rate limits, allows real-time adjustments if the user changes their Brand DNA mid-month, and prevents massive upfront API costs if a user cancels.
