const { sendMessage, web } = require("./slack-service");
const { getGroups, countryFlags } = require("./data-service");
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
  console.log(groups);
  const groupMessages = [];
  Object.keys(groups).forEach((group) => {
    console.log(group);
    groupMessages.push({
      type: "divider",
    });

    groupMessages.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: "*" + group + "*",
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

  console.log(groupMessages);
  await sendMessage({
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: ":soccer:  Euro 2020 Groups",
        },
      },

      ...groupMessages,
    ],
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
  }
};

module.exports = {
  getCommand,
  processMessage,
};
