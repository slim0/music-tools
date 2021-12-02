import { Button } from '@mui/material'
import React from 'react'

import autoCorrelate from "./libs/AutoCorrelate";
import {
  noteFromPitch,
  centsOffFromPitch,
  getDetunePercent,
} from "./libs/Helpers";


class Tuner extends React.Component {
  constructor(props) {
    super(props)

    this.audioContext = undefined
    this.analyser = undefined
    this.source = undefined
    this.mediaStream = undefined
    this.buflen = 2048
    this.buf = new Float32Array(this.buflen);
    this.noteStrings = [
      "C",
      "C#",
      "D",
      "D#",
      "E",
      "F",
      "F#",
      "G",
      "G#",
      "A",
      "A#",
      "B",
    ]

    this.state = {
      isRunning: false,
      pitch: "0 Hz",
      pitchNote: "C",
      pitchScale: "4",
      detune: "0",
      notification: false
    }
  }

  componentDidUpdate() {
    setInterval(this.updatePitch, 1)
  }

  updatePitch = (time) => {
    if (this.isRunning && this.audioContext && this.analyserNode) {
      this.analyserNode.getFloatTimeDomainData(this.buf)
      var ac = autoCorrelate(this.buf, this.audioContext.sampleRate)
      if (ac > -1) {
        let note = noteFromPitch(ac)
        let sym = this.noteStrings[note % 12]
        let scl = Math.floor(note / 12) - 1
        let dtune = centsOffFromPitch(ac, note)
        this.setState({pitch: parseFloat(ac).toFixed(2) + " Hz"})
        this.setState({pitchNote: parseFloat(ac).toFixed(2) + " Hz"})
        this.setState({pitchScale: scl})
        this.setState({detune: dtune})
        this.setState({notification: false})

        console.log(note, sym, scl, dtune, ac)
      }
    }
  }

  start = async () => {
    this.setState({isRunning: true})
    if (!this.mediaStream || this.mediaStream.active === false) {
      await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          autoGainControl: false,
          noiseSuppression: false,
          latency: 0,
        },
      }).then((mediaStream) => {this.mediaStream = mediaStream})
    }

    if (!this.audioContext || this.audioContext.state === "closed") {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
      this.analyser = this.audioContext.createAnalyser()
      this.source = this.audioContext.createMediaStreamSource(this.mediaStream)
      this.source.connect(this.analyser)
    }

    // if (audioCtx.state === "suspended") {
    //   await audioCtx.resume()
    // }
    // setStart(true)
    // setNotification(true)
    // setTimeout(() => setNotification(false), 5000)
    // setSource(audioCtx.createMediaStreamSource(input))
  }

  stop = () => {
    this.setState({isRunning: false})
    if (this.mediaStream && this.mediaStream.active === true) {
      this.mediaStream.getAudioTracks().forEach(track => {
        track.stop()
      })
    }
    if (this.audioContext.state !== "closed") {
      this.audioContext.close()
    }

    // source.disconnect(analyserNode)
    // setStart(false)
  }


  render() {
    return (
        <div className="Metronome">
            <Button onClick={this.start}>START</Button>
            <Button onClick={this.stop}>STOP</Button>
        </div>
    )
  }
}

export default Tuner