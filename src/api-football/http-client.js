import axios from "axios";

const getHttpClient = () => {
  const instance = axios.create({
    baseURL: "https://v3.football.api-sports.io/",
    headers: {
      "x-rapidapi-host": "v3.football.api-sports.io/",
      "x-rapidapi-key": process.env.API_FOOTBALL_API_KEY,
    },
  });

  instance.interceptors.response.use(async (res) => {
    const { headers } = res;

    const remainingRateLimitRequests = headers["x-ratelimit-remaining"];
    const remainingRequests = headers["x-ratelimit-requests-remaining"];

    console.log(
      `Requisições gratuitas restantes no dia: ${remainingRequests}`
    );

    if (remainingRateLimitRequests === "0") {
      await waitApiFootbalFreeRateLimitToReset();
    }

    return res;
  });

  return instance;
};

export const httpClient = getHttpClient();

const waitApiFootbalFreeRateLimitToReset = () => {
  console.log(
    "Aguardando restar o tempo de rate limit do API Football para novas requisições (1min)..."
  );

  const minute = 1000 * 60; // 1min

  return new Promise((resolve) => setTimeout(resolve, minute));
};
