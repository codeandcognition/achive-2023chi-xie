import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '../../app/store'
import { Milestone } from '../../constants/dbSchemas'

export interface MilestoneState {
    currentMilestone: Milestone
}

const emptyMilestone: Milestone = {
    completedPreSurvey: false,
    completedPS1: false,
    completedVideo: false,
    completedPS2: false,
    completedDistractor: false,
    completedPS3: false
}

const initialState: MilestoneState = {
    currentMilestone: emptyMilestone
}

/**
 * Redux state to store item status
 */
export const milestoneSlice = createSlice({
    name: 'milestones',
    initialState,
    reducers: {
        setCompletedPreSurvey: (state, action: PayloadAction<boolean>) => {
            state.currentMilestone.completedPreSurvey = action.payload
        },
        setCompletedPS1: (state, action: PayloadAction<boolean>) => {
            state.currentMilestone.completedPS1 = action.payload
        },
        setCompletedPS2: (state, action: PayloadAction<boolean>) => {
            state.currentMilestone.completedPS2 = action.payload
        },
        setCompletedPS3: (state, action: PayloadAction<boolean>) => {
            state.currentMilestone.completedPS3 = action.payload
        },
        setCompletedVideo: (state, action: PayloadAction<boolean>) => {
            state.currentMilestone.completedVideo = action.payload
        },
        setCompletedDistractor: (state, action: PayloadAction<boolean>) => {
            state.currentMilestone.completedDistractor = action.payload
        }
    }
})

export const {setCompletedPreSurvey, setCompletedPS1, setCompletedPS2, 
    setCompletedPS3, setCompletedDistractor, 
    setCompletedVideo } = milestoneSlice.actions


export const getPreSurveyMilestone = (state: RootState) => state.milestones.currentMilestone.completedPreSurvey
export const getPS1Milestone = (state: RootState) => state.milestones.currentMilestone.completedPS1
export const getVideoMilestone = (state: RootState) => state.milestones.currentMilestone.completedVideo
export const getPS2Milestone = (state: RootState) => state.milestones.currentMilestone.completedPS2
export const getDistractorMilestone = (state: RootState) => state.milestones.currentMilestone.completedDistractor
export const getPS3Milestone = (state: RootState) => state.milestones.currentMilestone.completedPS3


export default milestoneSlice.reducer