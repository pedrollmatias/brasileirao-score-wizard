import axios from "axios";

const getHttpClient = () => {
  return axios.create({
    baseURL: process.env.API_FOOTBALL_HOST,
    headers: {
      "x-rapidapi-host": process.env.API_FOOTBALL_API_HOST,
      "x-rapidapi-key": process.env.API_FOOTBALL_API_KEY,
    },
  });
};

export const httpClient = getHttpClient();
