import * as actionTypes from '../actions/actionTypes'

const initState = {
    videoRef: null
}

const videoRefReducer = (state = initState, action) => {
        switch (action.type) {
            case actionTypes.CHANGE_VIDEOREF:
                return{
                    ...state,
                    videoRef: action.payload
                }
        
            default:
                break;
        }
}

export default videoRefReducer