import { useState } from 'react'
import Box from '@mui/material/Box'
import Alert from '@mui/material/Alert'
import IconButton from '@mui/material/IconButton'
import Collapse from '@mui/material/Collapse'
import Button from '@mui/material/Button'
import CloseIcon from '@mui/icons-material/Close'

interface propsAuthFailedAlert {
  open: boolean,
  setOpen: Function,
  message: string
}

const AuthFailedAlert = ({ open, setOpen, message }: propsAuthFailedAlert) => {
  return (
    <Box sx={{ width: '100%' }}>
      <Collapse in={open}>
        <Alert
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => {
                setOpen(false)
              }}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
          sx={{ mb: 2 }}
          severity='error'
        >
          {message}
        </Alert>
      </Collapse>
    </Box>
  )
}

export default AuthFailedAlert
