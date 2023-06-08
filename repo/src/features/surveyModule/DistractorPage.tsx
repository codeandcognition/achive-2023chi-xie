import React, { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import { useNavigate } from 'react-router-dom'
import { LOG_IN_PATH, SIGN_UP_PATH } from '../../constants/paths'

import CodeReplayIcon from '../codeReplayIcon/CodeReplayIcon'
import { TextField } from '@mui/material'
import { getDistractorMilestone, getPreSurveyMilestone, getPS1Milestone, getPS2Milestone, getPS3Milestone, getVideoMilestone, setCompletedDistractor, setCompletedPreSurvey, setCompletedPS1, setCompletedPS2, setCompletedVideo } from '../progress/milestoneSlice'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { ItemStatus } from '../../constants/dbSchemas'
import { useFirebase, useFirebaseConnect } from 'react-redux-firebase'
import { COLLECTION_ITEMS, COLLECTION_ITEM_STATUSES, getItemStatusPath } from '../../utils/dbPaths'
import { setAttempted, setPassed, updateAttemptNumber, updateItemStatusCurrentCode } from '../progress/itemStatusSlice'

// sx shared among groups of info
const sxGroups = {
  my: 2 // vertical margin
}

const DistractorPage = () => {
    // Link to qualtrics initial pre-survey before starting modules
    const DISTRACTOR_LINK = "https://docs.google.com/forms/d/e/1FAIpQLScfm_3Dg1aHDIH1nM49dYNUX7SnB0gENEXsnxqLlhYjA1DvwA/viewform?usp=sf_link"

    // students have to input the correct code into the textfield to move onto the next module
    const surveyPassword = "1H2u^weEI%l2"

    // the value of the textfield
    const [value, setValue] = useState<string>("")

    const dispatch = useAppDispatch()

    const PS1 = "PS1"
    const PS2 = "PS2"
    const PS3 = "PS3"

    useFirebaseConnect({
        path: COLLECTION_ITEMS // practice items
    })

    useFirebaseConnect({
        path: COLLECTION_ITEM_STATUSES
    })

    // helper function to initialize item status
    const firebase = useFirebase()
    const practiceItems = useAppSelector(state => state.firebase.data.practice)
    const uid = useAppSelector(({ firebase }) => firebase.auth.uid)
    const itemStatus = useAppSelector(state => state.firebase.data.item_status)
    
    useEffect(() => {
        
    }, [practiceItems, firebase, itemStatus])

    const initializeItemStatusForUser = (problemSet: string) => {
        const defaultItemStatus: ItemStatus = {
            attempted: false,
            passed: false,
            attempts: 0,
            problem_set: problemSet,
            current_code: "",
            reflection_completed: false
        }
    
        // 
        Object.entries(practiceItems).map(([itemId, item], index: number) => {
            if (item.problem_set === problemSet) {
                firebase.set(getItemStatusPath(uid, problemSet, item.name), defaultItemStatus)
            } 
        })
        
        updateAttemptNumber(0)
        updateItemStatusCurrentCode("")
        setAttempted(false)
        setPassed(false)
    }

    const navigate = useNavigate()
    const HOME = "/home"

    const [readOnly, setReadOnly] = useState<boolean>(false)

    const handleSubmit = () => {
        // only render if the value is equal to password and the milestone hasn't been rendered yet
        if (value === surveyPassword) {
            dispatch(setCompletedDistractor(true))
            window.alert("Congratulations, you completed the distractor! Please return to the home page to start the next module.")
            initializeItemStatusForUser(PS3)
            navigate(HOME)
        }
    }

    const preSurveyMilestone = useAppSelector(getPreSurveyMilestone)
    const ps1Milestone = useAppSelector(getPS1Milestone)
    const videoMilestone = useAppSelector(getVideoMilestone)
    const ps2Milestone = useAppSelector(getPS2Milestone)
    const distractorMilestone = useAppSelector(getDistractorMilestone)
    const ps3Milestone = useAppSelector(getPS3Milestone)
    useEffect(() => {
        if(distractorMilestone) {
            setReadOnly(true)
        }
    }, [distractorMilestone, itemStatus])

    useEffect(() => {
        if (uid && itemStatus && itemStatus[uid]) {
            if (itemStatus[uid][PS1]) {
                dispatch(setCompletedPreSurvey(true))
            }
            if (itemStatus[uid][PS2]) {
                dispatch(setCompletedVideo(true))
            }
            if (itemStatus[uid][PS3]) {
                dispatch(setCompletedDistractor(true))
            }
            if (videoMilestone) {
                dispatch(setCompletedPS1(true))
            }
            if (distractorMilestone) {
                dispatch(setCompletedPS2(true))
            }
        } else {
            dispatch(setCompletedPreSurvey(false))
            dispatch(setCompletedVideo(false))
            dispatch(setCompletedDistractor(false))
        }
    }, [itemStatus])
    
    return (
    <Box
        sx={{
            display: 'flex',
            flexDirection: 'column',
            height: 1,
            justifyContent: 'space-between'
        }}>
        <Box sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'center',
            padding: 2,
            m: 'auto'
        }}>
        <Box sx={{
            m: 2
        }}>
        <CodeReplayIcon sx={{
            fontSize: '25vh'
        }} />
        </Box>

        <Box sx={{ ...sxGroups }}>
            <Box>
                <Typography variant='h2'>Code Replayer</Typography>
                <Typography variant='subtitle1'>Careful practice for writing code.</Typography>
            </Box>

            <Box sx={{ ...sxGroups }}>
                <Typography fontWeight={'bold'}>Please complete <a href={DISTRACTOR_LINK}>this form</a> to continue to next module. When you complete this form, a code will be provided. Please input the code in the bottom textfield and click submit to move to the next module.</Typography>
            </Box>

            <TextField required 
                label='Input code'
                value={value}
                onChange={(e) => {
                    setValue(e.target.value)
                }}
            />
            <Button
                type='submit'
                size='large'
                variant='contained'
                onClick={handleSubmit}
                disabled={readOnly}
            >
                {readOnly? 
                    "Code Submitted!"
                    :
                    "Submit Code"
                }
            </Button>
        </Box>
        </Box>
    </Box>
  )
}

export default DistractorPage

