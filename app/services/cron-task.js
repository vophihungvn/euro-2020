const fs = require("fs");
const moment = require("moment");
const cron = require("node-cron");
const { sendMessage } = require("./slack-service");
const { getFullCountryName } = require("./data-service");
const { getMatch, getMatchDetail } = require("./football-api-data");

const buildMatchBlock = (match) => {
  return {
    type: "section",
    text: {
      type: "mrkdwn",
      text: `${getFullCountryName(match?.homeTeam?.name)} ${
        match.score.fullTime.homeTeam
      } - ${match.score.fullTime.awayTeam} ${getFullCountryName(
        match?.awayTeam?.name
      )}            | [id: ${match.id}] | `,
    },
  };
};

const syncMatch = async () => {
  const res = await getMatch();

  const matches = res.matches;

  // check diff,
  // get current in play
  const inPlayMatches = matches.filter(
    (match) => match.status === "IN_PLAY" || match.status === "PAUSED"
  );

  let currentInPlay = [];
  try {
    currentInPlay = JSON.parse(
      fs.readFileSync("data/temp-data/matches-in-play.json").toString()
    );

    // con
  } catch (error) {}

  // console.log({ currentInPlay });

  // check new match
  const newInplay = inPlayMatches.filter((match) => {
    return !currentInPlay.some((inPlayMatch) => inPlayMatch.id === match.id);
  });
  // notify new inplay

  newInplay.forEach((match) => {
    const groupMessages = [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: ":soccer:  Euro 2020: New match start",
        },
      },
      buildMatchBlock(match),
    ];

    sendMessage({
      blocks: groupMessages,
    });
  });

  console.log({
    newInplay,
  });

  // check change

  await Promise.all(
    inPlayMatches.map(async (inPlay) => {
      const lastInPlay = currentInPlay.find((match) => match.id === inPlay.id);
      if (lastInPlay) {
        if (
          lastInPlay?.score?.fullTime?.homeTeam !==
          inPlay?.score?.fullTime?.homeTeam
        ) {
          if (
            lastInPlay?.score?.fullTime?.homeTeam <
            inPlay?.score?.fullTime?.homeTeam
          ) {
            await sendMessage({
              blocks: [
                {
                  type: "header",
                  text: {
                    type: "plain_text",
                    text: `:soccer:  Euro 2020: Goal for ${inPlay.homeTeam.name} !!!!! :soccer:`,
                  },
                },
                buildMatchBlock(inPlay),
              ],
            });
          } else {
            await sendMessage({
              blocks: [
                {
                  type: "header",
                  text: {
                    type: "plain_text",
                    text: ":soccer:  Euro 2020: Goal disallowed  !!!!! :soccer:",
                  },
                },
                buildMatchBlock(inPlay),
              ],
            });
          }
          // send home team new score
          console.log("Change score home", {
            lastInPlay,
            inPlay,
          });
        }

        if (
          lastInPlay?.score?.fullTime?.awayTeam !==
          inPlay?.score?.fullTime?.awayTeam
        ) {
          // send home team new score
          if (
            lastInPlay?.score?.fullTime?.awayTeam <
            inPlay?.score?.fullTime?.awayTeam
          ) {
            await sendMessage({
              blocks: [
                {
                  type: "header",
                  text: {
                    type: "plain_text",
                    text: `:soccer:  Euro 2020: Goal for ${inPlay.awayTeam.name} !!!!! :soccer:`,
                  },
                },
                buildMatchBlock(inPlay),
              ],
            });
          } else {
            await sendMessage({
              blocks: [
                {
                  type: "header",
                  text: {
                    type: "plain_text",
                    text: ":soccer:  Euro 2020: Goal disallowed  !!!!! :soccer:",
                  },
                },
                buildMatchBlock(inPlay),
              ],
            });
          }

          console.log("Change away home", {
            lastInPlay,
            inPlay,
          });
        }
      }
    })
  );

  // check finished match
  const finishedMatch = currentInPlay.filter((match) => {
    return !inPlayMatches.some((inPlayMatch) => inPlayMatch.id === match.id);
  });
  // notify new finished

  finishedMatch.forEach(async (match) => {
    await sendMessage({
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: `:soccer:  Euro 2020: Match finished`,
          },
        },
        buildMatchBlock(match),
      ],
    });
  });

  console.log("match finish", { finishedMatch });

  // save files
  fs.writeFileSync(
    "data/temp-data/matches.json",
    JSON.stringify(matches, null, 2)
  );

  fs.writeFileSync(
    "data/temp-data/matches-in-play.json",
    JSON.stringify(inPlayMatches, null, 2)
  );

  return inPlayMatches;
};

cron.schedule("*/60 * * * * *", () => {
  console.log("running every 30s");
  console.log(moment().format("YYYY-MM-DD HH:mm:ss"));
  syncMatch();
});

module.exports = {
  syncMatch,
};
