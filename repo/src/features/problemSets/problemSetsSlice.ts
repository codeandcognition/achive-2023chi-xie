import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '../../app/store'
import { ReflectionItem } from '../../constants/dbSchemas'

interface ProblemSetItem {
    activeProblemSet: string
}

export interface ProblemSetsState {
    activeProblemSet: string
}

const initialState: ProblemSetsState = {
    activeProblemSet: ''
}

/**
 * Redux state for active problem set item
 */

export const problemSetSlice = createSlice({
    name: 'problemSet',
    initialState,
    reducers: {
        setProblemSet: (state, action: PayloadAction<string>) => {
            state.activeProblemSet = action.payload
        }
    }
})

export const { setProblemSet } = problemSetSlice.actions

export const selectProblemSet = (state: RootState) => state.problemSets.activeProblemSet

export default problemSetSlice.reducer