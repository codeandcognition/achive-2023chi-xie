import React, { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { useAppSelector } from '../../app/hooks'
import { selectActiveItemId } from './reflectionsSlice'
import _ from 'lodash'
import { useFirebase, useFirebaseConnect } from 'react-redux-firebase'
import { COLLECTION_REFLECTION_PROMPTS } from '../../utils/dbPaths'

const dummyPrompt = 'select a reflection prompt to continue'

const ReflectionPrompt = () => {

  const firebase = useFirebase()

  useFirebaseConnect({
    path: COLLECTION_REFLECTION_PROMPTS
  })
  
  // name of selected item
  const activeItemName = useAppSelector(selectActiveItemId)
  const reflectionPrompts = useAppSelector(state => state.firebase.data.reflection)
  
  // prompt to show
  const [prompt, setPrompt] = useState(dummyPrompt)

  useEffect(() => {
    if(_.isObject(reflectionPrompts)) {
      // find active item
      const activeItem = Object.values(reflectionPrompts).filter(item => item.name === activeItemName)[0]
      if (activeItem?.prompt) {
        setPrompt(activeItem.prompt)
      }
    } else { // if no item selected
      setPrompt(dummyPrompt)
    }
    if (reflectionPrompts !== undefined) {
      const allReflectionItems = reflectionPrompts[0]
    }
    
  }, [activeItemName, reflectionPrompts])

  return (
    <ReactMarkdown>
      {prompt}
    </ReactMarkdown>
  )

}

export default ReflectionPrompt
