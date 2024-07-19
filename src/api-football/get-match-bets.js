import { httpClient } from "./http-client.js";

export const getMatchBets = async ({ fixtureId, bookmakerId }) => {
  const { data } = await httpClient.get("odds/bets", {
    params: { fixture: fixtureId, bookmaker: bookmakerId },
  });

  const [matchOddsFromBookmaker] = data.response;

  if (!matchOddsFromBookmaker) {
    return;
  }

  const {
    bookmakers: { bets },
  } = matchOddsFromBookmaker;

  return bets;
};
