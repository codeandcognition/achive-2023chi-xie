import { LogEventValues, LogInterface } from '../features/logger/loggerConstants'

export interface UserData {
  coursesEnrolled: boolean[],
  createdAt: string,
  name: string,
  timezone: string,
  isAdmin?: boolean
}

export interface TestCase {
  inputs: Array<string | number>,
  outputExpected: string | number | Array<any>
}

export interface TestCases {
  [testCaseId: string]: TestCase
}

export interface PracticeItem {
  name: string,
  problem_set: string,
  args: string[],
  argTypes: string[],
  prompt: string,
  testCases: TestCases,
  exampleSolution?: string,
  order: number
}

export interface ReflectionItem {
  name: string,
  createdAt: string,
  prompt: string,
  problem_set: string
}

//reflection response collection: reflection_response/[uid]/reflectionItemId/reflectionResponse
export interface ReflectionResponse {
  [x: string]: any
  name: string, //this is the name of the reflection item
  createdAt: string,
  timezone: string,
  response: string,
  prompt: string
}

// keystroke logs collection: ksl/[uid]/[practiceId]/[logId]:LogEventValues
export interface KeyStrokeLog {
  [key: string]: LogInterface
}

//milestone log collection
export interface Milestone {
  completedPreSurvey: boolean,
  completedPS1: boolean,
  completedVideo: boolean,
  completedPS2: boolean,
  completedDistractor: boolean,
  completedPS3: boolean
}

//item status collection
export interface ItemStatus {
  [x: string]: any
  attempted: boolean,
  passed: boolean,
  attempts: number,
  problem_set: string,
  current_code: string,
  reflection_completed: boolean
}