'use client'

import { useEffect } from 'react'
import { useAudioStore } from '@/store/audioStore'
import type { AudioTrack } from '@/types'
import { motion } from 'motion/react'

interface Props {
  tracks: AudioTrack[]
  projectId: string
}

function formatTime(seconds?: number) {
  if (!seconds) return '—'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function TrackList({ tracks, projectId }: Props) {
  const { loadQueue, play, pause, resume, currentTrack, isPlaying } = useAudioStore()

  // Charge la queue dès que la page du projet est montée
  useEffect(() => {
    loadQueue(tracks, projectId)
  }, [tracks, projectId, loadQueue])

  function handleClick(track: AudioTrack) {
    if (currentTrack?._key === track._key) {
      isPlaying ? pause() : resume()
    } else {
      play(track)
    }
  }

  return (
    <section>
      <h2 className="text-lg font-semibold mb-4">Tracks</h2>
      <ul className="flex flex-col gap-1">
        {tracks.map((track, i) => {
          const isActive = currentTrack?._key === track._key
          if (!track.audioUrl) return null
           else {return (
            <motion.li
              key={track._key}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <button
                onClick={() => handleClick(track)}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-md text-left transition-colors group ${isActive ? 'bg-white/10' : 'hover:bg-white/5'}`}
              >
                {/* Index / playing indicator */}
                <span className="w-6 text-center text-sm text-white/30">
                  {isActive && isPlaying ? '▶' : i + 1}
                </span>

                {/* Title */}
                <span className={`flex-1 text-sm font-medium ${isActive ? 'text-white' : 'text-white/70 group-hover:text-white'}`}>
                  {track.title}
                </span>

                {/* Duration */}
                <span className="text-xs text-white/30 tabular-nums">
                  {formatTime(track.duration)}
                </span>
              </button>
            </motion.li>
          )}
        })}
      </ul>
    </section>
  )
}
