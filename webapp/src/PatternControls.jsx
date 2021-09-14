import React from 'react';
import * as Patterns from './Patterns'

let PatternControls = props => {
    const currentPattern = Patterns.getPatternById(props.pattern)
    const name = currentPattern ? currentPattern.name : props.pattern

    const navButtonClass = 'btn btn-secondary' + (props.mode === 'single' ? '' : 'disabled')

    const previousPattern = () => {
        const previous = Patterns.previousPattern(props.pattern)
        props.onSwitchPattern(previous.id)
    }

    const nextPattern = () => {
        const next = Patterns.nextPattern(props.pattern)
        props.onSwitchPattern(next.id)
    }

    return (
        <div style={{minHeight: props.height + 'px'}} className='container-fluid'>
            <div className='row'>
                <div class='col-lg-4 d-none d-sm-block'></div>
                <div class='col-lg col' style={{textAlign: 'center'}}>
                    <button type='button' className={navButtonClass} onClick={previousPattern}>&lt;</button>
                </div>
                <div class='col-lg-2 col-2' style={{textAlign: 'center'}}>
                    <div>{name}</div>
                </div>
                <div class='col-lg col' style={{textAlign: 'center'}}>
                    <button type='button' className={navButtonClass} onClick={nextPattern}>&gt;</button>
                </div>
                <div class='col-lg-3 d-none d-sm-block'></div>
                <div className='col-lg col'>
                    <button type='button' className='btn btn-secondary' onClick={props.onSwitchLedMode}>{props.mode}</button>
                </div>
            </div>
        </div>
    )
}

export default PatternControls
