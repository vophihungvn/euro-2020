// Read data file

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

const tables = [];

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

const init = () => {
  readTable();
};

const getGroups = () => {
  return tables;
};

init();

module.exports = {
  getGroups,
  countryFlags,
};
