import { httpClient } from "./http-client.js";

export const getMatchPrediction = async ({ fixtureId }) => {
  const { data } = await httpClient.get(`predictions?fixture=${fixtureId}`);
  const [response] = data.response;

  if (!response) {
    return;
  }

  const { predictions, teams, h2h } = response;

  const homeTeamId = teams.home.id;
  const awayTeamId = teams.away.id;

  const previousYear = Number(new Date().getFullYear()) - 1;

  return {
    teams: {
      home: {
        id: homeTeamId,
        name: teams.home.name,
      },
      away: {
        id: awayTeamId,
        name: teams.away.name,
      },
    },
    prediction: {
      winner: predictions.winner,
      comment: predictions.winner?.comment,
      percent: predictions.percent,
      advice: predictions.advice,
    },
    lastMatches: h2h
      .filter((match) => getISODateYear(match.fixture.date) >= previousYear)
      .map((match) => ({
        home: match.teams.home.name,
        away: match.teams.away.name,
        winner: match.teams.home.winner
          ? match.teams.home.name
          : match.teams.away.winner
          ? match.teams.away.name
          : "N/A",
        score: {
          home: match.goals.home ?? 0,
          away: match.goals.away ?? 0,
        },
      })),
  };
};

const getISODateYear = (isoDateStr) => {
  const [year] = isoDateStr.split("-");

  return Number(year);
};
