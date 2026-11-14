const app = require("./app");
const knex = require("./db");

const port = process.env.PORT || 3000;

async function main() {
  await knex.migrate.latest();

  const server = app.listen(port, () => {
    console.log(`Listening on port ${port}`);
  });

  const shutdown = (signal) => {
    console.log(`${signal} received, shutting down`);
    server.close(async () => {
      await knex.destroy();
      process.exit(0);
    });
  };
  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
