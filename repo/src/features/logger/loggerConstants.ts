export type EventTypeOptions = 'Session.Start' | 'Session.End' | 'File.Edit' | 'Run.Program' | 'X-Focus' | 'X-Blur' | 'Replay.Start' | 'Replay.End' | 'NONE'

export interface LogEventValues {
  EventType: EventTypeOptions
  ClientTimestamp: string,
  ClientTimezone?: string,
  ServerTimestamp?: string,
  ServerTimezone?: string,
  CodeStateID?: string,
  Order?: number,
  Attempt?: number,
  EditType?: 'Insert' | 'Delete' | 'Replace' | 'Move' | 'Paste' | 'Undo' | 'Redo' | 'Reset',
  'X-IndexStart'?: number,
  'X-IndexEnd'?: number,
  'X-Keystroke'?: string,
  'X-RunOutput'?: Object,
  'X-RunCorrect'?: boolean,
  'X-RunError'?: string,
  'X-RunUserTerminated'?: boolean,
  'CourseID'?: string,
  'ExperimentalCondition'?: any,
  'X-Code'?: string // temporary until CodeStateID created
}

// logs for given user and item
export interface LogInterface {
  [index: string]: LogEventValues
}


// used to detect no log present
export const EMPTY_LOG_KEY = 'EMPTY'

export const emptyLog:LogInterface = {
  [EMPTY_LOG_KEY]: {
    EventType: 'NONE',
    ClientTimestamp: '-1'
  }

}