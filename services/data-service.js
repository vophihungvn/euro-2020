// Read data file
const moment = require("moment");

const fs = require("fs");

const countryFlags = {
  // A
  Turkey: "🇹🇷",
  Italy: "🇮🇹",
  Wales: "🏴󠁧󠁢󠁷󠁬󠁳󠁿",
  Switzerland: "🇨🇭",

  //B
  Denmark: "🇩🇰",
  Finland: "🇫🇮",
  Belgium: "🇧🇪",
  Russia: "🇷🇺",

  //C
  Netherlands: "🇳🇱",
  Ukraine: "🇺🇦",
  Austria: "🇦🇹",
  "North Macedonia": "🇲🇰",

  //D
  England: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  Croatia: "🇭🇷",
  Scotland: "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  "Czech Republic": "🇨🇿",

  //E
  Spain: "🇪🇸",
  Sweden: "🇸🇪",
  Poland: "🇵🇱",
  Slovakia: "🇸🇰",

  //F
  Hungary: "🇭🇺",
  Portugal: "🇵🇹",
  France: "🇫🇷",
  Germany: "🇩🇪",
};

const tables = {};
const schedules = [];

const readTable = () => {
  const groups = fs.readFileSync("data/groups.txt").toString().split("\n");
  groups.forEach((group) => {
    const [groupName, ...countries] = group.split(" | ");
    tables[groupName] = countries;
    // console.log({
    //   groupName,
    //   countries,
    // });
  });
};

const readSchedule = () => {
  const data = fs.readFileSync("data/schedule.txt").toString().split("\n");
  data.forEach((row) => {
    const [group, date, time, t1, s1, s2, t2, stadium] = row.split(" | ");
    schedules.push({
      group,
      date: moment(date, "MM/DD"),
      time: moment(time, "HH:mm"),
      t1,
      s1,
      s2,
      t2,
      stadium,
      fullDate: moment(`${date} ${time}`, "MM/DD HH:mm"),
    });
  });
};

const init = () => {
  readTable();
  readSchedule();
};

const getSchedules = () => {
  return schedules;
};

const getGroups = () => {
  return tables;
};

init();

module.exports = {
  getGroups,
  getSchedules,
  countryFlags,
};
