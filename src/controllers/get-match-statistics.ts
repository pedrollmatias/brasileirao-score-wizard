import { ApiSofascore } from "../infra/api-sofascore/api-sofascore";
import { getRelevantStatsFromMatch } from "./controller.helpers";
import { IPlayer, IPreviousRound, ITeam } from "./domain.types";
import { ITeamTopPlayers } from "./get-team-statistics";

const lastMatchesToAnalise = Number(process.env.LAST_MATCHES_TO_ANALISE) || 5;

export interface IMatchStatistic {
  shots: { total: number; onTarget: number };
  corners: number;
  yellowCards: number;
  redCards: number;
  fouls: number;
  ballPossession: number;
}

export interface IMatchTopPlayersStatistics {
  topScorers: (IPlayer & { total: number })[];
  topAssists: (IPlayer & { total: number })[];
  topShooters: (IPlayer & { total: number; onTarget: number })[];
  topYellowCards: (IPlayer & { total: number })[];
  topRedCards: (IPlayer & { total: number })[];
}

export interface IAnalyzedMatch {
  home: {
    team: ITeam;
    statistics: IMatchStatistic;
  };
  away: {
    team: ITeam;
    statistics: IMatchStatistic;
  };
  topPlayers: IMatchTopPlayersStatistics;
}

export const getPreviousMatchesStatistics = async ({
  previousRoundsMatches,
  team,
  topPlayers,
}: {
  previousRoundsMatches: IPreviousRound[];
  team: ITeam;
  topPlayers: ITeamTopPlayers;
}) => {
  const sofascoreApi = new ApiSofascore();

  const previousMatchesToAnalise = previousRoundsMatches
    .filter((match) => [match.home.id, match.away.id].includes(team.id))
    .map((match) => {
      const isHomeVenue = match.home.id === team.id;

      return { ...match, isHomeVenue };
    })
    .slice(0, lastMatchesToAnalise);

  const { topShooters, topAssists, topRedCards, topScorers, topYellowCards } =
    topPlayers;

  let previousMatchesAnalyzed: IAnalyzedMatch[] = [];

  for (const match of previousMatchesToAnalise) {
    const eventStats = await sofascoreApi.getEventStatistics({
      eventId: match.id,
    });

    if (!eventStats) {
      continue;
    }

    const [fullTimeStatistics] = eventStats.statistics;
    const { groups: statisticGroups } = fullTimeStatistics;

    let homeMatchStats, awayMatchStats;

    if (match.isHomeVenue) {
      homeMatchStats = getRelevantStatsFromMatch({
        statisticGroups,
        isHomeVenue: true,
      });
      awayMatchStats = getRelevantStatsFromMatch({
        statisticGroups,
        isHomeVenue: false,
      });
    } else {
      awayMatchStats = getRelevantStatsFromMatch({
        statisticGroups,
        isHomeVenue: false,
      });
      homeMatchStats = getRelevantStatsFromMatch({
        statisticGroups,
        isHomeVenue: true,
      });
    }

    const topScorersStats = (
      await Promise.all(
        topScorers.map(async ({ player }) => {
          const playerStats = await sofascoreApi.getPlayerStatisticsByEvent({
            eventId: match.id,
            playerId: player.id,
          });

          if (!playerStats) {
            return;
          }

          const { statistics } = playerStats;
          const { goals } = statistics;

          return {
            id: player.id,
            name: player.name,
            total: goals ?? 0,
          };
        })
      )
    ).filter((player) => player !== undefined);

    const topAssistsStats = (
      await Promise.all(
        topAssists.map(async ({ player }) => {
          const playerStats = await sofascoreApi.getPlayerStatisticsByEvent({
            eventId: match.id,
            playerId: player.id,
          });

          if (!playerStats) {
            return;
          }

          const { statistics } = playerStats;
          const { goalAssist } = statistics;

          return {
            id: player.id,
            name: player.name,
            total: goalAssist ?? 0,
          };
        })
      )
    ).filter((player) => player !== undefined);

    const topShootersStats = (
      await Promise.all(
        topShooters.map(async ({ player }) => {
          const playerStats = await sofascoreApi.getPlayerStatisticsByEvent({
            eventId: match.id,
            playerId: player.id,
          });

          if (!playerStats) {
            return;
          }

          const { statistics } = playerStats;
          const {
            shotOffTarget,
            onTargetScoringAttempt,
            blockedScoringAttempt,
          } = statistics;
          const offTarget = shotOffTarget ?? 0;
          const onTarget = onTargetScoringAttempt ?? 0;
          const total = offTarget + onTarget + (blockedScoringAttempt ?? 0);

          return {
            id: player.id,
            name: player.name,
            total,
            onTarget,
          };
        })
      )
    ).filter((player) => player !== undefined);

    const topYellowCardsStats = (
      await Promise.all(
        topYellowCards.map(async ({ player }) => {
          const playerStats = await sofascoreApi.getPlayerStatisticsByEvent({
            eventId: match.id,
            playerId: player.id,
          });

          if (!playerStats) {
            return;
          }

          const { statistics } = playerStats;
          const { yellowCards } = statistics;

          return {
            id: player.id,
            name: player.name,
            total: yellowCards ?? 0,
          };
        })
      )
    ).filter((player) => player !== undefined);

    const topRedCardsStats = (
      await Promise.all(
        topRedCards.map(async ({ player }) => {
          const playerStats = await sofascoreApi.getPlayerStatisticsByEvent({
            eventId: match.id,
            playerId: player.id,
          });

          if (!playerStats) {
            return;
          }

          const { statistics } = playerStats;
          const { redCards } = statistics;

          return {
            id: player.id,
            name: player.name,
            total: redCards ?? 0,
          };
        })
      )
    ).filter((player) => player !== undefined);

    previousMatchesAnalyzed = [
      ...previousMatchesAnalyzed,
      {
        home: {
          team: match.home,
          statistics: homeMatchStats,
        },
        away: {
          team: match.away,
          statistics: awayMatchStats,
        },
        topPlayers: {
          topAssists: topAssistsStats,
          topScorers: topScorersStats,
          topShooters: topShootersStats,
          topYellowCards: topYellowCardsStats,
          topRedCards: topRedCardsStats,
        },
      },
    ];
  }

  return previousMatchesAnalyzed;
};
