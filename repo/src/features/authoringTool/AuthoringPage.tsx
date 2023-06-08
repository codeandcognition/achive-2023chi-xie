import React, { useState } from 'react'
import HomePage from '../homePage/HomePage'

import PracticeItemAuthor from './PracticeItemAuthor'

/**
 * Container for Authoring Tool
 * @returns
 */
const AuthoringPage: React.FC = () => {
  return (
    // TODO: Uncomment this to enable author tool
    // <PracticeItemAuthor />
    <HomePage />
  )
}

export default AuthoringPage
