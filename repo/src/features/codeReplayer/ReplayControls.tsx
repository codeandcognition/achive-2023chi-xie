import React, { useState, useEffect } from 'react'
import { Box } from '@mui/material'
import Typography from '@mui/material/Typography'
import Slider from '@mui/material/Slider'
import IconButton from '@mui/material/IconButton'
import PlayCircleIcon from '@mui/icons-material/PlayCircle'
import PauseCircleIcon from '@mui/icons-material/PauseCircle'
import SkipNextIcon from '@mui/icons-material/SkipNext'
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious'
import { useFirebase, useFirebaseConnect } from 'react-redux-firebase'
import _ from 'lodash'

import { useAppSelector, useAppDispatch } from '../../app/hooks'
import { LogInterface, emptyLog, EMPTY_LOG_KEY, LogEventValues } from '../logger/loggerConstants'
import { updateCode } from '../codeEditor/codeEditorSlice'
import { getClientTimestampTime, millisToMinutesAndSeconds, findLastIndex } from './replayHelpers'
import { selectActiveItemId } from '../items/itemsSlice'
import { getKslPath, COLLECTION_KSL } from '../../utils/dbPaths'
import { PinRounded } from '@mui/icons-material'
import { type } from '@testing-library/user-event/dist/type'

type ReplayControlsProps = { fullReplay?: boolean }

const ReplayControls: React.FC<ReplayControlsProps> = ({ fullReplay = false }: ReplayControlsProps) => {
  // typescript friendly redux dispatch
  const dispatch = useAppDispatch()

  // extended firebase instance
  const firebase = useFirebase()

  // get user id
  const uid = useAppSelector(({ firebase }) => firebase.auth.uid)

  // get active item id
  const activeItemId = useAppSelector(selectActiveItemId)

  // sync logs from firebase (for this user and item) into redux
  useFirebaseConnect(getKslPath(uid, activeItemId))

  // object with all logs
  // const log = useAppSelector(selectLog)

  // get ksl for given uid and item. path: firebase.data.ksl.[uid].[activeItemId]
  const log: LogInterface = useAppSelector(({ firebase: { data: { ksl } } }) => {
    if (ksl?.[uid] && ksl?.[uid]?.[activeItemId]) {
      return ksl[uid][activeItemId]
    } else {
      return emptyLog
    }
  })

  const getLogSlice = (logs: LogInterface) => {
    // if (!fullReplay) {
    //   // grab logs from last session.start to end
    //   let logValues = Object.values(logs)
    //   const lastIndex = findLastIndex(logValues, (log) => {
    //     return log.EventType == 'Session.Start'
    //   })
    //   return logValues.slice(lastIndex)
    // } else {
    //   // TODO: update below code to apply to all code replays
    //   let logValues = Object.values(logs)
    //   if (logs && Object.keys(logs).length > 1) {
    //     const lastIndex = findLastIndex(logValues, (log) => {
    //       return log.EventType == 'Run.Program'
    //     })
    //     return logValues.slice(0, lastIndex + 1)
    //   }
    //   return logValues
    // }

    let logValues = Object.values(logs)
    if (logs && Object.keys(logs).length > 1) {
      const lastIndex = findLastIndex(logValues, (log) => {
        return log.EventType == 'Run.Program'
      })
      return logValues.slice(0, lastIndex + 1)
    }
    return logValues
  }

  // empty log only has 1, so this is fast check to check if log exists
  // for more robust way: !Object.keys(log).includes(EMPTY_LOG_KEY)
  const logExists = Object.keys(log).length > 1

  // storing log as array to more easily get next and previous values
  const logValues = getLogSlice(log)

  // number of events logged (last event has index numLogEvents-1)
  const numLogEvents = logValues.length

  // time in MS of first log
  const [startTime, setStartTime] = useState<number>(Date.now())

  // if true, replay is playing
  const [playing, setPlaying] = useState<boolean>(false)

  // time elapsed in player, in MS (from 0 to duration inclusive)
  const [timeElapsed, setTimeElapsed] = useState<number>(0)

  /// time in MS denoting time between first and last logs
  const [duration, setDuration] = useState<number>(10000)

  // index of log Object.keys(log)[currentLogIndex] === id/key of currently shown log
  const [currentLogIndex, setCurrentLogIndex] = useState<number>(0)

  // const [marks, setMarks] = useState<Array<Object>>([{}])

  // update state when playing
  useEffect(() => {
    let interval: any = undefined

    // if replay is playing
    if (playing) {
      // update timeElapsed 
      interval = setInterval(() => {
        setTimeElapsed(prevTime => prevTime + 100)
      }, 100) // repeat every 100 ms
    } else if (!playing) {
      clearInterval(interval) // if no longer playing, stop increasing interval
    }

    return () => clearInterval(interval)
  }, [playing])

  // when log changes, figure out duration and log ID
  useEffect(() => {

    // if log not empty
    if (logValues) {
      // calculate duration between first and last log
      if (logValues.length > 0) {
        const timeFirstLog = new Date(logValues[0].ClientTimestamp) // Date for first log
        const timeLastLog = new Date(logValues[logValues.length - 1].ClientTimestamp) // Date for last log
        const duration = timeLastLog.getTime() - timeFirstLog.getTime() // difference in time (in ms)
        
        setDuration(duration) // update duration
        setStartTime(timeFirstLog.getTime()) // update start time
        
      }

      // setMarks(calculateMarks())

      // reset time elapsed
      setTimeElapsed(0)

      // reset replay back to first log
      setCurrentLogIndex(0)
    }
  }, [log])

  const calculateMarks = (logValues: LogEventValues[]) => {
    // for each log
    if (logValues.length === 0) {
      return false
    }

    const startTimeInMs = getClientTimestampTime(logValues[0])

    const marks = logValues.map((logEvent) => {
      // value is time relative to start (in ms)
      const value = getClientTimestampTime(logEvent) - startTimeInMs
      // label only if submit
      const label = logEvent.EventType === 'Run.Program' ? 'run' : ''

      return ({ value, label })
    })

    return marks
  }

  // when time changes, update logId
  useEffect(() => {
    // if reached end, stop
    if (timeElapsed >= duration) {
      setPlaying(false)
    }

    // player time is time player is currently at relative to first log (so between time of first and last log)
    const playerTime = startTime + timeElapsed

    // get all log IDs
    // const allLogIds = Object.keys(log)

    // const firstLogId = allLogIds?.[0]

    // const lastLogId = allLogIds?.[numLogEvents - 1]

    // if time < time of first log, set to first log ID
    if (playerTime <= getClientTimestampTime(logValues[0])) {
      setCurrentLogIndex(0)
    }

    // if time >= time of last log, set to last log ID
    else if (numLogEvents > 0 && playerTime >= getClientTimestampTime(logValues[numLogEvents - 1])) {
      setCurrentLogIndex(numLogEvents - 1)
    }

    // otherwise, find the log in the middle (from 0 to n-1 b/c checking next log)
    else {
      // need to do loop in chase of a click and drag
      for (let i = 0; i < numLogEvents - 1; i++) {
        // ASSUMING LOG ORDERED BY TIME, get ids of current and next log
        // calculate times for these logs (in ms)
        const currentLogTime = getClientTimestampTime(logValues[i])
        const nextLogTime = getClientTimestampTime(logValues[i+1])

        // if player time comes after currentLogTime but before nextLogTime, set log ID to current log ID
        if (playerTime >= currentLogTime && playerTime < nextLogTime) {
          setCurrentLogIndex(i)
          break // and we're doing
        }
      }
    }
  }, [timeElapsed, startTime, duration])

  // update code editor whenever logId changes
  useEffect(() => {
    if (logValues && logValues[currentLogIndex] && logValues[currentLogIndex]['X-Code']) {
      // TODO: add getUpdatedCode() log here b/c not all logs will have X-Code
      const newValue = logValues[currentLogIndex]['X-Code'] as string
      dispatch(updateCode(newValue))
    }
  }, [logValues, currentLogIndex, dispatch])

  const handlePlayPauseClick = () => {
    // toggle state
    setPlaying(!playing)
  }

  // when you click on slider, update value position (time)
  const handleSliderChange = (event: Event, newValue: number | number[]) => {
    setTimeElapsed(newValue as number)
  }

  const handleSkipForward = () => {
    // condition: if the current logId is not the last log in logs\
    if (currentLogIndex < numLogEvents - 1) {
      console.log("fast forwarded")
      setCurrentLogIndex(currentLogIndex + 1)
      setTimeElapsed(Date.parse(logValues[currentLogIndex].ClientTimestamp) - startTime)
    }
  }

  const handleSkipBackward = () => {
    // condition: if the current logId is not the first log in logs
    if (currentLogIndex > 0) {
      setCurrentLogIndex(currentLogIndex - 1)
      setTimeElapsed(Date.parse(logValues[currentLogIndex].ClientTimestamp) - startTime)
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      <Box sx={{ display: 'flex', flexDirection: 'row' }} pl='10px'>
        <Slider
          aria-label='Time'
          value={timeElapsed}
          onChange={handleSliderChange}
          max={duration}
          marks={calculateMarks(logValues)}
          sx={{ height: '10px' }}
        />
        <Box pl='5px' >
          <Typography aria-label='time-stamp' >
            {millisToMinutesAndSeconds(timeElapsed)} / {millisToMinutesAndSeconds(duration)}
          </Typography>
        </Box>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'row' }}>
        <IconButton aria-label='play' onClick={handlePlayPauseClick}>
          {playing ? <PauseCircleIcon /> : <PlayCircleIcon />}
        </IconButton>
        <IconButton aria-label='skip-backward' onClick={handleSkipBackward}>
          <SkipPreviousIcon />
        </IconButton>
        <IconButton aria-label='skip-forward' onClick={handleSkipForward}>
          <SkipNextIcon />
        </IconButton>
      </Box>
    </Box>
  )
}

export default ReplayControls