const express = require("express");
const knex = require("../db");

const router = express.Router();

router.get("/", async (req, res) => {
  const data = await knex("counters").select().orderBy("visits", "desc");
  res.render("index", { data });
});

module.exports = router;
