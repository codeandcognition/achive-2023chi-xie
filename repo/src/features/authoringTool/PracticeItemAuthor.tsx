import React, { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import Typography from '@mui/material/Typography'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import { useFirebaseConnect, useFirebase } from 'react-redux-firebase'
import TextField from '@mui/material/TextField'
import ReactMarkdown from 'react-markdown'
import IconButton from '@mui/material/IconButton'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import Button from '@mui/material/Button'
import AceEditor from 'react-ace'
import Alert from '@mui/material/Alert'
import 'ace-builds/src-noconflict/mode-python'
import 'ace-builds/src-noconflict/theme-monokai'


import { PracticeItem, TestCase, TestCases } from '../../constants/dbSchemas'
import { COLLECTION_ITEMS, getPracticeItemsPath } from '../../utils/dbPaths'
import { useAppSelector } from '../../app/hooks'
import { range, stringToArray } from '../../utils/helperFunctions'
import _ from 'lodash'
import { Provider } from 'react-redux'

const NEW_ITEM_FLAG = 'NEW_ITEM'
const BLANK_TEXT = ''

const sxContainer = {
  my: 1,
  minWidth: '200px'
}

const sxArgsContainer = {
  display: 'flex',
  flexDirection: 'row',
  width: 600,
  m: 1
}

/**
 * Component that Manages Creating and Editing of Practice Items
 */
const PracticeItemAuthor = () => {
  const firebase = useFirebase()

  // sync collection from firebase to redux
  useFirebaseConnect({
    path: COLLECTION_ITEMS
  })

  const existingPracticeItems = useAppSelector((state) => state.firebase.data.practice)

  // get data from items
  const [selectedItemId, setSelectedItemId] = useState(BLANK_TEXT)

  // name/id of practice item
  const [name, setName] = useState(BLANK_TEXT)

  const [problemSet, setProblemSet] = useState(BLANK_TEXT)

  const [prompt, setPrompt] = useState(BLANK_TEXT)

  const [order, setOrder] = useState(0)

  const [numArgs, setNumArgs] = useState(0)

  const [args, setArgs] = useState<Array<any>>([])

  const [argTypes, setArgTypes] = useState<Array<any>>([])

  const [numTestCases, setNumTestCases] = useState(0)

  const [testCaseInputs, setTestCaseInputs] = useState<Array<any>>([])

  // length should equal length of testCaseInputs
  const [expectedOutputs, setExpectedOutputs] = useState<Array<string | number | any[]>>([])

  // const [testCases, setTestCases] = useState<Array<TestCase>>([])

  const [exampleCode, setExampleCode] = useState('')
  // state flags
  // if true, creating new item (not editing existing one)
  const [isCreatingNewItem, setIsCreatingNewItem] = useState(false)

  // if true, there are unsaved changed
  const [hasUnsavedEdits, setHasUnsavedEdits] = useState(false)

  // when true, data not valid (only checked on submit)
  const [dataNotValid, setDataNotValid] = useState(false)

  useEffect(() => {
    // if editting existing item, set data
    if (selectedItemId !== BLANK_TEXT && selectedItemId !== NEW_ITEM_FLAG) {
      // TODO: set values
    }
  },
    [selectedItemId])

  // handlers

  const handleItemChange = (event: SelectChangeEvent) => {
    // change selected item
    setSelectedItemId(event.target.value as string)
  }

  // update item name
  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value)
  }

  //update problem set
  const handleProblemSetChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setProblemSet(event.target.value)
  }

  const handleOrderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setOrder(+event.target.value)
  }

  const handlePromptChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPrompt(event.target.value)
  }

  const handleNumArgsChange = (shouldIncrement: boolean) => {
    if (shouldIncrement) {
      setNumArgs(numArgs + 1)
    } else {
      // can't go below 0 args!
      setNumArgs(Math.max(numArgs - 1, 0))
    }
  }

  const handleNumTestCases = (shouldIncrement: boolean) => {
    if (shouldIncrement) {
      setNumTestCases(numTestCases + 1)
    } else {
      // can't go below 0 args!
      setNumTestCases(Math.max(numTestCases - 1, 0))
    }
  }

  // handle change to specific argument
  const handleArgsChange = (event: React.ChangeEvent<HTMLInputElement>, ind: number) => {
    // copy array
    const argsCopy = [...args]

    // update appropriate value
    argsCopy[ind] = event.target.value

    // update state
    setArgs(argsCopy)
  }

  const handleArgTypeChange = (event: SelectChangeEvent, ind: number) => {
    // copy array
    const argTypesCopy = [...argTypes]

    // update appropriate value
    argTypesCopy[ind] = (event.target.value as string)

    // update state
    setArgTypes(argTypesCopy)
  }

  // handle change to test case
  const handleTestInputsChange = (event: React.ChangeEvent<HTMLInputElement>, ind: number) => {
    // copy array
    const testCaseInputsCopy = [...testCaseInputs]

    // update appropriate value
    testCaseInputsCopy[ind] = event.target.value

    // update state
    setTestCaseInputs(testCaseInputsCopy)
  }

  // handle change to expected output
  const handleExpectedOutcomeChange = (event: React.ChangeEvent<HTMLInputElement>, ind: number) => {
    // copy array
    const expectedOutputsCopy = [...expectedOutputs]

    // update appropriate value
    expectedOutputsCopy[ind] = event.target.value

    // update state
    setExpectedOutputs(expectedOutputsCopy)
  }


  // handle update to example solution
  const handleCodeChange = (newValue: string, event: any) => {
    setExampleCode(newValue)
  }

  // ensure item data is correct form
  const validateItemData = () => {

    // item id must be selected
    if (selectedItemId.length < 1) {
      return false
    }

    // must have name
    if (name.length < 1) {
      return false
    }

    // must have prmpt
    if (prompt.length < 1) {
      return false
    }

    // must be at least 1 arg
    if (numArgs < 1) {
      return false
    }

    // length of args should === length of arg types
    if (numArgs !== args.length || numArgs !== argTypes.length) {
      return false
    }

    // at least 1 test case
    if (numTestCases < 1) {
      return false
    }

    // length of inputs must equal numTestCases (expectedOutputs may be 1 off if last expected output is empty string)
    if (numTestCases !== testCaseInputs.length) {
      return false
    }

    // must have example code
    if (exampleCode.length < 1) {
      return false
    }

    return true
  }

  // Create test cases from testCaseInputs and expectedOutput
  const testCasesToString = (): TestCases => {
    const output: TestCases = {}
    range(numTestCases) // array from 0 to numTestCases-1 (or [] if numTestCases is 0)
      .forEach((ind) => {
        // key for test case is t0, t1, ...
        const testCaseKey = `t${ind}`
        const testCase: TestCase = {
          // splits input into array of strings and numbers
          inputs: stringToArray(testCaseInputs[ind]),

          // covers edge case of last expected output being left blank means expected output is empty string
          outputExpected: (_.isUndefined(expectedOutputs[ind]) ? '' : expectedOutputs[ind])
        }
        output[testCaseKey as keyof TestCases] = testCase
      })
    return output
  }

  const handleSubmit = () => {
    if (!validateItemData()) {
      setDataNotValid(true)
    } else {
      setDataNotValid(false)

      const practiceItem: PracticeItem = {
        name,
        problem_set: problemSet,
        order: order,
        prompt,
        args,
        argTypes,
        exampleSolution: exampleCode,
        testCases: testCasesToString()
      }

      // if new item, push new item
      if (selectedItemId === NEW_ITEM_FLAG) {
        const nameNoSpaces = name.replace(/ /g, '')
        // TODO: ensure no collision w/ existing item

        // push new item to firebase
        firebase.set(getPracticeItemsPath(nameNoSpaces), practiceItem)
      } else { //if updating existing value, push update to existing item
        firebase.set(getPracticeItemsPath(selectedItemId), practiceItem)
      }
    }
  }

  // setting argument name and types based on number of arguments
  const argsInputs = (
    range(numArgs) // array from 0 to numArgs-1 (or [] if numArgs is 0)
      .map((ind) => {
        return (
          <Box key={ind} sx={sxArgsContainer}>
            <TextField label='Arg Name' value={args[ind]} onChange={(event: React.ChangeEvent<HTMLInputElement>) => handleArgsChange(event, ind)} />

            <FormControl sx={{ width: 150, mx: 1 }}>
              <InputLabel id="select-arg-type-label">Arg Type</InputLabel>
              <Select
                labelId="arg-type-select-label"
                id="arg-type-select"
                value={_.isUndefined(argTypes[ind]) ? '' : argTypes[ind]}
                label="Arg Type"
                onChange={(event: SelectChangeEvent) => { handleArgTypeChange(event, ind) }}
              >
                <MenuItem value='str'>string</MenuItem>
                <MenuItem value='int'>int</MenuItem>
                <MenuItem value='float'>float</MenuItem>
                <MenuItem value='list'>list</MenuItem>
                <MenuItem value='bool'>bool</MenuItem>
              </Select>
            </FormControl>
          </Box>
        )
      })
  )

  // textfields to collect test case inputs and expected outputs
  const testCases = (
    range(numTestCases) // array from 0 to numTestCases-1 (or [] if numTestCases is 0)
      .map((ind) => {
        return (
          <Box key={ind} sx={sxArgsContainer}>
            <TextField
              label='Input Args'
              value={testCaseInputs[ind]}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => handleTestInputsChange(event, ind)}
              helperText={`(separated by ;, no quotes) e.g. argString;23`}
            />
            <TextField
              label='Expected Output'
              value={expectedOutputs[ind]}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => handleExpectedOutcomeChange(event, ind)}
              sx={{ mx: 1 }}
            />
          </Box>
        )
      })
  )

  return (
    <Box sx={{ display: "flex",
               flexDirection: "column",
               width: "75%",
               justifyContent:
               "left",
               alignItems: "left",
               m: "4em"
            }}>
      <Typography variant='h1'>Create/Edit Items</Typography>
      <FormControl fullWidth>
        <InputLabel id="select-practice-item-label">Item</InputLabel>
        <Select
          labelId="practice-item-select-label"
          id="practice-item-select"
          value={selectedItemId}
          label="Select Practice Item"
          onChange={handleItemChange}
          sx={sxContainer}
        >
          {_.isObject(existingPracticeItems) &&
            Object.keys(existingPracticeItems).map((itemId, index) => { return (<MenuItem key={index} value={itemId}>{itemId}</MenuItem>) })}
          <MenuItem value={NEW_ITEM_FLAG}>(create new problem)</MenuItem>
        </Select>
      </FormControl>

      <TextField id='problem-name' label='Problem Name' value={name} onChange={handleNameChange} sx={sxContainer} fullWidth />

      <TextField id='problem-set-name' label='Assign to problem set' value={problemSet} onChange={handleProblemSetChange} sx={sxContainer} fullWidth />

      <TextField id='item-order' label='Define order in problem set' value={order} onChange={handleOrderChange} sx={sxContainer} fullWidth />

      <TextField id='problem-prompt' label='Prompt (in Markdown)' value={prompt} onChange={handlePromptChange} sx={sxContainer} multiline rows={4} fullWidth />

      <Box sx={sxContainer}>
        <Typography>Prompt rendered in markdown:</Typography>
        <ReactMarkdown>{prompt}</ReactMarkdown>
      </Box>

      <Box sx={sxArgsContainer}>
        <Typography>Arguments</Typography>
        <IconButton onClick={() => handleNumArgsChange(false)}>
          <RemoveIcon />
        </IconButton>
        <IconButton onClick={() => handleNumArgsChange(true)}>
          <AddIcon />
        </IconButton>
      </Box>

      {argsInputs}

      <Box sx={sxArgsContainer}>
        <Typography>Test Cases</Typography>
        <IconButton onClick={() => handleNumTestCases(false)}>
          <RemoveIcon />
        </IconButton>
        <IconButton onClick={() => handleNumTestCases(true)}>
          <AddIcon />
        </IconButton>
      </Box>

      {testCases}

      <Typography>Example solution (including function declaration):</Typography>
      <AceEditor
        placeholder='write example solution here'
        mode='python'
        onChange={handleCodeChange}
        fontSize={14}
        height='400px'
        theme='monokai'
        value={exampleCode}
      />

      {dataNotValid &&
      <Alert severity="error">Sorry, changes were not saved to db because data was not valid. Please make changes and try to submit again.</Alert>
      }

      <Button
        type='submit'
        size='large'
        variant='contained'
        onClick={handleSubmit}
        sx={{ m: "10px"}}
      >
        Add/Update Item
      </Button>
    </Box>
  )
}

export default PracticeItemAuthor