import { Box, Checkbox, FormControlLabel, FormGroup, Radio, Tooltip, Button, IconButton, Typography, Link } from "@mui/material"
import { Navigate } from "react-router-dom"
import PracticeView from "../PracticeView"
import { useNavigate } from 'react-router-dom'
import ArrowCircleRightIcon from '@mui/icons-material/ArrowCircleRight'
import { useEffect, useState } from "react"
import { useFirebase, useFirebaseConnect } from 'react-redux-firebase'
import CircleOutlinedIcon from '@mui/icons-material/CircleOutlined'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';

import { useAppDispatch, useAppSelector } from "../../app/hooks"
import { selectProblemSet, setProblemSet } from "../problemSets/problemSetsSlice"
import { getDistractorMilestone,
         getPreSurveyMilestone,
         getPS1Milestone,
         getPS2Milestone,
         getPS3Milestone,
         getVideoMilestone,
         setCompletedDistractor,
         setCompletedPreSurvey,
         setCompletedPS1,
         setCompletedPS2,
         setCompletedPS3,
         setCompletedVideo } from "../progress/milestoneSlice";
import { COLLECTION_ITEMS, COLLECTION_ITEM_STATUSES, getItemStatusPath } from '../../utils/dbPaths'
import { ItemStatus, PracticeItem } from '../../constants/dbSchemas'
import { setAttempted, setPassed, updateAttemptNumber, updateItemStatusCurrentCode } from '../progress/itemStatusSlice'
import { setActiveItemId, setActiveItem, emptyItem, selectActiveItem } from "../items/itemsSlice"
import PreSurveyPage from "../surveyModule/PreSurveyPage"
import { CheckBox } from "@mui/icons-material"


const HomePage: React.FC = () => {
    // navigation links
    const PROBLEM_SET_1 = "/problem_set_1"
    const PROBLEM_SET_2 = "/problem_set_2"
    const PROBLEM_SET_3 = "/problem_set_3"
    const PRE_SURVEY = "/pre_survey"
    const VIDEO = "/video"
    const DISTRACTOR = "/short_breather"
    const POST_SURVEY = "/exit_survey"

    // problem set references
    const PS1 = "PS1"
    const PS2 = "PS2"
    const PS3 = "PS3"

    // get auth from firebase slice of redux state
    const uid = useAppSelector(({ firebase }) => firebase.auth.uid)

    const practiceItems = useAppSelector(state => state.firebase.data.practice)
    const itemStatus = useAppSelector(state => state.firebase.data.item_status)

    const problemSetArray = [PS1, PS2, PS3]
    
    // sync collection from firebase to redux
    useFirebaseConnect({
        path: COLLECTION_ITEMS // practice items
    })

    useFirebaseConnect({
        path: COLLECTION_ITEM_STATUSES
    })

    // extended firebase instance
    const firebase = useFirebase()
    
    const currentProblemSet = useAppSelector(selectProblemSet)
    
    const activeItem = useAppSelector(selectActiveItem)

    const navigate = useNavigate()
    const dispatch = useAppDispatch()

    const preSurveyMilestone = useAppSelector(getPreSurveyMilestone)
    const ps1Milestone = useAppSelector(getPS1Milestone)
    const videoMilestone = useAppSelector(getVideoMilestone)
    const ps2Milestone = useAppSelector(getPS2Milestone)
    const distractorMilestone = useAppSelector(getDistractorMilestone)
    const ps3Milestone = useAppSelector(getPS3Milestone)

    const onLoad = () => {
        if (uid && itemStatus && itemStatus[uid]) {
            problemSetArray.forEach((problemSet) => {
                loadProblemSetProgression(problemSet)
            })
        }
        dispatch(setProblemSet(''))
    }

    /**
     * PreSurvey needs to initializeItemStatusForUser(PS1)
     *   - logic: If itemStatus inside PS1 exists, then Pre-Survey milestone will be dispatched (dispatch(setPreSurveyMilestone()))
     *   - Video needs to initialize PS2
     *   - PostSurvey needs to initialize PS3
     */
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
        onLoad()
    }, [itemStatus, videoMilestone, distractorMilestone, ps1Milestone, ps2Milestone, ps3Milestone])

    // useEffect(() => {
    //     onLoad()
    // },[itemStatus, currentProblemSet])

    const loadProblemSetProgression = (problemSet: string) => {
        let numberOfReflections: number = 0
        if (itemStatus && uid && problemSet && itemStatus[uid][problemSet]) {
            Object.values(itemStatus[uid][problemSet]).forEach((item: any) => {
                if (item.reflection_completed) {
                    numberOfReflections++
                }
            })
            if (numberOfReflections === Object.values(itemStatus[uid][problemSet]).length) {
                if (problemSet === "PS1") {
                    dispatch(setCompletedPS1(true))
                }
                if (problemSet === "PS2") {
                    dispatch(setCompletedPS2(true))
                }
                if (problemSet === "PS3") {
                    dispatch(setCompletedPS3(true))
                }
            }
        }
    }

    //use dispatch to set problem to desired problem
    const clickProblemSet1 = () => {
        if (preSurveyMilestone) {
            dispatch(setProblemSet(PS1)) 
            navigate(PROBLEM_SET_1)
            dispatch(setActiveItemId(''))
            dispatch(setActiveItem(emptyItem))
        } else {
            window.alert("Please complete pre-survey first")
        }
    }

    const clickProblemSet2 = () => {
        if (ps1Milestone) {
            dispatch(setProblemSet(PS2))
            dispatch(setActiveItemId(''))
            dispatch(setActiveItem(emptyItem))
            if (!(itemStatus)[uid][PS2]) {
                initializeItemStatusForUser(PS2)
            }
            navigate(PROBLEM_SET_2)
        } else {
            window.alert("Please complete the video module first")
        }
    }

    const clickProblemSet3 = () => {
        if (ps2Milestone) {
            dispatch(setProblemSet(PS3))
            dispatch(setActiveItemId(''))
            dispatch(setActiveItem(emptyItem))
            navigate(PROBLEM_SET_3)
        } else {
            window.alert("Please complete the short break module first.")
        }
    }

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
              return firebase.set(getItemStatusPath(uid, problemSet, item.name), defaultItemStatus)
            } 
        })
        updateAttemptNumber(0)
        updateItemStatusCurrentCode("")
        setAttempted(false)
        setPassed(false)
    }

    const initializeAllItemStatus = () => {
        initializeItemStatusForUser(PS1)
        initializeItemStatusForUser(PS2)
        initializeItemStatusForUser(PS3)
    }

    const clickPreSurvey = () => {
        navigate(PRE_SURVEY)
        dispatch(setProblemSet(""))
    }

    const clickVideo = () => {
        if (ps1Milestone) {
            navigate(VIDEO)
            dispatch(setProblemSet(""))
        } else {
            dispatch(setProblemSet(""))
            window.alert("Please complete PS1 first.")
        }

    }

    const clickDistractor = () => {
        if (ps2Milestone) {
            navigate(DISTRACTOR)
            dispatch(setProblemSet(""))
        } else {
            setProblemSet("")
            window.alert("Please complete PS2 first.")
        }
    }

    const clickPostSurvey = () => {
        if (ps3Milestone) {
            navigate(POST_SURVEY)
            dispatch(setProblemSet(""))
        } else {
            dispatch(setProblemSet(""))
            window.alert("Please complete PS3 first.")
        }
    }
    const displayItemAttemptedTotal = (problemSet: string) => {
        let itemAttemptedTotal = 0
        let problemSetItemLength = 0
        if (uid && itemStatus) {
            if (itemStatus[uid] && itemStatus[uid][problemSet]) {
                Object.values(itemStatus[uid][problemSet]).map((item: any) => {
                    if (item) {
                        problemSetItemLength++
                        if(item.attempted) {
                            itemAttemptedTotal++
                        }
                    }
                })
            }
        }
        if (itemAttemptedTotal === 0 && problemSetItemLength === 0) {
            return "Not yet started"
        } else {
            return itemAttemptedTotal + "/" + problemSetItemLength + " attempted"
        }
    }

    const displayItemPassedTotal = (problemSet: string) => {
        let itemPassedTotal = 0
        let problemSetItemLength = 0
        if (uid && itemStatus){
            if (itemStatus[uid] && itemStatus[uid][problemSet]) {
                Object.values(itemStatus[uid][problemSet]).forEach((item: any) => {
                    if (item) {
                        problemSetItemLength++
                        if (item.passed) {
                            itemPassedTotal++
                        }
                    }
                })
            }
        }
        if (itemPassedTotal === 0 && problemSetItemLength === 0) {
            return ""
        } else {
            if (itemPassedTotal === problemSetItemLength) {
                loadProblemSetProgression(problemSet)
            }
            return itemPassedTotal + "/" + problemSetItemLength + " passed"
        }
    }

    //PreSurvey Button
    let preSurveyButton = 
        <Tooltip title={preSurveyMilestone ? "Pre-Survey Complete!": "Do this before continuing"}>
            <Box sx={{ display: 'flex', flexDirection: "row", alignItems: "center", justifyContent: "left", borderRadius: 1,
                        '&:hover': {
                            cursor: "pointer",
                            background: '#f0f0f0'
                        },
                        my: "0.5em"
                    }}
                onClick={clickPreSurvey}
            >
                <IconButton color='primary' >
                    {preSurveyMilestone ? <CheckCircleRoundedIcon /> : <CircleOutlinedIcon /> }
                </IconButton>
                <Typography>Pre-Survey</Typography>
            </Box>
        </Tooltip>

    //PS1 Button
    let problemSet1Button = 
        <Tooltip title={ps1Milestone ? "Problem Set 1 complete!": "Please complete problem set 1 before continuing"}>
            <Box sx={{ display: 'flex', flexDirection: "row", alignItems: "center", justifyContent: "left", borderRadius: 1, my: "0.1em",
                        '&:hover': {
                            cursor: "pointer",
                            background: '#f0f0f0'
                        }
                    }}
                onClick={clickProblemSet1}
            >
                <IconButton color='primary' >
                    {ps1Milestone ? <CheckCircleRoundedIcon /> : <CircleOutlinedIcon /> }
                </IconButton>
                <Typography>
                    {"Problem Set 1 - " + (uid ? displayItemAttemptedTotal(PS1) : "") + ", " + (uid ? displayItemPassedTotal(PS1) : "") }
                </Typography>
            </Box>
        </Tooltip>

    //Video Lesson Button
    let videoButton = 
        <Tooltip title={ videoMilestone ? "Video lesson complete!" : "Please watch this video before continuing"}>
            <Box sx={{ display: 'flex', flexDirection: "row", alignItems: "center", justifyContent: "left", borderRadius: 1, my: "0.1em",
                        '&:hover': {
                            cursor: "pointer",
                            background: '#f0f0f0'
                        }
                    }}
                onClick={clickVideo}
            >
                <IconButton color='primary' >
                    {videoMilestone ? <CheckCircleRoundedIcon /> : <CircleOutlinedIcon /> }
                </IconButton>
                <Typography>Video Lesson on Metacognition</Typography>
            </Box>
        </Tooltip>

    //PS2 Button
    let problemSet2Button = 
        <Tooltip title={ ps2Milestone ? "Problem Set 2 complete!": "Please complete problem set 2 before continuing" }>
            <Box sx={{ display: 'flex', flexDirection: "row", alignItems: "center", justifyContent: "left", borderRadius: 1, my: "0.1em",
                        '&:hover': {
                            cursor: "pointer",
                            background: '#f0f0f0'
                        }
                    }}
                onClick={clickProblemSet2}
            >
                <IconButton color='primary' >
                    {ps2Milestone ? <CheckCircleRoundedIcon /> : <CircleOutlinedIcon /> }
                </IconButton>
                <Typography>
                {"Problem Set 2 - " + (uid ? displayItemAttemptedTotal(PS2) : "") + ", " + (uid ? displayItemPassedTotal(PS2) : "")  }
                </Typography>
            </Box>
        </Tooltip>

    //Distractor Button
    let distractorButton = 
        <Tooltip title={ distractorMilestone ? "Item Complete!" : "Please complete this activity before continuing" }>
            <Box sx={{ display: 'flex', flexDirection: "row", alignItems: "center", justifyContent: "left", borderRadius: 1, my: "0.1em",
                        '&:hover': {
                            cursor: "pointer",
                            background: '#f0f0f0'
                        }
                    }}
                onClick={clickDistractor}
            >
                <IconButton color='primary' >
                    {distractorMilestone ? <CheckCircleRoundedIcon /> : <CircleOutlinedIcon /> }
                </IconButton>
                <Typography>Short Break</Typography>
            </Box>
        </Tooltip>

    //PS3 Button
    let problemSet3Button = 
        <Tooltip title={ ps3Milestone ?  "Problem Set 3 Complete!" : "Please complete problem set 3 before continuing" }>
            <Box sx={{ display: 'flex', flexDirection: "row", alignItems: "center", justifyContent: "left", borderRadius: 1, my: "0.1em",
                        '&:hover': {
                            cursor: "pointer",
                            background: '#f0f0f0'
                        }
                    }}
                onClick={clickProblemSet3}
            >
                <IconButton color='primary' >
                    {ps3Milestone ? <CheckCircleRoundedIcon /> : <CircleOutlinedIcon /> }
                </IconButton>
                <Typography>
                    {"Problem Set 3 - " + (uid ? displayItemAttemptedTotal(PS3) : "") + ", " + (uid ? displayItemPassedTotal(PS3) : "")  }
                </Typography>
            </Box>
        </Tooltip>

    //exit survey button
    let exitSurveyButton = 
        <Tooltip title={ ps3Milestone ?  "To complete this course, please submit this exit survey.": "Complete this exit survey to finish" }>
            <Box sx={{ display: 'flex', flexDirection: "row", alignItems: "center", justifyContent: "left", borderRadius: 1, my: "0.1em",
                        '&:hover': {
                            cursor: "pointer",
                            background: '#f0f0f0'
                        }
                    }}
                onClick={clickPostSurvey}
            >
                <IconButton color='primary' >
                    {false ? <CheckCircleRoundedIcon /> : <CircleOutlinedIcon /> }
                </IconButton>
                <Typography>Exit Survey</Typography>
            </Box>
        </Tooltip>

    return (
        <Box
            // onReset={onLoad}
            // onPointerMove={onLoad}
            sx={{
                m: "2em"
            }}
            // onPointerMove={onLoad}
        >
            
            <FormGroup>
                {preSurveyButton}
                {problemSet1Button}
                {videoButton}
                {problemSet2Button}
                {distractorButton}
                {problemSet3Button}
                {exitSurveyButton}
            </FormGroup>
            {/* this was for debugging, delete this */}
            {/* <Button onClick={initializeAllItemStatus}> 
                Debug: initialize all item statuses
            </Button> */}
        </Box>
    )
}

export default HomePage