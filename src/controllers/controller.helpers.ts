import { ApiFootball } from "../infra/api-football/api-football";
import {
  ApiSofascore,
  SofascoreSeasonEnum,
} from "../infra/api-sofascore/api-sofascore";
import { IPreviousRound } from "./domain.types";

export interface IRelevantEventStatistics {
  goals: {
    for: {
      home: number;
      away: number;
    };
    against: {
      home: number;
      away: number;
    };
  };
  ballPossession: number;
  totalShots: number;
  corners: number;
  fouls: number;
  yellowCards: number;
  redCards: number;
  shotsOnTarget: number;
  offsides: number;
  passes: number;
}

export const getRelevantStatsFromMatch = ({
  statisticGroups,
  isHomeVenue,
}: {
  statisticGroups: any[];
  isHomeVenue: boolean;
}) => {
  const getStatisticItemsValue = ({
    statisticKey,
    statisticsItems,
    isHomeVenue,
  }: {
    statisticKey: string;
    statisticsItems: Record<string, any>[];
    isHomeVenue: boolean;
  }) => {
    const { homeValue, awayValue } = (statisticsItems.find(
      ({ key }) => key === statisticKey
    ) as Record<string, any>) ?? { homeValue: 0, awayValue: 0 };

    return isHomeVenue ? homeValue : awayValue;
  };

  return statisticGroups.reduce(
    (groups: IRelevantEventStatistics, { groupName, statisticsItems }: any) => {
      if (groupName === "Match overview") {
        const ballPossession = getStatisticItemsValue({
          statisticKey: "ballPossession",
          statisticsItems,
          isHomeVenue,
        });
        const totalShots = getStatisticItemsValue({
          statisticKey: "totalShotsOnGoal",
          statisticsItems,
          isHomeVenue,
        });
        const corners = getStatisticItemsValue({
          statisticKey: "cornerKicks",
          statisticsItems,
          isHomeVenue,
        });
        const fouls = getStatisticItemsValue({
          statisticKey: "fouls",
          statisticsItems,
          isHomeVenue,
        });
        const passes = getStatisticItemsValue({
          statisticKey: "passes",
          statisticsItems,
          isHomeVenue,
        });
        const yellowCards = getStatisticItemsValue({
          statisticKey: "yellowCards",
          statisticsItems,
          isHomeVenue,
        });
        const redCards = getStatisticItemsValue({
          statisticKey: "redCards",
          statisticsItems,
          isHomeVenue,
        });

        return {
          ...groups,
          ballPossession,
          totalShots,
          corners,
          passes,
          fouls,
          yellowCards,
          redCards,
        };
      }

      if (groupName === "Shots") {
        const shotsOnTarget = getStatisticItemsValue({
          statisticKey: "shotsOnGoal",
          statisticsItems,
          isHomeVenue,
        });

        return {
          ...groups,
          shotsOnTarget,
        };
      }

      if (groupName === "Attack") {
        const offsides = getStatisticItemsValue({
          statisticKey: "offsides",
          statisticsItems,
          isHomeVenue,
        });
        return {
          ...groups,
          offsides,
        };
      }

      return groups;
    },
    {} as IRelevantEventStatistics
  );
};

export const eventToFixture = async (eventId: string) => {
  const sofascoreClient = new ApiSofascore();
  const apiFootballClient = new ApiFootball();

  const { event } = await sofascoreClient.getEventDeatils({ eventId });

  const {
    homeTeam,
    tournament: {
      uniqueTournament: { id: tournamentId },
    },
    season: { id: seasonId },
    roundInfo: { round },
  } = event;

  const season = ApiSofascore.toApiFootbalSeason(seasonId);
  const leagueId = ApiSofascore.toApiFootballLeagueId(tournamentId);

  const apiFootballHomeTeam = await apiFootballClient.findTeam({
    teamCode: homeTeam.nameCode,
  });

  return apiFootballClient.getMatch({
    leagueId,
    round,
    season,
    home: apiFootballHomeTeam,
  });
};

export const seasonIdToNumber = (seasonId: SofascoreSeasonEnum) => {};
