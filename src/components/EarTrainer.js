import { Button } from '@mui/material'
import React from 'react'

import soundfile from '../audiofiles/E2/1.wav'
import soundfile2 from '../audiofiles/E2/8.wav'


import './EarTrainer.scss'


// https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Advanced_techniques#dial_up_—_loading_a_sound_sample
async function getFile(audioContext, filepath) {
  const response = await fetch(filepath)
  const arrayBuffer = await response.arrayBuffer()
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
  return audioBuffer
}

async function setupSample(audioCtx) {
  // Note: You can easily modify the function to take an array of files and loop over them to load more than one sample. 
  // This would be very handy for more complex instruments, or gaming.
  console.log("Loading samples")
  const filePath = soundfile
  const sample = await getFile(audioCtx, filePath)
  return sample
}

async function setupSample2(audioCtx) {
  // Note: You can easily modify the function to take an array of files and loop over them to load more than one sample. 
  // This would be very handy for more complex instruments, or gaming.
  const filePath = soundfile2
  const sample = await getFile(audioCtx, filePath)
  return sample
}


class EarTrainer extends React.Component {
  constructor(props) {
    super(props)

    this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
    this.bufferNotes = []

  }

  componentDidMount() {
    setupSample(this.audioContext).then(
      (sample) => {
        this.sample=sample
      }
    )
    setupSample2(this.audioContext).then(
      (sample) => {
        this.sample2=sample
      }
    )
  }

  componentWillUnmount() {
    this.audioContext.close()
  }

  playSample = (audioContext, audioBufferArray) => {

    const notes = []

    audioBufferArray.forEach(audioBuffer => {
      const sampleSource = audioContext.createBufferSource()
      sampleSource.buffer = audioBuffer
      const playbackRate = 1
      sampleSource.playbackRate.value = playbackRate
      sampleSource.connect(audioContext.destination)

      notes.push(sampleSource)
    })

    let delay = 0
    notes.forEach(note => {
      note.start(this.audioContext.currentTime + delay)
      // delay += 1  // Si besoin de jouer mélodiquement
    })
  }

  render() {
    return (
        <div className="EarTrainer">
            EarTrainer
            <Button onClick={() => {this.playSample(this.audioContext, [this.sample, this.sample2])}}>ClickOnMe</Button>
        </div>
    )
  }
}

export default EarTrainer
