'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { RunState } from '@/types/schema'
import { getLaneById } from '@/data/lanes'
import { lanePositions, adjacency } from '@/data/adjacency'
import { loadRunState, migrateRunState } from '@/lib/state'
import { track } from '@/lib/metrics'

export const dynamic = 'force-dynamic'

function MapPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [runState, setRunState] = useState<RunState | null>(null)
  const [selectedLaneId, setSelectedLaneId] = useState<string | null>(null)
  const mapOpenedTrackedRef = useRef(false)

  useEffect(() => {
    const loaded = loadRunState()
    if (loaded) {
      // Validate lane_ratings exist and are valid
      if (!loaded.lane_ratings || Object.keys(loaded.lane_ratings).length === 0) {
        // Migrate or reset
        const migrated = migrateRunState(loaded)
        setRunState(migrated)
      } else {
        setRunState(loaded)
      }
    } else {
      // No state - show empty state
      setRunState(null)
    }

    // Track map_opened on mount (only once)
    if (!mapOpenedTrackedRef.current) {
      const focus = searchParams.get('focus')
      track('map_opened', { focus_lane_id: focus || null })
      mapOpenedTrackedRef.current = true
    }
  }, [router, searchParams])

  if (!runState) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-md px-4 py-6">
          <div className="py-12 text-center">
            <h1 className="mb-4 text-2xl font-bold text-gray-900">No map data</h1>
            <p className="mb-6 text-gray-600">Complete a run to see your career map.</p>
            <button
              onClick={() => router.push('/play')}
              className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors duration-200 hover:bg-blue-700"
            >
              Start a run
            </button>
          </div>
        </div>
      </main>
    )
  }

  // Get top 2 lanes from ratings
  const sortedLanes = Object.entries(runState.lane_ratings)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2)

  const topLaneId = sortedLanes[0]?.[0] || null
  const runnerUpLaneId = sortedLanes[1]?.[0] || null

  // SVG dimensions (normalized to 0-100, will scale)
  const svgWidth = 100
  const svgHeight = 100
  const nodeRadius = 4
  const strokeWidth = 0.5

  // Get node style based on lane
  const getNodeStyle = (laneId: string) => {
    if (laneId === topLaneId) {
      return {
        fill: '#0070f3',
        stroke: '#0051cc',
        strokeWidth: strokeWidth * 2,
        opacity: 1,
      }
    }
    if (laneId === runnerUpLaneId) {
      return {
        fill: '#4CAF50',
        stroke: '#388e3c',
        strokeWidth: strokeWidth * 1.5,
        opacity: 0.9,
      }
    }
    return {
      fill: '#9e9e9e',
      stroke: '#757575',
      strokeWidth: strokeWidth,
      opacity: 0.7,
    }
  }

  // Get selected lane data
  const selectedLane = selectedLaneId ? getLaneById(selectedLaneId) : null
  const adjacentLanes = selectedLaneId ? adjacency[selectedLaneId] || [] : []

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        padding: '20px',
        maxWidth: '600px',
        margin: '0 auto',
        backgroundColor: '#fafafa',
      }}
    >
      <h1
        style={{
          fontSize: '1.8rem',
          marginBottom: '1rem',
          fontWeight: 'bold',
          textAlign: 'center',
        }}
      >
        Career Map
      </h1>

      {/* Map SVG */}
      <div
        style={{
          width: '100%',
          aspectRatio: '1 / 1',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          padding: '20px',
          marginBottom: '1.5rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          style={{
            width: '100%',
            height: '100%',
            cursor: 'pointer',
          }}
        >
          {/* Draw edges (adjacency lines) */}
          {lanePositions.map((pos) => {
            const neighbors = adjacency[pos.lane_id] || []
            return neighbors.map((neighborId) => {
              const neighborPos = lanePositions.find((p) => p.lane_id === neighborId)
              if (!neighborPos) return null

              // Only draw edge once (avoid duplicates)
              if (pos.lane_id < neighborId) {
                return (
                  <line
                    key={`${pos.lane_id}-${neighborId}`}
                    x1={pos.x}
                    y1={pos.y}
                    x2={neighborPos.x}
                    y2={neighborPos.y}
                    stroke="#e0e0e0"
                    strokeWidth={strokeWidth}
                    opacity={0.5}
                  />
                )
              }
              return null
            })
          })}

          {/* Draw nodes (lanes) */}
          {lanePositions.map((pos) => {
            const style = getNodeStyle(pos.lane_id)
            const isSelected = selectedLaneId === pos.lane_id

            return (
              <g key={pos.lane_id}>
                {/* Node circle */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={isSelected ? nodeRadius * 1.5 : nodeRadius}
                  fill={style.fill}
                  stroke={style.stroke}
                  strokeWidth={style.strokeWidth}
                  opacity={style.opacity}
                  style={{
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onClick={() => setSelectedLaneId(pos.lane_id)}
                  onMouseOver={(e) => {
                    e.currentTarget.style.opacity = '1'
                    e.currentTarget.setAttribute('r', String(nodeRadius * 1.3))
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.opacity = String(style.opacity)
                    e.currentTarget.setAttribute(
                      'r',
                      String(isSelected ? nodeRadius * 1.5 : nodeRadius)
                    )
                  }}
                />
                {/* Lane label */}
                <text
                  x={pos.x}
                  y={pos.y + nodeRadius + 3}
                  fontSize="2.5"
                  fill="#666"
                  textAnchor="middle"
                  style={{
                    pointerEvents: 'none',
                    userSelect: 'none',
                    fontWeight: isSelected ? '600' : '400',
                  }}
                >
                  {getLaneById(pos.lane_id)?.name.split(' / ')[0] || pos.lane_id}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      {/* Info Panel (Bottom Sheet) */}
      {selectedLane && (
        <div
          style={{
            padding: '24px',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            marginBottom: '1rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '16px',
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: '1.3rem',
                  fontWeight: '600',
                  marginBottom: '8px',
                }}
              >
                {selectedLane.name}
              </h2>
              <p
                style={{
                  fontSize: '0.95rem',
                  color: '#666',
                  lineHeight: '1.5',
                }}
              >
                {selectedLane.description}
              </p>
            </div>
            <button
              onClick={() => setSelectedLaneId(null)}
              style={{
                padding: '4px 8px',
                fontSize: '1.2rem',
                backgroundColor: 'transparent',
                border: 'none',
                color: '#999',
                cursor: 'pointer',
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>

          {/* Adjacent lanes */}
          {adjacentLanes.length > 0 && (
            <div>
              <h3
                style={{
                  fontSize: '0.9rem',
                  color: '#666',
                  marginBottom: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Adjacent Lanes
              </h3>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                {adjacentLanes.map((adjLaneId) => {
                  const adjLane = getLaneById(adjLaneId)
                  if (!adjLane) return null

                  return (
                    <button
                      key={adjLaneId}
                      onClick={() => setSelectedLaneId(adjLaneId)}
                      style={{
                        padding: '12px 16px',
                        fontSize: '0.95rem',
                        textAlign: 'left',
                        backgroundColor: '#f5f5f5',
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        color: '#333',
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = '#eeeeee'
                        e.currentTarget.style.borderColor = '#0070f3'
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = '#f5f5f5'
                        e.currentTarget.style.borderColor = '#e0e0e0'
                      }}
                    >
                      <div style={{ fontWeight: '600', marginBottom: '4px' }}>{adjLane.name}</div>
                      <div style={{ fontSize: '0.85rem', color: '#666' }}>
                        {adjLane.description}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div
        style={{
          padding: '16px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: '1rem',
          fontSize: '0.9rem',
        }}
      >
        <div style={{ marginBottom: '8px', fontWeight: '600' }}>Legend</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: '#0070f3',
                border: '1px solid #0051cc',
              }}
            />
            <span>Your Top Lane</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: '#4CAF50',
                border: '1px solid #388e3c',
              }}
            />
            <span>Runner-up</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: '#9e9e9e',
                border: '1px solid #757575',
              }}
            />
            <span>Other Lanes</span>
          </div>
        </div>
      </div>

      {/* Back button */}
      <button
        onClick={() => router.push('/results')}
        style={{
          padding: '16px 32px',
          fontSize: '1rem',
          fontWeight: '600',
          backgroundColor: '#0070f3',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          transition: 'background-color 0.2s',
          width: '100%',
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = '#0051cc'
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = '#0070f3'
        }}
      >
        Back to Results
      </button>
    </main>
  )
}

export default function MapPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gray-50">
          <div className="mx-auto max-w-md px-4 py-6">
            <div className="py-12 text-center">
              <p className="text-gray-600">Loading map...</p>
            </div>
          </div>
        </main>
      }
    >
      <MapPageContent />
    </Suspense>
  )
}
