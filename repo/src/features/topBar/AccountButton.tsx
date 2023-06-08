import React, { useState } from 'react'
import Menu from '@mui/material/Menu'
import IconButton from '@mui/material/IconButton'
import AccountCircle from '@mui/icons-material/AccountCircle'
import MenuItem from '@mui/material/MenuItem'
import { useAppSelector } from '../../app/hooks'
import { isLoaded, isEmpty, useFirebase } from 'react-redux-firebase'
import { useNavigate } from 'react-router-dom'

import { HOME_PATH } from '../../constants/paths'

const AccountButton = () => {
  const firebase = useFirebase()
  const navigate = useNavigate()
  const auth = useAppSelector(({ firebase }) => firebase.auth)
  const authExists = isLoaded(auth) && !isEmpty(auth)

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  }

  const handleClose = () => {
    setAnchorEl(null);
  }

  const handleLogOut = () => {
    // TODO: is this where we can log Session.End on logout?

    // logout of firebase
    firebase.logout()

    // navigate to homepage
    navigate(HOME_PATH)

    // close menu
    handleClose()
  }

  return (
    <>
      <IconButton
        size="large"
        aria-label="account of current user"
        aria-controls="menu-appbar"
        aria-haspopup="true"
        onClick={handleMenu}
        color="inherit"
      >
        <AccountCircle />
      </IconButton>
      <Menu
        id="menu-appbar"
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={handleClose}>profile</MenuItem>
        <MenuItem onClick={handleClose}>about study</MenuItem>
        <MenuItem onClick={handleLogOut}>log out</MenuItem>
      </Menu>
    </>
  )
}

export default AccountButton
