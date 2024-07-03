import "dotenv/config";

import { teamSquadValues } from "./src/data/2024/team-squad-values.js";

import { LeaguesEnum, teamNameMap } from "./src/api-football/constants.js";
import { getLeagueStanding } from "./src/api-football/get-league-standing.js";
import { getLeagueRounds } from "./src/api-football/get-league-rounds.js";
import { getMatchPrediction } from "./src/api-football/get-match-prediction.js";
import { getMatchInjuries } from "./src/api-football/get-match-injuries.js";

import {
  getGloboEsporteMatchAnalysis,
  getUfmgMatchPrediction,
} from "./src/crawler.js";

import { pdfBuilder } from "./src/pdf-builder/builder.js";

const buildReport = async () => {
  if (!process.env.ROUND) {
    throw new Error("ROUND is not defined");
  }

  if (!process.env.URL_GE) {
    console.log("URL_GE is not defined");
  }

  if (!process.env.URL_UFMG) {
    console.log("URL_GE is not defined");
  }

  const season = Number(process.env.SEASON) || 2024;
  const round = Number(process.env.ROUND);
  const league = LeaguesEnum.BRASILEIRAO_SERIE_A;

  const standing = await getLeagueStanding({ league, season });
  const { previousRounds, nextRound } = await getLeagueRounds({
    league,
    season,
    round,
  });

  for (const match of nextRound) {
    const home = {
      id: match.home.id,
      name: teamNameMap[match.home.id],
    };
    const away = {
      id: match.away.id,
      name: teamNameMap[match.away.id],
    };

    const geAnalysis = process.env.URL_GE
      ? await getGloboEsporteMatchAnalysis({
          url: process.env.URL_GE,
          home,
          away,
        })
      : null;

    const apiFootballPrediction = await getMatchPrediction({
      fixtureId: match.fixtureId,
    });
    const ufmgPrediction = process.env.URL_GE
      ? await getUfmgMatchPrediction({
          url: process.env.URL_UFMG,
          home,
          away,
        })
      : null;

    const injuries = await getMatchInjuries({ fixtureId: match.fixtureId });

    const teamMatchSquadValues = teamSquadValues
      .filter(({ id }) => id === home.id || id === away.id)
      .sort((a, b) => b.squadValue - a.squadValue);

    const teamsPreviousRounds = Object.entries(previousRounds).reduce(
      (acc, [round, matches]) => {
        const teamMatches = matches.filter(
          (match) =>
            match.home.id === home.id ||
            match.away.id === home.id ||
            match.away.id === away.id ||
            match.home.id === away.id
        );

        acc[round] = teamMatches;

        return acc;
      },
      {}
    );

    await pdfBuilder({
      league,
      season,
      round,
      home,
      away,
      teamSquadValues: teamMatchSquadValues,
      leagueStanding: standing,
      nextMatch: {
        injuries,
        ufmgPrediction,
        apiFootballPrediction,
        geAnalysis,
        ...match,
      },
      previousRounds: teamsPreviousRounds,
    });
  }

  console.log("Relatórios gerados com sucesso");
};

(async () => {
  await buildReport();
})();
