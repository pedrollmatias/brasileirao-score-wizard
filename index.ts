import readline from "readline";
import fs from "fs";

import { getCurrentRoundMatches } from "./src/controllers/get-current-round-matches";
import {
  SeasonEnum,
  TournamentEnum,
} from "./src/infra/api-sofascore/api-sofascore";
import { getStanding } from "./src/controllers/get-standing";
import { getPreviousRoundMatches } from "./src/controllers/get-previous-rounds-mathces";
import { groupRounds } from "./src/utils";
import { getTeamTournamentStatistics } from "./src/controllers/get-team-statistics";
import { getPreviousMatchesStatistics } from "./src/controllers/get-match-statistics";

const runMatchPrompt = async ({
  tournamentId,
  seasonId,
}: {
  tournamentId: TournamentEnum;
  seasonId: SeasonEnum;
}) => {
  const { matches: currentRoundMatches, round } = await getCurrentRoundMatches({
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
    rl.question(
      `Qual partida você quer prever as apostas (Rodada ${round})?\n${matchesOptions}`,
      (answer) => {
        rl.close();
        resolve(answer);
      }
    );
  });
  const match = currentRoundMatches[Number(matchIdx) - 1];

  return { match, round };
};

(async () => {
  const tournamentId = TournamentEnum.BRASILEIRAO_SERIE_A;
  const seasonId = SeasonEnum.SEASON_2024;

  const { match, round } = await runMatchPrompt({
    seasonId,
    tournamentId,
  });

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

  const output = {
    round,
    standing,
    home: {
      team: match.home,
      previousMatches: homePreviousMatchesStats,
      statistics: homeTournamentStatistics,
    },
    away: {
      team: match.away,
      previousMatches: awayPreviousMatchesStats,
      statistics: awayTournamentStatistics,
    },
  };

  fs.writeFileSync("output.json", JSON.stringify(output));
})();
