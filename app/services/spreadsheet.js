const { GoogleSpreadsheet } = require("google-spreadsheet");
const config = require("../../config.json");
const fs = require("fs");
const moment = require("moment");
const { sendMessage } = require("./slack-service");
const userMapping = require("../../userMapping");

// Initialize the sheet - doc ID is the long id in the sheets URL
const doc = new GoogleSpreadsheet(process.env.SHEET_ID);

const reloadData = async () => {
  await doc.useServiceAccountAuth({
    client_email: config.client_email,
    private_key: config.private_key,
  });

  await doc.loadInfo(); // loads document properties and worksheets
};

const readSheet = async () => {
  await reloadData();
  console.log(doc.title);
  // await doc.updateProperties({ title: "renamed doc" });

  const sheet = doc.sheetsByIndex[1]; // or use doc.sheetsById[id] or doc.sheetsByTitle[title]
  console.log(sheet.title);
  console.log(sheet.rowCount);

  // read rows
  const rows = await sheet.getRows(); // can pass in { limit, offset }
  console.log({ rows });

  // // adding / removing sheets
  // const newSheet = await doc.addSheet({ title: "hot new sheet!" });
  // await newSheet.delete();
};

const popuplateData = async () => {
  await reloadData();

  const data = JSON.parse(fs.readFileSync("data/temp-data/matches.json"));
  console.log(data);
  console.log(doc.title);
  const sheet = doc.sheetsByIndex[2]; // or use doc.sheetsById[id] or doc.sheetsByTitle[title]
  const currentRows = await sheet.getRows();
  console.log({
    currentRows,
  });

  for (const match of data) {
    // console.log(match);
    await sheet.addRow({
      id: match.id,
      Bang: match.stage === "GROUP_STAGE" ? match.group : match.stage,
      Ngày: moment
        .utc(match.utcDate)
        .utcOffset("+07:00")
        .format("MM/DD/YYYY HH:mm"),
      "Team 1": match.homeTeam.name,
      "Team 2": match.awayTeam.name,
      "Kèo trên": "",
      "Tỷ lệ": "",
      Won: "",
      hung: "",
      xuanusm: "",
      longvo: "",
      tripham: "",
    });
  }
};

const processBet = async (userId, matchId, team) => {
  await reloadData();
  const username = userMapping[userId];
  console.log({
    userId,
    matchId,
    team,
    username,
  });

  if (!username) {
    // not registered yet
    console.log("User not registerd");
    await sendMessage({
      text: `This user has not been registered yet. Receiver user: ${userId}`,
    });
    return;
  }

  const sheet = doc.sheetsByIndex[1]; // or use doc.sheetsById[id] or doc.sheetsByTitle[title]
  const currentRows = await sheet.getRows();

  const choosenMatch = currentRows.find(
    (match) => match.id.toString() === matchId.toString()
  );

  if (choosenMatch) {
    choosenMatch[username] = team;
    await choosenMatch.save();

    // Send message bet
    await sendMessage({
      text: `<@${userId}> successfully betted on ${team} in match *${choosenMatch["Team 1"]} - ${choosenMatch["Team 2"]}*, good luck!`,
    });
  }
};

module.exports = {
  readSheet,
  popuplateData,
  processBet,
};
