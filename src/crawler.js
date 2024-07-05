import puppeteer from "puppeteer";
import { TeamIdEnum } from "./api-football/constants.js";

const teamNameGloboEsporteMap = {
  [TeamIdEnum.ATHLETICO_PARANAENSE]: "Athletico Paranaense",
  [TeamIdEnum.ATLETICO_GOIANENSE]: "Atlético-GO",
  [TeamIdEnum.ATLETICO_MG]: "Atlético-MG",
  [TeamIdEnum.BAHIA]: "Bahia",
  [TeamIdEnum.BOTAFOGO]: "Botafogo",
  [TeamIdEnum.CORINTHIANS]: "Corintians",
  [TeamIdEnum.CRICIUMA]: "Criciúma",
  [TeamIdEnum.CRUZEIRO]: "Cruzeiro",
  [TeamIdEnum.CUIABA]: "Cuiabá",
  [TeamIdEnum.FLAMENGO]: "Flamengo",
  [TeamIdEnum.FLUMINENSE]: "Fluminense",
  [TeamIdEnum.FORTALEZA]: "Fortaleza",
  [TeamIdEnum.GREMIO]: "Grêmio",
  [TeamIdEnum.INTERNACIONAL]: "Internacional",
  [TeamIdEnum.JUVENTUDE]: "Juventude",
  [TeamIdEnum.PALMEIRAS]: "Palmeiras",
  [TeamIdEnum.SAO_PAULO]: "São Paulo",
  [TeamIdEnum.VASCO_DA_GAMA]: "Vasco",
  [TeamIdEnum.VITORIA]: "Vitoria",
};

const teamNameUfmgMap = {
  [TeamIdEnum.ATHLETICO_PARANAENSE]: "ATHLETICO-PR",
  [TeamIdEnum.ATLETICO_GOIANENSE]: "ATLÉTICO-GO",
  [TeamIdEnum.ATLETICO_MG]: "ATLÉTICO-MG",
  [TeamIdEnum.BAHIA]: "BAHIA",
  [TeamIdEnum.BOTAFOGO]: "BOTAFOGO",
  [TeamIdEnum.CORINTHIANS]: "CORINTHIANS",
  [TeamIdEnum.CRICIUMA]: "CRICIÚMA",
  [TeamIdEnum.CRUZEIRO]: "CRUZEIRO",
  [TeamIdEnum.CUIABA]: "CUIABÁ",
  [TeamIdEnum.FLAMENGO]: "FLAMENGO",
  [TeamIdEnum.FLUMINENSE]: "FLUMINENSE",
  [TeamIdEnum.FORTALEZA]: "FORTALEZA",
  [TeamIdEnum.GREMIO]: "GRÊMIO",
  [TeamIdEnum.INTERNACIONAL]: "INTERNACIONAL",
  [TeamIdEnum.JUVENTUDE]: "JUVENTUDE",
  [TeamIdEnum.PALMEIRAS]: "PALMEIRAS",
  [TeamIdEnum.SAO_PAULO]: "SÃO PAULO",
  [TeamIdEnum.VASCO_DA_GAMA]: "VASCO DA GAMA",
  [TeamIdEnum.VITORIA]: "VITÓRIA",
};

export const getGloboEsporteMatchAnalysis = async ({ url, home, away }) => {
  if (!url) {
    return null;
  }

  const browser = await puppeteer.launch({
    ...(process.env.BROWSER_EXECUTABLE_PATH && {
      executablePath: process.env.BROWSER_EXECUTABLE_PATH,
    }),
    headless: true,
  });
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: "networkidle2" });
    await page.waitForSelector(".protected-content", { timeout: 100000 });

    const divContent = await page.evaluate(() => {
      const div = document.querySelector(".protected-content");

      return div ? div.textContent.trim() : null;
    });

    const teamName1FavoriteSearchString = `Favorito >> ${
      teamNameGloboEsporteMap[home.id]
    }`;
    const teamName1Favorite = divContent.indexOf(teamName1FavoriteSearchString);

    const teamName2FavoriteSearchString = `Favorito >> ${
      teamNameGloboEsporteMap[away.id]
    }`;
    const teamName2Favorite = divContent.indexOf(teamName2FavoriteSearchString);

    if (teamName1Favorite === -1 && teamName2Favorite === -1) {
      return null;
    }

    const favoriteTeam = teamName1Favorite === -1 ? away : home;

    const startIndex =
      teamName1Favorite !== -1
        ? teamName1Favorite + teamName1FavoriteSearchString.length
        : teamName2Favorite + teamName2FavoriteSearchString.length;

    const partialSubstring = divContent.substring(startIndex).trim();
    const endIndex = partialSubstring.indexOf("    ");
    const analysis = partialSubstring.substring(0, endIndex).trim();

    return { analysis, favoriteTeam };
  } catch (error) {
    console.error(`Erro ao buscar o artigo: ${error}`);

    return null;
  } finally {
    await browser.close();
  }
};

export const getUfmgMatchPrediction = async ({ url, home, away }) => {
  if (!url) {
    return null;
  }

  const browser = await puppeteer.launch({
    ...(process.env.BROWSER_EXECUTABLE_PATH && {
      executablePath: process.env.BROWSER_EXECUTABLE_PATH,
    }),
    headless: true,
  });
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: "networkidle2" });
    await page.waitForSelector("#tabelaCL", { timeout: 100000 });

    const cells = await page.evaluate(() => {
      const tds = Array.from(document.querySelectorAll("table tr td"));
      return tds.map((td) => td.innerText);
    });

    const homeIndex = cells.indexOf(teamNameUfmgMap[home.id]);

    if (homeIndex === -1) {
      return null;
    }

    const homeWinnerChance = cells[homeIndex + 1];
    const drawChance = cells[homeIndex + 2];
    const awayWinnerChance = cells[homeIndex + 3];

    const maxChange = Math.max(homeWinnerChance, drawChance, awayWinnerChance);
    const winner =
      maxChange === homeWinnerChance
        ? home
        : maxChange === awayWinnerChance
        ? away
        : null;

    return {
      prediction: {
        winner: winner,
        percent: {
          home: `${homeWinnerChance}%`,
          draw: `${drawChance}%`,
          away: `${awayWinnerChance}%`,
        },
      },
    };
  } catch (error) {
    console.error(`Erro ao buscar previsões da UFMG: ${error}`);

    return null;
  } finally {
    await browser.close();
  }
};
