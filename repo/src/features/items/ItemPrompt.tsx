import React, { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { useAppSelector } from '../../app/hooks'
import { selectActiveItemId } from './itemsSlice'
import _ from 'lodash'

import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography
} from '@mui/material'

import ReflectionPromptLister from '../reflectionPrompt/reflectionPromptLister'


const dummyPrompt = 'select an item to continue'
const dummyProblemSet = 'dummy problem set'

const ItemPrompt: React.FC = () => {
  // name of selected item
  const activeItemName = useAppSelector(selectActiveItemId)
  const practiceItems = useAppSelector(state => state.firebase.data.practice)

  const currentProblemSet = useAppSelector(state => state.problemSets.activeProblemSet)
    
  // prompt to show
  const [prompt, setPrompt] = useState(dummyPrompt)
  
  const [problemSet, setProblemSet] = useState(dummyProblemSet)

  useEffect(() => {
    if(_.isObject(practiceItems)) {
      // find active item
      const activeItem = Object.values(practiceItems).filter(item => item.name === activeItemName)[0]
      if (activeItem?.prompt) {
        setPrompt(activeItem.prompt)
        setProblemSet(activeItem.problem_set)
      }
    } else { // if no item selected
      setPrompt(dummyPrompt)
    }

    

  }, [activeItemName, practiceItems])
  return (
    <div>
      <Typography variant='h4'>
        {prompt !== dummyPrompt ? activeItemName + '()' : ""}
      </Typography>
      <ReactMarkdown>
          {prompt}
      </ReactMarkdown>
    </div>
  )
}



export default ItemPrompt
