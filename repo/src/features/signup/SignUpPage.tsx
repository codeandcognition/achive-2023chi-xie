import React, { useState } from 'react'
import { useFirebase } from 'react-redux-firebase'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import FormLabel from '@mui/material/FormLabel'
import FormControl from '@mui/material/FormControl'
import FormGroup from '@mui/material/FormGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import Divider from '@mui/material/Divider'
import { Link, useNavigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import FormHelperText from '@mui/material/FormHelperText'
import CircularProgress from '@mui/material/CircularProgress'

import { LOG_IN_PATH, HOME_PATH } from '../../constants/paths'
import { MIN_PASSWORD_LENGTH } from './signUpConstants'
import { validateEmail } from '../../utils/helperFunctions'
import AuthFailedAlert from './AuthFailedAlert'
import { TIME_BETWEEN_AUTH_ATTEMPTS } from '../login/loginConstants'
import { getIsoTime } from '../../utils/helperFunctions'

const SignUpPage = () => {
  const firebase = useFirebase()
  const navigate = useNavigate()

  const [name, setName] = useState('')

  // user inputted email
  const [email, setEmail] = useState('')

  // if email ever changed, sets to true (prevents error from displaying before action)
  const [everChangedEmail, setEverChangedEmail] = useState(false)

  // true if email is valid
  const validEmail = validateEmail(email)

  // stores user inputted password
  const [password, setPassword] = useState('')

  // if password ever changed, sets to true (prevents error from displaying before action)
  const [everChangedPassword, setEverChangedPassword] = useState(false)

  // true if password meets min length
  const validPassword = password.length >= MIN_PASSWORD_LENGTH

  // handling state for courses
  // TODO: courses should come from firebase
  const [coursesEnrolled, setCoursesEnrolled] = useState({
    cse160: false,
    cse163: false,
    csc110: false,
    none: false
  })

  // if any course option checked, sets to true (prevents error from displaying before action)
  const [everCheckedAnyCourse, setEverCheckedAnyCourse] = useState(false)

  // error if options every changed and no option currently selected
  const validCoursesEnrolled = everCheckedAnyCourse && Object.values(coursesEnrolled).filter((v) => v).length > 0;

  // handles checkmark for consent. Required
  const [consented, setConsented] = useState(false)

  // if consent ever checked, sets to true (prevents error from displaying before action)
  const [everChangedConsent, setEverChangedConsent] = useState(false)

  // errors for UI updates (NOT submission). Show error if previously changed & NOT valid
  const errors = {
    email: everChangedEmail && !validEmail,
    password: everChangedPassword && !validPassword,
    coursesEnrolled: everCheckedAnyCourse && !validCoursesEnrolled,
    consent: everChangedConsent && !consented
  }

  // change form validity does not consider whether value ever changed before
  const canSubmit = validEmail && validPassword && validCoursesEnrolled && consented

  // error message after trying to submit data to create firebase profile (not part of form validation)
  const [submitError, setSubmitError] = useState(false)
  const [submitErrorMessage, setSubmitErrorMessage] = useState('')

  // if true, waiting between auth attempts (to prevent too much hammering of auth server)
  const [waitingForAuth, setWaitingForAuth] = useState(false)

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // update name
    setName(event.target.value)
  }

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    //update email
    setEmail(event.target.value)

    // set to true on first action to email
    if (!everChangedEmail) {
      setEverChangedEmail(true)
    }
  }

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // update password
    setPassword(event.target.value)

    // set to true on first action to email
    if (!everChangedPassword) {
      setEverChangedPassword(true)
    }
  }

  // handle change to course selection checkbox
  const handleCourseChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCoursesEnrolled({
      ...coursesEnrolled, // previous state
      [event.target.name]: event.target.checked // change what was checked
    })

    // set to true on first action to any course checkbox
    if (!everCheckedAnyCourse) {
      setEverCheckedAnyCourse(true)
    }
  }

  // handle change to consent checkbox
  const handleConsentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setConsented(event.target.checked)

    // set to true on first action to consent
    if (!everChangedConsent) {
      setEverChangedConsent(true)
    }
  }

  const handleSubmit = () => {
    // reset submission error
    if (submitError) {
      setSubmitError(false)
    }

    setWaitingForAuth(true)

    // credentials to pass in
    const cred = { email, password }

    const [clientTime, clientTimezone] = getIsoTime()

    // additional info to add to users db
    const profile = {
      name: name.length > 0 ? name : 'user', // username defaults to user if not specified
      createdAt: clientTime,
      timezone: clientTimezone,
      coursesEnrolled: coursesEnrolled
    }

    // create new user on firebase
    return firebase
      .createUser(cred, profile)
      .then((userInfo) => {
        // Redirect to the homepage and do not include/replace /signup from history
        navigate(HOME_PATH, { replace: true })
      })
      .catch((error) => {
        // wait certain amount of time between login attempts
        setTimeout(() => setWaitingForAuth(false), TIME_BETWEEN_AUTH_ATTEMPTS)

        // update state to show error
        setSubmitError(true)
        setSubmitErrorMessage(error.message)
      })

  }

  return (
    <>
      <FormControl
        sx={{
          m: 3,
          maxWidth: '800px'
        }}
        component='fieldset'
        variant='standard'
      >
        <Typography variant='h3'>Create your Code Replayer account</Typography>
        <Box>
          <TextField
            autoComplete='given-name'
            name='name'
            fullWidth
            id='name'
            label='Name'
            value={name}
            onChange={handleNameChange}
            autoFocus
            sx={{ m: 1 }}
          />
          <TextField
            required
            fullWidth
            id='email'
            label='Email Address'
            name='email'
            value={email}
            onChange={handleEmailChange}
            error={errors.email}
            autoComplete='email'
            helperText={errors.email && 'input a valid email'}
            sx={{ m: 1 }}
          />
          <TextField
            required
            fullWidth
            value={password}
            error={errors.password}
            onChange={handlePasswordChange}
            name='password'
            label='Password'
            type='password'
            id='password'
            autoComplete='new-password'
            helperText={errors.password && 'input a password of at least 8 characters'}
            sx={{ m: 1 }}
          />

          <FormControl
            required
            error={errors.coursesEnrolled}
            component='fieldset'
            variant='standard'
            sx={{ m: 1, my: 2 }}
          >
            <FormLabel component='legend'>Are you currently enrolled in any of these courses?</FormLabel>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox checked={coursesEnrolled.cse160} onChange={handleCourseChange} name='cse160' />
                }
                label='UW CSE 160'
              />
              <FormControlLabel
                control={
                  <Checkbox checked={coursesEnrolled.cse163} onChange={handleCourseChange} name='cse163' />
                }
                label='UW CSE 163'
              />
              <FormControlLabel
                control={
                  <Checkbox checked={coursesEnrolled.csc110} onChange={handleCourseChange} name='csc110' />
                }
                label='Seattle Central CSC 110'
              />
              <FormControlLabel
                control={
                  <Checkbox checked={coursesEnrolled.none} onChange={handleCourseChange} name='none' />
                }
                label='(not enrolled in any of above courses)'
              />
            </FormGroup>
            {errors.coursesEnrolled && <FormHelperText>Please select at least one respone</FormHelperText>}
          </FormControl>

          <Box>
            <Divider></Divider>
            <Typography sx={{ fontSize: 22, pt: '.75em' }}>
              Consent
            </Typography>
            <Typography sx={{pt: '5px'}}>
              Code Replayer is a research project being conducted by the University of Washington to help students learn to write code. Data you share may be analyzed by trained researchers, but will never be shared with anyone in such way that you could be easily reidentified.
            </Typography>
            <Typography sx={{ pt: '5px' }}>
              This tool will also record and store data about keystroke logs, which are keys entered, modified, or deleted in the tool's code editor. Data collected through this method will also be anonymized and analyzed by trained researchers, and will never be shared with anyone in such a way that you could easily be reidentified.
            </Typography>
            <FormControl
              error={errors.consent}
            >
              <FormControlLabel
                control={<Checkbox value='consentToStudy' checked={consented} onChange={handleConsentChange} color='primary' />}
                label='I consent to participate in this research study.'
              />
              {errors.consent && <FormLabel component='legend'>You must consent to participate in this study to create an account.</FormLabel>}
            </FormControl>
          </Box>
          <AuthFailedAlert
            open={submitError}
            setOpen={setSubmitError}
            message={submitErrorMessage}
          />
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
              disabled={!canSubmit || waitingForAuth}
              onClick={handleSubmit}
            >
              {waitingForAuth ? <CircularProgress color='primary' /> : 'Sign Up'}
            </Button>
          </Box>

          <Box sx={{ textAlign: 'center' }}>
            <Link to={LOG_IN_PATH}>Already have an account? Log in.</Link>
          </Box>
        </Box>
      </FormControl>
    </>
  )
}

export default SignUpPage
