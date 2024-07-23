import puppeteer from "puppeteer";
import { IPrediction, ITeam } from "../controllers/domain.types";

const teamNameUfmgMap = {
  Athletico: "ATHLETICO-PR",
  "Atlético Goianiense": "ATLÉTICO-GO",
  "Atlético Mineiro": "ATLÉTICO-MG",
  Bahia: "BAHIA",
  Botafogo: "BOTAFOGO",
  Corinthians: "CORINTHIANS",
  Criciúma: "CRICIÚMA",
  Cruzeiro: "CRUZEIRO",
  Cuiabá: "CUIABÁ",
  Flamengo: "FLAMENGO",
  Fluminense: "FLUMINENSE",
  Fortaleza: "FORTALEZA",
  Grêmio: "GRÊMIO",
  Internacional: "INTERNACIONAL",
  Juventude: "JUVENTUDE",
  Palmeiras: "PALMEIRAS",
  "São Paulo": "SÃO PAULO",
  Vasco: "VASCO DA GAMA",
  Vitória: "VITÓRIA",
};

export const getUfmgMatchPrediction = async ({
  url = "https://www.mat.ufmg.br/futebol/tabela-da-proxima-rodada_seriea/",
  home,
  away,
}: {
  url?: string;
  home: ITeam;
  away: ITeam;
}): Promise<IPrediction | undefined> => {
  if (!url) {
    return;
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
      return tds.map((td) => (td as any).innerText);
    });

    const homeIndex = cells.indexOf(
      teamNameUfmgMap[home.name as keyof typeof teamNameUfmgMap]
    );

    if (homeIndex === -1) {
      return;
    }

    const homeWinnerChance = cells[homeIndex + 1];
    const drawChance = cells[homeIndex + 2];
    const awayWinnerChance = cells[homeIndex + 3];

    return {
      away: {
        team: away,
        percent: `${awayWinnerChance}%`,
      },
      home: {
        team: home,
        percent: `${homeWinnerChance}%`,
      },
      draw: {
        percent: `${drawChance}%`,
      },
    };
  } catch (error) {
    console.error(`Erro ao buscar previsões da UFMG: ${error}`);

    return;
  } finally {
    await browser.close();
  }
};
