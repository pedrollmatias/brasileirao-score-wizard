import "dotenv/config";

import fs from "fs";
import readline from "readline";

import { LeaguesEnum } from "./src/api-football/constants.js";
import { getLeagueRounds } from "./src/api-football/get-league-rounds.js";
import { getLeagueStanding } from "./src/api-football/get-league-standing.js";
import { getMatchPlayersStatistics } from "./src/api-football/get-match-players-statistics.js";
import { getMatchStatistics } from "./src/api-football/get-match-statistics.js";
import { getTeamPlayersStatistics } from "./src/api-football/get-team-players-statistics.js";
import { getTeamStatistics } from "./src/api-football/get-team-statistics.js";
import { getMatchPrediction } from "./src/api-football/get-match-prediction.js";
import {
  getAverageArr,
  getMaxArr,
  getMinArr,
  sumArr,
  waitApiFootbalFreeRateLimitToReset,
} from "./src/utils.js";

import {
  // getGloboEsporteMatchAnalysis,
  getUfmgMatchPrediction,
} from "./src/crawler.js";

const lastMatchesToAnalise = 5;

const runPrompt = async () => {
  const league = await new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(
      "Qual o campenato do jogo?\n1. Brasileirão Série A\n",
      (answer) => {
        rl.close();
        resolve(answer);
      }
    );
  });

  const leaguesMap = {
    1: LeaguesEnum.BRASILEIRAO_SERIE_A,
  };
  const leagueId = leaguesMap[league];

  const roundStr = await new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question("Qual a rodada do campeonato? (Ex: 3, 15, 38)\n", (answer) => {
      rl.close();
      resolve(answer);
    });
  });
  const round = Number(roundStr);
  const season = new Date().getFullYear();

  const { previousRounds, nextRound } = await getLeagueRounds({
    leagueId,
    season,
    round,
  });

  const matchIdx = await new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const matchesOptions = nextRound.reduce(
      (str, match, index) =>
        `${str}${index + 1}. ${match.home.name} x ${match.away.name}\n`,
      ""
    );

    rl.question(
      `Qual partida você quer prever as apostas?\n${matchesOptions}`,
      (answer) => {
        rl.close();
        resolve(answer);
      }
    );
  });
  const match = nextRound[Number(matchIdx) - 1];

  return {
    leagueId,
    match,
    previousRounds,
    season,
    round,
  };
};

const main = async () => {
  const { leagueId, match, previousRounds, season, round } = await runPrompt();
  const { home, away } = match;

  const teamIds = [home.id, away.id];
  const filteredPreviousRoundsByTeams = filterPreviousRoundsByTeamIds(
    teamIds,
    previousRounds
  );

  console.log(
    `** Gerando relatório da partida entre ${match.home.name} x ${match.away.name} **`
  );

  const { teamSquadValues } = await import(
    `./src/data/${season}/team-squad-values.js`
  );

  const standing = await getLeagueStanding({ leagueId, season });

  const { mainPlayers: homeMainPlayers } = await getTeamPlayersStatistics({
    teamId: home.id,
    leagueId,
    season,
  });

  const homeTeamStatistics = await getTeamStatistics({
    leagueId,
    season,
    teamId: home.id,
  });

  await waitApiFootbalFreeRateLimitToReset();

  const homePreviousMatches = (
    await Promise.all(
      Object.values(filteredPreviousRoundsByTeams)
        .slice(-lastMatchesToAnalise)
        .map(async (round) => {
          const _match = round.find((match) =>
            [match.home.id, match.away.id].includes(home.id)
          );

          return getPreviousMatchData({
            team: home,
            match: _match,
            mainPlayers: homeMainPlayers,
          });
        })
    )
  ).filter((match) => Boolean(match));

  await waitApiFootbalFreeRateLimitToReset();

  const calculatedHomeTeamStatistics = calculateSeasonTeamStatistics({
    teamId: home.id,
    previousMatches: homePreviousMatches,
    teamStatistics: homeTeamStatistics,
  });

  const { mainPlayers: awayMainPlayers } = await getTeamPlayersStatistics({
    teamId: away.id,
    leagueId,
    season,
  });
  const awayTeamStatistics = await getTeamStatistics({
    leagueId,
    season,
    teamId: away.id,
  });

  await waitApiFootbalFreeRateLimitToReset();

  const awayPreviousMatches = (
    await Promise.all(
      Object.values(filteredPreviousRoundsByTeams)
        .slice(-lastMatchesToAnalise)
        .map(async (round) => {
          const _match = round.find((match) =>
            [match.away.id, match.away.id].includes(away.id)
          );

          return getPreviousMatchData({
            team: away,
            match: _match,
            mainPlayer: awayMainPlayers,
          });
        })
    )
  ).filter((match) => Boolean(match));
  const calculatedAwayTeamStatistics = calculateSeasonTeamStatistics({
    teamId: away.id,
    previousMatches: awayPreviousMatches,
    teamStatistics: awayTeamStatistics,
  });

  const apiFootballPrediction = await getMatchPrediction({
    fixtureId: match.fixtureId,
  });
  // const ufmgPrediction = urlUfmg
  //   ? await getUfmgMatchPrediction({
  //       url: urlUfmg,
  //       home,
  //       away,
  //     })
  //   : null;

  const injuries = await getMatchInjuries({ fixtureId: match.fixtureId });

  const _match = {
    round,
    standing,
    home: {
      id: home.id,
      name: home.name,
      form: homeTeamStatistics.form,
      previousMatches: homePreviousMatches,
      statistics: {
        team: calculatedHomeTeamStatistics,
        mainPlayers: homeMainPlayers,
      },
    },
    away: {
      id: away.id,
      name: away.name,
      form: homeTeamStatistics.away,
      previousMatches: awayPreviousMatches,
      statistics: {
        team: calculatedAwayTeamStatistics,
        mainPlayers: awayMainPlayers,
      },
    },
    injuries,
    prediction: {
      apiFootballPrediction,
    },
  };

  const data = JSON.stringify(_match);

  fs.writeFileSync("./output.txt", data);

  console.log(data);

  console.log("** Relatório(s) gerados com sucesso! **");
};

const filterPreviousRoundsByTeamIds = (teamIds, previousRounds) => {
  return Object.entries(previousRounds).reduce((acc, [round, matches]) => {
    const teamMatches = matches.filter(
      (match) =>
        teamIds.includes(match.home.id) || teamIds.includes(match.away.id)
    );

    acc[round] = teamMatches;

    return acc;
  }, {});
};

const getPreviousMatchData = async ({ team, match, mainPlayers }) => {
  const { fixtureId, home } = match;

  const matchStats = await getMatchStatistics({ fixtureId, home });

  if (!matchStats) {
    return;
  }

  const matchPlayersStatistics = await getMatchPlayersStatistics({
    fixtureId,
    teamId: team.id,
    mainPlayers,
  });

  if (!matchPlayersStatistics) {
    return;
  }

  const { away: awayMatchStatistics, home: homeMatchStatistics } = matchStats;
  const { mainPlayers: mainPlayersPerformance } = matchPlayersStatistics;

  return {
    round: match.round,
    match: {
      home: {
        goals: match.score.home,
        ...homeMatchStatistics,
      },
      away: {
        goals: match.score.away,
        ...awayMatchStatistics,
      },
      mainPlayers: mainPlayersPerformance,
    },
  };
};

const calculateSeasonTeamStatistics = ({
  teamId,
  teamStatistics,
  previousMatches,
}) => {
  const goalsStatistics = {
    for: {
      total: {
        home: teamStatistics.goals.for.total.home,
        away: teamStatistics.goals.for.total.away,
        total: teamStatistics.goals.for.total.total,
      },
      avg: {
        home: teamStatistics.goals.for.average.home,
        away: teamStatistics.goals.for.average.away,
        total: teamStatistics.goals.for.average.total,
      },
      max: {
        home: teamStatistics.biggest.goals.for.home,
        away: teamStatistics.biggest.goals.for.away,
        total: getMaxArr([
          teamStatistics.biggest.goals.for.home,
          teamStatistics.biggest.goals.for.away,
        ]),
      },
    },
    against: {
      total: {
        home: teamStatistics.goals.against.total.home,
        away: teamStatistics.goals.against.total.away,
        total: teamStatistics.goals.against.total.total,
      },
      avg: {
        home: teamStatistics.goals.against.average.home,
        away: teamStatistics.goals.against.average.away,
        total: teamStatistics.goals.against.average.total,
      },
      max: {
        home: teamStatistics.biggest.goals.against.home,
        away: teamStatistics.biggest.goals.against.away,
        total: teamStatistics.biggest.goals.against.total,
      },
    },
  };

  const previousMatchesTotalShots = previousMatches.map(
    ({ match: previousMatch }) => {
      const team = getTeam(teamId, [previousMatch.home, previousMatch.away]);

      return team.shots.total;
    }
  );
  const previousMatchesOnShots = previousMatches.map(
    ({ match: previousMatch }) => {
      const team = getTeam(teamId, [previousMatch.home, previousMatch.away]);

      return team.shots.on;
    }
  );
  const previousMatchFouls = previousMatches.map(({ match: previousMatch }) => {
    const team = getTeam(teamId, [previousMatch.home, previousMatch.away]);

    return team.fouls;
  });
  const previousMatchCorners = previousMatches.map(
    ({ match: previousMatch }) => {
      const team = getTeam(teamId, [previousMatch.home, previousMatch.away]);

      return team.corners;
    }
  );
  const previousMatchYellowCards = previousMatches.map(
    ({ match: previousMatch }) => {
      const team = getTeam(teamId, [previousMatch.home, previousMatch.away]);

      return team.yellowCards;
    }
  );
  const previousMatchRedCards = previousMatches.map(
    ({ match: previousMatch }) => {
      const team = getTeam(teamId, [previousMatch.home, previousMatch.away]);

      return team.redCards;
    }
  );

  const shotsStatistics = {
    total: {
      total: sumArr(previousMatchesTotalShots),
      min: getMinArr(previousMatchesTotalShots),
      max: getMaxArr(previousMatchesTotalShots),
      avg: getAverageArr(previousMatchesTotalShots),
    },
    on: {
      total: sumArr(previousMatchesOnShots),
      min: getMinArr(previousMatchesOnShots),
      max: getMaxArr(previousMatchesOnShots),
      avg: getAverageArr(previousMatchesOnShots),
    },
  };

  const foulsStatistics = {
    total: sumArr(previousMatchFouls),
    min: getMinArr(previousMatchFouls),
    max: getMaxArr(previousMatchFouls),
    avg: getAverageArr(previousMatchFouls),
  };

  const cornersStatistics = {
    total: sumArr(previousMatchCorners),
    min: getMinArr(previousMatchCorners),
    max: getMaxArr(previousMatchCorners),
    avg: getAverageArr(previousMatchCorners),
  };

  const yellowCardsStatistics = {
    total: sumArr(previousMatchYellowCards),
    min: getMinArr(previousMatchYellowCards),
    max: getMaxArr(previousMatchYellowCards),
    avg: getAverageArr(previousMatchYellowCards),
  };

  const redCardsStatistics = {
    total: sumArr(previousMatchRedCards),
    min: getMinArr(previousMatchRedCards),
    max: getMaxArr(previousMatchRedCards),
    avg: getAverageArr(previousMatchRedCards),
  };

  return {
    goals: goalsStatistics,
    shots: shotsStatistics,
    fouls: foulsStatistics,
    corners: cornersStatistics,
    yellowCards: yellowCardsStatistics,
    redCards: redCardsStatistics,
  };
};

const getTeam = (teamId, teams) => {
  const [team1, team2] = teams;
  return teamId === team1.id ? team1 : team2;
};

(async () => {
  await main();
})();
