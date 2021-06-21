import * as actionTypes from '../actions/actionTypes'

// This is to send the videoRef to the store
export const changeVideoRef = (videoRef) => {
    return{
        type: actionTypes.CHANGE_VIDEOREF,
        payload: videoRef
    }
}