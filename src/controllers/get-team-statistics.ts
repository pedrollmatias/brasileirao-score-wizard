import {
  ApiSofascore,
  SofascoreSeasonEnum,
  SofascoreTournamentEnum,
} from "../infra/api-sofascore/api-sofascore";
import { getAverageArr, getMaxArr, getMinArr, sumArr } from "../utils";
import {
  getRelevantStatsFromMatch,
  IRelevantEventStatistics,
} from "./controller.helpers";
import {
  IPreviousRound,
  ITeam,
  ITeamTopPlayers,
  ITeamStatistics,
  ITopPlayerStatistics,
} from "./domain.types";

const topPlayersAmount = Number(process.env.TOP_PLAYERS_AMOUNT) || 5;

export const getTeamTournamentStatistics = async ({
  previousMatches,
  team,
  tournamentId,
  seasonId,
}: {
  previousMatches: IPreviousRound[];
  team: ITeam;
  tournamentId: SofascoreTournamentEnum;
  seasonId: SofascoreSeasonEnum;
}) => {
  const sofascoreClient = new ApiSofascore();

  const { statistics } = await sofascoreClient.getTeamStatisticsByTournament({
    seasonId,
    teamId: team.id,
    tournamentId,
  });
  const { matches } = statistics;

  const { topPlayers } = await sofascoreClient.getTeamTopPlayers({
    tournamentId,
    seasonId,
    teamId: team.id,
  });

  const teamTopPlayers = getTeamTopPlayers(topPlayers);

  const previousMathcesByTeamIds = previousMatches
    .filter((match) => [match.home.id, match.away.id].includes(team.id))
    .map((match) => {
      const isHomeVenue = match.home.id === team.id;

      return {
        id: match.id,
        isHomeVenue,
      };
    });

  const previousTeamEventsStatistics = (
    await Promise.all(
      previousMathcesByTeamIds.map(async ({ id: eventId, isHomeVenue }) => {
        const eventDetails = await sofascoreClient.getEventDeatils({ eventId });
        const eventStatistics = await sofascoreClient.getEventStatistics({
          eventId,
        });

        if (!eventDetails || !eventStatistics) {
          return;
        }

        return getRelevantEventStatistics({
          eventStatistics,
          eventDetails,
          isHomeVenue,
        });
      })
    )
  ).filter((event) => event !== undefined) as IRelevantEventStatistics[];
  const {
    goals,
    ballPossessionValues,
    cornersValues,
    foulsValues,
    offsidesValues,
    passesValues,
    redCardsValues,
    // shotsOffTargetValues,
    shotsOnTargetValues,
    totalShotsValues,
    yellowCardsValues,
  } = getStatisticsValuesByType(previousTeamEventsStatistics);

  const data: ITeamStatistics = {
    matches,
    goals: {
      for: {
        total: {
          home: sumArr(goals.for.home),
          away: sumArr(goals.for.away),
          total: sumArr(goals.for.home) + sumArr(goals.for.away),
        },
        avg: {
          home: getAverageArr(goals.for.home),
          away: getAverageArr(goals.for.away),
          total: getAverageArr(goals.for.home) + getAverageArr(goals.for.away),
        },
        max: {
          home: getMaxArr(goals.for.home),
          away: getMaxArr(goals.for.away),
          total: getMaxArr(goals.for.home) + getMaxArr(goals.for.away),
        },
      },
      against: {
        total: {
          home: sumArr(goals.against.home),
          away: sumArr(goals.against.away),
          total: sumArr(goals.against.home) + sumArr(goals.against.away),
        },
        avg: {
          home: getAverageArr(goals.against.home),
          away: getAverageArr(goals.against.away),
          total:
            getAverageArr(goals.against.home) +
            getAverageArr(goals.against.away),
        },
        max: {
          home: getMaxArr(goals.against.home),
          away: getMaxArr(goals.against.away),
          total: getMaxArr(goals.against.home) + getMaxArr(goals.against.away),
        },
      },
    },
    shots: {
      onTarget: {
        total: sumArr(shotsOnTargetValues),
        avg: getAverageArr(shotsOnTargetValues),
        max: getMaxArr(shotsOnTargetValues),
        min: getMinArr(shotsOnTargetValues),
      },
      total: {
        total: sumArr(totalShotsValues),
        avg: getAverageArr(totalShotsValues),
        max: getMaxArr(totalShotsValues),
        min: getMinArr(totalShotsValues),
      },
    },
    ballPossession: {
      total: sumArr(ballPossessionValues),
      avg: getAverageArr(ballPossessionValues),
      max: getMaxArr(ballPossessionValues),
      min: getMinArr(ballPossessionValues),
    },
    corners: {
      total: sumArr(cornersValues),
      avg: getAverageArr(cornersValues),
      max: getMaxArr(cornersValues),
      min: getMinArr(cornersValues),
    },
    fouls: {
      total: sumArr(foulsValues),
      avg: getAverageArr(foulsValues),
      max: getMaxArr(foulsValues),
      min: getMinArr(foulsValues),
    },
    yellowCards: {
      total: sumArr(yellowCardsValues),
      avg: getAverageArr(yellowCardsValues),
      max: getMaxArr(yellowCardsValues),
      min: getMinArr(yellowCardsValues),
    },
    redCards: {
      total: sumArr(redCardsValues),
      avg: getAverageArr(redCardsValues),
      max: getMaxArr(redCardsValues),
      min: getMinArr(redCardsValues),
    },
    offsides: {
      total: sumArr(offsidesValues),
      avg: getAverageArr(offsidesValues),
      max: getMaxArr(offsidesValues),
      min: getMinArr(offsidesValues),
    },
    passes: {
      total: sumArr(passesValues),
      avg: getAverageArr(passesValues),
      max: getMaxArr(passesValues),
      min: getMinArr(passesValues),
    },
    topPlayers: teamTopPlayers,
  };

  return data;
};

const getTeamTopPlayers = (
  topPlayers: Record<string, any>
): ITeamTopPlayers => {
  const { goals, assists, totalShots, yellowCards, redCards } = topPlayers;

  const formatTopPlayer = (
    { player, statistics }: any,
    paramName: string
  ): ITopPlayerStatistics => ({
    player: {
      id: player.id,
      name: player.name,
    },
    statistics: {
      total: statistics[paramName],
      avg: Number((statistics[paramName] / statistics.appearances).toFixed(2)),
    },
  });

  const sortPlayers = (
    player1: ITopPlayerStatistics,
    player2: ITopPlayerStatistics
  ) => player2.statistics.total - player1.statistics.total;

  return {
    topAssists: (assists ?? [])
      .map((player: any) => formatTopPlayer(player, "assists"))
      .filter((player: any) => player.statistics.total > 0)
      .sort(sortPlayers)
      .slice(0, topPlayersAmount),
    topScorers: (goals ?? [])
      .map((player: any) => formatTopPlayer(player, "goals"))
      .filter((player: any) => player.statistics.total > 0)
      .sort(sortPlayers)
      .slice(0, topPlayersAmount),
    topShooters: (totalShots ?? [])
      .map((player: any) => formatTopPlayer(player, "totalShots"))
      .filter((player: any) => player.statistics.total > 0)
      .sort(sortPlayers)
      .slice(0, topPlayersAmount),
    topYellowCards: (yellowCards ?? [])
      .map((player: any) => formatTopPlayer(player, "yellowCards"))
      .filter((player: any) => player.statistics.total > 0)
      .sort(sortPlayers)
      .slice(0, topPlayersAmount),
    topRedCards: (redCards ?? [])
      .map((player: any) => formatTopPlayer(player, "redCards"))
      .filter((player: any) => player.statistics.total > 0)
      .sort(sortPlayers)
      .slice(0, topPlayersAmount),
  };
};

const getRelevantEventStatistics = ({
  eventDetails,
  eventStatistics,
  isHomeVenue,
}: {
  eventDetails: any;
  eventStatistics: any;
  isHomeVenue: boolean;
}): IRelevantEventStatistics => {
  const { event } = eventDetails;
  const { statistics } = eventStatistics;
  const [fullTimeStatistics] = statistics;
  const { groups: statisticGroups } = fullTimeStatistics;

  const goalsStats = isHomeVenue
    ? {
        for: {
          home: event.homeScore.normaltime,
          away: 0,
        },
        against: {
          home: event.awayScore.normaltime,
          away: 0,
        },
      }
    : {
        for: {
          home: 0,
          away: event.awayScore.normaltime,
        },
        against: {
          home: 0,
          away: event.homeScore.normaltime,
        },
      };

  const stats = getRelevantStatsFromMatch({ statisticGroups, isHomeVenue });

  return {
    goals: goalsStats,
    ...stats,
  };
};

const getStatisticsValuesByType = (
  relevantStatistics: IRelevantEventStatistics[]
) => {
  return relevantStatistics.reduce(
    (acc: any, stats) => {
      const {
        goals,
        ballPossession,
        corners,
        fouls,
        offsides,
        passes,
        redCards,
        shotsOnTarget,
        totalShots,
        yellowCards,
      } = stats;

      const goalsFor = {
        home: [...acc.goals.for.home, goals.for.home ?? 0],
        away: [...acc.goals.for.away, goals.for.away ?? 0],
      };

      const goalsAgainst = {
        home: [...acc.goals.against.home, goals.against.home ?? 0],
        away: [...acc.goals.against.away, goals.against.away ?? 0],
      };

      return {
        goals: {
          for: goalsFor,
          against: goalsAgainst,
        },
        ballPossessionValues: [
          ...acc.ballPossessionValues,
          ballPossession ?? 0,
        ],
        cornersValues: [...acc.cornersValues, corners ?? 0],
        foulsValues: [...acc.foulsValues, fouls ?? 0],
        offsidesValues: [...acc.offsidesValues, offsides ?? 0],
        passesValues: [...acc.passesValues, passes ?? 0],
        redCardsValues: [...acc.redCardsValues, redCards ?? 0],
        shotsOnTargetValues: [...acc.shotsOnTargetValues, shotsOnTarget ?? 0],
        totalShotsValues: [...acc.totalShotsValues, totalShots ?? 0],
        yellowCardsValues: [...acc.yellowCardsValues, yellowCards ?? 0],
      };
    },
    {
      goals: {
        for: {
          home: [],
          away: [],
        },
        against: {
          home: [],
          away: [],
        },
      },
      ballPossessionValues: [],
      cornersValues: [],
      foulsValues: [],
      offsidesValues: [],
      passesValues: [],
      redCardsValues: [],
      shotsOnTargetValues: [],
      totalShotsValues: [],
      yellowCardsValues: [],
    }
  );
};
