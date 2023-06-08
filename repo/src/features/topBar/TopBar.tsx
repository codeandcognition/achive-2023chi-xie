import React, { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import _ from 'lodash'
import { Link } from 'react-router-dom'
import { isLoaded, isEmpty } from 'react-redux-firebase'

import CodeReplayIcon from '../codeReplayIcon/CodeReplayIcon'
import { useAppSelector } from '../../app/hooks'
import AccountButton from './AccountButton'
import { HOME_PATH } from '../../constants/paths'
import SideDrawer from './SideDrawer'

// side drawer width in pixels
const drawerWidth = 240

const TopBar = () => {
  // get auth from firebase slice of redux state
  const auth = useAppSelector(({ firebase }) => firebase.auth)

  // if true, user is signed in
  const authExists = isLoaded(auth) && !isEmpty(auth)

  return (
    <>
      <AppBar position='static'>
        <Toolbar>
          <SideDrawer />
          <Box sx={{ flexGrow: 1 }} >
            <Link to={HOME_PATH} style={{textDecoration: 'none'}}>
              <Box sx={{display: 'flex', flexDirection: 'row', alignItems: 'center', color: 'white'}}>
                <CodeReplayIcon sx={{mr: 0.5}}/>
                <Typography variant='h6' noWrap component='div' sx={{ flexGrow: 1 }}>
                  Code Replayer
                </Typography>
              </Box>
            </Link>
          </Box>
          {authExists && <AccountButton />}
        </Toolbar>
      </AppBar>
    </>
  )
}

export default TopBar
