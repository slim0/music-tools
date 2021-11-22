import React, { useState } from 'react'
import IconButton from '@mui/material/IconButton'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
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
      <IconButton className="button-controller increase-button" size="small" aria-label="increase" onClick={() => setNumberUp()}>
        <KeyboardArrowUpIcon fontSize="small"/>
      </IconButton>

      <div className="number">{currentNumber}</div>

      <IconButton className="button-controller decrease-button" size="small" aria-label="decrease" onClick={() => setNumberDown()}>
        <KeyboardArrowDownIcon fontSize="small"/>
      </IconButton>
    </div>
  )
}

export default NumberSelector
