require("dotenv").config();
const slackEvents = require("./message-webhook");
const express = require("express");

const app = express();
app.use("/", slackEvents.expressMiddleware());

app.get("/", (req, res) => {
  res.json({
    status: "ok",
  });
});

app.listen(3000, () => {
  console.log("App is listening on port 4000");
});
