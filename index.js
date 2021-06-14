require("dotenv").config();
const morgan = require("morgan");
const { slackEvents, slackReceiver } = require("./message-webhook");

const express = require("express");

const apiRouter = require("./app/api");

const app = express();
app.use(morgan("common"));
// app.use(express.json());
app.use("/api", apiRouter);

app.use("/slack/events", slackEvents.expressMiddleware());
app.use("/", slackReceiver.router);

app.listen(3000, () => {
  console.log("App is listening on port 4000");
});
