# Automarc - Master SaaS Strategy & Economics

This document contains the complete technical architecture, pricing strategy, and growth mechanics for Automarc, a Premium AI Marketing OS for D2C Brands.

## 1. The Production Tech Stack (The "Anti-Slop" Engine)
Automarc does not use generic API wrappers. It uses a highly specialized multi-model stack to produce agency-quality D2C content.

*   **Brain / Strategy:** Anthropic Claude 3.5 Sonnet (The ultimate marketing copywriter; zero generic "AI slop" or emojis).
*   **Voice Engine:** OpenAI TTS (High-end, hyper-realistic voiceovers).
*   **Image Engine:** OpenAI DALL-E 3 (High prompt adherence for product/static shots, ~₹4.54 per 1024x1024 image).
*   **Video Engine:** Kling API (Standard Mode). Highly capable Image-to-Video API for cinematic product reveals (~₹34 per 10s video).
*   **Composition / Assembly:** Remotion (React-based video rendering to overlay precise D2C brand colors, fonts, and CTA buttons on top of Kling videos).
*   **Infrastructure (Fixed Costs):** Vercel Pro ($20), Supabase Pro ($25), Upstash QStash ($10), Resend ($10). Total Fixed Cost: ~₹5,450/month (Breaks even at ~8 paid users).

---

## 2. Token System & Generation Costs
Bonus Credits (Tokens) are offered to users to manually generate one-off content in the Studio (flash sales, etc.).

*   **1 Token** = 1 Static Image (DALL-E 3). API Cost: **~₹4.54**
*   **8 Tokens** = 1 Cinematic Video (10s Kling). API Cost: **~₹36.00**
*   *(Example: A 5-slide carousel deducts 5 Tokens).*

---

## 3. The Daily Autopilot Rotation (Cost Control)
To maintain a strict 30-50% profit margin while delivering daily posts, the AI Content Calendar strictly enforces a **1/3 Rotation Constraint**:
**[Carousel → Static Image → Cinematic Video]**

This guarantees that only 33% of automated posts are expensive videos, driving the blended API cost of a 30-day autopilot down to just **~₹540 per month**.

---

## 4. SaaS Subscription Plans (The Hybrid OS Model)
Automarc is a software-first automation tool. The core product is the Daily Autopilot, and the Bonus Credits are a creative perk.

*   **Free Plan (The Lead Magnet):**
    *   *Features:* 1 Workspace, 10 Bonus Credits.
    *   *Restriction:* **Manual Trigger Only.** No daily autopilot. All content is watermarked.

*   **Starter OS (₹1,489 / month):**
    *   *Target:* Solo D2C founders.
    *   *Engine:* 1 Workspace, **1 Post Daily** (Rotation).
    *   *Perk:* **30 Bonus Credits/mo**.
    *   *Max API Cost:* ₹540 (Auto) + ₹136 (Credits) = ₹676.
    *   *Net Profit:* **₹813 / user (54% Margin)**

*   **Growth OS (₹2,489 / month):**
    *   *Target:* Aggressive D2C brands.
    *   *Engine:* 1 Workspace, **2 Posts Daily** (Rotation).
    *   *Perk:* **60 Bonus Credits/mo**.
    *   *Max API Cost:* ₹1080 (Auto) + ₹272 (Credits) = ₹1352.
    *   *Net Profit:* **₹1,137 / user (45% Margin)**

*   **Build-Your-Own OS (Custom B2B Agency Tier):**
    *   *Target:* Marketing Agencies managing multiple clients.
    *   *Logic:* Minimum 2 Workspaces. Users drag sliders for Workspaces and Posts/Day.
    *   *Pricing Formula:* `(Workspaces) × (Posts/Day) × ₹1,489/mo`
    *   *Credits Bundled:* `(Workspaces) × (Posts/Day) × 30 Credits`
    *   *Margin:* Dynamically locked at a permanent **~55% Margin** regardless of scale.

---

## 5. The "₹50 Infinite Loop" (Freemium Growth Hack)
The Free Plan is monetized directly through high-friction micro-transactions.

1. Free users generate amazing posts in the Studio, but they have a large "Automarc" watermark.
2. When they click Download, a popup appears: *"Unlock Full HD, Remove Watermark, and get 10 Bonus Tokens for just ₹50."*
3. They pay instantly via a frictionless UPI QR code.
4. *Economics:* Revenue: ₹50. Cost for 10 Tokens: ~₹45. Net Profit: **₹5 per UPI scan.**
5. *The Loop:* They burn through the 10 tokens, hit the watermark wall again, and repeat the UPI scan until they get tired and upgrade to the full Starter OS.

---

## 6. The "Anti-Slop" Pipeline Architecture
Automarc never uses generic ChatGPT prompts. The Upstash QStash cron job triggers a multi-agent Claude pipeline:
1.  **The Strategist:** Reads Brand DNA, sets the psychological angle.
2.  **The Copywriter:** Writes punchy D2C copy (Strict Negative Prompt: No emojis, no corporate jargon, no "Unlock your potential").
3.  **The Art Director:** Generates the exact DALL-E 3 / Kling visual prompts.
4.  **The Composer (Remotion):** Merges the assets, overlays exact hex colors/fonts, and renders the final `.mp4`.
