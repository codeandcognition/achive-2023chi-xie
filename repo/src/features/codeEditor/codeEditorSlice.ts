import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '../../app/store'

export interface CodeEditorState {
  starterCode: string
  currentCode: string
}

const initialState: CodeEditorState = {
  starterCode: '', // default code in item prompt
  currentCode: '' // current code in editor
}

export const codeEditorSlice = createSlice({
  name: 'codeEditor',
  initialState,
  reducers: {

    // update currentCode based on new actions
    updateCode: (state, action: PayloadAction<string>) => {
      state.currentCode = action.payload
    },

    // update started code and reset current code to it
    updateStarterCodeAndReset: (state, action: PayloadAction<string>) => {
      state.starterCode = action.payload
      state.currentCode = action.payload
    },

    // reset currentCode back to starterCode
    resetCode: (state) => {
      state.currentCode = state.starterCode
    }
  }
})

export const { updateCode, updateStarterCodeAndReset, resetCode } = codeEditorSlice.actions

// selector for starterCode
export const selectStarterCode = (state: RootState) => state.codeEditor.starterCode

// selector for currentCode
export const selectCurrentCode = (state: RootState) => state.codeEditor.currentCode


export default codeEditorSlice.reducer