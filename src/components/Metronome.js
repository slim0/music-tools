import React from 'react'
import Slider from '@mui/material/Slider'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import IconButton from '@mui/material/IconButton'
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline'
import PauseCircleFilledIcon from '@mui/icons-material/PauseCircleFilled'
import CircleIcon from '@mui/icons-material/Circle';
import NumberSelector from './NumberSelector'

import './Metronome.scss'

class Metronome extends React.Component {  // Thanks to https://github.com/grantjames/metronome.git
  constructor(props) {
    super(props)

    this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
    this.intervalID = undefined
    

    this.state = {
      minBpmValue: props.minBpmValue || 30,
      maxBpmValue: props.maxBpmValue || 250,
      stepBPM: props.stepBPM || 1,
      BPM: props.BPM || 60,
      beatPerMeasure: props.beatPerMeasure || 4,
      beatPerTime: props.beatPerTime || 1,
      isPlaying: false,
      currentNote: 0,
      lookahead: 25,
      scheduleAheadTime: 0.1, // How far ahead to schedule audio (sec)
      nextBeatTime: 0.0, // when the next note is due
      nextSubBeatTime: 0.0, // when the next sub note is due
      tapTempo: undefined
    }
  }

  nextNote() {
    // Advance current note and time by a quarter note (crotchet if you're posh)
    var secondsPerBeat = 60.0 / this.state.BPM // Notice this picks up the CURRENT tempo value to calculate beat length.
    this.setState({nextBeatTime: this.state.nextBeatTime + secondsPerBeat}) // Add beat length to last beat time

    this.setState({currentNote: this.state.currentNote + 1})
    if (this.state.currentNote % this.state.beatPerMeasure === 0) {
      this.setState({currentNote: 0})
    }
  }

  scheduleNote(time, subBeatTime) {
    // push the note on the queue, even if we're not playing.
    // this.notesInQueue.push({ note: this.currentNote, time: time })
    // create an oscillator
    const osc = this.audioContext.createOscillator()
    const envelope = this.audioContext.createGain()

    osc.frequency.value = (this.state.currentNote % (this.state.beatPerMeasure) === 0) ? 1000 : 800 // 1000 frequency at the first beat per measure !

    let volume = 1
    envelope.gain.value = volume
 
    envelope.gain.exponentialRampToValueAtTime(volume, time + 0.001)
    envelope.gain.exponentialRampToValueAtTime(0.001, time + 0.02)

    osc.connect(envelope)
    envelope.connect(this.audioContext.destination)

    osc.start(time || subBeatTime)
    osc.stop(time + 0.03)

  }

  scheduler() {
    // while there are notes that will need to play before the next interval, schedule them and advance the pointer.
    while (this.state.nextBeatTime < this.audioContext.currentTime + this.state.scheduleAheadTime) {
      this.scheduleNote(this.state.nextBeatTime)
      this.nextNote()
    }
  }

  startStop() {
    if (this.state.isPlaying) {
      this.stop()
    }
    else {
      this.start()
    }
  }

  start() {
    this.setState({
      isPlaying: true,
      currentNote:  0,
      nextBeatTime: this.audioContext.currentTime + 0.05
    })

    this.intervalID = setInterval(() => this.scheduler(), this.state.lookahead)
  }

  stop() {
    this.setState({isPlaying: false})
    clearInterval(this.intervalID)

  }

  onChangeBpmButton(action) {
    if (action === "decrease") {
      if (this.state.BPM - this.state.stepBPM >= this.state.minBpmValue) {
        this.setState({BPM: this.state.BPM - this.state.stepBPM})
      }
    } else {
      if (this.state.BPM + this.state.stepBPM <= this.state.maxBpmValue) {
        this.setState({BPM: this.state.BPM + this.state.stepBPM})
      }
    }
  }

  onChangeBeatPerMeasure(newBeatPerMeasure) {
    this.setState({beatPerMeasure: newBeatPerMeasure})
  }

  onChangeBeatPerTime(newBeatPerTime) {
    this.setState({beatPerTime: newBeatPerTime})
  }

  setTapTempo() {
    if (this.state.tapTempo === undefined || this.state.tapTempo === 0) {
      if (this.state.tapTempo === undefined) {
        this.startStop()
      }
      this.setState({ tapTempo: this.audioContext.currentTime })
    } else {
      let currentTime = this.audioContext.currentTime
      let newBPM = Math.round(60.0 / (currentTime - this.state.tapTempo))
      if (newBPM >= this.state.minBpmValue && newBPM <= this.state.maxBpmValue) {
        this.setState({ tapTempo: currentTime })
        this.setState({BPM: newBPM})
        if (!this.state.isPlaying) {
          this.start()
        } else {
          this.stop()
          this.start()
        }
      } else {
        this.setState({ tapTempo: 0 })
      }
    }
  }

  render() {

    return (
      <div className="Metronome">
        <div id="bpm-info">{this.state.BPM} <span style={{fontSize: "12px", fontWeight: "normal"}}>BPM</span></div>
        <div id="slider-and-buttons">
          <>
            <IconButton className="change-bpm-button left" aria-label="decrease-bpm" onClick={() => {this.onChangeBpmButton("decrease")}} disabled={this.state.BPM === this.state.minBpmValue ? true : false}>
              <RemoveIcon />
            </IconButton>
  
            <Slider className='metronome-slider'
              value={this.state.BPM}
              aria-label="bpm-slider"
              step={this.state.stepBPM}
              min={this.state.minBpmValue}
              max={this.state.maxBpmValue}
              onChange={(event, value) => this.setState({BPM: value})}
            />
            
            <IconButton className="change-bpm-button right" aria-label="increase-bpm" onClick={() => {this.onChangeBpmButton("increase")}} disabled={this.state.BPM === this.state.maxBpmValue ? true : false}>
              <AddIcon />
            </IconButton>
          </>
        </div>

        <div style={{display: 'flex', alignItems: 'center'}}>
          <NumberSelector defaultNumber={this.state.beatPerMeasure} numbersArray={Array.from({length: 64}, (_, i) => i + 1)} onChange={(value) => {this.onChangeBeatPerMeasure(value)}}/>
          <div style={{fontSize: '12px'}}>BEATS PER MEASURE</div>

          <IconButton style={{marginLeft: 'auto', marginRight: '-20px'}} size="small" aria-label="tap-tempo" onClick={() => {this.setTapTempo()}}>
            <CircleIcon fontSize="large"/>
          </IconButton>

          <IconButton style={{marginLeft: 'auto', marginRight: '10px'}} size="small" aria-label="play-metronome" onClick={() => {this.startStop()}}>
            { this.state.isPlaying ? <PauseCircleFilledIcon fontSize="large"/> : <PlayCircleOutlineIcon fontSize="large"/> }
          </IconButton>
        </div>

        {/* <div>
          <NumberSelector defaultNumber={this.state.beatPerTime} numbersArray={Array.from({length: 8}, (_, i) => i + 1)} onChange={(value) => {this.onChangeBeatPerTime(value)}}/>
        </div> */}
      </div>
    )
  }
}

export default Metronome
