import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '../../app/store'
import { DUMMY_TIMESTAMP, ResultsResponse } from './resultsConstants'

const dummyResponse: ResultsResponse = {
  [DUMMY_TIMESTAMP]: {}
}

export interface ResultsState {
  results: ResultsResponse
}

const initialState: ResultsState = {
  results: dummyResponse
}

export const resultsSlice = createSlice({
  name: 'result',
  initialState,
  reducers: {

    // set results after code is run
    setResults: (state, action: PayloadAction<ResultsResponse>) => {
      state.results = action.payload
    },

    // set results back to initial state
    clearResults: (state) => {
      state.results = initialState.results
    }
  }
})

export const { setResults, clearResults } = resultsSlice.actions

// get results
export const selectResults = (state: RootState) => state.results.results

export default resultsSlice.reducer