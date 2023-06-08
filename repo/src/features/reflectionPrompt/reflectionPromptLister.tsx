import React, { useEffect, useState } from 'react'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
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

import { COLLECTION_REFLECTION_PROMPTS, getItemStatusPath, getReflectionResponsePath } from '../../utils/dbPaths'
import { ItemStatus, ReflectionItem, ReflectionResponse } from '../../constants/dbSchemas'
import { selectActiveItemId, setActiveItemId } from '../items/itemsSlice'
import _ from 'lodash'
import { getIsoTime } from '../../utils/helperFunctions'

import { selectActiveItem} from '../items/itemsSlice'
import { aceChangeEventToLogEvent } from '../codeEditor/codeHelpers'
import ReflectionIndividualPrompt from './ReflectionIndividualPrompt'
import { setCompletedPS1, setCompletedPS2, setCompletedPS3 } from '../progress/milestoneSlice'
import { resolve } from 'path'
import { selectReflectionCompleted, setReflectionCompleted } from '../progress/itemStatusSlice'

const BLANK_TEXT = ""
const sxContainer = {
  my: 1,
  minWidth: '200px'
}

interface ReflectionPromptListerProps {
  items: ReflectionItem[]
}

/**
 * Accepts a list of reflection items and maps over each reflection item to return a JSX element
 * @param items the list of reflection items (has to be filtered first) 
 * @returns a JSX element of the reflection prompt
 */
const ReflectionPromptLister = ({ items }: ReflectionPromptListerProps ) => {
  const firebase = useFirebase()
  //sync collection from firebase to reduct
  useFirebaseConnect({
      path: COLLECTION_REFLECTION_PROMPTS
  })
  const dispatch = useAppDispatch()

  //uid to push to firebase
  const uid = useAppSelector(({ firebase }) => firebase.auth.uid)

  //get all reflection items
  const activeItem = useAppSelector(selectActiveItem)

  const currentProblemSet = useAppSelector(state => state.problemSets.activeProblemSet)
  
  const reflectionResponses = useAppSelector(state => state.firebase.data.reflection_response)

  const reflectionCompleted = useAppSelector(selectReflectionCompleted)
  const [itemReflectionResponse, setItemReflectionResponse] = useState<boolean>(reflectionCompleted)

  let PROBLEM_SET_INDEX = 0
  if (currentProblemSet === "PS1") {
    PROBLEM_SET_INDEX = 0
  } else if (currentProblemSet === "PS2") {
    PROBLEM_SET_INDEX = 1
  } else if (currentProblemSet === "PS3") {
    PROBLEM_SET_INDEX = 2
  }
  
  const practiceItems = useAppSelector(state => state.firebase.data.practice)
  const itemStatus = useAppSelector(state => state.firebase.data.item_status)


  // this is for the confirmation pop-up
  const [open, setOpen] = useState<boolean>(false)
  const handleClickOpen = () => {
    setOpen(true)
  }
  const handleClose = () => {
    setOpen(false)
  }

  // when active item changes, load if reflection response is complete
  useEffect(() => {
    setItemReflectionResponse(false)
    if (activeItem) {
      if (uid && itemStatus && currentProblemSet && itemStatus[uid] && itemStatus[uid][currentProblemSet][activeItem.name]) {
        if (itemStatus[uid][currentProblemSet][activeItem.name].reflection_completed) {
          setItemReflectionResponse(true)
        }
      }
    }
  }, [activeItem, itemStatus])

  const loadProblemSetProgression = (problemSet: string) => {
    let numProblems = 0
    if (practiceItems) {
      Object.values(practiceItems).map((item, index: number) => { 
        if (item.problem_set === problemSet) {
            numProblems++
        }
      })
    }


    // set problem set index
    let PROBLEM_SET_INDEX = 0
    if (problemSet === "PS1") {
      PROBLEM_SET_INDEX = 0
    } else if (problemSet === "PS2") {
      PROBLEM_SET_INDEX = 1
    } else if (problemSet === "PS3") {
      PROBLEM_SET_INDEX = 2
    }

    // check how many reflections have been completed among all items in the problem set, store in count
    let count = 0
    if (uid) {
      Object.values(Object.values(itemStatus[uid])[PROBLEM_SET_INDEX]).forEach((item: any) => {
        if (item.reflection_completed === true) {
          count++
        }
      })
    }

    // if all reflections have been completed, dispatch milestone update
    if (count === numProblems) {
      if (PROBLEM_SET_INDEX === 0) {
        return dispatch(setCompletedPS1(true))
      } else if (PROBLEM_SET_INDEX === 1) {
        return dispatch(setCompletedPS2(true))
      } else if (PROBLEM_SET_INDEX === 2) {
        return dispatch(setCompletedPS3(true))
      }
    }
  }
  
  // check if milestone needs to be updated every time itemStatus changes
  useEffect(() => {
    loadProblemSetProgression(currentProblemSet)
  }, [itemStatus, reflectionResponses])
  
  const handleSubmit = () => {
    if (uid && activeItem.name && reflectionResponses && reflectionResponses[uid][currentProblemSet]) {
      let currentReflectionResponse = Object.values(Object.values(reflectionResponses[uid])[PROBLEM_SET_INDEX][activeItem.name])
      let count: number = 0
      currentReflectionResponse.forEach((item: any) => {
        if (item.response.length >= 10) {
          count++
        }
      })
      // TODO: for future use: the 2 refers to how many reflection prompts are in each item.
      if (count === 2) {
        firebase.update(getItemStatusPath(uid, currentProblemSet, activeItem.name), { reflection_completed: true })
          .then(() => {
            console.log('executing .then()')
            dispatch(setReflectionCompleted(true))
            // loadProblemSetProgression(currentProblemSet)
            window.alert("Reflection responses saved! Please continue to the next practice problem or problem set.")
          })
          .catch(() => {
            window.alert("Unable to save changes. Please try again or refer to console.")
          })
      } else {
        window.alert("Please enter at least 10 characters for both reflection responses.")
      }
    }
    setOpen(false)
  }
  // default item shouldn't have any reflection prompts
  if (activeItem.name === "") {
    return (
      <div>

      </div>
    )
  } else {
    return (
      <div>
        {items.map((item) => {
          return <ReflectionIndividualPrompt item={item} readOnly={itemReflectionResponse}/>
        })}
        <Button
          type='submit'
          size='large'
          variant='contained'
          onClick={handleClickOpen}
        >
          Submit Reflections
        </Button>
        <Dialog
          open={open}
          onClose={handleClose}
          aria-labelledby='alert-dialog-title'
          aria-describedby='alert-dialog-description'
        >
          <DialogTitle id='alert-dialog-title'>
            {'Submit reflection?'}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id='alert-dialog-description'>
              Do you wish to submit these reflections? You cannot edit them in the future! 
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={handleSubmit}>Submit</Button>
          </DialogActions>
        </Dialog>
      </div>
    )
  }
}

export default ReflectionPromptLister

