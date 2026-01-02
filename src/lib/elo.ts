/**
 * ELO rating system implementation
 * Standard ELO formula: R' = R + K * (S - E)
 * where R' is new rating, R is current rating, K is K-factor,
 * S is actual score (1 for win, 0 for loss), E is expected score
 */

/**
 * Calculate expected score for a player with rating rA against rating rB
 * @param rA Rating of player A
 * @param rB Rating of player B
 * @returns Expected score (0-1) for player A
 */
export function expectedScore(rA: number, rB: number): number {
  return 1 / (1 + Math.pow(10, (rB - rA) / 400))
}

/**
 * Update ELO ratings after a match
 * @param rWinner Current rating of the winner
 * @param rLoser Current rating of the loser
 * @param kFactor K-factor (default 24, standard for most games)
 * @returns Object with updated winner and loser ratings
 */
export function updateElo(
  rWinner: number,
  rLoser: number,
  kFactor: number = 24
): { winner: number; loser: number } {
  const expectedWinner = expectedScore(rWinner, rLoser)
  const expectedLoser = expectedScore(rLoser, rWinner)

  // Winner gets 1 point, loser gets 0
  const newWinner = rWinner + kFactor * (1 - expectedWinner)
  const newLoser = rLoser + kFactor * (0 - expectedLoser)

  return {
    winner: Math.round(newWinner),
    loser: Math.round(newLoser),
  }
}
