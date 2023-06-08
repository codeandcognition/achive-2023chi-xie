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
import { ItemStatus } from '../../constants/dbSchemas'
import { useFirebase, useFirebaseConnect } from 'react-redux-firebase'
import { COLLECTION_ITEMS, COLLECTION_ITEM_STATUSES, getItemStatusPath } from '../../utils/dbPaths'
import { setAttempted, setPassed, updateAttemptNumber, updateItemStatusCurrentCode } from '../progress/itemStatusSlice'
import { getIsoTime } from '../../utils/helperFunctions'

// sx shared among groups of info
const sxGroups = {
  my: 2 // vertical margin
}

const PostSurveyPage = () => {
    // Link to qualtrics initial pre-survey before starting modules
    const POST_SURVEY_LINK = "https://ischooluw.co1.qualtrics.com/jfe/form/SV_03aZBQe0NinXQjA"

    // students have to input the correct code into the textfield to move onto the next module
    const surveyPassword = "1H2u^weEI%l2"

    // the value of the textfield
    const [value, setValue] = useState<string>("")

    const dispatch = useAppDispatch()
    
    useFirebaseConnect({
        path: COLLECTION_ITEMS // practice items
    })

    useFirebaseConnect({
        path: COLLECTION_ITEM_STATUSES
    })
    // const COLLECTION_KSL = "ksl"
    // useFirebaseConnect({
    //     path: COLLECTION_KSL
    // })

    // helper function to initialize item status
    const firebase = useFirebase()
    const practiceItems = useAppSelector(state => state.firebase.data.practice)
    const PS1 = "PS1"
    const PS2 = "PS2"
    const PS3 = "PS3"
    const uid = useAppSelector(({ firebase }) => firebase.auth.uid)
    const itemStatus = useAppSelector(state => state.firebase.data.item_status)
    // const ksl = useAppSelector(state => state.firebase.data.ksl)

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

    // when the initial survey is complete, update milestone progress
    const [readOnly, setReadOnly] = useState<boolean>(false)


    const [clientTime, clientTimezone] = getIsoTime()
    const [coursesEnrolled, setCoursesEnrolled] = useState({
        cse160: true,
        cse163: false,
        csc110: false,
        none: false
      })
    const users = useAppSelector(state => state.firebase.data.users)
    const getUserPath = (userId: string) => {
        return `users/${userId}`
    }
    // const handleLogs = () => {
    //     // console.log(uid)
    //     // console.log(users[uid])
    //     // console.log(ksl[uid])
    //     if (users && users[uid]) {
    //         if (ksl && ksl[uid] && ksl[uid]['is_profitable']) {
    //             // loop over is_profitable keystroke logs and identify the first and last logs
    //             //earliest log value
    //             const firstLog = Object.values(ksl[uid]['is_profitable']).reduce((log1: any, log2: any) => {
    //                 return (
    //                     log1.ClientTimestamp < log2.ClientTimestamp ? log1.ClientTimestamp : log2.ClientTimestamp
    //                 )
    //             })
    //             const lastLog = Object.values(ksl[uid]['is_profitable']).reduce((log1: any, log2: any) => {
    //                 return (
    //                     log1.ClientTimestamp > log2.ClientTimestamp ? log1.ClientTimestamp : log2.ClientTimestamp
    //                 )
    //             })
    //             console.log("First log: ", firstLog)
    //             console.log("Last log: ", lastLog)
    //         }
    //     }
    // }

    const handleSubmit = () => {
        if (value) {
            if (!users[uid]) {
                const currentUserData: any = {
                    coursesEnrolled: coursesEnrolled,
                    createdAt: clientTime,
                    timezone: clientTimezone,
                    name: value
                }
                window.alert("Thank you! We will direct you to an exit survey, after which you are completely done with the tool.")
                window.location.href = POST_SURVEY_LINK
                return firebase.set(getUserPath(uid), currentUserData)            
            } else {
                window.alert("Thank you! We will direct you to an exit survey, after which you are completely done with the tool.")
                window.location.href = POST_SURVEY_LINK
            }
        }
    }

    const preSurveyMilestone = useAppSelector(getPreSurveyMilestone)
    const ps1Milestone = useAppSelector(getPS1Milestone)
    const videoMilestone = useAppSelector(getVideoMilestone)
    const ps2Milestone = useAppSelector(getPS2Milestone)
    const distractorMilestone = useAppSelector(getDistractorMilestone)
    const ps3Milestone = useAppSelector(getPS3Milestone)
    
    useEffect(() => {
        // if(preSurveyMilestone) {
        //     setReadOnly(true)
        // }
    }, [preSurveyMilestone, itemStatus])

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
                {/* FINAL TODO: REPLACE THIS LINK WITH THE ACTUAL SURVEY */}
                {/* <Box sx={{ ...sxGroups }}>
                    <Typography fontWeight={'bold'}>
                        Congratulations on completing Code Replayer! Please fill out <a href={POST_SURVEY_LINK}>this survey</a> to receive your compensation. We are very happy to see you complete this journey.</Typography>
                </Box> */}
                <Box sx={{ ...sxGroups }}>
                    <Typography fontWeight={'bold'}>
                        Congratulations on completing Code Replayer! To confirm that you have completed this problem set, please input your full name here. When you hit submit, a link will guide you to a 15-20 minute exit survey, which will include details about your compensation.
                    </Typography>
                </Box>
                <TextField required
                    label='Input name'
                    value={value}
                    onChange={(e) => {
                        setValue(e.target.value)
                    }}
                    // disabled={readOnly}
                />
                <Button
                    type='submit'
                    size='large'
                    variant='contained'
                    onClick={handleSubmit}
                    // disabled={readOnly}
                >
                    {readOnly ?
                        "Name Submitted!"
                    :
                        "Confirm Name"
                    }
                </Button>
                {/* <Button
                    type='submit'
                    size='large'
                    variant='contained'
                    onClick={handleLogs}
                >
                    First KSL log:
                    Last KSL log: 
                </Button> */}
                {/* <TextField required 
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
                >
                    {readOnly? 
                        "Survey Completed!"
                        :
                        "Submit Code"
                    }
                </Button> */}
            </Box>
            </Box>
        </Box>
    )
}

export default PostSurveyPage