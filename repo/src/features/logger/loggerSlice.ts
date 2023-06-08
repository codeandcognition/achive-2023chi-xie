import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '../../app/store'
import _ from 'lodash'
import { LogEventValues, LogInterface } from './loggerConstants'

export interface LoggerState {
  log: LogInterface
}

const initialState: LoggerState = {
  log: {}, // keystroke logs
}

export const loggerSlice = createSlice({
  name: 'logger',
  initialState,
  reducers: {

    // update currentCode based on new actions
    updateLog: (state, action: PayloadAction<LogEventValues>) => {
      // num of prior events is order (also used as EventID for now)
      const eventNum = Object.keys(state.log).length

      // add new event to state.log
      state.log = _.merge(state.log, { [eventNum]: { ...action.payload, Order: eventNum } })
    },

    // reset log
    resetLog: (state) => {
      state.log = {}
    }
  }
})

export const { updateLog, resetLog } = loggerSlice.actions

// selector for log
export const selectLog = (state: RootState) => state.logger.log

export default loggerSlice.reducer