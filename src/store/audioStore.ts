import { create } from 'zustand'
import { Howl } from 'howler'
import type { AudioTrack } from '@/types'
import { connectHowlElement } from '@/lib/audioAnalyser'

interface AudioState {
  // État courant
  currentTrack: AudioTrack | null
  isPlaying: boolean
  duration: number
  seek: number
  volume: number

  // Queue — tous les tracks du projet ouvert
  queue: AudioTrack[]
  queueProjectId: string | null

  // Howl instance (non-sérialisable, on la stocke hors Zustand idéalement
  // mais la mettre ici est pratique pour ce projet)
  _howl: Howl | null

  // Actions
  loadQueue: (tracks: AudioTrack[], projectId: string) => void
  play: (track: AudioTrack) => void
  pause: () => void
  resume: () => void
  togglePlay: () => void
  stop: () => void
  next: () => void
  prev: () => void
  setVolume: (volume: number) => void
  setSeek: (seconds: number) => void
  _onEnd: () => void
}

export const useAudioStore = create<AudioState>((set, get) => ({
  currentTrack: null,
  isPlaying: false,
  duration: 0,
  seek: 0,
  volume: 0.8,
  queue: [],
  queueProjectId: null,
  _howl: null,

  loadQueue(tracks, projectId) {
    set({ queue: tracks, queueProjectId: projectId })
  },

  play(track) {
    const { _howl, volume } = get()

    // Stop & destroy le son précédent
    if (_howl) {
      _howl.stop()
      _howl.unload()
    }

    const howl = new Howl({
      src: [track.audioUrl],
      html5: true, // streaming — important pour les gros fichiers audio
      volume,
      onend: () => get()._onEnd(),
      onload: () => set({ duration: howl.duration() }),
      onplay: () => {
        // En mode html5, Howler garde l'élément <audio> réel dans _sounds[0]._node.
        // On le branche sur l'analyseur pour que la forme 3D réagisse au son.
        // @ts-expect-error accès à une propriété interne non-typée de Howler
        const el = howl._sounds?.[0]?._node as HTMLMediaElement | undefined
        connectHowlElement(el)
      },
    })

    // IMPORTANT : l'audio (CDN Sanity = cross-origin) doit être marqué
    // crossOrigin AVANT que le navigateur ne commence à le charger, sinon
    // Web Audio le rendra silencieux (sans erreur) une fois passé dans
    // l'AnalyserNode. On force donc crossOrigin + un reload propre ici,
    // avant d'appeler play().
    // @ts-expect-error accès à une propriété interne non-typée de Howler
    const rawEl = howl._sounds?.[0]?._node as HTMLMediaElement | undefined
    if (rawEl && rawEl.crossOrigin !== 'anonymous') {
      rawEl.crossOrigin = 'anonymous'
      rawEl.load()
    }

    howl.play()

    set({ _howl: howl, currentTrack: track, isPlaying: true, seek: 0 })

    // Mise à jour de seek toutes les secondes
    const interval = setInterval(() => {
      const { _howl, isPlaying } = get()
      if (_howl && isPlaying) {
        set({ seek: (_howl.seek() as number) || 0 })
      } else {
        clearInterval(interval)
      }
    }, 1000)
  },

  pause() {
    const { _howl } = get()
    if (_howl) _howl.pause()
    set({ isPlaying: false })
  },

  resume() {
    const { _howl } = get()
    if (_howl) _howl.play()
    set({ isPlaying: true })
  },

  togglePlay() {
    const { isPlaying } = get()
    isPlaying ? get().pause() : get().resume()
  },

  stop() {
    const { _howl } = get()
    if (_howl) { _howl.stop(); _howl.unload() }
    set({ _howl: null, currentTrack: null, isPlaying: false, seek: 0, duration: 0 })
  },

  next() {
    const { queue, currentTrack } = get()
    if (!currentTrack || queue.length === 0) return
    const idx = queue.findIndex((t) => t._key === currentTrack._key)
    const next = queue[(idx + 1) % queue.length]
    get().play(next)
  },

  prev() {
    const { queue, currentTrack } = get()
    if (!currentTrack || queue.length === 0) return
    const idx = queue.findIndex((t) => t._key === currentTrack._key)
    const prev = queue[(idx - 1 + queue.length) % queue.length]
    get().play(prev)
  },

  setVolume(volume) {
    const { _howl } = get()
    if (_howl) _howl.volume(volume)
    set({ volume })
  },

  setSeek(seconds) {
    const { _howl } = get()
    if (_howl) _howl.seek(seconds)
    set({ seek: seconds })
  },

  _onEnd() {
    get().next()
  },
}))
