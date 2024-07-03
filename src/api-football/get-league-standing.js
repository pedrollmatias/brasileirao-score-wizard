import { httpClient } from "./http-client.js";

export const getLeagueStanding = async ({ league, season }) => {
  const { data } = await httpClient.get(
    `standings?league=${league}&season=${season}`
  );

  const [_league] = data.response;
  const { standings } = _league.league;
  const [standing] = standings;

  return standing
    .map((team) => ({
      rank: team.rank,
      id: team.id,
      name: team.team.name,
      points: team.points,
      played: team.all.played,
      wins: team.all.win,
      draws: team.all.draw,
      looses: team.all.lose,
      goalsFor: team.all.goals.for,
      goalsAgainst: team.all.goals.against,
      goalDifference: team.all.goals.for - team.all.goals.against,
      lastMatches: team.form.split("").reverse(),
      efficiency: ((team.points / (team.all.played * 3)) * 100).toFixed(2),
    }))
    .sort((a, b) => a.rank - b.rank);
};
