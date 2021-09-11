import React from 'react';
import { HuePicker  } from 'react-color';

import './styles.css';

let EditControls = props => {
    return (
        <div style={{minHeight: props.height + 'px'}} className='container-fluid'>
            <div className='row'>
                <div className='col' style={{textAlign: 'center'}}>
                    { (props.mode == 'manual' && !props.editMode) && <HuePicker color={props.manualColor} onChangeComplete={props.onColorChangeComplete} /> }
                </div>
            </div>
            <div className='row'>
                <div class='col-lg-11 col-7' style={{textAlign: 'right'}}>
                    { (props.editMode) && <span>Click to add or remove tiles</span> }
                </div>
                <div class='col-lg col' style={{textAlign: 'right'}}>
                    { (!props.editMode) && <button type='button' className='btn btn-secondary' onClick={() => props.setEditMode(true)}>Edit</button> }
                    { (props.editMode) && <button type='button' className='btn btn-primary' onClick={() => props.setEditMode(false)}>X</button> }
                </div>
            </div>
        </div>
    )
}

export default EditControls
