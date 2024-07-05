import path, { dirname } from "path";
import ejs from "ejs";
import fs from "fs";
import { fileURLToPath } from "url";
import puppeteer from "puppeteer";

const fsPromises = fs.promises;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const pdfBuilder = async ({
  league,
  home,
  away,
  season,
  round,
  teamSquadValues,
  leagueStanding,
  previousRounds,
  nextMatch,
}) => {
  const coverPage = await ejs.renderFile(
    path.join(__dirname, "./components/cover-page.ejs"),
    { season, round, home, away }
  );
  const aboutTheChampionshipPage = await ejs.renderFile(
    path.join(__dirname, "./components/about-the-championship-page.ejs")
  );
  const teamSquadValuesPage = await ejs.renderFile(
    path.join(__dirname, "./components/team-squad-values-page.ejs"),
    { teams: teamSquadValues }
  );
  const leagueStandingPage = await ejs.renderFile(
    path.join(__dirname, "./components/league-standing-page.ejs"),
    {
      home,
      away,
      round,
      standing: leagueStanding,
      previousRounds: splitArrayIntoGroups(
        Object.entries(previousRounds).map(([round, matches]) => ({
          round,
          matches,
        })),
        5
      ),
    }
  );
  const nextMatchPage = await ejs.renderFile(
    path.join(__dirname, "./components/next-match-page.ejs"),
    { home, away, round, match: nextMatch }
  );
  const predictionsPage = await ejs.renderFile(
    path.join(__dirname, "./components/predictions-page.ejs"),
    { home, away, round, match: nextMatch }
  );
  const metricsInfoPage = await ejs.renderFile(
    path.join(__dirname, "./components/metrics-info-page.ejs")
  );

  const content = `
    ${coverPage}
    ${aboutTheChampionshipPage}
    ${teamSquadValuesPage}
    ${leagueStandingPage}
    ${nextMatchPage}
    ${predictionsPage}
    ${metricsInfoPage}
  `;

  const htmlReport = await ejs.renderFile(
    path.join(__dirname, "./components/wrapper.ejs"),
    { content }
  );
  const pdf = await htmlToPdf(htmlReport);

  const dir = path.join(__dirname, "../../output");
  const filename =
    `l${league}-s${season}-r${round}-${home.name.toLowerCase()}-x-${away.name.toLowerCase()}`
      .trim()
      .replace(" ", "-");

  await fsPromises.writeFile(path.join(__dirname, dir, filename), pdf);
};

const splitArrayIntoGroups = (array, groupSize) => {
  return array.reduce((acc, _, index) => {
    if (index % groupSize === 0) {
      acc.push(array.slice(index, index + groupSize));
    }
    return acc;
  }, []);
};

const htmlToPdf = async (report) => {
  let browser;

  try {
    browser = await puppeteer.launch({
      executablePath:
        process.env.CHROMIUM_EXECUTABLE_PATH || "/usr/bin/chromium-browser",
      headless: true,
    });

    await page.setContent(report, { waitUntil: "networkidle2" });

    return page.pdf();
  } catch {
    browser && (await browser.close());
  }
};
