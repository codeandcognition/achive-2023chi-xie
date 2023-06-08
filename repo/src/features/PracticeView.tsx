import React, { useState, useEffect } from 'react'
import { Button, Box, Typography, Link } from '@mui/material'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import { useFirebase, useFirebaseConnect } from 'react-redux-firebase'

import ReplayControls from './codeReplayer/ReplayControls'
import CodeEditor from './codeEditor/CodeEditor'
import ResultsViewer from './results/ResultsViewer'
import ItemPrompt from './items/ItemPrompt'
import {
  resetCode,
  selectCurrentCode,
  selectStarterCode,
  updateCode,
  updateStarterCodeAndReset
} from './codeEditor/codeEditorSlice'
import { useAppSelector, useAppDispatch } from '../app/hooks'
import { setAllItems } from './items/itemsSlice'
import { setResults, clearResults } from './results/resultsSlice'
import { updateLog } from './logger/loggerSlice'
import { getIsoTime } from '../utils/helperFunctions'
import { LogEventValues } from './logger/loggerConstants'
import { selectActiveItem, selectItemBacklog } from './items/itemsSlice'
import { ResultsResponse } from './results/resultsConstants'
import { getKslPath, COLLECTION_ITEMS, getItemStatusPath, COLLECTION_ITEM_STATUSES, COLLECTION_REFLECTION_PROMPTS } from '../utils/dbPaths'
import { apiUrl } from '../config'
import { PracticeItem, ReflectionItem } from '../constants/dbSchemas'
import ReflectionPromptLister from './reflectionPrompt/reflectionPromptLister'
import { selectIfItemPassed, selectIfItemWasAttempted, setAttempted, setCurrentItemId, setPassed, updateAttemptNumber, updateItemStatusCurrentCode } from './progress/itemStatusSlice'
import { setCompletedPS1, setCompletedPS2, setCompletedPS3 } from './progress/milestoneSlice'
const PracticeView: React.FC = () => {
  // sync collection from firebase to redux
  useFirebaseConnect({
    path: COLLECTION_ITEMS // practice items
  })

  useFirebaseConnect({
    path: COLLECTION_ITEM_STATUSES
  })

  // extended firebase instance
  const firebase = useFirebase()

  // get auth from firebase slice of redux state
  const uid = useAppSelector(({ firebase }) => firebase.auth.uid)

  // typescript friendly redux dispatch
  const dispatch = useAppDispatch()

  // default code in item prompt
  const starterCode = useAppSelector(selectStarterCode)

  // current code in editor
  const currentCode = useAppSelector(selectCurrentCode)

  // item that is currently being shown
  const allItems = useAppSelector(state => state.firebase.data.problems)

  const activeItem = useAppSelector(selectActiveItem)
  const currentProblemSet = useAppSelector(state => state.problemSets.activeProblemSet)
  
  const practiceItems = useAppSelector(state => state.firebase.data.practice)

  // users' progress on problems (attempted, number of attempts, if all tests passed)
  const itemStatuses = useAppSelector(state => state.firebase.data.item_status)

  // backlog of visited items
  const itemBacklog = useAppSelector(selectItemBacklog)

  // whether runtime is loaded
  const [loaded, setLoaded] = useState<boolean>(false)

  // what is currently rendered to console (not always program output)
  const [output, setOutput] = useState<string>('')

  // which attempt student is on (starting at 1, increments each time code run)
  const [attemptNum, setAttemptNum] = useState<number>(1)

  // if true, on code replay. if false, editing code
  const [isReplayMode, setIsReplayMode] = useState<boolean>(false)

  let PROBLEM_SET_INDEX = 0
  if (currentProblemSet === "PS1") {
    PROBLEM_SET_INDEX = 0
  } else if (currentProblemSet === "PS2") {
    PROBLEM_SET_INDEX = 1
  } else if (currentProblemSet === "PS3") {
    PROBLEM_SET_INDEX = 2
  }

  const itemPassed = useAppSelector(selectIfItemPassed)
  const itemAttempted = useAppSelector(selectIfItemWasAttempted)
  
  const [itemWasAttempted, setItemWasAttempted] = useState<boolean>(itemAttempted)

  const reflectionItems = useAppSelector(state => state.firebase.data.reflection)

  const blankReflectionPrompt: ReflectionItem = {
    createdAt: "",
    name: "",
    prompt: "",
    problem_set: ""
  }

  const [reflectionPrompts, setReflectionPrompts] = useState<ReflectionItem[]>([blankReflectionPrompt])

  useEffect(() => {
    // TODO: replace with firebase
    // load items to redux
    dispatch(setAllItems(allItems))

    // set loaded TODO: probably not necessary, can remove in overhaul/refactoring
    setLoaded(true)
  }, [dispatch])

  useEffect(() => {
    // if the itemBacklog contains at least two entries 
    // and the activeItem is not the item at the end of the log
    if (itemBacklog && itemBacklog.length >= 2 && itemBacklog[itemBacklog.length - 2] !== activeItem) {
      
      // log session end for previously selected item
      logSessionEnd(itemBacklog[itemBacklog.length - 2])
    }
  }, [activeItem])

  // when active item changes
  useEffect(() => {
    if (activeItem) {

      // TODO: revisit
      if (currentProblemSet && reflectionItems) {
          let filteredReflections = Object.values(reflectionItems).filter((item) => item.problem_set === currentProblemSet)
          setReflectionPrompts(filteredReflections)
      }

      dispatch(setCurrentItemId(activeItem.name))
      setItemWasAttempted(false)

      // same as above, but checks if item passed tests
      if (uid && itemStatuses) {
        if (currentProblemSet && itemStatuses[uid]) {
          if (itemStatuses[uid][currentProblemSet][activeItem.name]) {
            // if active item was attempted before in firebase, set attempted(true)
            if (itemStatuses[uid][currentProblemSet][activeItem.name].attempted){
              setItemWasAttempted(true)
              dispatch(setAttempted(true))
            } else {
              dispatch(setAttempted(false))
            }

            if(itemStatuses[uid][currentProblemSet][activeItem.name].passed){
              dispatch(setPassed(true))
            } else {
              dispatch(setPassed(false))
            }
          }
        }
      }

      // update attempt number if it exists from firebase
      if (uid && itemStatuses) {
        if (currentProblemSet && itemStatuses[uid]) {
          if (itemStatuses[uid][currentProblemSet][activeItem.name]) {
            if(itemStatuses[uid][currentProblemSet][activeItem.name].attempts !== 0){
              setAttemptNum(itemStatuses[uid][currentProblemSet][activeItem.name].attempts)
            } else {
              dispatch(updateAttemptNumber(0))
              setAttemptNum(1)
            }
          }
        }
      }
      // update current code from firebase
      if (uid && itemStatuses) {
        if (currentProblemSet && itemStatuses[uid]) {
          if (itemStatuses[uid][currentProblemSet][activeItem.name]) {
            if(itemStatuses[uid][currentProblemSet][activeItem.name].current_code){
              dispatch(updateItemStatusCurrentCode(itemStatuses[uid][currentProblemSet][activeItem.name].current_code))
            } else {
              dispatch(updateItemStatusCurrentCode(""))
            }
          }
        }
      }

      // back to edit
      setIsReplayMode(false)
    }
  }, [activeItem, itemStatuses])

  useFirebaseConnect({
    path: COLLECTION_REFLECTION_PROMPTS
  })

  // handle reset button click
  const reset = () => {
    // clear output message
    setOutput('')

    // reset code back to starter code
    dispatch(updateCode(starterCode))
    dispatch(resetCode())

    // setItemCode(starterCode)
    // dispatch(updateCode(starterCode))
    dispatch(updateStarterCodeAndReset(starterCode))

    // clear results
    dispatch(clearResults())

    // get time of action
    const [clientTime, clientTimezone] = getIsoTime()

    const newLogValue: LogEventValues = {
      EventType: 'File.Edit',
      EditType: 'Reset',
      ClientTimestamp: clientTime,
      ClientTimezone: clientTimezone,
      'X-Code': starterCode // resets to starterCode
    }

    // log reset code to redux
    dispatch(updateLog(newLogValue))
    dispatch(updateItemStatusCurrentCode(starterCode))


    // push to firebase
    firebase.push(getKslPath(uid, activeItem.name), newLogValue)
  }

  const start = () => {
    // communicate execution is second, wait a second, then execute
    setOutput('executing...')
    // timestamp is also response ID
    const timestamp = Date.now()

    // create JSON object to pass in as request body. JSON requires DOUBLE QUOTES
    const body = {
      "practiceItem": { // grabbing only necessary items to pass send data
        name: activeItem.name,
        argTypes: activeItem.argTypes,
        args: activeItem.args,
        testCases: activeItem.testCases
      },
      "timestamp": timestamp, // TODO: replace with firebase timestamp
      "code": currentCode
    }

    // setting up all request options
    const options: RequestInit = {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    }

    // increment attempt num
    firebase.update(getItemStatusPath(uid, currentProblemSet, activeItem.name), {attempts: attemptNum + 1})
    
    if (currentProblemSet && reflectionItems) {
      let filteredReflections = Object.values(reflectionItems).filter((item) => item.problem_set === currentProblemSet)
      setReflectionPrompts(filteredReflections)
    }

    setCurrentItemId(activeItem.name)

    const filteredArray: any[] = []
    Object.values(practiceItems).map((item, index: number) => {
      if (item.problem_set === currentProblemSet) {
        filteredArray.push(item)
      }
    })

    let count = 0
    Object.values(Object.values(itemStatuses[uid])[PROBLEM_SET_INDEX]).forEach((item: any) => {
      if (item.reflection_response === true) {
        count++
      }
    })

    if (count === filteredArray.length) {
      if (PROBLEM_SET_INDEX === 0) {
        dispatch(setCompletedPS1(true))
        setOutput("Congratulations, you have completed this problem set!")
      } else if (PROBLEM_SET_INDEX === 1) {
        dispatch(setCompletedPS2(true))
        setOutput("Congratulations, you have completed this problem set!")

      } else if (PROBLEM_SET_INDEX === 2) {
        dispatch(setCompletedPS3(true))
        setOutput("Congratulations, you have completed this problem set!")
      }
    }

    // async post request
    fetch(apiUrl, options)
      .then((response) => response.json())
      .then((data: ResultsResponse) => {
        // clear output message
        if (itemAttempted) {
          setOutput('Done executing. Please complete reflection below')
        } else {
          setOutput('Done executing. See results on right.')
        }

        // store results in redux
        dispatch(setResults(data))

        // get time of action
        const [clientTime, clientTimezone] = getIsoTime(new Date(timestamp))

        const output = data[timestamp]

        // only 1 test case could be sign of error thrown
        const firstTestCase = Object.values(output)[0]

        // correct if all test cases correct
        const isCorrect = Object.values(output).reduce((total, testCase) => total && testCase.correct, true)

        const newLogValue: LogEventValues = {
          EventType: 'Run.Program',
          ClientTimestamp: clientTime,
          ClientTimezone: clientTimezone,
          'X-Code': currentCode,
          'X-RunCorrect': isCorrect,
          'X-RunOutput': output,
          Attempt: attemptNum
        }

        // response includes error property if error thrown
        if (firstTestCase?.error) {
          newLogValue['X-RunError'] = firstTestCase.error
        }

        // log code submission to redux
        dispatch(updateLog(newLogValue))

        // log code submission to firebase
        firebase.push(getKslPath(uid, activeItem.name), newLogValue)

        //update attempt number in reducer
        dispatch(updateAttemptNumber(attemptNum))

        if (!isCorrect) {
          const newItemStatus = {
            problem_set: currentProblemSet,
            current_code: currentCode, //use current_code to store the currentCode and render past problems with it
          }
          firebase.update(getItemStatusPath(uid, currentProblemSet, activeItem.name), newItemStatus)
        }

        //if the number of attempts >= 5, or isCorrect:
        if (attemptNum >= 5 || isCorrect) {
          setItemWasAttempted(true)
          dispatch(setAttempted(true))
          setOutput('Done executing. Please complete reflection below')
          if (!isCorrect) {
            firebase.update(getItemStatusPath(uid, currentProblemSet, activeItem.name), {
              attempts: attemptNum,
              problem_set: currentProblemSet,
              current_code: currentCode,
              attempted: true
            })
          } else { // the case where the submitted attempt passed all tests
            dispatch(setPassed(true))
            firebase.update(getItemStatusPath(uid, currentProblemSet, activeItem.name), {
              attempts: attemptNum,
              problem_set: currentProblemSet,
              current_code: currentCode,
              attempted: true,
              passed: true
            })
          }
        }
      })
  }

  const setAndLogReplayMode = (replayModeAlignment: boolean=false) => {
    setIsReplayMode(replayModeAlignment)

    const [clientTime, clientTimezone] = getIsoTime()

    const replayLog: LogEventValues = {
      EventType: !isReplayMode ? "Replay.Start" : "Replay.End",
      ClientTimestamp: clientTime,
      ClientTimezone: clientTimezone,
    }

    dispatch(updateLog(replayLog))
    firebase.push(getKslPath(uid, activeItem.name), replayLog)
  }

  const sxOuter = {
    display: 'flex',
    width: '90vw',
    maxWidth: '1400px',
    margin: 1,
    padding: 1,
    // background color, color, and border color differ based on dark theme or not
    bgcolor: (theme: any) => (theme.palette.mode === 'dark' ? '#101010' : '#fff'),
    color: (theme: any) =>
      theme.palette.mode === 'dark' ? 'grey.300' : 'grey.800',
    borderColor: 'grey.800',

    // for testing, can remove later
    border: '1px solid',
    borderRadius: 2,

    // font size and weight
    fontSize: '0.875rem',
    fontWeight: '700',
  }

  const logSessionEnd = (item: PracticeItem) => {
    const [clientTime, clientTimezone] = getIsoTime()

    const endLogValue: LogEventValues = {
      EventType: 'Session.End',
      ClientTimestamp: clientTime,
      ClientTimezone: clientTimezone,
      'X-Code': currentCode
    }
    
    if (item && uid) {
      firebase.push(getKslPath(uid, item.name), endLogValue)
    }
  }

  return (
    <>
      <Box sx={{ flexDirection: 'column', ...sxOuter }}>
        <Box sx={{ fontSize: "1rem", fontWeight: "400", color: "black" }} >
          <ItemPrompt />
        </Box>
        <Box sx={{ display: 'flex', width: '50%', alignItems: 'center', paddingBottom: 1 }}>
          <ToggleButtonGroup
            disabled={activeItem.name === ''}
            color='primary'
            value={isReplayMode}
            exclusive
            onChange={(event: React.MouseEvent<HTMLElement>, newAlignment: boolean) => {
                if (!isReplayMode && activeItem.name !== '' || itemWasAttempted) {
                  logSessionEnd(activeItem)
                }
                setAndLogReplayMode(newAlignment)
              }
            }
          >
            <ToggleButton value={false}>edit</ToggleButton>
            {currentProblemSet ==="PS2" && itemWasAttempted? //only problem set 2 gets the replay mode
              <ToggleButton value={true}>replay</ToggleButton> :
              ""
            }
          </ToggleButtonGroup>
        </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-evenly' }}>

            <Box sx={{ display: 'flex', width: '50%', flexDirection: 'column', paddingRight: 1 }}>
              <Box>
                <CodeEditor
                  codeSubmission={currentCode}
                  starterCode={starterCode}
                  readOnly={(isReplayMode || activeItem.name === '')  || itemWasAttempted}
                  isReplayMode={isReplayMode}
                  fullReplay={false}
                />
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', paddingTop: 1, paddingBottom: 1 }}>
                {isReplayMode
                  ?
                  <ReplayControls />
                  :
                  <>
                    <Button
                      disabled={activeItem.name === '' || itemWasAttempted}
                      variant='outlined'
                      onClick={reset}
                    >
                      reset
                    </Button>
                    <Button
                      disabled={activeItem.name === '' || itemWasAttempted}
                      variant='contained'
                      onClick={start}
                    >
                      run code
                    </Button>
                  </>
                }
              </Box>
              <Box>
                <Typography paragraph>
                  {output}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ width: '50%', paddingLeft: 1 }}>
              <ResultsViewer />
            </Box>
          </Box>
        <Box>
          {/* was resolving merge conflicts and wasn't sure if we needed this
            {itemPassed || itemAttempted ?
            <ReflectionPromptLister
              readOnly={false} /**change to true if reflection completed */
            // /> : <></>
          }
          {(itemPassed || itemWasAttempted) ? 
            <ReflectionPromptLister items={reflectionPrompts} />
            :
            <></>
          }
        </Box>
      </Box>
    </>
  )
}

// wrap in higher order component that provides firebase and dispatch as props
export default PracticeView
