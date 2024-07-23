export interface ILeague {
  id: string;
  name: string;
  season?: string;
}

export interface ITeam {
  id: string;
  name: string;
  logo?: string;
  code: string;
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

export interface ITeamStanding {
  rank: number;
  team: ITeam;
  points: number;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goals: {
    for: number;
    against: number;
    difference: number;
  };
  lastMatches?: string[];
  efficiency: number;
}

interface IDataStatistics {
  total: number;
  avg: number;
  min: number;
  max: number;
}

export interface ITopPlayerStatistics {
  player: IPlayer;
  statistics: {
    total: number;
    avg: number;
  };
}

export interface ITeamTopPlayers {
  topScorers: ITopPlayerStatistics[];
  topAssists: ITopPlayerStatistics[];
  topShooters: ITopPlayerStatistics[];
  topYellowCards: ITopPlayerStatistics[];
  topRedCards: ITopPlayerStatistics[];
}

export interface ITeamStatistics {
  matches: number;
  topPlayers: ITeamTopPlayers;
  goals: {
    for: {
      total: { home: number; away: number; total: number };
      avg: { home: number; away: number; total: number };
      max: { home: number; away: number; total: number };
    };
    against: {
      total: { home: number; away: number; total: number };
      avg: { home: number; away: number; total: number };
      max: { home: number; away: number; total: number };
    };
  };
  shots: {
    // offTarget: IDataStatistics;
    onTarget: IDataStatistics;
    total: IDataStatistics;
  };
  passes: IDataStatistics;
  offsides: IDataStatistics;
  corners: IDataStatistics;
  fouls: IDataStatistics;
  yellowCards: IDataStatistics;
  redCards: IDataStatistics;
  ballPossession: IDataStatistics;
}

export interface IMatchOdd {
  id: number;
  name: string;
  values: {
    value: string;
    odd: string;
  }[];
}

export interface IMatchStatistic {
  goals: number;
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

export interface IPreviousMatch {
  round: number;
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

export interface IMatchInjuries {
  home: {
    team: ITeam;
    players: IPlayer[];
  };
  away: {
    team: ITeam;
    players: IPlayer[];
  };
}

export interface ILineup {
  players: IPlayer[];
  formation: string;
}

interface ITeamInfo {
  team: ITeam;
  lineup?: ILineup;
  previousMatches: IPreviousMatch[];
  statistics: ITeamStatistics;
  injuries: IPlayer[];
}

export interface IPrediction {
  comment?: string;
  home: {
    team: ITeam;
    percent: string;
  };
  away: {
    team: ITeam;
    percent: string;
  };
  draw: {
    percent: string;
  };
}

export interface IReportData {
  season: number;
  round: number;
  standing: ITeamStanding[];
  previousRounds: IPreviousRound[];
  home: ITeamInfo;
  away: ITeamInfo;
  odds?: IMatchOdd[];
  predictions?: {
    apiFootball?: IPrediction;
    ufmg?: IPrediction;
  };
}
