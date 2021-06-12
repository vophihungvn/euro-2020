const fs = require("fs");
const moment = require("moment");
const Router = require("express").Router;
const { getStanding, getMatch } = require("./services/football-api-data");
const { syncMatch } = require("./services/cron-task");

const router = Router();

router.get("/new", (req, res) => {
  res.json({ status: "ok" });
});

router.get("/sync/standings", async (req, res) => {
  const standings = await getStanding();
  fs.writeFileSync(
    "data/temp-data/standing.json",
    JSON.stringify(standings.standings, null, 2)
  );
  res.json({ status: "ok" });
});

router.get("/sync/match", async (req, res) => {
  // const matches = await getMatch();
  // fs.writeFileSync(
  //   "data/temp-data/standing.json",
  //   JSON.stringify(
  //     {
  //       updated: moment().format("YYYY-MM-DD HH:mm:ss"),
  //       matches: matches.matches,
  //     },
  //     null,
  //     2
  //   )
  // );

  const matches = await syncMatch();

  res.json({
    status: matches,
  });
});

module.exports = router;
