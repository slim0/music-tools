import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import Metronome  from './components/Metronome';
import Tuner from './components/Tuner'
import reportWebVitals from './reportWebVitals';
import EarTrainer from './components/EarTrainer';

ReactDOM.render(
  <React.StrictMode>
    <Metronome beatPerMeasure={4} beatPerTime={1}/>
    <Tuner></Tuner>
    <EarTrainer></EarTrainer>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
