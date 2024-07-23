import "dotenv/config";

import fs from "fs";
import readline from "readline";

import { eventToFixture } from "./src/controllers/controller.helpers";
import { IMatch, IReportData } from "./src/controllers/domain.types";
import { getApiFootballMatchPrediction } from "./src/controllers/get-api-football-match-prediction";
import { getCurrentRoundMatches } from "./src/controllers/get-current-round-matches";
import { getMatchInjuries } from "./src/controllers/get-match-injuries";
import { getMatchLineups } from "./src/controllers/get-match-lineups";
import { getMatchOdds } from "./src/controllers/get-match-odds";
import { getPreviousMatchesStatistics } from "./src/controllers/get-match-statistics";
import { getPreviousRoundMatches } from "./src/controllers/get-previous-rounds-mathces";
import { getStanding } from "./src/controllers/get-standing";
import { getTeamTournamentStatistics } from "./src/controllers/get-team-statistics";
import {
  ApiSofascore,
  SofascoreSeasonEnum,
  SofascoreTournamentEnum,
} from "./src/infra/api-sofascore/api-sofascore";
import { pdfBuilder } from "./src/infra/pdf-builder/pdf-builder";
import { getUfmgMatchPrediction } from "./src/infra/ufmg-crawler";

const BET365_BOOKMAKER_ID = 8;

const runMatchPrompt = async ({
  tournamentId,
  seasonId,
}: {
  tournamentId: SofascoreTournamentEnum;
  seasonId: SofascoreSeasonEnum;
}) => {
  const roundStr = await new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(
      `Qual a rodada da partida que você quer prever as apostas?\n`,
      (answer) => {
        rl.close();
        resolve(answer);
      }
    );
  });
  const round = Number(roundStr);

  const { matches: currentRoundMatches } = await getCurrentRoundMatches({
    round,
    seasonId,
    tournamentId,
  });

  const matchIdx = await new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    const matchesOptions = currentRoundMatches.reduce(
      (str, match, index) =>
        `${str}${index + 1}. ${match.home.name} x ${match.away.name}\n`,
      ""
    );
    rl.question(`Qual partida?\n${matchesOptions}`, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
  const match = currentRoundMatches[Number(matchIdx) - 1];

  return { match, round };
};

const getReportData = async ({
  seasonId,
  tournamentId,
  round,
  match,
}: {
  seasonId: SofascoreSeasonEnum;
  tournamentId: SofascoreTournamentEnum;
  round: number;
  match: IMatch;
}): Promise<IReportData> => {
  const standing = await getStanding({ seasonId, tournamentId });
  const previousRoundsMatches = await getPreviousRoundMatches({
    currentRound: round,
    away: match.away,
    home: match.home,
    seasonId,
    tournamentId,
  });

  const homeTournamentStatistics = await getTeamTournamentStatistics({
    previousMatches: previousRoundsMatches,
    seasonId,
    team: match.home,
    tournamentId,
  });
  const awayTournamentStatistics = await getTeamTournamentStatistics({
    previousMatches: previousRoundsMatches,
    seasonId,
    team: match.away,
    tournamentId,
  });

  const homePreviousMatchesStats = await getPreviousMatchesStatistics({
    previousRoundsMatches,
    team: match.home,
    topPlayers: homeTournamentStatistics.topPlayers,
  });
  const awayPreviousMatchesStats = await getPreviousMatchesStatistics({
    previousRoundsMatches,
    team: match.away,
    topPlayers: awayTournamentStatistics.topPlayers,
  });
  const lineups = await getMatchLineups({
    eventId: match.id,
  });

  const fixtureData = await eventToFixture(match.id);

  const {
    fixture,
    teams: { home: fixtureHome },
  } = fixtureData;

  const matchInjuries = await getMatchInjuries({
    fixtureId: fixture.id,
    home: { ...match.home, id: fixtureHome.id },
  });

  const matchOdds = await getMatchOdds({
    fixtureId: fixture.id,
    bookmakerId: BET365_BOOKMAKER_ID,
  });
  const season = ApiSofascore.toApiFootbalSeason(seasonId);

  const apiFootballPrediction = await getApiFootballMatchPrediction({
    home: match.home,
    away: match.away,
    fixtureId: fixture.id,
  });
  const ufmgPrediction = await getUfmgMatchPrediction({
    home: match.home,
    away: match.away,
  });

  return {
    round,
    season,
    standing,
    previousRounds: previousRoundsMatches,
    home: {
      team: match.home,
      lineup: lineups?.home,
      previousMatches: homePreviousMatchesStats,
      statistics: homeTournamentStatistics,
      injuries: matchInjuries.home.players,
    },
    away: {
      team: match.away,
      lineup: lineups?.away,
      previousMatches: awayPreviousMatchesStats,
      statistics: awayTournamentStatistics,
      injuries: matchInjuries.away.players,
    },
    odds: matchOdds,
    predictions: {
      apiFootball: apiFootballPrediction,
      ufmg: ufmgPrediction,
    },
  };
};

(async () => {
  console.log("** Sofawizard **");

  // const tournamentId = SofascoreTournamentEnum.BRASILEIRAO_SERIE_A;
  // const seasonId = SofascoreSeasonEnum.SEASON_2024;

  // const { match, round } = await runMatchPrompt({
  //   seasonId,
  //   tournamentId,
  // });

  // const output = await getReportData({
  //   match,
  //   round,
  //   seasonId,
  //   tournamentId,
  // });

  // fs.writeFileSync("output.json", JSON.stringify(output, null, 2));

  const output: IReportData = JSON.parse(
    fs.readFileSync("output.json").toString()
  );

  await pdfBuilder(output);

  console.log("** Relatório gerado com sucesso **");
})();
