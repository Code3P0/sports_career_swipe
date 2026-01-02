'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { RunState } from '@/types/schema'
import { getLaneById } from '@/data/lanes'
import { getFiguresByLaneId } from '@/data/figures'
import { getStatementById } from '@/data/statements'
import { getActionsByLaneId } from '@/data/actions'
import { loadSavedActionIds, toggleSavedAction, isSaved } from '@/lib/savedActions'

/**
 * Confidence thresholds incorporating rating gap and signal quality:
 * Strong: big gap (>= 80) + good signal (skipRate <= 0.35)
 * Medium: moderate gap (>= 40) OR higher skip rate
 * Weak/Exploratory: small gap (< 40) OR very high skip rate (> 0.5)
 */
function getConfidenceLabel(ratingGap: number, skipRate: number): string {
  const hasBigGap = ratingGap >= 80
  const hasModerateGap = ratingGap >= 40
  const hasGoodSignal = skipRate <= 0.35
  const hasVeryHighSkip = skipRate > 0.5
  
  if (hasBigGap && hasGoodSignal) return 'Strong'
  if (hasModerateGap && hasGoodSignal) return 'Medium'
  if (hasVeryHighSkip) return 'Exploratory'
  if (!hasModerateGap) return 'Weak'
  return 'Medium'
}

/**
 * Get signal quality label
 */
function getSignalQuality(skipRate: number): string {
  return skipRate <= 0.35 ? 'Good' : 'Low'
}

export default function ResultsPage() {
  const router = useRouter()
  const [runState, setRunState] = useState<RunState | null>(null)
  const [showAllFigures, setShowAllFigures] = useState(false)
  const [savedActionIds, setSavedActionIds] = useState<string[]>([])

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
    
    // Load saved actions
    setSavedActionIds(loadSavedActionIds())
  }, [router])

  const handleReset = () => {
    localStorage.removeItem('runState')
    router.push('/play')
  }

  const handleToggleSave = (actionId: string) => {
    const updated = toggleSavedAction(actionId)
    setSavedActionIds(updated)
  }

  const handleCopyPlan = async () => {
    if (!topLane || !runState) return
    
    const actions = topLaneId ? getActionsByLaneId(topLaneId) : []
    const runnerUpName = runnerUpLane ? runnerUpLane.name : 'N/A'
    
    let text = `Career Swipe Results\n\n`
    text += `Top Lane: ${topLane.name}\n`
    text += `Runner-up: ${runnerUpName}\n`
    text += `Confidence: ${confidenceLabel}\n`
    text += `Signal Quality: ${signalQuality}\n\n`
    text += `Next Actions (15-60 min):\n\n`
    
    actions.forEach((action, idx) => {
      const saved = isSaved(action.id, savedActionIds)
      text += `${idx + 1}. ${action.title} (${action.minutes} min)${saved ? ' [Saved]' : ''}\n`
      text += `   ${action.description}\n`
      text += `   Deliverable: ${action.deliverable}\n\n`
    })
    
    if (runnerUpLane) {
      text += `If you're between lanes:\n`
      text += `Consider a hybrid mini-project combining ${topLane.name} and ${runnerUpLane.name}—for example, creating a content series that drives community engagement while measuring growth metrics.\n`
    }
    
    try {
      await navigator.clipboard.writeText(text)
      // Optional: show a brief success message
      alert('Plan copied to clipboard!')
    } catch (e) {
      console.error('Failed to copy:', e)
      alert('Failed to copy. Please try again.')
    }
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

  // Get answer counts
  const answerCounts = runState.answer_counts || { yes: 0, no: 0, skip: 0 }
  const totalAnswers = answerCounts.yes + answerCounts.no + answerCounts.skip
  const skipRate = totalAnswers > 0 ? answerCounts.skip / totalAnswers : 0
  const signalQuality = getSignalQuality(skipRate)
  const confidenceLabel = getConfidenceLabel(ratingGap, skipRate)

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
            color: '#666',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}>
            <div>
              Confidence: <strong>{confidenceLabel}</strong>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#999' }}>
              Signal quality: {signalQuality}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#999' }}>
              Answers: {answerCounts.yes} Yes / {answerCounts.no} No / {answerCounts.skip} Skip
            </div>
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

      {/* Next Actions section */}
      {topLaneId && (
        <div style={{
          padding: '24px',
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
            Next Actions (15–60 min)
          </h3>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            {getActionsByLaneId(topLaneId).map((action) => {
              const saved = isSaved(action.id, savedActionIds)
              return (
                <div
                  key={action.id}
                  style={{
                    padding: '16px',
                    backgroundColor: '#f9f9f9',
                    borderRadius: '8px',
                    border: saved ? '2px solid #4CAF50' : '1px solid #e0e0e0',
                    position: 'relative'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '8px'
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '6px'
                      }}>
                        <h4 style={{
                          fontSize: '1rem',
                          fontWeight: '600',
                          margin: 0
                        }}>
                          {action.title}
                        </h4>
                        <span style={{
                          fontSize: '0.85rem',
                          color: '#666',
                          backgroundColor: '#e0e0e0',
                          padding: '2px 8px',
                          borderRadius: '4px'
                        }}>
                          {action.minutes} min
                        </span>
                      </div>
                      <p style={{
                        fontSize: '0.9rem',
                        color: '#666',
                        lineHeight: '1.5',
                        marginBottom: '8px'
                      }}>
                        {action.description}
                      </p>
                      <div style={{
                        fontSize: '0.85rem',
                        color: '#666'
                      }}>
                        <strong>Deliverable:</strong> {action.deliverable}
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggleSave(action.id)}
                      style={{
                        marginLeft: '12px',
                        padding: '6px 12px',
                        fontSize: '0.85rem',
                        fontWeight: '500',
                        backgroundColor: saved ? '#4CAF50' : '#e0e0e0',
                        color: saved ? 'white' : '#666',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        whiteSpace: 'nowrap'
                      }}
                      onMouseOver={(e) => {
                        if (!saved) {
                          e.currentTarget.style.backgroundColor = '#d0d0d0'
                        }
                      }}
                      onMouseOut={(e) => {
                        if (!saved) {
                          e.currentTarget.style.backgroundColor = '#e0e0e0'
                        }
                      }}
                    >
                      {saved ? '✓ Saved' : 'Save'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Hybrid mini-project suggestion */}
      {topLane && runnerUpLane && (
        <div style={{
          padding: '20px',
          backgroundColor: '#f0f7ff',
          borderRadius: '12px',
          marginBottom: '1.5rem',
          border: '1px solid #b3d9ff'
        }}>
          <h3 style={{
            fontSize: '1rem',
            fontWeight: '600',
            marginBottom: '8px',
            color: '#0051cc'
          }}>
            If you're between lanes…
          </h3>
          <p style={{
            fontSize: '0.95rem',
            color: '#333',
            lineHeight: '1.5',
            margin: 0
          }}>
            Consider a hybrid mini-project combining <strong>{topLane.name}</strong> and <strong>{runnerUpLane.name}</strong>—for example, creating a content series that drives community engagement while measuring growth metrics.
          </p>
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

      {/* Copy Plan button */}
      <button
        onClick={handleCopyPlan}
        style={{
          padding: '16px 32px',
          fontSize: '1.1rem',
          fontWeight: '600',
          backgroundColor: '#9e9e9e',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          transition: 'background-color 0.2s',
          marginBottom: '1rem',
          width: '100%'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = '#757575'
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = '#9e9e9e'
        }}
      >
        Copy my plan
      </button>

      {/* Explore Career Map button */}
      <button
        onClick={() => router.push('/map')}
        style={{
          padding: '16px 32px',
          fontSize: '1.1rem',
          fontWeight: '600',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          transition: 'background-color 0.2s',
          marginBottom: '1rem',
          width: '100%'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = '#45a049'
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = '#4CAF50'
        }}
      >
        Explore the Career Map
      </button>

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

