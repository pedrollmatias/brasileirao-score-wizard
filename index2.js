import "dotenv/config";

import readline from "readline";
import { LeaguesEnum } from "./src/api-football/constants.js";
import { getMatchPlayersStatistics } from "./src/api-football/get-match-players-statistics.js";

const runPrompt = async () => {
  const league = await new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(
      "Qual o campenato do jogo?\n1. Brasileirão Série A\n2. Brasileirão Série B\n4. La Liga\n3. Premier League\n\n",
      (answer) => {
        rl.close();
        resolve(answer);
      }
    );
  });

  const leaguesMap = {
    1: LeaguesEnum.BRASILEIRAO_SERIE_A,
    2: LeaguesEnum.BRASILEIRAO_SERIE_B,
    3: LeaguesEnum.PREMIER_LEAGUE,
    4: LeaguesEnum.PREMIER_LEAGUE,
  };

  const leagueId = leaguesMap[league];

  const match = await new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question("Qual partida você quer prever as apostas?\n", (answer) => {
      rl.close();
      resolve(answer);
    });
  });

  const season = new Date().getFullYear();

  return {
    leagueId,
    match,
    season,
  };
};

const buildReport = async ({ season, leagueId }) => {
  const 
};

(async () => {
  console.log("** Brasileirão Match Wizard **\n");

  const { leagueId, match, season } = await runPrompt();

  console.log(JSON.stringify(await getMatchPlayersStatistics({ fixtureId: 1180505 })));

  console.log("** Relatório(s) gerados com sucesso! **");
})();
