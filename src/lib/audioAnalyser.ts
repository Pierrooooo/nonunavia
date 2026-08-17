'use client'

import { Howler } from 'howler'

/**
 * Analyseur audio global, indépendant de React.
 * Howler tourne en `html5: true` (streaming), donc l'audio ne passe PAS
 * par le graphe Web Audio de Howler par défaut : on doit créer un
 * MediaElementAudioSourceNode sur l'élément <audio> réel de chaque Howl
 * et le brancher sur un AnalyserNode.
 *
 * Appelle `connectHowlElement(el)` à chaque nouveau son (voir audioStore.ts),
 * et `getAudioLevels()` à chaque frame pour lire les niveaux basses/médiums/aigus.
 */

let ctx: AudioContext | null = null
let analyser: AnalyserNode | null = null
let freqData: Uint8Array<ArrayBuffer> | null = null
let currentSource: MediaElementAudioSourceNode | null = null
let currentEl: HTMLMediaElement | null = null

function ensureGraph() {
  if (analyser) return
  const howlerCtx = Howler.ctx as AudioContext | undefined
  if (!howlerCtx) return // pas encore initialisé par Howler (créé au premier play)

  ctx = howlerCtx
  analyser = ctx.createAnalyser()
  analyser.fftSize = 512
  analyser.smoothingTimeConstant = 0.82
  // Typage explicite requis par les lib.dom.d.ts récents : getByteFrequencyData
  // attend un Uint8Array<ArrayBuffer>, alors que `new Uint8Array(n)` est
  // inféré comme Uint8Array<ArrayBufferLike> (peut être un SharedArrayBuffer).
  freqData = new Uint8Array(new ArrayBuffer(analyser.frequencyBinCount))

  // L'analyseur doit être DANS le chemin audible (source -> analyser -> destination) :
  // un AnalyserNode laisse passer le signal inchangé, donc le son continue de
  // sortir normalement tout en étant lisible pour getByteFrequencyData().
  analyser.connect(ctx.destination)
}

/**
 * À appeler avec l'élément <audio> interne de Howler (howl._sounds[0]._node)
 * à chaque nouveau morceau joué en mode html5.
 */
export function connectHowlElement(el: HTMLMediaElement | null | undefined) {
  if (!el || el === currentEl) return
  ensureGraph()
  if (!ctx || !analyser) return

  try {
    currentSource?.disconnect()
  } catch {
    // rien à déconnecter
  }

  try {
    currentSource = ctx.createMediaElementSource(el)
    currentSource.connect(analyser)
    currentEl = el
  } catch (err) {
    // Erreur volontairement loguée (et non avalée) : un élément déjà routé
    // vers une MediaElementSource (ex: hot-reload en dev) lève ici — dans ce
    // cas un rechargement complet de page règle le souci.
    console.warn('[audioAnalyser] connectHowlElement failed:', err)
  }

  // Les navigateurs démarrent l'AudioContext en "suspended" tant qu'aucun
  // geste utilisateur n'a eu lieu. Comme on route maintenant le son à
  // travers ce contexte, il faut s'assurer qu'il tourne, sinon silence total.
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {})
  }
}

export interface AudioLevels {
  bass: number
  mid: number
  treble: number
  overall: number
}

const EMPTY: AudioLevels = { bass: 0, mid: 0, treble: 0, overall: 0 }

export function getAudioLevels(): AudioLevels {
  if (!analyser || !freqData) return EMPTY

  analyser.getByteFrequencyData(freqData)
  const n = freqData.length
  const bassEnd = Math.max(1, Math.floor(n * 0.12))
  const midEnd = Math.max(bassEnd + 1, Math.floor(n * 0.5))

  let bass = 0
  let mid = 0
  let treble = 0
  for (let i = 0; i < bassEnd; i++) bass += freqData[i]
  for (let i = bassEnd; i < midEnd; i++) mid += freqData[i]
  for (let i = midEnd; i < n; i++) treble += freqData[i]

  bass = bass / bassEnd / 255
  mid = mid / (midEnd - bassEnd) / 255
  treble = treble / (n - midEnd) / 255

  return { bass, mid, treble, overall: (bass + mid + treble) / 3 }
}