const express = require("express");
const path = require("path");
const logger = require("morgan");

const indexRouter = require("./routes/index");
const counterRouter = require("./routes/counter");

const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

if (process.env.DEBUG) app.use(logger("dev"));
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/counter", counterRouter);

app.use((req, res) => {
  res.status(404);
  res.render("error", { message: "Not Found", status: 404 });
});

// eslint-disable-next-line no-unused-vars -- Express detects error handlers by arity
app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  if (status >= 500) console.error(err);
  res.status(status);
  res.render("error", {
    message: status >= 500 ? "Internal Server Error" : err.message,
    status,
  });
});

module.exports = app;
