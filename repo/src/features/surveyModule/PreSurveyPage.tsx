import React, { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import { useNavigate } from 'react-router-dom'
import { LOG_IN_PATH, SIGN_UP_PATH } from '../../constants/paths'

import CodeReplayIcon from '../codeReplayIcon/CodeReplayIcon'
import { Link, TextField } from '@mui/material'
import { getDistractorMilestone, getPreSurveyMilestone, getPS1Milestone, getPS2Milestone, getPS3Milestone, getVideoMilestone, setCompletedDistractor, setCompletedPreSurvey, setCompletedPS1, setCompletedPS2, setCompletedVideo } from '../progress/milestoneSlice'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { ItemStatus, UserData } from '../../constants/dbSchemas'
import { useFirebase, useFirebaseConnect } from 'react-redux-firebase'
import { COLLECTION_ITEMS, COLLECTION_ITEM_STATUSES, getItemStatusPath } from '../../utils/dbPaths'
import { setAttempted, setPassed, updateAttemptNumber, updateItemStatusCurrentCode } from '../progress/itemStatusSlice'
import { getClientTimestampTime } from '../codeReplayer/replayHelpers'
import { getIsoTime } from '../../utils/helperFunctions'

// sx shared among groups of info
const sxGroups = {
  my: 2 // vertical margin
}

const PreSurveyPage = () => {
    // Link to qualtrics initial pre-survey before starting modules
    const PRE_SURVEY_LINK = "https://ischooluw.co1.qualtrics.com/jfe/form/SV_bEj8YYS0B1o73YG"

    // students have to input the correct code into the textfield to move onto the next module
    const surveyPassword = "evH@6U&9p78M"

    // the value of the textfield
    const [value, setValue] = useState<string>("")
    const [nameValue, setNameValue] = useState<string>("")

    const dispatch = useAppDispatch()
    
    useFirebaseConnect({
        path: COLLECTION_ITEMS // practice items
    })

    useFirebaseConnect({
        path: COLLECTION_ITEM_STATUSES
    })

    // helper function to initialize item status
    const firebase = useFirebase()
    const practiceItems = useAppSelector(state => state.firebase.data.practice)
    const PS1 = "PS1"
    const PS2 = "PS2"
    const PS3 = "PS3"
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
    
        if (practiceItems) {
            Object.entries(practiceItems).map(([itemId, item], index: number) => {
                if (item.problem_set === problemSet) {
                    firebase.set(getItemStatusPath(uid, problemSet, item.name), defaultItemStatus)
                } 
            })
        }
        
        updateAttemptNumber(0)
        updateItemStatusCurrentCode("")
        setAttempted(false)
        setPassed(false)
    }

    const navigate = useNavigate()
    const HOME = "/home"

    // when the initial survey is complete, update milestone progress
    const [readOnly, setReadOnly] = useState<boolean>(false)

    
    const handleSubmit = () => {
        // only render if the value is equal to password and the milestone hasn't been rendered yet
        if (value === surveyPassword) {
            initializeItemStatusForUser(PS1)
            dispatch(setCompletedPreSurvey(true))
            setReadOnly(true)
            window.alert("Congratulations, you completed the initial survey! Please return to the home page to start the next module.")
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
        if (preSurveyMilestone) {
            setReadOnly(true)
        }
    }, [preSurveyMilestone, itemStatus, readOnly])

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
        }
        //  else {
        //     dispatch(setCompletedPreSurvey(false))
        //     dispatch(setCompletedVideo(false))
        //     dispatch(setCompletedDistractor(false))
        // }
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
                    <Typography fontWeight={'bold'}>Please fill out <a href={PRE_SURVEY_LINK}>this survey</a> to continue to next module. When you complete the survey, it will provide a code. Please input the code in the bottom textfield and click submit to move to go to the next module.</Typography>
                </Box>

                <Box>
                    <Typography variant='subtitle1'>If you notice that the Pre-Survey module is not marked as complete after submitting the code, please refresh from the home page, navigate back here, and try resubmitting.</Typography>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'row', align: 'center', mt: '1em' }}>
                    <TextField required 
                        label='Input code'
                        value={value}
                        onChange={(e) => {
                            setValue(e.target.value)
                        }}
                        disabled={readOnly}
                    />
                    <Button
                        type='submit'
                        size='large'
                        variant='contained'
                        onClick={handleSubmit}
                        disabled={readOnly}
                        sx={{ mx: '1em' }}
                    >
                        {readOnly? 
                            "Survey Completed!"
                            :
                            "Submit Code"
                        }
                    </Button>
                </Box>
            </Box>
            </Box>
        </Box>
    )
}

export default PreSurveyPage

