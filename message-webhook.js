// Initialize using signing secret from environment variables
const { createEventAdapter } = require("@slack/events-api");
const {
  getCommand,
  processMessage,
} = require("./app/services/message-processor");
const slackEvents = createEventAdapter(process.env.SLACK_SIGNING_SECRET);
const port = process.env.PORT || 3000;

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

// Handle errors (see `errorCodes` export)
slackEvents.on("error", console.error);

module.exports = slackEvents;
