import { httpClient } from "./http-client.js";

export const getTeamStatistics = async ({ teamId, leagueId, season }) => {
  const { data } = await httpClient.get("teams/statistics", {
    params: { league: leagueId, season, team: teamId },
  });
  const statistics = data.response;

  if (!statistics) {
    return;
  }

  const {
    goals,
    cards,
    form,
    biggest,
    clean_sheet,
    failed_to_score,
    penalty,
    lineups,
  } = statistics;

  return {
    goals,
    cards,
    form: form.split("").reverse(),
    biggest,
    clean_sheet,
    failed_to_score,
    penalty,
    lineups,
  };
};
