import axios, { AxiosError, AxiosInstance } from "axios";
import { ApiFootballLeagueEnum } from "../api-football/api-football";

export enum SofascoreTournamentEnum {
  BRASILEIRAO_SERIE_A = 325,
}

export enum SofascoreSeasonEnum {
  SEASON_2024 = "58766",
}

export class ApiSofascore {
  private client: AxiosInstance;

  constructor() {
    const client = axios.create({
      baseURL: "https://www.sofascore.com/api/v1/",
    });

    this.client = client;
  }

  async getTournament({
    tournamentId,
  }: {
    tournamentId: SofascoreTournamentEnum;
  }) {
    const url = `unique-tournament/${tournamentId}`;
    const { data } = await this.client.get(url);

    return data;
  }

  async getTournamentTeams({
    tournamentId,
    seasonId,
  }: {
    tournamentId: SofascoreTournamentEnum;
    seasonId: SofascoreSeasonEnum;
  }) {
    const url = `unique-tournament/${tournamentId}/season/${seasonId}/teams`;
    const { data } = await this.client.get(url);

    return data;
  }

  async getTournamentStanding({
    tournamentId,
    seasonId,
  }: {
    tournamentId: SofascoreTournamentEnum;
    seasonId: SofascoreSeasonEnum;
  }) {
    const url = `unique-tournament/${tournamentId}/season/${seasonId}/standings/total`;
    const { data } = await this.client.get(url);

    return data;
  }

  async getTournamentRounds({
    tournamentId,
    seasonId,
  }: {
    tournamentId: SofascoreTournamentEnum;
    seasonId: SofascoreSeasonEnum;
  }) {
    const url = `unique-tournament/${tournamentId}/season/${seasonId}/rounds`;
    const { data } = await this.client.get(url);

    return data;
  }

  async getTournamentEvents({
    tournamentId,
    seasonId,
  }: {
    tournamentId: SofascoreTournamentEnum;
    seasonId: SofascoreSeasonEnum;
  }) {
    let currentPage = 0;
    let hasNextPage = true;
    let events: any[] = [];

    while (hasNextPage) {
      const url = `unique-tournament/${tournamentId}/season/${seasonId}/events/last/${currentPage}`;
      const { data } = await this.client.get(url);
      const { events: fetchedEvents, hasNextPage: fetchedHasNextPage } = data;

      currentPage += 1;
      events = [...events, ...fetchedEvents];
      hasNextPage = fetchedHasNextPage;
    }

    return events;
  }

  async getEventStatistics({ eventId }: { eventId: string }) {
    try {
      const url = `event/${eventId}/statistics`;
      const { data } = await this.client.get(url);

      return data;
    } catch (error) {
      return this.handleNotFoundError(error as AxiosError);
    }
  }

  async getEventDeatils({ eventId }: { eventId: string }) {
    try {
      const url = `event/${eventId}`;
      const { data } = await this.client.get(url);

      return data;
    } catch (error) {
      return this.handleNotFoundError(error as AxiosError);
    }
  }

  async getEventLineups({ eventId }: { eventId: string }) {
    try {
      const url = `event/${eventId}/lineups`;
      const { data } = await this.client.get(url);

      return data;
    } catch (error) {
      return this.handleNotFoundError(error as AxiosError);
    }
  }

  async getPlayerStatisticsByEvent({
    eventId,
    playerId,
  }: {
    eventId: string;
    playerId: string;
  }) {
    try {
      const url = `event/${eventId}/player/${playerId}/statistics`;
      const { data } = await this.client.get(url);

      return data;
    } catch (error) {
      return this.handleNotFoundError(error as AxiosError);
    }
  }

  async getPlayersStatisticsByTournament({
    tournamentId,
    seasonId,
    playerId,
  }: {
    tournamentId: SofascoreTournamentEnum;
    seasonId: SofascoreSeasonEnum;
    playerId: string;
  }) {
    const url = `player/${playerId}/unique-tournament/${tournamentId}/season/${seasonId}/statistics/overall`;
    const { data } = await this.client.get(url);

    return data;
  }

  async getTeamStatisticsByTournament({
    tournamentId,
    seasonId,
    teamId,
  }: {
    tournamentId: SofascoreTournamentEnum;
    seasonId: SofascoreSeasonEnum;
    teamId: string;
  }) {
    const url = `team/${teamId}/unique-tournament/${tournamentId}/season/${seasonId}/statistics/overall`;
    const { data } = await this.client.get(url);

    return data;
  }

  async getTeamTopPlayers({
    tournamentId,
    seasonId,
    teamId,
  }: {
    tournamentId: SofascoreTournamentEnum;
    seasonId: SofascoreSeasonEnum;
    teamId: string;
  }) {
    const url = `team/${teamId}/unique-tournament/${tournamentId}/season/${seasonId}/top-players/overall`;
    const { data } = await this.client.get(url);

    return data;
  }

  async getTeamPlayers({ teamId }: { teamId: string }) {
    const url = `team/${teamId}/players`;
    const { data } = await this.client.get(url);

    return data;
  }

  async getTeamImage({ teamId }: { teamId: string }) {
    const url = `team/${teamId}/image`;
    const { data } = await this.client.get(url);

    return data;
  }

  getTeamImageUrl({ teamId }: { teamId: string }) {
    return `${this.client.getUri()}team/${teamId}/image`;
  }

  async getRoundEvents({
    tournamentId,
    seasonId,
    round,
  }: {
    tournamentId: SofascoreTournamentEnum;
    seasonId: SofascoreSeasonEnum;
    round: number;
  }) {
    const url = `unique-tournament/${tournamentId}/season/${seasonId}/events/round/${round}`;
    const {
      data: { events },
    } = await this.client.get(url);

    return events;
  }

  private handleNotFoundError(error: AxiosError) {
    const err = error as AxiosError;
    const { code } = (err.response?.data as any)?.error ?? {};

    if (code === 404) {
      return;
    }

    throw error;
  }

  static toApiFootballLeagueId(tournamentId: SofascoreTournamentEnum) {
    const map = {
      [SofascoreTournamentEnum.BRASILEIRAO_SERIE_A]:
        ApiFootballLeagueEnum.BRASILEIRAO_SERIE_A,
    };

    return map[tournamentId];
  }

  static toApiFootbalSeason(seasonId: SofascoreSeasonEnum) {
    const map = {
      [SofascoreSeasonEnum.SEASON_2024]: 2024,
    };

    return map[seasonId];
  }
}
