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

class Metronome extends React.Component {  // Thanks to https://github.com/grantjames/metronome.git for inspiration 
  constructor(props) {
    super(props)

    this.intervalID = undefined
    this.audioContext = undefined
    this.tapTempo = undefined
    
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
    }
  }

  componentWillUnmount() {
    console.log("componentWillUnmount")
    this.audioContext.close()
  }

  startAudioCtx = () => {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
    }
  }

  nextNote = () => {
    // Advance current note and time by a quarter note (crotchet if you're posh)
    var secondsPerBeat = 60.0 / this.state.BPM // Notice this picks up the CURRENT tempo value to calculate beat length.
    this.setState({nextBeatTime: this.state.nextBeatTime + secondsPerBeat}) // Add beat length to last beat time

    this.setState({currentNote: this.state.currentNote + 1})
    if (this.state.currentNote % this.state.beatPerMeasure === 0) {
      this.setState({currentNote: 0})
    }
  }

  playNote = (frequency, volume, time) => {
    const osc = this.audioContext.createOscillator()
    const envelope = this.audioContext.createGain()
    osc.frequency.value = frequency
    envelope.gain.value = volume
    envelope.gain.exponentialRampToValueAtTime(volume, time + 0.001)
    envelope.gain.exponentialRampToValueAtTime(0.001, time + 0.02)
    osc.connect(envelope)
    envelope.connect(this.audioContext.destination)
    osc.start(time)
    osc.stop(time + 0.03)
  }

  scheduleNote = (time) => {
    const frequency = (this.state.currentNote % (this.state.beatPerMeasure) === 0) ? 1000 : 800 // 1000 frequency at the first beat per measure !
    let volume = 1
    this.playNote(frequency, volume, time)
    
    if (this.state.beatPerTime > 1) {
      let timeSubBeat = time
      for (let beat=1; beat < this.state.beatPerTime; beat++) {
        var secondsPerSubBeat = 60.0 / this.state.BPM / this.state.beatPerTime
        timeSubBeat += secondsPerSubBeat
        const frequencySubBeat = 800
        const volumeSubBeat = 0.3
        this.playNote(frequencySubBeat, volumeSubBeat, timeSubBeat)
      }
    }

  }

  scheduler = () => {
    // while there are notes that will need to play before the next interval, schedule them and advance the pointer.
    while (this.state.nextBeatTime < this.audioContext.currentTime + this.state.scheduleAheadTime) {
      this.scheduleNote(this.state.nextBeatTime)
      this.nextNote()
    }
  }

  startStop = () => {
    if (this.state.isPlaying) {
      this.setState({isPlaying: false})
      clearInterval(this.intervalID)
    }
    else {  // START
      this.startAudioCtx()
      this.setState({
        isPlaying: true,
        currentNote:  0,
        nextBeatTime: this.audioContext.currentTime + 0.05
      })
  
      this.intervalID = setInterval(() => this.scheduler(), this.state.lookahead)
    }
  }

  onChangeBpmButton = (action) => {
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

  onChangeBeatPerMeasure = (newBeatPerMeasure) => {
    this.setState({beatPerMeasure: newBeatPerMeasure})
  }

  onChangeBeatPerTime = (newBeatPerTime) => {
    this.setState({beatPerTime: newBeatPerTime})
  }

  setTapTempo = () => {
    this.startAudioCtx()  // Because audio context needs to be created or resumed on user action
    if (this.tapTempo === undefined) {
      this.tapTempo = this.audioContext.currentTime
    } else {
      console.log(this.tapTempo)
      let currentTime = this.audioContext.currentTime
      let newBPM = Math.round(60.0 / (currentTime - this.tapTempo))
      if (newBPM >= this.state.minBpmValue && newBPM <= this.state.maxBpmValue) {
        this.tapTempo = currentTime
        this.setState({BPM: newBPM})
      } else {
        this.tapTempo = undefined
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
          <div style={{fontSize: '12px', marginLeft: '5px'}}>BEATS PER MEASURE</div>

          <IconButton style={{marginLeft: 'auto', marginRight: '20px'}} size="small" aria-label="tap-tempo" onClick={this.setTapTempo}>
            <CircleIcon fontSize="large"/>
          </IconButton>
        </div>

        <div style={{display: 'flex', alignItems: 'center'}}>
          <NumberSelector defaultNumber={this.state.beatPerTime} numbersArray={Array.from({length: 8}, (_, i) => i + 1)} onChange={(value) => {this.onChangeBeatPerTime(value)}}/>
          <div style={{fontSize: '12px', marginLeft: '5px'}}>BEATS PER TIME</div>

          <IconButton style={{marginLeft: 'auto', marginRight: '20px'}} size="small" aria-label="play-metronome" onClick={this.startStop}>
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
