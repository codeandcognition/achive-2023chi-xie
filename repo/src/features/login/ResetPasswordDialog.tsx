import React, { useState } from 'react'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import { useFirebase } from 'react-redux-firebase'
import { validateEmail } from '../../utils/helperFunctions'
import Alert from '@mui/material/Alert'

import { ALERT_DURATION } from '../../constants/constants'

const ResetPasswordDialog = () => {
  const firebase = useFirebase() // firebase instance

  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')

  // true when password reset failed
  const [resetFailed, setResetFailed] = useState(false)
  const [failMessage, setFailMessage] = useState('')

  // true when password reset successful 
  const [resetSuccess, setResetSuccess] = useState(false)

  const emailValid = validateEmail(email)

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value)
  }

  const handlePasswordReset = () => {
    firebase
      .resetPassword(email)
      .then(() => { // on success
        // close dialoge
        handleClose()

        // update state to show success message
        setResetSuccess(true)

        // after certain time, reset alert disappears
        setTimeout(() => setResetSuccess(false), ALERT_DURATION)
      })
      .catch((err) => { // on error

        // update state to show fail message
        setFailMessage(err.message)
        setResetFailed(true)

        // after certain time, reset alert disappears
        setTimeout(() => setResetFailed(false), ALERT_DURATION)
      })
  }

  return (
    <>
      {resetSuccess &&
        <Alert
          onClose={() => { setResetSuccess(false) }}
          severity='success'
        >
          Reset email sent! Please check your inbox for further instructions.
        </Alert>
      }
      <Button variant='text' onClick={handleClickOpen}>
        Forgot Password?
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Forgot Password?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter your email and we'll email instructions to reset your password.
          </DialogContentText>
          <TextField
            autoFocus
            margin='dense'
            id='name'
            label='Email Address'
            type='email'
            fullWidth
            variant='standard'
            value={email}
            error={!emailValid}
            onChange={handleEmailChange}
            helperText={!emailValid && 'Please enter a valid email address'}
          />
          {resetFailed &&
            <Alert
              onClose={() => { setResetFailed(false) }}
              severity='error'
            >
              {failMessage}
            </Alert>
          }
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={handlePasswordReset}
            disabled={!emailValid}
          >
            Reset Password
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default ResetPasswordDialog
