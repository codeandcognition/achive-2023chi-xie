import React, { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import TopBar from './features/topBar/TopBar'
import './App.css'
import { useAppSelector, useAppDispatch } from './app/hooks'
import { useFirebaseConnect, isLoaded, isEmpty } from 'react-redux-firebase'
import Box from '@mui/material/Box'

import PracticeView from './features/PracticeView'
import ReflectionView from './features/ReflectionView'
import LandingPage from './features/landing/LandingPage'
import { SIGN_UP_PATH, LOG_IN_PATH, AUTHOR_PATH } from './constants/paths'
import SignUpPage from './features/signup/SignUpPage'
import LogInPage from './features/login/LogInPage'
import AuthoringPage from './features/authoringTool/AuthoringPage'
import { getUsersPath, COLLECTION_ITEMS, COLLECTION_REFLECTION_PROMPTS } from './utils/dbPaths'
import { selectActiveItemId, setActiveItem, updateBacklog, selectItemBacklog } from './features/items/itemsSlice'
import HomePage from './features/homePage/HomePage'
import { getPreSurveyMilestone, getPS1Milestone, getVideoMilestone, getPS2Milestone, getDistractorMilestone, getPS3Milestone } from './features/progress/milestoneSlice'
import PreSurveyPage from './features/surveyModule/PreSurveyPage'
import DistractorPage from './features/surveyModule/DistractorPage'
import PostSurveyPage from './features/surveyModule/PostSurveyPage'
import VideoPage from './features/surveyModule/VideoPage'
import { Link, Typography } from '@mui/material'
import ReplayView from './features/ReplayView'

const App = () => {
  const dispatch = useAppDispatch()
  // get auth from firebase reducer
  const auth = useAppSelector(({ firebase }) => firebase.auth)

  // true if user is authenticated (signed in)
  const authExists = isLoaded(auth) && !isEmpty(auth)

  // sync collection from firebase to redux
  useFirebaseConnect({
    path: getUsersPath(auth.uid)
  })

  // sync practice problems
  useFirebaseConnect({
    path: COLLECTION_ITEMS
  })

  //sync reflection prompts
  useFirebaseConnect({
    path: COLLECTION_REFLECTION_PROMPTS
  })

  const isAdmin = useAppSelector(state => state.firebase.data.users?.[auth.uid]?.isAdmin)
  const practiceItems = useAppSelector(state => state.firebase.data.practice)
  const activeItemId = useAppSelector(selectActiveItemId)
  const reflectionPrompts = useAppSelector(state => state.firebase.data.reflection)

  // if a user completes a problem set, they have the auth to continue on

  const preSurveyMilestone = useAppSelector(getPreSurveyMilestone)
  const ps1Milestone = useAppSelector(getPS1Milestone)
  const videoMilestone = useAppSelector(getVideoMilestone)
  const ps2Milestone = useAppSelector(getPS2Milestone)
  const distractorMilestone = useAppSelector(getDistractorMilestone)
  const ps3Milestone = useAppSelector(getPS3Milestone)

  // keep activeItemId and activeItem in sync
  useEffect(() => {
    // when activeItemId or practice items change, update activeItem
    if (practiceItems?.[activeItemId]) {
      dispatch(updateBacklog([practiceItems[activeItemId]]))
      dispatch(setActiveItem(practiceItems[activeItemId]))
    }
  }, [practiceItems, activeItemId])

  const sxBody = {
    mx: 'auto' // center content horizontally
  }

  const sxOuter = {
    display: 'flex',
    flexDirection: 'column',
    height: 1,
    width: 1
  }
  const PROBLEM_SET_1 = "/problem_set_1"
  const PROBLEM_SET_2 = "/problem_set_2"
  const PROBLEM_SET_3 = "/problem_set_3"

  const PRE_SURVEY = "/pre_survey"
  const VIDEO = "/video"
  const DISTRACTOR = "/short_breather"
  const POST_SURVEY = "/exit_survey"

  const REPLAY_ONLY = "/replay_only"

  return (
    <Box sx={sxOuter}>
      <TopBar />
      <Box sx={sxBody}>
        <Routes>
          {authExists ?
            <>
              <Route index element={<HomePage />} />
              <Route path={"/home"} element={<HomePage />} />

              {/* <Route path={PRE_SURVEY} element={<PreSurveyPage />} />
              <Route path={PROBLEM_SET_1} element={<PracticeView />} />
              <Route path={VIDEO} element={<VideoPage />} />
              <Route path={PROBLEM_SET_2} element={<PracticeView />} />
              <Route path={DISTRACTOR} element={<DistractorPage />} />
              <Route path={PROBLEM_SET_3} element={<PracticeView />} />
              <Route path={POST_SURVEY} element={<PostSurveyPage />} /> */}

              {/* {preSurveyMilestone ?
                <Route path={PRE_SURVEY} element={<HomePage />} />
              :
                <Route path={PRE_SURVEY} element={<PreSurveyPage />} />
              } */}
              <Route path={PRE_SURVEY} element={<PreSurveyPage />} />
              {preSurveyMilestone ?
                <Route path={PROBLEM_SET_1} element={<PracticeView />} />
              :
                <Route path={PROBLEM_SET_1} element={<HomePage />} />
              }
              {ps1Milestone ?
                <Route path={VIDEO} element={<VideoPage />} />
                :
                <Route path={VIDEO} element={<HomePage />} />
              }
              {videoMilestone ?
                <Route path={PROBLEM_SET_2} element={<PracticeView/>} /> 
                :
                <Route path={PROBLEM_SET_2} element={<HomePage />} />
              }
              {ps2Milestone ?
                <Route path={DISTRACTOR} element={<DistractorPage />} />
                :
                <Route path={DISTRACTOR} element={<HomePage />} />
              }
              {distractorMilestone ? 
                <Route path={PROBLEM_SET_3} element={<PracticeView />} />
                :
                <Route path={PROBLEM_SET_3} element={<HomePage />} />
              }
              {ps3Milestone ?
                <Route path={POST_SURVEY} element={<PostSurveyPage />} />
                :
                <Route path={POST_SURVEY} element={<HomePage />} />
              }
              
              <Route index element={<ReflectionView />} />
              <Route path={AUTHOR_PATH} element={<AuthoringPage />} />

              <Route path={REPLAY_ONLY} element={<ReplayView />} />
            </>
            :
            <>
              <Route index element={<LandingPage />} />
              <Route path={LOG_IN_PATH} element={<LogInPage />} />
              <Route path={SIGN_UP_PATH} element={<SignUpPage />} />
            </>
          }
        </Routes>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column'}} >
          <Typography variant='caption' sx={{ textAlign: 'center', mb: 1, fontWeight: 800 }}>
              {"Code Replayer is currently in beta. If you notice something wrong, need help, or just have a question, please fill out this "}
              <Link href="https://docs.google.com/forms/d/e/1FAIpQLScE53ECeYPKLbv9rkTNmkyHDMLB0aoXigcF8Syh6_cPeQCj9Q/viewform?usp=sf_link">
                  {"form"}
              </Link>
              {" and the research team will look into it."}
          </Typography>
          <Typography variant='caption' sx={{ textAlign: 'center', mb: 1 }}>
              {"Developed at the Code & Cognition Lab, University of Washington Information School."}
          </Typography>
      </Box>
    </Box>
  )
}

export default App
