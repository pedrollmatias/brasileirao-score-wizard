import "dotenv/config";

import fs from "fs";
import readline from "readline";

import { BookmakersEnum, LeaguesEnum } from "./src/api-football/constants.js";
import { getLeagueRounds } from "./src/api-football/get-league-rounds.js";
import { getLeagueStanding } from "./src/api-football/get-league-standing.js";
import { getMatchPlayersStatistics } from "./src/api-football/get-match-players-statistics.js";
import { getMatchStatistics } from "./src/api-football/get-match-statistics.js";
import { getTeamPlayersStatistics } from "./src/api-football/get-team-players-statistics.js";
import { getTeamStatistics } from "./src/api-football/get-team-statistics.js";
import { getMatchPrediction } from "./src/api-football/get-match-prediction.js";
import { getAverageArr, getMaxArr, getMinArr, sumArr } from "./src/utils.js";

import {
  // getGloboEsporteMatchAnalysis,
  getUfmgMatchPrediction,
} from "./src/crawler.js";
import { getMatchInjuries } from "./src/api-football/get-match-injuries.js";
import { getMatchBets } from "./src/api-football/get-match-bets.js";

const lastMatchesToAnalise = Number(process.env.LAST_MATCHES_TO_ANALISE) || 5;

const runPrompt = async () => {
  const leagueId = LeaguesEnum.BRASILEIRAO_SERIE_A;
  const season = new Date().getFullYear();

  const { previousRounds, nextRound, round } = await getLeagueRounds({
    leagueId,
    season,
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
      `Qual partida você quer prever as apostas (Rodada ${round})?\n${matchesOptions}`,
      (answer) => {
        rl.close();
        resolve(answer);
      }
    );
  });
  const match = nextRound[Number(matchIdx) - 1];

  const bookmakerIdx = await new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(
      `Qual plataforma vc utiliza para as apostas?\n1. Bet365\n2. Betfair\n`,
      (answer) => {
        rl.close();
        resolve(answer);
      }
    );
  });
  const bookmakerMap = {
    1: BookmakersEnum.BET_365,
    2: BookmakersEnum.BETFAIR,
  };
  const bookmakerId = bookmakerMap[bookmakerIdx];

  return {
    bookmakerId,
    leagueId,
    match,
    previousRounds,
    season,
    round,
  };
};

const main = async () => {
  console.log("** Brasileirão Match Wizard **\n");

  const { leagueId, match, previousRounds, season, round, bookmakerId } =
    await runPrompt();
  const { home, away } = match;

  const teamIds = [home.id, away.id];

  console.log(
    `** Gerando relatório da partida entre ${match.home.name} x ${match.away.name} **`
  );

  const { teamSquadValues } = await import(
    `./src/data/${season}/team-squad-values.js`
  );

  const standing = await getLeagueStanding({ leagueId, season });
  const { home: homeInjuries, away: awayInjuries } = await getMatchInjuries({
    fixtureId: match.fixtureId,
    home,
    away,
  });

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

  const filteredPreviousRoundsByTeams = filterPreviousRoundsByTeamIds(
    teamIds,
    previousRounds
  );
  const { home: homeLastMatches, away: awayLastMatches } =
    getLastMatchesByTeams({
      previousRounds: filteredPreviousRoundsByTeams,
      home,
      away,
    });

  let homeLastMatchesData = [];
  let awayLastMatchesData = [];

  for (const homeLastMatch of homeLastMatches) {
    const homeMatchData = await getPreviousMatchData({
      team: home,
      match: homeLastMatch,
      mainPlayers: homeMainPlayers,
      injuries: homeInjuries.players,
    });

    if (!Boolean(homeMatchData)) {
      continue;
    }

    homeLastMatchesData = [...homeLastMatchesData, homeMatchData];
  }

  for (const awayLastMatch of awayLastMatches) {
    const awayMatchData = await getPreviousMatchData({
      team: away,
      match: awayLastMatch,
      mainPlayers: awayMainPlayers,
      injuries: awayInjuries.players,
    });

    if (!Boolean(awayMatchData)) {
      continue;
    }

    awayLastMatchesData = [...awayLastMatchesData, awayMatchData];
  }

  // const homePreviousMatches = (
  //   await Promise.all(
  //     Object.values(filteredPreviousRoundsByTeams)
  //       .slice(-lastMatchesToAnalise)
  //       .map(async (round) => {
  //         const _match = round.find((match) =>
  //           [match.home.id, match.away.id].includes(home.id)
  //         );

  //         return getPreviousMatchData({
  //           team: home,
  //           match: _match,
  //           mainPlayers: homeMainPlayers,
  //           injuries: homeInjuries.players,
  //         });
  //       })
  //   )
  // ).filter((match) => Boolean(match));

  // const awayPreviousMatches = (
  //   await Promise.all(
  //     Object.values(filteredPreviousRoundsByTeams)
  //       .slice(-lastMatchesToAnalise)
  //       .map(async (round) => {
  //         const _match = round.find((match) =>
  //           [match.home.id, match.away.id].includes(away.id)
  //         );

  //         return getPreviousMatchData({
  //           team: away,
  //           match: _match,
  //           mainPlayers: awayMainPlayers,
  //         });
  //       })
  //   )
  // ).filter((match) => Boolean(match));

  const apiFootballPrediction = await getMatchPrediction({
    fixtureId: match.fixtureId,
  });
  // // const ufmgPrediction = urlUfmg
  // //   ? await getUfmgMatchPrediction({
  // //       url: urlUfmg,
  // //       home,
  // //       away,
  // //     })
  // //   : null;

  const bets = await getMatchBets({
    fixtureId: match.fixtureId,
    bookmakerId,
  });

  const _match = {
    round,
    standing,
    home: {
      id: home.id,
      name: home.name,
      form: homeTeamStatistics.form,
      previousMatches: homeLastMatchesData,
      statistics: {
        team: homeTeamStatistics,
        mainPlayers: homeMainPlayers,
      },
    },
    away: {
      id: away.id,
      name: away.name,
      form: homeTeamStatistics.away,
      previousMatches: awayLastMatchesData,
      statistics: {
        team: awayTeamStatistics,
        mainPlayers: awayMainPlayers,
      },
    },
    injuries: { home: homeInjuries, away: awayInjuries },
    prediction: {
      apiFootballPrediction,
    },
    bets,
  };

  const data = JSON.stringify(_match);

  fs.writeFileSync("./output.json", data);

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

const getLastMatchesByTeams = ({ previousRounds, home, away }) => {
  const homePreviousMatches = Object.values(previousRounds)
    .slice(-lastMatchesToAnalise)
    .map((round) => {
      return round.find((match) =>
        [match.home.id, match.away.id].includes(home.id)
      );
    });

  const awayPreviousMatches = Object.values(previousRounds)
    .slice(-lastMatchesToAnalise)
    .map((round) => {
      return round.find((match) =>
        [match.home.id, match.away.id].includes(away.id)
      );
    });

  return {
    home: homePreviousMatches,
    away: awayPreviousMatches,
  };
};

const getPreviousMatchData = async ({ team, match, mainPlayers, injuries }) => {
  const { fixtureId, home } = match;

  const matchStats = await getMatchStatistics({ fixtureId, home });

  if (!matchStats) {
    return;
  }

  const matchPlayersStatistics = await getMatchPlayersStatistics({
    fixtureId,
    teamId: team.id,
    mainPlayers,
    injuries,
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

(async () => {
  await main();
})();
