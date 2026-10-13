# Local Runtime Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Run Transformer Explainer on localhost without runtime downloads from external services.

**Architecture:** Keep the existing browser GPT-2 inference and its 63 local ONNX chunks. Vendor the two tokenizer JSON files and Jersey font, serve ONNX WASM from the installed package, and bundle KaTeX CSS and fonts. Disable remote tokenizer fallback, remove analytics mounting, and replace the automatically loaded video with an external link.

**Tech Stack:** SvelteKit, Transformers.js 2.17.2, ONNX Runtime Web 1.23.0, Vite, Node.js.

## Findings and scope

- `src/routes/+page.svelte` downloads `Xenova/gpt2` tokenizer before activating the visualization and loads ONNX WASM from jsDelivr.
- Model chunks already exist in `static/model-v2/` (about 626 MiB). Local startup still needs disk reads and browser initialization.
- Google Fonts, KaTeX CDN CSS, the tutorial iframe, and optional analytics create additional external requests.
- The existing lockfile pairs Vite 5 with Svelte plugin 6, whose peer requirement is Vite 6.3 or 7. Fresh `npm ci` fails with ERESOLVE. Align Vite with version 6, preserving the rest of the stack.
- The user has authorized the local conversion. Work continues in this directory; it has no Git metadata. Original source is backed up in `/tmp/transformer-explainer-before-local.tar.gz`.

## Tasks

1. Fix the Vite peer dependency conflict and install dependencies. Record baseline check diagnostics.
2. Add pinned tokenizer assets and font with source/license notes; copy matching ONNX WASM files using a local-only preparation script.
3. Share one local tokenizer loader, disable remote fallback, use local ONNX paths, and display startup errors. Update both tokenizer entry points.
4. Bundle KaTeX CSS, serve the font locally, remove analytics mounting, and replace the video iframe with a link. Make the production base path local by default and configurable for GitHub Pages.
5. Add an offline tokenizer regression test with known GPT-2 token IDs, round trips, and a missing-file failure. Add asset checks before dev/build.
6. Run asset tests, Svelte checks, and a production build. In a clean browser context, block all external requests, load the actual ONNX model, edit input, and generate a token. Verify production base-path handling too.
7. Document local startup, first-install requirements, runtime asset locations, and the remaining local model load time.

## Design choice

Browser caching alone still requires a successful first external download. Replacing GPT-2 with mock data removes live inference. Bundling the existing resources preserves the learning experience and makes cold starts independent of external networks.

## Verification and handoff

- `npm test`: passed. Networking is disabled; known token IDs, Unicode round trips, singleton reuse, and missing-file behavior are checked.
- Default production build: passed. The final `build/` uses the local root path.
- Production browser test on a previously unused localhost origin: passed with a CSP blocking external resources. Both tokenizer files, all 63 model chunks, and the ONNX JSEP module/WASM were served locally, with no HTTP errors or browser console warnings/errors. A custom prompt and two consecutive generations worked.
- Subpath production build: passed. Its browser validation was interrupted by the user requesting that all test servers be stopped; no browser success claim is made for that build.
- `npm ci --dry-run --ignore-scripts --offline`: passed against the updated lockfile and local npm cache.
- Full Svelte type checks remain failing: 498 errors. The original source with only the Sass path normalized produced 499 errors under the same installed toolchain. This task does not claim a passing type check.
- At the user's request, all services on 5173–5175 were terminated. No server is left running; subsequent manual testing belongs to the user.
