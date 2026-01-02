'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { Card, RunState, HistoryEntry } from '@/types/schema'
import { updateElo } from '@/lib/elo'
import { cards, getPrimaryLaneId } from '@/data/cards'

// All 8 MVP lanes
const ALL_LANES = [
  'partnerships',
  'content',
  'community',
  'growth',
  'nil',
  'talent',
  'bizops',
  'product'
]

// Initialize all lanes to 1000
const INITIAL_LANE_RATINGS: Record<string, number> = Object.fromEntries(
  ALL_LANES.map(lane => [lane, 1000])
)

export default function PlayPage() {
  const router = useRouter()
  const [runState, setRunState] = useState<RunState | null>(null)
  const [currentCard] = useState<Card>(cards[0])

  useEffect(() => {
    // Initialize or load RunState from localStorage
    const stored = localStorage.getItem('runState')
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as RunState
        // Migrate: if lane_ratings is missing or empty, initialize all lanes
        if (!parsed.lane_ratings || Object.keys(parsed.lane_ratings).length === 0) {
          parsed.lane_ratings = { ...INITIAL_LANE_RATINGS }
        }
        // Ensure all lanes exist (add missing ones)
        const migratedRatings = { ...INITIAL_LANE_RATINGS }
        Object.keys(parsed.lane_ratings).forEach(lane => {
          if (ALL_LANES.includes(lane)) {
            migratedRatings[lane] = parsed.lane_ratings[lane]
          }
        })
        parsed.lane_ratings = migratedRatings
        setRunState(parsed)
      } catch (e) {
        // If parsing fails, initialize new state
        initializeRunState()
      }
    } else {
      initializeRunState()
    }
  }, [])

  const initializeRunState = () => {
    const newState: RunState = {
      round: 1,
      max_rounds: 16,
      lane_ratings: { ...INITIAL_LANE_RATINGS },
      history: []
    }
    setRunState(newState)
    localStorage.setItem('runState', JSON.stringify(newState))
  }

  const handleCardTap = (picked: 'left' | 'right') => {
    if (!runState) return

    // Get winner and loser lane IDs
    const winnerSide = picked === 'left' ? currentCard.left : currentCard.right
    const loserSide = picked === 'left' ? currentCard.right : currentCard.left
    
    const winnerLaneId = getPrimaryLaneId(winnerSide.lane_ids)
    const loserLaneId = getPrimaryLaneId(loserSide.lane_ids)

    // Update ELO ratings if we have valid lane IDs
    const updatedRatings = { ...runState.lane_ratings }
    if (winnerLaneId && loserLaneId && winnerLaneId !== loserLaneId) {
      const winnerRating = updatedRatings[winnerLaneId] || 1000
      const loserRating = updatedRatings[loserLaneId] || 1000
      const { winner: newWinnerRating, loser: newLoserRating } = updateElo(
        winnerRating,
        loserRating
      )
      updatedRatings[winnerLaneId] = newWinnerRating
      updatedRatings[loserLaneId] = newLoserRating
    }

    const historyEntry: HistoryEntry = {
      card_id: currentCard.id,
      picked,
      timestamp_iso: new Date().toISOString()
    }

    const newRound = runState.round + 1
    const updatedState: RunState = {
      ...runState,
      round: newRound,
      lane_ratings: updatedRatings,
      history: [...runState.history, historyEntry]
    }

    setRunState(updatedState)
    localStorage.setItem('runState', JSON.stringify(updatedState))

    // Navigate to results after 16 taps
    if (newRound > runState.max_rounds) {
      router.push('/results')
    }
  }

  if (!runState) {
    return <div>Loading...</div>
  }

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      padding: '20px',
      maxWidth: '600px',
      margin: '0 auto'
    }}>
      <div style={{
        textAlign: 'center',
        marginBottom: '2rem',
        fontSize: '1.2rem',
        fontWeight: '600'
      }}>
        Round {runState.round}/{runState.max_rounds}
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        {/* Left Card */}
        <div
          onClick={() => handleCardTap('left')}
          style={{
            padding: '24px',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            cursor: 'pointer',
            transition: 'transform 0.2s, box-shadow 0.2s',
            minHeight: '150px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = 'scale(0.98)'
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
          }}
          onTouchStart={(e) => {
            e.currentTarget.style.transform = 'scale(0.98)'
          }}
          onTouchEnd={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
          }}
        >
          <h3 style={{
            fontSize: '1.3rem',
            marginBottom: '12px',
            fontWeight: '600'
          }}>
            {currentCard.left.title}
          </h3>
          <p style={{
            fontSize: '1rem',
            color: '#666',
            lineHeight: '1.5'
          }}>
            {currentCard.left.body}
          </p>
        </div>

        {/* Right Card */}
        <div
          onClick={() => handleCardTap('right')}
          style={{
            padding: '24px',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            cursor: 'pointer',
            transition: 'transform 0.2s, box-shadow 0.2s',
            minHeight: '150px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = 'scale(0.98)'
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
          }}
          onTouchStart={(e) => {
            e.currentTarget.style.transform = 'scale(0.98)'
          }}
          onTouchEnd={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
          }}
        >
          <h3 style={{
            fontSize: '1.3rem',
            marginBottom: '12px',
            fontWeight: '600'
          }}>
            {currentCard.right.title}
          </h3>
          <p style={{
            fontSize: '1rem',
            color: '#666',
            lineHeight: '1.5'
          }}>
            {currentCard.right.body}
          </p>
        </div>
      </div>

      <div style={{
        fontSize: '0.9rem',
        color: '#999',
        textAlign: 'center',
        marginTop: 'auto',
        paddingTop: '2rem'
      }}>
        Tap a card to make your choice
      </div>
    </main>
  )
}


