// Read data file
const moment = require("moment");

const fs = require("fs");

const countryFlags = {
  // A
  Turkey: "đšđˇ",
  Italy: "đŽđš",
  Wales: "đ´ó §ó ˘ó ˇó Źó łó ż",
  Switzerland: "đ¨đ­",

  //B
  Denmark: "đŠđ°",
  Finland: "đŤđŽ",
  Belgium: "đ§đŞ",
  Russia: "đˇđş",

  //C
  Netherlands: "đłđą",
  Ukraine: "đşđŚ",
  Austria: "đŚđš",
  "North Macedonia": "đ˛đ°",

  //D
  England: "đ´ó §ó ˘ó Ľó Žó §ó ż",
  Croatia: "đ­đˇ",
  Scotland: "đ´ó §ó ˘ó łó Łó ´ó ż",
  "Czech Republic": "đ¨đż",

  //E
  Spain: "đŞđ¸",
  Sweden: "đ¸đŞ",
  Poland: "đľđą",
  Slovakia: "đ¸đ°",

  //F
  Hungary: "đ­đş",
  Portugal: "đľđš",
  France: "đŤđˇ",
  Germany: "đŠđŞ",
};

const tables = {};
const schedules = [];

const teamPadding = {
  // A
  Turkey: 10,
  Italy: 10,
  Wales: 9,
  Switzerland: 13,

  // //B
  // Denmark: "đŠđ°",
  // Finland: "đŤđŽ",
  // Belgium: "đ§đŞ",
  // Russia: "đˇđş",

  // //C
  // Netherlands: "đłđą",
  // Ukraine: "đşđŚ",
  // Austria: "đŚđš",
  // "North Macedonia": "đ˛đ°",

  // //D
  // England: "đ´ó §ó ˘ó Ľó Žó §ó ż",
  // Croatia: "đ­đˇ",
  // Scotland: "đ´ó §ó ˘ó łó Łó ´ó ż",
  // "Czech Republic": "đ¨đż",

  // //E
  // Spain: "đŞđ¸",
  // Sweden: "đ¸đŞ",
  // Poland: "đľđą",
  // Slovakia: "đ¸đ°",

  // //F
  // Hungary: "đ­đş",
  // Portugal: "đľđš",
  // France: "đŤđˇ",
  // Germany: "đŠđŞ",
};

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

const getFullCountryName = (country) => `${countryFlags[country]} ${country}`;

module.exports = {
  getGroups,
  getSchedules,
  countryFlags,
  teamPadding,
  getFullCountryName,
};
