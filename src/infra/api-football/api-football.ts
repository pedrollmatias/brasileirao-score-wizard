import axios, { AxiosError, AxiosInstance } from "axios";
import { ITeam } from "../../controllers/domain.types";

export enum ApiFootballLeagueEnum {
  BRASILEIRAO_SERIE_A = 71,
}

export class ApiFootball {
  private client: AxiosInstance;

  constructor() {
    const client = axios.create({
      baseURL: "https://v3.football.api-sports.io/",
      headers: {
        "x-rapidapi-host": "v3.football.api-sports.io/",
        "x-rapidapi-key": process.env.API_FOOTBALL_API_KEY,
      },
    });

    client.interceptors.response.use(async (res) => {
      const { headers } = res;

      const remainingRateLimitRequests = headers["x-ratelimit-remaining"];
      const remainingRequests = headers["x-ratelimit-requests-remaining"];

      console.log(
        `Requisições gratuitas restantes no dia: ${remainingRequests}`
      );

      if (remainingRateLimitRequests === "0") {
        await this.waitFreeRateLimitToReset();
      }

      return res;
    });

    this.client = client;
  }

  private waitFreeRateLimitToReset() {
    console.log(
      "Aguardando restar o tempo de rate limit do API Football para novas requisições (1min)..."
    );

    const minute = 1000 * 60; // 1min

    return new Promise((resolve) => setTimeout(resolve, minute));
  }

  async findTeam({ teamCode }: { teamCode: string }) {
    const teamCodeMap = {
      CAP: 134,
      ATL: 1062,
      CRI: 140,
      BRA: 794,
      INT: 119,
      FOR: 154,
      VAS: 133,
      CUI: 1193,
      CRU: 135,
      JUV: 152,
      SPA: 126,
      BOT: 120,
      VIT: 136,
      FLA: 127,
      GOI: 144,
      BAH: 118,
      FLU: 124,
      PAL: 121,
      COR: 131,
      GPA: 130,
    };

    const { data } = await this.client.get("teams", {
      params: { id: teamCodeMap[teamCode as keyof typeof teamCodeMap] },
    });

    const [{ team }] = data.response;

    return team;
  }

  async getMatch({
    home,
    away,
    leagueId,
    round,
    season,
  }: {
    leagueId: ApiFootballLeagueEnum;
    round: number;
    season: number;
    home?: ITeam;
    away?: ITeam;
  }) {
    const { data } = await this.client.get("fixtures", {
      params: {
        league: leagueId,
        season,
        round: `Regular Season - ${round}`,
        team: home ? home.id : away ? away.id : undefined,
      },
    });

    const [{ fixture, teams }] = data.response;

    return { fixture, teams };
  }

  async getMatchInjuries({ fixtureId }: { fixtureId: string }) {
    const { data } = await this.client.get("injuries", {
      params: { fixture: fixtureId },
    });

    return data.response;
  }

  async getMatchOdds({
    fixtureId,
    bookmakerId,
  }: {
    fixtureId: string;
    bookmakerId: string | number; // TODO: enum
  }) {
    const { data } = await this.client.get("odds", {
      params: { fixture: fixtureId, bookmaker: bookmakerId },
    });

    const [odds] = data.response;

    if (!odds) {
      return;
    }

    const { bookmakers } = odds;
    const [bookmakerOdds] = bookmakers;

    return bookmakerOdds;
  }

  async getMatchPrediction({ fixtureId }: { fixtureId: string }) {
    const { data } = await this.client.get("predictions", {
      params: { fixture: fixtureId },
    });

    const [response] = data.response;

    return response;
  }
}
