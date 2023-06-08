import React, { useEffect, useState } from 'react'
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material'
import _ from 'lodash'

import CheckIcon from '@mui/icons-material/Check'
import WarningIcon from '@mui/icons-material/Warning'

import { selectActiveItem, selectActiveItemId } from '../items/itemsSlice'
import { selectResults, clearResults } from './resultsSlice'
import { ResultsResponse } from './resultsConstants'
import { useAppSelector, useAppDispatch } from '../../app/hooks'
import { testCaseToString } from './resultsConstants'
import { PracticeItem } from '../../constants/dbSchemas'

export interface Row {
  codeRun: string | number,
  expectedOutput: any,
  actualOutput: any,
  correct: boolean | null
}

const ResultsViewer = () => {
  // results after running code
  const results = useAppSelector(selectResults)

  // name of active item
  const activeItemName = useAppSelector(selectActiveItemId)

  // info about active item
  const activeItem = useAppSelector(selectActiveItem)

  // for dispatching updates to redux
  const dispatch = useAppDispatch()

  // results data that goes into each row
  const [rows, setRows] = useState<Row[]>([])

  // update rows if activeItem or results change
  useEffect(() => {
    setRows(populateResults(activeItem, results))
  }, [activeItem, results])

  // if activeItemName changes, clear results
  useEffect(() => {
    dispatch(clearResults())
  }, [activeItemName, dispatch])

  // given item, return code run and expected output without results
  const populateTestCases = (activeItem: PracticeItem) => {
    // if no active item has no name, say it's not there
    if (activeItem.name.length < 1) {
      return []
    }

    // for each test case, get code run and expected output
    return (Object.keys(activeItem.testCases).map((testCaseId: string | number, ind: number) => {
      // get code run
      const [codeRun, expectedOutput] = testCaseToString(activeItem, testCaseId)

      // actual output and correct are both empty
      return { codeRun, expectedOutput, actualOutput: '', correct: null }
    })
    )

  }

  // return array with data of result of each test case
  const populateResults = (activeItem: PracticeItem, results: ResultsResponse) => {

    // if no active item has no name, say it's not there
    if (activeItem.name.length < 1) {
      return []
    }
    // get first (currently only) value result stored
    const resultsByCase = Object.values(results)[0]

    // if no results, just show test cases
    if (_.isEmpty(resultsByCase)) {
      return populateTestCases(activeItem)
    }

    const testCaseIds = Object.keys(resultsByCase)

    // for each test case, create result
    return (testCaseIds.map((testCaseId: string, ind: number) => {
      const [codeRun, expectedOutput] = testCaseToString(activeItem, testCaseId)

      // get result for test cases
      const result = Object.values(results)[0][testCaseId]

      const actualOutput = result.outputActual
      const correct = result.correct

      return { codeRun, expectedOutput, actualOutput, correct }
    }))

  }

  const correctIcon = (<CheckIcon />)
  const wrongIcon = (<WarningIcon color='secondary' />)

  return (
    <TableContainer component={Paper}>
      <Table aria-label='simple table'>
        <TableHead>
          <TableRow>
            <TableCell align='center'>Code Run</TableCell>
            <TableCell align='center'>Expected Output</TableCell>
            <TableCell align='center'>Actual Output</TableCell>
            <TableCell align='center'>Correct?</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, ind) => {
            return (
              <TableRow
                key={ind}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component='th' scope='row'>
                  {row.codeRun}
                </TableCell>
                <TableCell align='center'>{"" + row.expectedOutput}</TableCell>
                <TableCell align='center'>{"" + row.actualOutput}</TableCell>
                <TableCell align='center'>{_.isNull(row.correct) ? '' : (row.correct ? correctIcon : wrongIcon)}</TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default ResultsViewer