const path = require("path");

/**
 * Single config for all environments; the database location comes from DB_PATH.
 * The knex CLI falls back to this object when no per-environment key exists.
 *
 * @type { import("knex").Knex.Config }
 */
module.exports = {
  client: "better-sqlite3",
  connection: {
    filename: process.env.DB_PATH || path.join(__dirname, "data.sqlite3"),
  },
  useNullAsDefault: true,
  migrations: {
    directory: path.join(__dirname, "migrations"),
  },
};
