import axios from "axios";

const getHttpClient = () => {
  return axios.create({
    baseURL: "https://v3.football.api-sports.io/",
    headers: {
      "x-rapidapi-host": "v3.football.api-sports.io/",
      "x-rapidapi-key": process.env.API_FOOTBALL_API_KEY,
    },
  });
};

export const httpClient = getHttpClient();
