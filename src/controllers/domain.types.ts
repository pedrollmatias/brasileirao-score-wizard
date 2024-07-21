export interface ILeague {
  id: string;
  name: string;
  season?: string;
}

export interface ITeam {
  id: string;
  name: string;
  logo?: string;
}

export interface IPlayer {
  id: string;
  name: string;
}

export interface IMatch {
  id: string;
  league: ILeague;
  home: ITeam;
  away: ITeam;
  score: {
    home: number;
    away: number;
  };
}

export interface IPreviousRound {
  id: string;
  round: number;
  home: ITeam;
  away: ITeam;
  winner?: ITeam;
  score: {
    home: number;
    away: number;
  };
}
