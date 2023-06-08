import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '../../app/store'
import { ReflectionItem } from '../../constants/dbSchemas'



export interface ReflectionsState {
    activeItemId: string,
    activeItem: ReflectionItem
}

const emptyReflectionItem: ReflectionItem = {
    name: '',
    createdAt: '',
    prompt: '',
    problem_set: ''
}

const initialState: ReflectionsState = {
    activeItemId: '',
    activeItem: emptyReflectionItem
}


/**
 * Redux state for active reflection item
 */

export const reflectionsSlice = createSlice({
    name: 'reflections',
    initialState,
    reducers: {
        setActiveItemId: (state, action: PayloadAction<string>) => {
            state.activeItemId = action.payload
        },

        setActiveItem: (state, action: PayloadAction<ReflectionItem>) => {
            state.activeItem = action.payload
        }
    }
})

export const { setActiveItemId, setActiveItem } = reflectionsSlice.actions

export const selectActiveItemId = (state: RootState) => state.reflections.activeItemId

export const selectActiveItem = (state: RootState) => state.reflections.activeItem

export default reflectionsSlice.reducer