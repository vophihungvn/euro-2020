require("dotenv").config();
const slackEvents = require("./message-webhook");
const express = require("express");

const axios = require("axios");
const apiRouter = require("./app/api");

const app = express();
app.use("/api", apiRouter);

app.use("/", slackEvents.expressMiddleware());

app.listen(3000, () => {
  console.log("App is listening on port 4000");
});
