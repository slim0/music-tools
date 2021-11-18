import React, { useState } from 'react'
import Slider from '@mui/material/Slider'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import IconButton from '@mui/material/IconButton'
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline'
import PauseCircleFilledIcon from '@mui/icons-material/PauseCircleFilled'

import './MetronomeComponent.scss'

class Metronome {  // Thanks to https://github.com/grantjames/metronome.git
  constructor(tempo, pulsation) {
    this.audioContext = null
    this.notesInQueue = []         // notes that have been put into the web audio and may or may not have been played yet {note, time}
    this.currentQuarterNote = 0
    this.tempo = tempo
    this.pulsation = pulsation
    this.lookahead = 25          // How frequently to call scheduling function (in milliseconds)
    this.scheduleAheadTime = 0.1   // How far ahead to schedule audio (sec)
    this.nextNoteTime = 0.0     // when the next note is due
    this.isRunning = false
    this.intervalID = null
  }

  nextNote() {
      // Advance current note and time by a quarter note (crotchet if you're posh)
      console.log(this.tempo)
      var secondsPerBeat = 60.0 / this.tempo // Notice this picks up the CURRENT tempo value to calculate beat length.
      this.nextNoteTime += secondsPerBeat // Add beat length to last beat time
  
      this.currentQuarterNote++    // Advance the beat number, wrap to zero
      if (this.currentQuarterNote === 4) {
          this.currentQuarterNote = 0
      }
  }

  scheduleNote(beatNumber, time) {
      // push the note on the queue, even if we're not playing.
      this.notesInQueue.push({ note: beatNumber, time: time })
  
      // create an oscillator
      const osc = this.audioContext.createOscillator()
      const envelope = this.audioContext.createGain()
      
      osc.frequency.value = (beatNumber % 4 === 0) ? 1000 : 800  // 1000 frequency at the first time !
      envelope.gain.value = 1
      envelope.gain.exponentialRampToValueAtTime(1, time + 0.001)
      envelope.gain.exponentialRampToValueAtTime(0.001, time + 0.02)

      osc.connect(envelope)
      envelope.connect(this.audioContext.destination)
  
      osc.start(time)
      osc.stop(time + 0.03)
  }

  scheduler() {
      // while there are notes that will need to play before the next interval, schedule them and advance the pointer.
      while (this.nextNoteTime < this.audioContext.currentTime + this.scheduleAheadTime ) {
          this.scheduleNote(this.currentQuarterNote, this.nextNoteTime)
          this.nextNote()
      }
  }

  start() {
      if (this.isRunning) return

      if (this.audioContext == null)
      {
          this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
      }

      this.isRunning = true

      this.currentQuarterNote = 0
      this.nextNoteTime = this.audioContext.currentTime + 0.05

      this.intervalID = setInterval(() => this.scheduler(), this.lookahead)
  }

  stop() {
      this.isRunning = false

      clearInterval(this.intervalID)
  }

  startStop() {
      if (this.isRunning) {
          this.stop()
      }
      else {
          this.start()
      }
  }
}

function MetronomeComponent(props) {

  const 
    minBpmValue = 30, 
    maxBpmValue = 250, 
    defaultBpmValue = 120, 
    stepBPM = 1, 
    defaultPulsation = 4  // 4: Binaire car on va jusqu'à un découpage de 4 temps pas mesure (possible d'augmenter)

  const [BPM, setBPM] = useState(defaultBpmValue)
  const [pulsation, setPulsation] = useState(defaultPulsation)
  const [isPlaying, setIsPlaying] = useState(false)

  const [metronomeRunner] = useState(new Metronome(BPM, pulsation))

  function onPlayPause(oldPlayingState) {
    setIsPlaying(!isPlaying)  // New Playing state
    metronomeRunner.startStop()
  }

  function onChangeBpmButton(oldBpm, action) {
    if (action === "decrease") {
      setBPM(oldBpm - stepBPM < minBpmValue ? minBpmValue : oldBpm - stepBPM)
    } else {
      setBPM(oldBpm + stepBPM > maxBpmValue ? maxBpmValue : oldBpm + stepBPM)
    }
    metronomeRunner.tempo = BPM
  }

  function onChangeBpmSlider(newBpm) {
    setBPM(newBpm)
    metronomeRunner.tempo = BPM
  }

  return (
    <div className="MetronomeComponent">
      <div id="version">Metronome v1.0</div>
      <div id="bpm-info">{BPM} <span style={{fontSize: "12px", fontWeight: "normal"}}>BPM</span></div>
      <div id="slider-and-buttons">
        <>
          <IconButton className="change-bpm-button left" aria-label="decrease-bpm" onClick={() => {onChangeBpmButton(BPM, "decrease")}} disabled={BPM === minBpmValue ? true : false}>
            <RemoveIcon />
          </IconButton>

          <Slider
            value={BPM}
            aria-label="bpm-slider"
            step={stepBPM}
            min={minBpmValue}
            max={maxBpmValue}
            onChange={(event, value) => onChangeBpmSlider(value)}
          />
          
          <IconButton className="change-bpm-button right" aria-label="increase-bpm" onClick={() => {onChangeBpmButton(BPM, "increase")}} disabled={BPM === maxBpmValue ? true : false}>
            <AddIcon />
          </IconButton>
        </>
      </div>
      <div>
        <IconButton aria-label="play-metronome" onClick={() => {onPlayPause(isPlaying)}}>
          { isPlaying ? <PauseCircleFilledIcon fontSize="large"/> : <PlayCircleOutlineIcon fontSize="large"/> }
        </IconButton>
      </div>
    </div>
  )
}

export default MetronomeComponent
