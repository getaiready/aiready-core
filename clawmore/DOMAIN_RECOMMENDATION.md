# ClawMore Domain Recommendation Report

**Date:** March 26, 2026
**Status:** DOMAIN_PURCHASED - CODE_UPDATED - AWAITING_DEPLOY

---

## Executive Summary

**Dual-domain strategy implemented:**

- **Primary (Brand):** `clawmore.ai` — PURCHASED, code updated
- **Secondary (Developer):** `serverlessclaw.dev` — pending registration

---

## What Was Done

All source code references updated from `clawmore.getaiready.dev` to `clawmore.ai`:

- `clawmore/sst.config.ts` — domain config, Stripe webhook URL, env vars
- `clawmore/app/page.tsx` — OpenGraph URL, canonical URL
- `clawmore/app/layout.tsx` — metadataBase, OpenGraph URL
- `clawmore/app/sitemap.ts` — baseUrl
- `clawmore/app/robots.ts` — sitemap URL
- `clawmore/app/api/ai/proxy/route.ts` — HTTP-Referer header
- `clawmore/.env.example` — NEXT_PUBLIC_APP_URL
- `clawmore/playwright.config.prod.ts` — baseURL
- `clawmore/e2e/seo.spec.ts` — test assertions
- All 18+ blog post page.tsx files — JSON-LD BlogPosting schemas

---

## Remaining Action Items

- [ ] Deploy to production (`pnpm sst deploy --stage production`)
- [ ] Update Cloudflare DNS zone for `clawmore.ai` (new zone ID needed)
- [ ] Set up 301 redirect from `clawmore.getaiready.dev` to `clawmore.ai` in Cloudflare

### Subdomain Architecture (using clawmore.ai)

- `clawmore.ai` — main SaaS dashboard
- `docs.clawmore.ai` — developer documentation (if needed)
- `api.clawmore.ai` — API reference (if needed)
- `clawmore.getaiready.dev` — 301 redirect to `clawmore.ai`
