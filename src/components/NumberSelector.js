import React, { useState } from 'react'
import IconButton from '@mui/material/IconButton'
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import PropTypes from 'prop-types';

import './NumberSelector.scss'


NumberSelector.propTypes = {
  defaultNumber: PropTypes.number.isRequired,
  numbersArray: PropTypes.arrayOf(PropTypes.number),
}

function NumberSelector(props) {

  const [currentNumber, setCurrentNumber] = useState(props.defaultNumber)
  const [numbersArray] = useState(props.numbersArray)

  function setNumberUp() {
    let newNumber = currentNumber
    let currentNumberIndex = numbersArray.indexOf(currentNumber)
    currentNumberIndex++
    newNumber = numbersArray[currentNumberIndex]
    if (typeof newNumber === "undefined") {
      return
    }
    setCurrentNumber(newNumber)
    props.onChange(newNumber)
  }

  function setNumberDown() {
    let newNumber = currentNumber
    let currentNumberIndex = numbersArray.indexOf(currentNumber)
    currentNumberIndex--
    newNumber = numbersArray[currentNumberIndex]
    if (typeof newNumber === "undefined") {
      return
    }
    setCurrentNumber(newNumber)
    props.onChange(newNumber)
  }


  return (
    <div className="NumberSelector">
      <IconButton disableRipple={true} className="button-controller decrease-button" size="small" aria-label="decrease" onClick={() => setNumberDown()}>
        <KeyboardArrowLeftIcon fontSize="small"/>
      </IconButton>
      
      <div className="number">{currentNumber}</div>

      <IconButton disableRipple={true} className="button-controller increase-button" size="small" aria-label="increase" onClick={() => setNumberUp()}>
        <KeyboardArrowRightIcon fontSize="small"/>
      </IconButton>
    </div>
  )
}

export default NumberSelector
