/**
 * ELO scoring engine tests
 * Simple test file that can be run with Node.js built-in test runner
 * Run with: npx tsx src/lib/elo.test.ts
 */

import { expectedScore, updateElo } from './elo'

// Simple test runner
function test(name: string, fn: () => void) {
  try {
    fn()
    console.log(`✓ ${name}`)
  } catch (error) {
    console.error(`✗ ${name}`)
    console.error(error)
    process.exit(1)
  }
}

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message)
  }
}

function assertStrictEqual(actual: any, expected: any, message: string) {
  if (actual !== expected) {
    throw new Error(`${message}: expected ${expected}, got ${actual}`)
  }
}

// Tests
test('expectedScore: equal ratings return 0.5', () => {
  const result = expectedScore(1000, 1000)
  assertStrictEqual(result, 0.5, 'Equal ratings should have 50% expected score')
})

test('expectedScore: higher rating has higher expected score', () => {
  const higher = expectedScore(1200, 1000)
  const lower = expectedScore(1000, 1200)
  assert(higher > 0.5, 'Higher rated player should have >50% expected score')
  assert(lower < 0.5, 'Lower rated player should have <50% expected score')
  assert(Math.abs(higher + lower - 1) < 0.0001, 'Expected scores should sum to 1')
})

test('updateElo: winner rating increases, loser decreases', () => {
  const rWinner = 1000
  const rLoser = 1000
  const { winner, loser } = updateElo(rWinner, rLoser)

  assert(winner > rWinner, 'Winner rating should increase')
  assert(loser < rLoser, 'Loser rating should decrease')
})

test('updateElo: changes are symmetric-ish (total rating change is small)', () => {
  const rWinner = 1000
  const rLoser = 1000
  const { winner, loser } = updateElo(rWinner, rLoser)

  const winnerChange = winner - rWinner
  const loserChange = loser - rLoser

  // Total change should be close to zero (ELO is zero-sum)
  const totalChange = winnerChange + loserChange
  assert(Math.abs(totalChange) < 1, 'Total rating change should be near zero (zero-sum)')

  // Winner gain should roughly equal loser loss
  assert(Math.abs(winnerChange + loserChange) < 1, 'Changes should be roughly symmetric')
})

test('updateElo: stronger player beating weaker player gains less', () => {
  const strongWinner = 1200
  const weakLoser = 1000
  const { winner: strongResult } = updateElo(strongWinner, weakLoser)

  const weakWinner = 1000
  const strongLoser = 1200
  const { winner: weakResult } = updateElo(weakWinner, strongLoser)

  const strongGain = strongResult - strongWinner
  const weakGain = weakResult - weakWinner

  assert(weakGain > strongGain, 'Upset (weak beating strong) should gain more points')
})

console.log('\nAll ELO tests passed! ✓')
