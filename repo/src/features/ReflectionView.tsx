<<<<<<< HEAD
import React, { useState, useEffect } from 'react'
import { Box } from '@mui/material'
import { useFirebase, useFirebaseConnect } from 'react-redux-firebase'
=======
import React, { useState } from 'react'
import { Box } from '@mui/material'
import { useFirebaseConnect } from 'react-redux-firebase'
>>>>>>> 8c9f1b7 (revert soft tabs)

//Note: technically, in the itemsSlice.ts, there is a setAllItems method
//      but it is being phased out.
//import { setAllItems } from './reflectionPrompt/reflectionsSlice'
import { selectActiveItem } from './reflectionPrompt/reflectionsSlice'

import { COLLECTION_REFLECTION_PROMPTS } from '../utils/dbPaths'
import { useAppDispatch, useAppSelector } from '../app/hooks'

//need to make specialized setResults + clearResults
import { setResults } from './results/resultsSlice'

import { apiUrl } from '../config'
import { ResultsResponse } from './results/resultsConstants'
import { ReflectionItem } from './../constants/dbSchemas'
import { getIsoTime } from '../utils/helperFunctions'

import ReflectionPrompt from './reflectionPrompt/ReflectionPromptItem'

const ReflectionView: React.FC = () => {
  // sync collection from firebase to redux
  useFirebaseConnect({
    path: COLLECTION_REFLECTION_PROMPTS // practice items
  })

  //typescript friendly redux dispatch
  const dispatch = useAppDispatch()

  const activeItem = useAppSelector(selectActiveItem)
  
  // what is currently rendered to console (not always program output)
  const [output, setOutput] = useState<string>('')

  const submit = () => {
    setOutput('submitting...')
    
    const timestamp = Date.now()
    
    //JSON object to pass in as request body
    const body = {
        "ReflectionItem": {
            name: activeItem.name,
            createdAt: timestamp,
            prompt: activeItem.prompt
        }
    }

    //setting up request options
    const options: RequestInit = {
        method: "POST",
        mode: "cors",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    }

    //async post request
    fetch(apiUrl, options)
        .then((response) => response.json())
        .then((data: ResultsResponse) => {
            setOutput('Submitted response! See results on the right.')

            //store results in the redux
            dispatch(setResults(data))

            //get ime of action
            const [clientTime, clientTimezone] = getIsoTime(new Date(timestamp))

            const output = data[timestamp]

            //create new reflection response
            const newResponse: ReflectionItem = {
                name: activeItem.name,
                createdAt: clientTime,
                prompt: activeItem.prompt,
                problem_set: activeItem.problem_set
            }

            //send reflection submission to firebase
            //firebase.push(getReflectionResponsePath(uid, activeItem.name), newResponse)
        })
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

    return (
        <Box sx={{ flexDirection: 'column', ...sxOuter }}>
                <ReflectionPrompt />
        </Box>
    )
}



export default ReflectionView