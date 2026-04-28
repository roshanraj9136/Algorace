const K_FACTOR = 32;

export function computeElo(
  winnerElo: number,
  loserElo: number
): { winnerNewElo: number; loserNewElo: number } {
  const expectedWinner = 1 / (1 + 10 ** ((loserElo - winnerElo) / 400));
  const expectedLoser = 1 - expectedWinner;
  const winnerNewElo = Math.round(winnerElo + K_FACTOR * (1 - expectedWinner));
  const loserNewElo = Math.round(loserElo + K_FACTOR * (0 - expectedLoser));
  return { winnerNewElo, loserNewElo };
}
