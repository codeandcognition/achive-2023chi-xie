import React from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import { useNavigate } from 'react-router-dom'
import { LOG_IN_PATH, SIGN_UP_PATH } from '../../constants/paths'

import CodeReplayIcon from '../codeReplayIcon/CodeReplayIcon'

// sx shared among groups of info
const sxGroups = {
  my: 2 // vertical margin
}

const LandingPage = () => {
  // hook to handle navigation of routes
  const navigate = useNavigate()

  const clickSignUp = () => {
    // go to sign up page, add to window history
    navigate(SIGN_UP_PATH)
  }
  
  const clickLogIn = () => {
    // go to log in page, add to window history
    navigate(LOG_IN_PATH)
  }

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
            <Typography fontWeight={'bold'}>Learn from your code replay today.</Typography>
            <Button variant='contained' color='primary' size='large' onClick={clickSignUp}>
              sign up
            </Button>
          </Box>

          <Box sx={{ ...sxGroups }}>
            <Typography variant='body1'>Already have an account?</Typography>
            <Button variant='outlined' size='large' onClick={clickLogIn}>
              log in
            </Button>
          </Box>

        </Box>
      </Box>
    </Box>
  )
}

export default LandingPage