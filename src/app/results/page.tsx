'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { RunState } from '@/types/schema'
import { getLaneById } from '@/data/lanes'
import { getFiguresByLaneId } from '@/data/figures'
import { getStatementById } from '@/data/statements'

/**
 * Confidence thresholds based on rating gap (top - second):
 * Strong: >= 80 points
 * Medium: >= 40 points
 * Weak: < 40 points
 */
function getConfidenceLabel(ratingGap: number): string {
  if (ratingGap >= 80) return 'Strong'
  if (ratingGap >= 40) return 'Medium'
  return 'Weak'
}

export default function ResultsPage() {
  const router = useRouter()
  const [runState, setRunState] = useState<RunState | null>(null)
  const [showAllFigures, setShowAllFigures] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('runState')
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as RunState
        setRunState(parsed)
      } catch (e) {
        // If no valid state, redirect to play
        router.push('/play')
      }
    } else {
      // No state found, redirect to play
      router.push('/play')
    }
  }, [router])

  const handleReset = () => {
    localStorage.removeItem('runState')
    router.push('/play')
  }

  if (!runState) {
    return <div>Loading...</div>
  }

  // Get top 2 lanes
  const sortedLanes = Object.entries(runState.lane_ratings)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2)

  const topLaneId = sortedLanes[0]?.[0]
  const runnerUpLaneId = sortedLanes[1]?.[0]
  const topRating = sortedLanes[0]?.[1] || 1000
  const runnerUpRating = sortedLanes[1]?.[1] || 1000
  const ratingGap = topRating - runnerUpRating

  const topLane = topLaneId ? getLaneById(topLaneId) : null
  const runnerUpLane = runnerUpLaneId ? getLaneById(runnerUpLaneId) : null

  // Get figures for top lane
  const allFigures = topLaneId ? getFiguresByLaneId(topLaneId) : []
  const displayedFigures = showAllFigures ? allFigures : allFigures.slice(0, 2)

  // Get last 3 choices (support both new statement format and legacy card format)
  const lastChoices = runState.history.slice(-3).reverse()

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      padding: '20px',
      maxWidth: '600px',
      margin: '0 auto'
    }}>
      <h1 style={{
        fontSize: '2rem',
        marginBottom: '2rem',
        fontWeight: 'bold',
        textAlign: 'center'
      }}>
        Your Results
      </h1>

      {/* Your Lane */}
      {topLane && (
        <div style={{
          padding: '24px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: '1.5rem'
        }}>
          <div style={{
            fontSize: '0.9rem',
            color: '#666',
            marginBottom: '8px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Your Lane
          </div>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            marginBottom: '8px'
          }}>
            {topLane.name}
          </h2>
          <p style={{
            fontSize: '1rem',
            color: '#666',
            lineHeight: '1.5'
          }}>
            {topLane.description}
          </p>
          <div style={{
            marginTop: '12px',
            fontSize: '0.9rem',
            color: '#999'
          }}>
            Confidence: {getConfidenceLabel(ratingGap)}
          </div>
        </div>
      )}

      {/* Runner-up */}
      {runnerUpLane && (
        <div style={{
          padding: '20px',
          backgroundColor: '#f9f9f9',
          borderRadius: '12px',
          marginBottom: '1.5rem'
        }}>
          <div style={{
            fontSize: '0.85rem',
            color: '#666',
            marginBottom: '6px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Runner-up
          </div>
          <h3 style={{
            fontSize: '1.2rem',
            fontWeight: '600'
          }}>
            {runnerUpLane.name}
          </h3>
        </div>
      )}

      {/* Closest matches section */}
      {allFigures.length > 0 && (
        <div style={{
          padding: '20px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: '1.5rem'
        }}>
          <h3 style={{
            fontSize: '1.2rem',
            fontWeight: '600',
            marginBottom: '16px'
          }}>
            Closest matches
          </h3>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {displayedFigures.map((figure) => (
              <div key={figure.id} style={{
                fontSize: '0.95rem',
                lineHeight: '1.5'
              }}>
                <strong>{figure.name}</strong> — {figure.role}
                <div style={{
                  fontSize: '0.85rem',
                  color: '#666',
                  marginTop: '4px'
                }}>
                  {figure.one_liner}
                </div>
              </div>
            ))}
          </div>
          {allFigures.length > 2 && (
            <button
              onClick={() => setShowAllFigures(!showAllFigures)}
              style={{
                marginTop: '12px',
                padding: '8px 16px',
                fontSize: '0.9rem',
                color: '#0070f3',
                backgroundColor: 'transparent',
                border: '1px solid #0070f3',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#f0f7ff'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              {showAllFigures ? 'Show less' : `Show more (${allFigures.length - 2} more)`}
            </button>
          )}
        </div>
      )}

      {/* Why section */}
      {lastChoices.length > 0 && (
        <div style={{
          padding: '20px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: '1.5rem'
        }}>
          <h3 style={{
            fontSize: '1.2rem',
            fontWeight: '600',
            marginBottom: '16px'
          }}>
            Why
          </h3>
          <ul style={{
            listStyle: 'none',
            padding: 0,
            margin: 0
          }}>
            {lastChoices.map((choice, idx) => {
              // New format: statement-based
              if (choice.statement_id && choice.answer) {
                const statement = getStatementById(choice.statement_id)
                if (!statement) return null
                
                return (
                  <li key={idx} style={{
                    marginBottom: '12px',
                    paddingLeft: '20px',
                    position: 'relative'
                  }}>
                    <span style={{
                      position: 'absolute',
                      left: 0,
                      color: '#999'
                    }}>•</span>
                    <div style={{ fontSize: '0.95rem', lineHeight: '1.5' }}>
                      <span style={{
                        fontWeight: '600',
                        color: choice.answer === 'yes' 
                          ? '#4CAF50' 
                          : choice.answer === 'no' 
                          ? '#f44336' 
                          : '#9e9e9e',
                        marginRight: '8px'
                      }}>
                        {choice.answer === 'meh' 
                          ? 'NOT SURE' 
                          : choice.answer === 'skip'
                          ? 'SKIP'
                          : choice.answer.toUpperCase()}
                      </span>
                      {statement.text}
                    </div>
                  </li>
                )
              }
              
              // Legacy format: card-based (for backward compatibility)
              return null
            })}
          </ul>
        </div>
      )}

      {/* Reset button */}
      <button
        onClick={handleReset}
        style={{
          padding: '16px 32px',
          fontSize: '1.1rem',
          fontWeight: '600',
          backgroundColor: '#0070f3',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          transition: 'background-color 0.2s',
          marginTop: 'auto',
          width: '100%'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = '#0051cc'
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = '#0070f3'
        }}
      >
        Start New Run
      </button>
    </main>
  )
}

