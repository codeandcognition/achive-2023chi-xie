import React, { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import MenuIcon from '@mui/icons-material/Menu'
import Typography from '@mui/material/Typography'
import _ from 'lodash'
import { isLoaded, isEmpty } from 'react-redux-firebase'
import { useLocation } from 'react-router-dom'

import ItemLister from '../items/ItemLister'
import { selectActiveItemId } from '../items/itemsSlice'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { PRACTICE_PATH } from '../../constants/paths'
import { selectProblemSet, setProblemSet } from '../problemSets/problemSetsSlice'

const SideDrawer = () => {
  const activeItemName = useAppSelector(selectActiveItemId)
  const auth = useAppSelector(({ firebase }) => firebase.auth)
  const authExists = isLoaded(auth) && !isEmpty(auth)

  const location = useLocation()

  const [open, setOpen] = useState(false)

  const itemStatus = useAppSelector(state => state.firebase.data.item_status)
  const currentProblemSet = useAppSelector(selectProblemSet)

  const PS1_PATH = '/problem_set_1'
  const PS2_PATH = '/problem_set_2'
  const PS3_PATH = '/problem_set_3'

  const dispatch = useAppDispatch()

  // listen for change to auth or active item (name)
  useEffect(() => {
    // if in practice, logged in, & no item selected, open menu to select next item
    // if (location.pathname === PRACTICE_PATH && (location.pathname === PRACTICE_PATH || location.pathname === PS1_PATH || location.pathname === PS2_PATH || location.pathname === PS3_PATH) && authExists && _.isEmpty(activeItemName)) {
    //   setOpen(true)
    // } else { // if (new) item selected, close drawer
    //   setOpen(false)
    // }
    setOpen(false)
  }, [activeItemName, authExists, location, itemStatus, currentProblemSet])
  
  useEffect(() => {
    if (location.pathname === PS1_PATH){
      dispatch(setProblemSet("PS1"))
    }
    if (location.pathname === PS2_PATH){
      dispatch(setProblemSet("PS2"))
    }
    if (location.pathname === PS3_PATH){
      dispatch(setProblemSet("PS3"))
    }

  }, [currentProblemSet])

  const toggleDrawer = (isOpen: boolean) =>
    (event: React.KeyboardEvent | React.MouseEvent) => {
      if (
        // tab and shift+tab goes through items in list, so ignore
        event.type === 'keydown' &&
        ((event as React.KeyboardEvent).key === 'Tab' ||
          (event as React.KeyboardEvent).key === 'Shift')
      ) {
        return
      }
      setOpen(isOpen)
    }

  const drawerContents = (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      {_.isEmpty(activeItemName) &&
        <Typography paragraph>
          Select a problem to practice:
        </Typography>
      }
      <ItemLister />
    </Box>
  )

  return (
    <>
      <IconButton
        color='inherit'
        aria-label='open drawer'
        onClick={toggleDrawer(true)}
        edge='start'
        sx={{ mr: 2, ...(open && { display: 'none' }) }}
      >
        <MenuIcon />
      </IconButton>
      <Drawer
        anchor={'left'}
        open={open}
        onClose={toggleDrawer(false)}
      >
        {drawerContents}
      </Drawer>
    </>
  )
}

export default SideDrawer

