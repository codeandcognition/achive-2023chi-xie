import React, { useEffect, useState } from 'react'
import {
  Box,
  Button,
  InputLabel,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Typography
} from '@mui/material'
import { useFirebase, useFirebaseConnect } from 'react-redux-firebase'
import { useAppDispatch, useAppSelector } from '../../app/hooks'

import { COLLECTION_REFLECTIONS, COLLECTION_REFLECTION_PROMPTS, getReflectionResponsePath } from '../../utils/dbPaths'
import { ReflectionItem, ReflectionResponse } from '../../constants/dbSchemas'
import { selectActiveItemId, setActiveItemId } from '../items/itemsSlice'
import _ from 'lodash'
import { getIsoTime } from '../../utils/helperFunctions'

import { selectActiveItem} from '../items/itemsSlice'
import { aceChangeEventToLogEvent } from '../codeEditor/codeHelpers'
import { selectReflectionCompleted, setReflectionCompleted } from '../progress/itemStatusSlice'


interface reflectionIndividualPromptProps {
    item: ReflectionItem,
    readOnly: boolean
}

const BLANK_TEXT = ""
const sxContainer = {
  my: 1,
  minWidth: '200px'
}

const MIN_RESPONSE_LENGTH = 10

const ReflectionIndividualPrompt = ({ item, readOnly }: reflectionIndividualPromptProps) => {
    const firebase = useFirebase()
    //sync collection from firebase to reduct
    useFirebaseConnect({
        path: COLLECTION_REFLECTION_PROMPTS
    })

    useFirebaseConnect({
      path: COLLECTION_REFLECTIONS
    })
    const dispatch = useAppDispatch()

    const [errorMessage, setErrorMessage] = useState("")
    
    const [response, setResponse] = useState(BLANK_TEXT)
    const [clientTime, clientTimezone] = getIsoTime()

    const [output, setOutput] = useState<string>('')

    const activeItem = useAppSelector(selectActiveItem)
    const activeItemId = useAppSelector(selectActiveItemId)

    const uid = useAppSelector(({ firebase }) => firebase.auth.uid)

    const currentProblemSet = useAppSelector(state => state.problemSets.activeProblemSet)
   
    const reflectionResponses = useAppSelector(state => state.firebase.data.reflection_response)

    let PROBLEM_SET_INDEX = 0
    if (currentProblemSet === "PS1") {
      PROBLEM_SET_INDEX = 0
    } else if (currentProblemSet === "PS2") {
      PROBLEM_SET_INDEX = 1
    } else if (currentProblemSet === "PS3") {
      PROBLEM_SET_INDEX = 2
    }
    
    // onload, set client response box to what is in firebase
    // also i'm sorry
    const onLoad = () => {
      if (reflectionResponses && uid) {
        if ((reflectionResponses[uid])){
          if (Object.values(reflectionResponses[uid])[PROBLEM_SET_INDEX][activeItem.name]) {
            if (Object.values(reflectionResponses[uid])[PROBLEM_SET_INDEX][activeItem.name][item.name]) {
              if (Object.values(reflectionResponses[uid])[PROBLEM_SET_INDEX][activeItem.name][item.name].response) {
                let currentItemReflection = Object.values(reflectionResponses[uid])[PROBLEM_SET_INDEX][activeItem.name][item.name].response
                return setResponse(currentItemReflection)
              } else {
                return setResponse(BLANK_TEXT)
              }
            }
          }
        }
      }
    }

    // the following two useEffect hooks are for form validation
    useEffect(() => {
      // Set errorMessage only if text is lest than MIN_RESPONSE_LENGTH
      if (response.length >= MIN_RESPONSE_LENGTH) {
        setErrorMessage("")
      }
    }, [response]);
  
    useEffect(() => {
      // and errorMessage is not empty.
      // avoids setting empty errorMessage if the errorMessage is already empty
      if (response.length < MIN_RESPONSE_LENGTH && errorMessage) {
        setErrorMessage("Please enter at least 10 characters");
      }
    }, [response, errorMessage])

    // when active item changes
    useEffect(() => {
      if (reflectionResponses && uid && activeItem.name && currentProblemSet && reflectionResponses[uid]) {
        if (reflectionResponses[uid][currentProblemSet] && reflectionResponses[uid][currentProblemSet][activeItem.name] && reflectionResponses[uid][currentProblemSet][activeItem.name][item.name]) {
          let currentItemReflection = Object.values(reflectionResponses[uid])[PROBLEM_SET_INDEX][activeItem.name][item.name].response
          setResponse(currentItemReflection)
        } else {
          setResponse(BLANK_TEXT)
        }
      }
    }, [activeItem, dispatch, reflectionResponses])

    const handleResponseChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setResponse(event.target.value)
      const reflectionResponse: ReflectionResponse = {
          createdAt: clientTime,
          name: item.name,
          prompt: item.prompt,
          timezone: clientTimezone,
          response: event.target.value
      }
      firebase.set(getReflectionResponsePath(uid, activeItem.problem_set, activeItemId, reflectionResponse.name), reflectionResponse)
    }

    return (
      <Box sx={{ minWidth: 120 }}>
          <Typography variant='h5'>{item.prompt}</Typography>
          <TextField 
            id='reflection-response'
            label='Response to reflection prompt' 
            value={response} 
            onChange={handleResponseChange}
            error={response.length < MIN_RESPONSE_LENGTH}
            sx={sxContainer} 
            multiline rows={4}
            fullWidth onLoad={onLoad}
            disabled={readOnly}
          />
          <Typography paragraph>
            {output}
          </Typography>
      </Box >
    )
}

export default ReflectionIndividualPrompt