import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '../../app/store'
import { ItemStatus } from '../../constants/dbSchemas'

export interface ItemStatusesState {
    currentItemId: string,
    currentItemStatus: ItemStatus
}

const emptyItemStatus: ItemStatus = {
    attempted: false,
    passed: false,
    attempts: 0,
    problem_set: '',
    current_code: '',
    reflection_completed: false
}

const initialState: ItemStatusesState = {
    currentItemId: '',
    currentItemStatus: emptyItemStatus
}

/**
 * Redux state to store item status
 */
export const itemStatusesSlice = createSlice({
    name: 'itemStatuses',
    initialState,
    reducers: {
        setCurrentItemId: (state, action: PayloadAction<string>) => {
            state.currentItemId = action.payload
        },
        updateStatus: (state, action: PayloadAction<ItemStatus>) => {
            state.currentItemStatus = action.payload
        },
        updateAttemptNumber: (state, action: PayloadAction<number>) => {
            state.currentItemStatus.attempts = action.payload
        },
        updateItemStatusCurrentCode: (state, action: PayloadAction<string>) => {
            state.currentItemStatus.current_code = action.payload
        },
        setAttempted: (state, action: PayloadAction<boolean>) => {
            state.currentItemStatus.attempted = action.payload
        },
        setPassed: (state, action: PayloadAction<boolean>) => {
            state.currentItemStatus.passed = action.payload
        },
        setProblemSet: (state, action: PayloadAction<string>) => {
            state.currentItemStatus.problem_set = action.payload
        },
        setReflectionCompleted: (state, action: PayloadAction<boolean>) => {
            state.currentItemStatus.reflection_completed = action.payload
        }
        
    }
})

export const { setCurrentItemId, updateStatus, updateAttemptNumber, updateItemStatusCurrentCode,
setAttempted, setPassed, setProblemSet, setReflectionCompleted } = itemStatusesSlice.actions

export const selectCurrentAttemptNumber = (state: RootState) => state.itemStatuses.currentItemStatus.attempts

export const selectCurrentItemId = (state: RootState) => state.itemStatuses.currentItemId

export const selectItemStatus = (state: RootState) => state.itemStatuses.currentItemStatus

export const selectItemStatusCurrentCode = (state: RootState) => state.itemStatuses.currentItemStatus.current_code

export const selectIfItemWasAttempted = (state: RootState) => state.itemStatuses.currentItemStatus.attempted

export const selectIfItemPassed = (state: RootState) => state.itemStatuses.currentItemStatus.passed

export const selectItemProblemSet = (state: RootState) => state.itemStatuses.currentItemStatus.problem_set

export const selectReflectionCompleted = (state: RootState) => state.itemStatuses.currentItemStatus.reflection_completed

export default itemStatusesSlice.reducer
