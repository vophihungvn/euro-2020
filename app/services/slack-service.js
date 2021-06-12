const { WebClient } = require("@slack/web-api");

// An access token (from your Slack app or custom integration - xoxp, xoxb)
const token = process.env.SLACK_TOKEN;

const web = new WebClient(token);

// This argument can be a channel ID, a DM ID, a MPDM ID, or a group ID
const channelId = process.env.SLACK_CHANNEL;

const sendMessage = async ({ text, blocks }) => {
  const params = {};
  if (text) {
    params.text = text;
  }

  if (blocks) {
    params.blocks = blocks;
  }
  const res = await web.chat.postMessage({
    channel: channelId,
    ...params,
  });

  // `res` contains information about the posted message
  console.log("Message sent: ", res.ts);
};

module.exports = {
  sendMessage,
};
