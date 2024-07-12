import "dotenv/config";

import readline from "readline";

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

const runPrompt = async () => {
  const season = await new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(
      "Qual a temporada do campeonato? (Ex: 2023, 2024...)\n",
      (answer) => {
        rl.close();
        resolve(answer);
      }
    );
  });

  const round = await new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(
      "Qual a próxima rodada do campenado? (Ex: 3, 15, 38)\n",
      (answer) => {
        rl.close();
        resolve(answer);
      }
    );
  });

  const urlGe = await new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(
      `Qual a URL da análise da rodada do Globo Esporte (Favoritismo #${round}")? A matéria será utilizada como fonte para análise qualitativa dos confrontos\n`,
      (answer) => {
        rl.close();
        resolve(answer);
      }
    );
  });

  const urlUfmg = await new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(
      `Qual a URL da UFMG contendo as previsões da rodada?\n`,
      (answer) => {
        rl.close();
        resolve(answer);
      }
    );
  });

  return {
    season: Number(season),
    round: Number(round),
    urlGe,
    urlUfmg,
  };
};

const buildReport = async ({ season, round, urlGe, urlUfmg }) => {
  if (!season) {
    throw new Error("Temporada não definida");
  }

  if (!round) {
    throw new Error("Rodada não definida");
  }

  if (!urlGe) {
    console.warn("URL Globo Esporte não definida");
  }

  if (!urlUfmg) {
    console.warn("URL UFMG não definida");
  }

  const leagueId = LeaguesEnum.BRASILEIRAO_SERIE_A;

  const { teamSquadValues } = await import(
    `./src/data/${season}/team-squad-values.js`
  );

  const standing = await getLeagueStanding({ leagueId, season });
  const { previousRounds, nextRound } = await getLeagueRounds({
    leagueId,
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

    console.log(
      `Gerando relatório para partida entre ${home.name} x ${away.name}...`
    );

    const geAnalysis = urlGe
      ? await getGloboEsporteMatchAnalysis({
          url: urlGe,
          home,
          away,
        })
      : null;

    const apiFootballPrediction = await getMatchPrediction({
      fixtureId: match.fixtureId,
    });
    const ufmgPrediction = urlUfmg
      ? await getUfmgMatchPrediction({
          url: urlUfmg,
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
};

(async () => {
  console.log("** Brasileirão Score Wizard **");

  const { season, round, urlGe, urlUfmg } = await runPrompt();
  

  console.log("** Iniciando geraçao dos relatórios **");

  await buildReport({ season, round, urlGe, urlUfmg });

  console.log("** Relatórios gerados com sucesso! **");
})();
