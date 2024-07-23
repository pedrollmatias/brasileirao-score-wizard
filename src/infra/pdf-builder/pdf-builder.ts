import { IReportData } from "../../controllers/domain.types";

import path from "path";
import fs from "fs";
import puppeteer from "puppeteer";
import ejs from "ejs";
import { groupRounds, splitArrayIntoGroups } from "../../utils";

const fsPromises = fs.promises;

export const pdfBuilder = async (reportData: IReportData) => {
  const { season, round, home, away, previousRounds, standing, predictions } =
    reportData;

  const coverPage = await ejs.renderFile(
    path.join(__dirname, "./components/cover-page.ejs"),
    {
      season,
      round,
      home,
      away,
    }
  );
  const aboutTheChampionshipPage = await ejs.renderFile(
    path.join(__dirname, "./components/about-the-championship-page.ejs")
  );

  const groupedPreviousRounds = groupRounds(previousRounds);
  // const groupedPreviousRounds = splitArrayIntoGroups(previousRounds, 2);
  const standingPage = await ejs.renderFile(
    path.join(__dirname, "./components/standing-page.ejs"),
    {
      standing,
      round,
      previousRoundsEntries: Object.entries(groupedPreviousRounds),
    }
  );

  const homeTeamStatisticsPage = await ejs.renderFile(
    path.join(__dirname, "./components/team-statistics-page.ejs"),
    {
      section: "3",
      team: home.team,
      statistics: home.statistics,
      previousMatches: home.previousMatches,
    }
  );
  const awayTeamStatisticsPage = await ejs.renderFile(
    path.join(__dirname, "./components/team-statistics-page.ejs"),
    {
      section: "4",
      team: away.team,
      statistics: away.statistics,
      previousMatches: away.previousMatches,
    }
  );

  const matchPage = await ejs.renderFile(
    path.join(__dirname, "./components/match-page.ejs"),
    {
      home,
      away,
      predictions,
    }
  );
  // const leagueStandingPage = await ejs.renderFile(
  //   path.join(__dirname, "./components/league-standing-page.ejs"),
  //   {
  //     home,
  //     away,
  //     round,
  //     standing: leagueStanding,
  //     previousRounds: splitArrayIntoGroups(
  //       Object.entries(previousRounds).map(([round, matches]) => ({
  //         round,
  //         matches,
  //       })),
  //       5
  //     ),
  //   }
  // );

  const content = `
    ${coverPage}
    ${aboutTheChampionshipPage}
    ${standingPage}
    ${homeTeamStatisticsPage}
    ${awayTeamStatisticsPage}
    ${matchPage}
  `;

  const htmlReport = await ejs.renderFile(
    path.join(__dirname, "./components/wrapper.ejs"),
    { content }
  );
  const pdf = await htmlToPdf(htmlReport);

  const dir = path.join(__dirname, "../../../output");
  const filename =
    `${season}-r${round}-${home.team.code.toLowerCase()}-x-${away.team.code.toLowerCase()}.pdf`
      .trim()
      .replace(/\s+/g, "-");

  if (!fs.existsSync(dir)) {
    await fsPromises.mkdir(dir, { recursive: true });
  }

  await fsPromises.writeFile(path.join(dir, filename), pdf as Buffer);
};

const htmlToPdf = async (report: string) => {
  const browser = await puppeteer.launch({
    ...(process.env.BROWSER_EXECUTABLE_PATH && {
      executablePath: process.env.BROWSER_EXECUTABLE_PATH,
    }),
    headless: true,
  });

  const page = await browser.newPage();

  await page.setContent(report, { waitUntil: "networkidle2" });

  const pdf = await page.pdf();

  await browser.close();

  return pdf;
};
