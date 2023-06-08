import React, { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import { useNavigate } from 'react-router-dom'
import { LOG_IN_PATH, SIGN_UP_PATH } from '../../constants/paths'

import CodeReplayIcon from '../codeReplayIcon/CodeReplayIcon'
import { Link, TextField } from '@mui/material'
import { getPreSurveyMilestone, getVideoMilestone, setCompletedPreSurvey, setCompletedVideo } from '../progress/milestoneSlice'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { ItemStatus } from '../../constants/dbSchemas'
import { useFirebase, useFirebaseConnect } from 'react-redux-firebase'
import { COLLECTION_ITEMS, COLLECTION_ITEM_STATUSES, getItemStatusPath } from '../../utils/dbPaths'
import { setAttempted, setPassed, updateAttemptNumber, updateItemStatusCurrentCode } from '../progress/itemStatusSlice'

// sx shared among groups of info
const sxGroups = {
  my: 2 // vertical margin
}

const VideoPage = () => {
    // Link to qualtrics initial pre-survey before starting modules
    const VIDEO_LINK = "https://www.loom.com/share/083e6860d91244a8bf1951e71dcfdf3a"
    const DEMO_LINK = "https://www.loom.com/share/05efa9d55d0042dc9490b2df7f42c96d"
    // students have to input the correct code into the textfield to move onto the next module
    const surveyPassword = "ilovemetacognition"

    // the value of the textfield
    const [value, setValue] = useState<string>("")

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
    const PS2 = "PS2"
    const uid = useAppSelector(({ firebase }) => firebase.auth.uid)

    const initializeItemStatusForUser = (problemSet: string) => {
        const defaultItemStatus: ItemStatus = {
            attempted: false,
            passed: false,
            attempts: 0,
            problem_set: problemSet,
            current_code: "",
            reflection_completed: false
        }
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
            dispatch(setCompletedVideo(true))
            window.alert("Congratulations, you completed the video! Please return to the home page to start the next module.")
            initializeItemStatusForUser(PS2)
            navigate(HOME)
        }
    }

    const completedVideo = useAppSelector(getVideoMilestone)
    useEffect(() => {
        if(completedVideo) {
            setReadOnly(true)
        }
    }, [completedVideo])

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
                <Typography fontWeight={'bold'}>In the next problem set, we will introduce the replay tool. <a href={DEMO_LINK}>This video</a> will show a demo on how to use it in problem set 2. To continue to the next problem set, please watch <a href={VIDEO_LINK}>this video</a>. When you complete this video, a code will be provided. Please input the code in the bottom textfield and click submit to move to the next module.</Typography>
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

export default VideoPage

