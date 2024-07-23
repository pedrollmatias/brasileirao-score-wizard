import { ApiSofascore } from "../infra/api-sofascore/api-sofascore";
import { getRelevantStatsFromMatch } from "./controller.helpers";
import {
  IMatchTopPlayersStatistics,
  IPlayer,
  IPreviousMatch,
  IPreviousRound,
  ITeam,
  ITeamTopPlayers,
} from "./domain.types";

const lastMatchesToAnalise = Number(process.env.LAST_MATCHES_TO_ANALISE) || 5;

export const getPreviousMatchesStatistics = async ({
  previousRoundsMatches,
  team,
  topPlayers,
}: {
  previousRoundsMatches: IPreviousRound[];
  team: ITeam;
  topPlayers: ITeamTopPlayers;
}): Promise<IPreviousMatch[]> => {
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

  let previousMatches: IPreviousMatch[] = [];

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
    ).filter((player) => player !== undefined && player.total > 0);

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
    ).filter((player) => player !== undefined && player.total > 0);

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
    ).filter(
      (player) =>
        player !== undefined && (player.total > 0 || player.onTarget > 0)
    );

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
    ).filter((player) => player !== undefined && player.total > 0);

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
    ).filter((player) => player !== undefined && player.total > 0);

    const teamMatchTopPlayers = {
      topAssists: topAssistsStats,
      topScorers: topScorersStats,
      topShooters: topShootersStats,
      topYellowCards: topYellowCardsStats,
      topRedCards: topRedCardsStats,
    } as IMatchTopPlayersStatistics;

    previousMatches = [
      ...previousMatches,
      {
        round: match.round,
        home: {
          team: match.home,
          statistics: { goals: match.score.home, ...homeMatchStats },
        },
        away: {
          team: match.away,
          statistics: { goals: match.score.away, ...awayMatchStats },
        },
        topPlayers: teamMatchTopPlayers,
      },
    ];
  }

  return previousMatches;
};
