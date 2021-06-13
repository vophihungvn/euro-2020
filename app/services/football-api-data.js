const axios = require("axios");
const { getFullCountryName } = require("./data-service");

axios.interceptors.response.use(
  function (response) {
    console.log("Current response rate limit", {
      "x-requests-available-minute":
        response.headers["x-requests-available-minute"],
      "x-requestcounter-reset": response.headers["x-requestcounter-reset"],
    });
    return response;
  },
  function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    return Promise.reject(error);
  }
);

const BASE_URL = "http://api.football-data.org/v2/";
const COMPETITON = "2018";

const getStanding = async () => {
  const response = await axios.get(
    BASE_URL + `competitions/${COMPETITON}/standings`,
    {
      headers: {
        "X-Auth-Token": process.env.FB_API_KEY,
      },
    }
  );
  return response.data;
};

const getMatch = async () => {
  const response = await axios.get(
    BASE_URL + `competitions/${COMPETITON}/matches`,
    {
      headers: {
        "X-Auth-Token": process.env.FB_API_KEY,
      },
    }
  );
  return response.data;
};

const getMatchDetail = async (matchId) => {
  const response = await axios.get(BASE_URL + `matches/${matchId}`, {
    headers: {
      "X-Auth-Token": process.env.FB_API_KEY,
    },
  });
  return response.data;
};

module.exports = {
  getStanding,
  getMatch,
  getMatchDetail,
};
