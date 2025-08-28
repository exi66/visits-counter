const express = require("express");
const router = express.Router();
const knex = require("knex")(require("../knexfile").development);

router.get("/:url", function (req, res, next) {
  const referrer = req.get("Referer") ?? req.get("Referrer") ?? null;

  if (!referrer || !referrer.includes(process.env.HOSTNAME || "localhost")) {
    return res.status(403).send("Forbidden: Invalid referrer");
  }

  if (!req.params.url) {
    return res.status(400).send("URL parameter is required");
  }

  const color = req.query.color || "black";
  const width = parseInt(req.query.width) || 42;
  const height = parseInt(req.query.height) || 14;

  knex("counters")
    .where({ url: req.params.url })
    .first()
    .then((counter) => {
      if (counter) {
        return knex("counters")
          .where({ id: counter.id })
          .update({ visits: counter.visits + 1 })
          .then(() => {
            res.setHeader("content-type", "image/svg+xml");
            res.render("counter", {
              label: kmb.format(counter.visits + 1),
              color,
              width,
              height,
            });
          });
      } else {
        return knex("counters")
          .insert({ url: req.params.url, visits: 1 })
          .then(() => {
            res.setHeader("content-type", "image/svg+xml");
            res.render("counter", {
              label: kmb.format(1),
              color,
              width,
              height,
            });
          });
      }
    })
    .catch(() => {
      res.status(500).send("Internal Server Error");
    });
});

const kmb = Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

module.exports = router;
