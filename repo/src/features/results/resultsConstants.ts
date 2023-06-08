import { PracticeItem } from '../../constants/dbSchemas'

export interface TestCaseResponse {
  correct: boolean,
  output_actual: any,
  error?: string
}

export interface ResultsResponse {
  [timestamp:string]: {
        [testCaseId: string]: {
            outputActual: any, // when error thrown, message shown here for first and only test case
            correct: boolean, // true if this test case passed
            error?: string // type of error
        }
    }
}

// when this timestamp in use, then no real response
export const DUMMY_TIMESTAMP = -1

/**
 * Given item and test case id, return string of code run and expected output
 * @param item practice item with test case
 * @param testCaseId index of test case
 * @returns [string of function name with args passed in, expected output]
 */
export const testCaseToString = (item: PracticeItem, testCaseId: string | number):[string, string|number|any[]] => {
  // array of arguments passed in on this call
  const itemInfo = item.testCases[testCaseId]

  // get arguments passed into testcase
  const args = itemInfo.inputs

  // args to string
  const argsToString = args.join(', ')

  // string of function name with args passed in (e.g. string_times('hi', 2))
  const codeRun = `${item.name}(${argsToString})`

  // expected output after running code
  const expectedOutput = itemInfo.outputExpected

  return [codeRun, expectedOutput]
}