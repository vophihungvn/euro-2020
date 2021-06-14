const fs = require("fs");
const moment = require("moment");
const { sendMessage, web } = require("./slack-service");
const {
  getGroups,
  countryFlags,
  getSchedules,
  teamPadding,
  getFullCountryName,
} = require("./data-service");
const { getStanding } = require("./football-api-data");
const getCommand = (message) => {
  const [command, ...details] = message.split(" ");
  // console.log({ command, details });
  if (command !== "euro" && command != process.env.BOT_MENTIONED) {
    throw new Error("Command not found");
  }

  // Check detail[0] go get specific action

  return {
    command: details[0],
    details: details.slice(1),
  };
};

const sendGroups = async () => {
  const groups = getGroups();
  const groupMessages = [];
  Object.keys(groups).forEach((group) => {
    groupMessages.push({
      type: "divider",
    });

    groupMessages.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: "* Group " + group + "*",
      },
    });

    groups[group].forEach((country) => {
      groupMessages.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: `${countryFlags[country]} ${country}`,
        },
      });
    });
  });

  await sendMessage({
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: ":soccer:  Euro 2020: Groups",
        },
      },

      ...groupMessages,
    ],
  });
};

const buildMatch = (match) => {
  const mm = moment(match.utcDate);
  const matchBlock = {
    type: "section",
    text: {
      type: "mrkdwn",
      text: `:alarm_clock: ${mm
        .utcOffset("+07:00")
        .format("DD/MM @ HH:mm")}    |   ${
        match.stage === "GROUP_STAGE" ? match.group : match.stage
      }\n${getFullCountryName(match?.homeTeam?.name)}     ${
        match.status !== "SCHEDULED"
          ? `*${match.score.fullTime.homeTeam} - ${match.score.fullTime.awayTeam}*`
          : " *-* "
      }     ${getFullCountryName(match?.awayTeam?.name)}`,
    },
  };

  if (mm.isSameOrAfter(moment())) {
    matchBlock.accessory = {
      action_id: "select_bet",
      type: "static_select",
      placeholder: {
        type: "plain_text",
        emoji: true,
        text: "Place your bet",
      },
      options: [
        {
          text: {
            type: "plain_text",
            emoji: true,
            text: getFullCountryName(match?.homeTeam?.name),
          },
          value: JSON.stringify({
            match: match.id,
            team: match.homeTeam.name,
          }),
        },
        {
          text: {
            type: "plain_text",
            emoji: true,
            text: getFullCountryName(match?.awayTeam?.name),
          },
          value: JSON.stringify({
            match: match.id,
            team: match.awayTeam.name,
          }),
        },
      ],
    };
  }

  return matchBlock;
};

const sendTodayMatch = async () => {
  // const schedules = getSchedules();

  const matches = JSON.parse(fs.readFileSync("data/temp-data/matches.json"));

  const from = moment().utcOffset("+07:00").hour(18).minute(0);
  const to = moment().utcOffset("+07:00").add(1, "d").hour(6);

  const todaySchedule = matches.filter((s) => {
    const mm = moment(s.utcDate);
    return mm.isAfter(from) && mm.isBefore(to);
  });

  const groupMessages = [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: ":soccer:  Euro 2020: Today match",
      },
    },
    ...todaySchedule.map(buildMatch),
  ];

  await sendMessage({
    blocks: groupMessages,
  });
};

const sendGroupMatch = async (group) => {
  const searchGroup = group.toLowerCase();
  const matches = JSON.parse(fs.readFileSync("data/temp-data/matches.json"));
  const todaySchedule = matches.filter(
    (s) =>
      (s.stage === "GROUP_STAGE" && (s?.group?.toLowerCase() ?? "")) ===
      `group ${searchGroup}`
  );

  const groupMessages = [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: `:soccer:  Euro 2020: Group ${group.toUpperCase()} matches`,
      },
    },
    ...todaySchedule.map(buildMatch),
  ];

  await sendMessage({
    blocks: groupMessages,
  });
};

const sendStanding = async () => {
  const data = fs.readFileSync("data/temp-data/standing.json").toString();
  const standings = JSON.parse(data);

  const groupMessages = [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: `:soccer:  Euro 2020: Groups Standing`,
      },
    },
  ];

  standings.forEach((groupStanding) => {
    const { group, table } = groupStanding;
    groupMessages.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: "* " + group + "*",
      },
    });
    const groupRows = [
      [
        "   ",
        "Team".padEnd(20, " "),
        "Played",
        "Win",
        "Draw",
        "Lost",
        "GF",
        "GA",
        "+/- ",
        "Pts",
      ].join("\t"),
    ];
    table.forEach((team) => {
      groupRows.push(
        [
          team.position,
          `${countryFlags[team.team.name]} ${team.team.name.padEnd(
            teamPadding?.[team.team.name] ?? 20,
            "\t"
          )}`,
          ,
          team.playedGames,
          team.won,
          team.draw,
          team.lost,
          team.goalsFor,
          team.goalsAgainst,
          team.goalDifference,
          team.point,
        ].join("\t")
      );
    });

    console.log({
      groupRows,
    });

    groupMessages.push({
      type: "section",
      fields: table.map((team) => ({
        type: "mrkdwn",
        text: [
          `${team.position}. ${countryFlags[team.team.name]} ${team.team.name}`,
          ["Played: " + team.playedGames, "Pts: " + (team.point ?? 0)]
            .map((i) => i.padEnd(10, " "))
            .join("\t|\t"),
          ,
          ["Win: " + team.won, "Draw: " + team.draw, "Lost: " + team.lost]
            .map((i) => i.padEnd(10, " "))
            .join("\t|\t"),

          [
            "GF: " + team.goalsFor,
            "GA: " + team.goalsAgainst,
            "+/- : " + team.goalDifference,
          ]
            .map((i) => i.padEnd(11, " "))
            .join("\t|\t"),

          "\t\n",
        ].join("\n"),
      })),
    });

    groupMessages.push({
      type: "divider",
    });
  });

  await sendMessage({
    blocks: groupMessages,
  });
};

const processMessage = (command, details = []) => {
  switch (command) {
    case "echo":
      sendMessage("receive");
      break;
    case "groups":
      sendGroups();
      break;
    case "today":
      sendTodayMatch();
      break;
    case "match":
      sendGroupMatch(details[0]);
      break;
    case "standing":
      sendStanding();
  }
};

module.exports = {
  getCommand,
  processMessage,
};
