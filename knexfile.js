// Update with your config settings.

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
  development: {
    client: "better-sqlite3",
    connection: {
      filename: "./data.sqlite3",
    },
  },
  staging: {
    client: "better-sqlite3",
    connection: {
      filename: "./data.sqlite3",
    },
  },
  production: {
    client: "better-sqlite3",
    connection: {
      filename: "./data.sqlite3",
    },
  },
};
