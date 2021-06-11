const moment = require("moment");
const { sendMessage, web } = require("./slack-service");
const { getGroups, countryFlags, getSchedules } = require("./data-service");
const getCommand = (message) => {
  const [command, ...details] = message.split(" ");
  console.log({ command, details });
  if (command !== "euro" && command != process.env.BOT_MENTIONED) {
    throw new Error("Command not found");
  }

  // Check detail[0] go get specific action

  return {
    command: details[0],
    details,
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

const sendTodayMatch = async () => {
  const schedules = getSchedules();

  const from = moment().hour(18).minute(0);
  const to = moment().add(1, "d").hour(6);

  const todaySchedule = schedules.filter((s) => {
    return s.fullDate.isAfter(from) && s.fullDate.isBefore(to);
  });

  console.log(todaySchedule);
  const groupMessages = [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: ":soccer:  Euro 2020: Today match",
      },
    },
    ...todaySchedule.map((match) => ({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `:alarm_clock: ${match.fullDate.format(
          "DD/MM @ HH:mm"
        )}    |    ${countryFlags[match.t1]} ${match.t1} - ${
          countryFlags[match.t2]
        } ${match.t2}     |     :stadium:  ${match.stadium} `,
      },
    })),
  ];

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
  }
};

module.exports = {
  getCommand,
  processMessage,
};
