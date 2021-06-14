// TODO: Migrate to https://github.com/slackapi/bolt-js

// Initialize using signing secret from environment variables
const { App, ExpressReceiver } = require("@slack/bolt");
const { createEventAdapter } = require("@slack/events-api");
const {
  getCommand,
  processMessage,
} = require("./app/services/message-processor");
const { processBet } = require("./app/services/spreadsheet");
const slackEvents = createEventAdapter(process.env.SLACK_SIGNING_SECRET);
// Setup slack app

const receiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  endpoints: {
    events: `/slack/events`,
    action: `/slack/actions`,
  },
});

const app = new App({
  receiver,
  token: process.env.SLACK_TOKEN,
});

// Attach listeners to events by Slack Event "type". See: https://api.slack.com/events/message.im
slackEvents.on("message", (event) => {
  console.log(
    `Received a message event: user ${event.user} in channel ${event.channel} says ${event.text}`
  );

  if (event.user === process.env.BOT_ID) {
    return;
  }
  if (event.channel !== process.env.SLACK_CHANNEL) return;

  try {
    const { command, details } = getCommand(event.text);
    console.log({ command, details });
    processMessage(command, details);
  } catch (error) {
    // Send unknown message
    console.log(error);
    console.log("unknown message");
  }
});

// app.message(async ({ body, say }) => {
//   console.log("go to receive message");
//   console.log({ body });
//   await say(`Hey there, I'm app-a`);

//   return body;
// });

app.event("message", () => {
  console.log("new app on message");
});

app.action("select_bet", async ({ payload, ack, body, action }) => {
  console.log({
    payload,
    body,
    action,
  });
  ack();

  const user = body.user.id;
  const detail = JSON.parse(action.selected_option.value);

  await processBet(user, detail.match, detail.team);
});

// Handle errors (see `errorCodes` export)
slackEvents.on("error", console.error);

module.exports = {
  slackEvents,
  slackApp: app,

  slackReceiver: receiver,
};
