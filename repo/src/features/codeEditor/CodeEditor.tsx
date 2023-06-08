import React, { useState, useEffect } from 'react'
import AceEditor from 'react-ace'
import { useFirebase, useFirebaseConnect } from 'react-redux-firebase'
import _ from 'lodash'
import 'ace-builds/src-noconflict/mode-python'
import 'ace-builds/src-noconflict/theme-monokai'

import { useAppDispatch, useAppSelector } from '../../app/hooks'
import {
  selectCurrentCode,
  updateCode,
  updateStarterCodeAndReset
} from './codeEditorSlice'
import { updateLog, selectLog, resetLog } from '../logger/loggerSlice'
import { emptyItem, selectActiveItem, selectActiveItemId } from '../items/itemsSlice'
import { generateStarterCode, aceChangeEventToLogEvent } from './codeHelpers'
import { getIsoTime } from '../../utils/helperFunctions'
import { COLLECTION_ITEM_STATUSES, getItemStatusPath, getKslPath } from '../../utils/dbPaths'
import { LogEventValues } from '../logger/loggerConstants'
import { ItemStatus } from '../../constants/dbSchemas'
import { selectCurrentAttemptNumber, setCurrentItemId, updateItemStatusCurrentCode } from '../progress/itemStatusSlice'

interface CodeEditorProps {
  starterCode: string,
  codeSubmission: string,
  readOnly: boolean,
  isReplayMode: boolean
  fullReplay: boolean
}

// TODO: replace this with the real interace?
interface AceEditorInterface {
  getSession: Function
}

const CodeEditor = ({ starterCode, codeSubmission, readOnly, isReplayMode, fullReplay }: CodeEditorProps) => {
  const dispatch = useAppDispatch()
  const activeItem = useAppSelector(selectActiveItem)
  const activeItemId = useAppSelector(selectActiveItemId)
  const firebase = useFirebase()
  
  const currentAttemptNum = useAppSelector(selectCurrentAttemptNumber)
  
  const practiceItems = useAppSelector(state => state.firebase.data.practice)

  // get auth from firebase slice of redux state
  const uid = useAppSelector(({ firebase }) => firebase.auth.uid)

  useFirebaseConnect({
    path: COLLECTION_ITEM_STATUSES
  })
  
  const itemStatuses = useAppSelector(state => state.firebase.data.item_status)
  const currentProblemSet = useAppSelector(state => state.problemSets.activeProblemSet)
  const currentCode = useAppSelector(selectCurrentCode)
  
  let PROBLEM_SET_INDEX = 0
  if (currentProblemSet === "PS1") {
    PROBLEM_SET_INDEX = 0
  }
  if (currentProblemSet === "PS2") {
    PROBLEM_SET_INDEX = 1
  }
  if (currentProblemSet === "PS3") {
    PROBLEM_SET_INDEX = 2
  }

  // when the problem set changes, revert editor to blank
  useEffect(() => {
    const starterCode = ''
    dispatch(updateCode(starterCode))
    dispatch(updateStarterCodeAndReset(starterCode))

  }, [practiceItems])

  // when active item changed
  useEffect(() => {
    if (!_.isNull(activeItem) && activeItem.name && activeItem.args) {
      // switch to boiler plate/starter code for new active item
      const starterCode = generateStarterCode(activeItem.name, activeItem.args)

      // update code
      dispatch(updateStarterCodeAndReset(starterCode))

      // clear logs (temporary until logs for different users, items, sessions ready)
      dispatch(resetLog())

      if (!fullReplay) {
        // get time of action
        const [clientTime, clientTimezone] = getIsoTime()

        const newLogValue: LogEventValues = {
          EventType: 'Session.Start',
          ClientTimestamp: clientTime,
          ClientTimezone: clientTimezone,
          'X-Code': starterCode
        }
        // log session start log
        dispatch(updateLog(newLogValue))

        // push data to firebase
        firebase.push(getKslPath(uid, activeItem.name), newLogValue)
      }
      
      // if this active item has an item status with current code length > starter code length,
      // change code submission to include current_code
      if (itemStatuses && uid && !isReplayMode) {
        if (itemStatuses[uid] !== undefined && Object.values(Object.values(itemStatuses[uid])[PROBLEM_SET_INDEX][activeItem.name])[2] as string > starterCode) {
          const itemCurrentCode = Object.values(Object.values(itemStatuses[uid])[PROBLEM_SET_INDEX][activeItem.name])[2] as string
          dispatch(updateStarterCodeAndReset(starterCode))
          dispatch(updateCode(itemCurrentCode))

        } else {
          dispatch(updateCode(starterCode))
          dispatch(updateStarterCodeAndReset(starterCode))
        }
      }
    }
  }, [activeItem, dispatch])

  const onLoad = (editor: AceEditorInterface) => {
    // let session = editor.getSession()
    // let undoManager = session.getUndoManager() // manages undo/redo
  }

  const onChange = (newValue: string, event: any) => {
    // get time of actions
    const [clientTime, clientTimezone] = getIsoTime()

    // data from ace (EventType, EditType, 'X-IndexStart', 'X-IndexEnd', 'X-Keystroke')
    let newLogValue = aceChangeEventToLogEvent(newValue, event, clientTime, clientTimezone)

    let newLogValueWithCode = {
      ...newLogValue,

      // don't need to keep long term, but good for debugging
      'X-Code': newValue 

    }

    // add new log with code snapshot
    dispatch(updateLog(newLogValueWithCode))

    // push data to firebase
    firebase.push(getKslPath(uid, activeItemId), newLogValueWithCode)


    // update code
    dispatch(updateCode(newValue))


    /**
     * If the current active item exists, push new log values to the item status object in the database
     */
    if (!isReplayMode) {
      if (Object.keys(Object.values(itemStatuses[uid])[PROBLEM_SET_INDEX]).includes(activeItem.name)) {
        if (Object.keys(Object.values(itemStatuses[uid])[PROBLEM_SET_INDEX][activeItem.name])) {
          dispatch(setCurrentItemId(activeItem.name))
          dispatch(updateItemStatusCurrentCode(newValue))        
          firebase.update(getItemStatusPath(uid, currentProblemSet, activeItem.name), {current_code: newValue})
        }
      }
    }
  }

  return (
    <AceEditor
      placeholder='write your Python code here'
      mode='python'
      theme='monokai'
      name='code editor'
      readOnly={readOnly}
      onLoad={onLoad}
      onChange={onChange}
      // onCopy={(text: string) => console.log(`copy: ${text}`)}
      // onPaste={(text: string) => console.log(`paste: ${text}`)}
      fontSize={14}
      showPrintMargin={true}
      showGutter={true}
      highlightActiveLine={true}
      width='100%'
      height='400px'
      minLines={5}
      value={currentCode}
      setOptions={{
        showLineNumbers: true,
        tabSize: 2
      }}
    />

  )

}

export default CodeEditor
