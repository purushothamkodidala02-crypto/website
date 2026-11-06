import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("proxy drops aggressive bots and probe paths early to conserve CDN bandwidth", async () => {
  const proxy = await read("proxy.ts");

  assert.match(proxy, /BLOCKED_BOT_REGEX/);
  assert.match(proxy, /bytespider/i);
  assert.match(proxy, /petalbot/i);
  assert.match(proxy, /gptbot/i);
  assert.match(proxy, /SUSPICIOUS_PATH_REGEX/);
  assert.match(proxy, /status:\s*403/);
  assert.match(proxy, /status:\s*404/);
  assert.match(proxy, /Cache-Control/);
});

test("robots.txt explicitly disallows aggressive scrapers and preserves site host", async () => {
  const robots = await read("app/robots.ts");

  assert.match(robots, /"Bytespider"/);
  assert.match(robots, /"GPTBot"/);
  assert.match(robots, /"ClaudeBot"/);
  assert.match(robots, /"PetalBot"/);
  assert.match(robots, /host:\s*absoluteUrl\("\/"\)/);
});

test("OpenGraph images export revalidate to cache dynamic PNGs on Edge CDN", async () => {
  const [mockTestOg, rootOg] = await Promise.all([
    read("app/mock-tests/[id]/opengraph-image.tsx"),
    read("app/opengraph-image.tsx"),
  ]);

  assert.match(mockTestOg, /export const revalidate\s*=\s*\d+/);
  assert.match(rootOg, /export const revalidate\s*=\s*\d+/);
});

test("catalog grids disable automatic prefetch to prevent viewport download storm", async () => {
  const [examGrid, catalogSteps, catalogPage] = await Promise.all([
    read("components/exams/ExamSelectionGrid.tsx"),
    read("components/exams/CatalogSteps.tsx"),
    read("app/mock-tests/page.tsx"),
  ]);

  assert.match(examGrid, /prefetch=\{false\}/);
  assert.match(catalogSteps, /prefetch=\{false\}/);
  assert.match(catalogPage, /prefetch=\{false\}/);
});

test("next.config.ts configures immutable cache headers for static public assets", async () => {
  const config = await read("next.config.ts");

  assert.match(config, /headers:\s*async/);
  assert.match(config, /Cache-Control/);
  assert.match(config, /max-age=31536000/);
});
