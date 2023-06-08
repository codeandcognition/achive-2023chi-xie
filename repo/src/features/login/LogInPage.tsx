import React, { useState } from 'react'
import FormControl from '@mui/material/FormControl'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import { useFirebase } from 'react-redux-firebase'
import { Link, useNavigate } from 'react-router-dom'
import CircularProgress from '@mui/material/CircularProgress'

import { HOME_PATH, SIGN_UP_PATH } from '../../constants/paths'
import AuthFailedAlert from '../signup/AuthFailedAlert'
import { TIME_BETWEEN_AUTH_ATTEMPTS } from './loginConstants'
import ResetPasswordDialog from './ResetPasswordDialog'

const LogInPage = () => {
  const firebase = useFirebase() // firebase instance
  const navigate = useNavigate() // to navigate to new page

  // user inputted email
  const [email, setEmail] = useState('')

  // stores user inputted password
  const [password, setPassword] = useState('')

  // error message after trying to submit data to create firebase profile (not part of form validation)
  const [submitError, setSubmitError] = useState(false)
  const [submitErrorMessage, setSubmitErrorMessage] = useState('')

  // if true, waiting between auth attempts (to prevent too much hammering of auth server)
  const [waitingForAuth, setWaitingForAuth] = useState(false)

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    //update email
    setEmail(event.target.value)
  }

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // update password
    setPassword(event.target.value)
  }

  const handleSubmit = () => {
    // reset submission error
    if (submitError) {
      setSubmitError(false)
    }

    setWaitingForAuth(true)

    // credentials to pass in
    const creds = { email, password }

    // try to login to firebase
    return firebase
      .login(creds)
      .then((userInfo) => {
        // Redirect to the homepage and do not include/replace /logi  from history
        navigate(HOME_PATH, { replace: true })
      })
      .catch((error) => {
        // wait certain amount of time between login attempts, then update waitingForAuth
        setTimeout(() => setWaitingForAuth(false), TIME_BETWEEN_AUTH_ATTEMPTS)

        // update state to show error
        setSubmitError(true)
        setSubmitErrorMessage(error.message)
      })
  }

  return (
    <>
      <AuthFailedAlert
        open={submitError}
        setOpen={setSubmitError}
        message={submitErrorMessage}
      />
      <FormControl
        sx={{
          m: 3,
          maxWidth: '800px'
        }}
        component='fieldset'
        variant='standard'
      >
        <Typography variant='h3'>Log back in to your Code Replayer account</Typography>
        <Box>
          <TextField
            required
            fullWidth
            id='email'
            label='Email Address'
            name='email'
            value={email}
            onChange={handleEmailChange}
            autoComplete='email'
            sx={{ m: 1 }}
          />
          <TextField
            required
            fullWidth
            value={password}
            onChange={handlePasswordChange}
            name='password'
            label='Password'
            type='password'
            id='password'
            autoComplete='new-password'
            sx={{ m: 1 }}
          />
          <ResetPasswordDialog />
        </Box>

        <Box
          sx={{
            my: 4,
            display: 'flex',
            justifyContent: 'center'
          }}
        >
          <Button
            type='submit'
            size='large'
            variant='contained'
            onClick={handleSubmit}
            disabled={waitingForAuth}
          >
            {waitingForAuth ? <CircularProgress color="primary" /> : 'Log In'}
          </Button>
        </Box>
      </FormControl>

      <Box sx={{ textAlign: 'center' }}>
        <Link to={SIGN_UP_PATH}>Don't have an account? Sign up for one!</Link>
      </Box>
    </>
  )
}

export default LogInPage
