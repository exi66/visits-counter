const express = require("express");
const router = express.Router();
const knex = require("knex")(require("../knexfile").development);

router.get("/", function (req, res, next) {
  knex("counters")
    .select()
    .then((data) => {
      res.render("index", { data });
    })
    .catch((err) => {
      next(err);
    });
});

module.exports = router;
