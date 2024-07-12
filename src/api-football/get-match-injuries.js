import { httpClient } from "./http-client.js";

export const getMatchInjuries = async ({ fixtureId }) => {
  const { data } = await httpClient.get('injuries', {
    params: { fixture: fixtureId },
  });

  const players = data.response;

  const injuries = players
    .filter((player) => player.player.type === "Missing Fixture")
    .map((player) => ({
      team: player.team.name,
      name: player.player.name,
    }))
    .reduce(
      (acc, player) => ({
        ...acc,
        [player.team]: [...(acc[player.team] || []), player.name],
      }),
      {}
    );

  return injuries;
};
