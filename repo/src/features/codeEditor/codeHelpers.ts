import _ from 'lodash'
import { NewLineKind } from 'typescript'
import { ItemStatus } from '../../constants/dbSchemas'
import { LogEventValues } from '../logger/loggerConstants'

// ace event actions
const INSERT = 'insert'
const REMOVE = 'remove'
const NEWLINE = '\n'

// structure of 2D start and end locations that Ace uses
interface AceLocation {
  column: number,
  row: number
}

// structure of Ace onChange event
interface AceOnChangeEvent {
  action: 'insert' | 'remove', // can't pass in variables into interface?
  end: AceLocation,
  lines: Array<string>,
  start: AceLocation
}

export const generateStarterCode = (funcName: string, params: Array<string>) => {
  const paramsStr = params.join(', ')
  return `def ${funcName}(${paramsStr}):\n  `
}

/**
 * Convert ace event into event to log event
 * @param {string} newValue value in editor after change event
 * @param {AceOnChangeEvent} event 
 * @param {string} clientTime time in ISO format
 * @param {string} clientTimezone timezone in ISO format
 * @returns {LogEventValues} ace event as keystroke log
 */
export const aceChangeEventToLogEvent = (newValue: string, event: AceOnChangeEvent, clientTime: string, clientTimezone: string): LogEventValues => {
  // merge all lines as string
  const content = _.join(event.lines, NEWLINE)
  const indexStart = aceLocationToIndex(newValue, event.start)

  return {
    EventType: 'File.Edit',
    EditType: event.action === INSERT ? 'Insert' : 'Delete', // to be compliant with ProgSnap2
    'X-IndexStart': indexStart,
    'X-IndexEnd': indexStart + content.length,
    'X-Keystroke': content,
    ClientTimestamp: clientTime,
    ClientTimezone: clientTimezone
  }
}

/**
 * convert item status event into log event into firebaes
 * @param newAttempt Number of attempts
 * @param attempted If the item was attempted
 * @param passed If the item's tests passed
 * @param problem_set What problem set this item is
 * @param code The code currently typed in the editor
 * @returns {ItemStatus} event as an ItemStatus log in Firebase
 */
export const itemStatusChangeEvent = (newAttempt: number, attempted: boolean, passed: boolean, problem_set: string, code: string, reflectionCheck: boolean): ItemStatus => {
  return {
    attempted: attempted,
    passed: passed,
    attempts: newAttempt,
    problem_set: problem_set,
    current_code: code,
    reflection_completed: reflectionCheck
  }
}

/**
 * Given an ace location, return int that is 0-based index of location.
 * Converts newlines to '\n'
 * @param {string} val value of string
 * @param {AceLocation} loc row and column numbers of index
 */
const aceLocationToIndex = (val: string, loc: AceLocation) => {
  const row = loc.row // row num
  const col = loc.column // col num

  // split val by lines
  const lines = val.split(NEWLINE)

  // get previous lines [0-row)
  const prevLines = _.slice(lines, 0, row)

  // get length of all lines previous lines
  const prevLinesLen = prevLines.reduce((total, line) => { return total + line.length }, 0)

  // index = length of previous lines + NEWLINE_LEN * num of lines + loc.col
  const index = prevLinesLen + NEWLINE.length * row + col

  return index

}