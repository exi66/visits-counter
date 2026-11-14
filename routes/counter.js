const express = require("express");
const knex = require("../db");

const router = express.Router();

const MAX_KEY_LENGTH = 255;
const MAX_SIZE = 1000;
const DEFAULT_HEIGHT = 14;
const COLOR_RE = /^(#[0-9a-f]{3,8}|[a-z]{1,20})$/i;

// SVG geometry, in viewBox units (see views/counter.ejs)
const VIEWBOX_HEIGHT = 24;
const TEXT_X = 25;
const CHAR_WIDTH = 10.6; // approx. Arial digit width at font-size 18.9
const PADDING_RIGHT = 2;

const allowedHosts = (process.env.ALLOWED_HOSTS || "localhost")
  .split(",")
  .map((host) => host.trim().toLowerCase())
  .filter(Boolean);

const compact = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

function isAllowedReferrer(referrer) {
  if (!referrer) return false;
  let hostname;
  try {
    hostname = new URL(referrer).hostname.toLowerCase();
  } catch {
    return false;
  }
  return allowedHosts.some(
    (host) => hostname === host || hostname.endsWith("." + host),
  );
}

function parseSize(value) {
  const size = parseInt(value, 10);
  if (!Number.isFinite(size)) return null;
  return Math.min(Math.max(size, 1), MAX_SIZE);
}

router.get("/:url", async (req, res) => {
  if (!isAllowedReferrer(req.get("Referer"))) {
    return res.status(403).send("Forbidden: Invalid referrer");
  }

  const url = req.params.url;
  if (url.length > MAX_KEY_LENGTH) {
    return res.status(400).send("Counter key is too long");
  }

  const color = COLOR_RE.test(req.query.color ?? "")
    ? req.query.color
    : "black";

  const [{ visits }] = await knex("counters")
    .insert({ url, visits: 1 })
    .onConflict("url")
    .merge({ visits: knex.raw("?? + 1", ["counters.visits"]) })
    .returning("visits");

  const label = compact.format(visits);
  const viewBoxWidth = TEXT_X + label.length * CHAR_WIDTH + PADDING_RIGHT;
  const height = parseSize(req.query.height) ?? DEFAULT_HEIGHT;
  const width =
    parseSize(req.query.width) ??
    Math.round((height * viewBoxWidth) / VIEWBOX_HEIGHT);

  res.set({
    "Content-Type": "image/svg+xml",
    "Cache-Control": "no-cache, no-store, must-revalidate",
    Expires: "0",
  });
  res.render("counter", {
    label,
    color,
    width,
    height,
    viewBoxWidth: viewBoxWidth.toFixed(1),
  });
});

module.exports = router;
