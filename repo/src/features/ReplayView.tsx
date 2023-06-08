import _ from 'lodash'
import { useFirebase, useFirebaseConnect } from 'react-redux-firebase'
import React, { useState, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { SelectChangeEvent } from '@mui/material/Select'
import { Box,
    Typography,
    InputLabel,
    FormControl,
    MenuItem,
    Select
   } from '@mui/material'


import { selectCurrentCode, selectStarterCode } from './codeEditor/codeEditorSlice'
import { selectActiveItem, selectActiveItemId, setActiveItemId } from './items/itemsSlice'
import { ResultsResponse } from './results/resultsConstants'
import CodeEditor from './codeEditor/CodeEditor'
import ReplayControls from './codeReplayer/ReplayControls'
import ResultsViewer from './results/ResultsViewer'
import { COLLECTION_ITEMS, COLLECTION_ITEM_STATUSES, getItemStatusPath, getKslPath } from '../utils/dbPaths'
import ItemPrompt from './items/ItemPrompt'
import { selectIfItemPassed, selectItemStatus, setCurrentItemId, setPassed, updateStatus } from './progress/itemStatusSlice'
import { apiUrl } from '../config'
import { setResults } from './results/resultsSlice'

const SELECT_PLACEHOLDER = ""

const sxContainer = {
    my: 1,
    minWidth: '100px'
  }

const ReplayView: React.FC = () => {
    /**
     * -- PLANNING -- TODO: REMOVE WHEN FULLY IMPLEMENTED
     * data required for this view
     *  - list of practice items (for dropdown select)
     *  - keystroke logs for user
     *      - auth/uid
     *  - item status for this item
     * 
     * editor state --
     *  - current code -> code from first KSL
     *  - timestamps for replayer? -> handled by ReplayControls
     * 
     * results viewer state -- 
     *  - potentially: run tests to see their output in results viewer?
     * 
     * nice to have -- DONE
     *  - something displaying if item was passed + number of attempts recorded
     */

    // sync collection from firebase to redux
    useFirebaseConnect({
        path: COLLECTION_ITEMS // practice items
    })

    useFirebaseConnect({
        path: COLLECTION_ITEM_STATUSES
    })

    // get auth from firebase slice of redux state
    const uid = useAppSelector(({ firebase }) => firebase.auth.uid)

    // typescript friendly dispatch
    const dispatch = useAppDispatch()

    // list of practice items in firebase
    const practiceItems = useAppSelector(state => state.firebase.data.practice)

    // state of editor in first KSL
    const starterCode = useAppSelector(selectStarterCode)

    // redux state for current state of code displayed in replayer
    const currentCode = useAppSelector(selectCurrentCode)
    
    // access redux store for current active item (as selected by dropdown)
    const activeItem = useAppSelector(selectActiveItem)

    // get active item id
    const activeItemId = useAppSelector(selectActiveItemId)

    // probably not necessary
    useFirebaseConnect(getItemStatusPath(uid, activeItem.problem_set, activeItemId))

    // whether or not user correctly solved this item
    const itemPassed = useAppSelector(selectIfItemPassed) // TODO: not reliable, get from FB if possible

    // status of current focused item
    const itemStatus = useAppSelector(state => state.firebase.data.item_status)

    // name of selected item in dropdown menu
    const [selectedItemId, setSelectedItemId] = useState(SELECT_PLACEHOLDER)

    // sync logs from firebase (for this user and item) into redux
    useFirebaseConnect(getKslPath(uid, activeItemId))

    // keystroke logs for current item
    const logs = useAppSelector(state => state.firebase.data.ksl)

    // when new item selected, update redux state
    const handleItemSelect = (itemId: string) => {
        dispatch(setActiveItemId(itemId))
    }

    const handleItemChange = (event: SelectChangeEvent) => {
        // change selected item
        setSelectedItemId(event.target.value as string)
        handleItemSelect(event.target.value as string)
    }

    // useEffect(() => {
    //     // if editting existing item, set data
    //     if (selectedItemId !== SELECT_PLACEHOLDER) {
    //       // TODO: update activeItem, starterCode, currentCode
    //     }
    // }, [selectedItemId])

    // run tests on activeItem load
    useEffect(() => {
        if (activeItem.name !== '') {
            dispatch(setCurrentItemId(activeItem.name))
            dispatch(setPassed(itemStatus[uid][activeItem.problem_set][activeItemId].passed))
            runCheck(activeItem.name)
        }
    }, [activeItem])

    // for later: may need useEffect to rerender codeEditor if new item is selected
    
    const getAttemptsForItem = (itemId: string, problemSet: string) => {
        if (itemStatus && activeItem.name !== "") {
            return itemStatus[uid][problemSet][activeItem.name].attempts
        }
    }

    const sxOuter = {
        display: 'flex',
        width: '90vw',
        maxWidth: '1400px',
        margin: 1,
        padding: 1,
        // background color, color, and border color differ based on dark theme or not
        bgcolor: (theme: any) => (theme.palette.mode === 'dark' ? '#101010' : '#fff'),
        color: (theme: any) =>
          theme.palette.mode === 'dark' ? 'grey.300' : 'grey.800',
        borderColor: 'grey.800',
    
        // for testing, can remove later
        border: '1px solid',
        borderRadius: 2,
    
        // font size and weight
        fontSize: '0.875rem',
        fontWeight: '700',
    }

    // run a check on the tests for current item for last code snapshot and display in ResultsViewer 
    const runCheck = (itemId: string) => {
        if (itemStatus && uid && itemId && activeItem.name !== '') {
            const timestamp = Date.now()
            
            // create JSON object to pass in as request body. JSON requires DOUBLE QUOTES
            const body = {
                "practiceItem": { // grabbing only necessary items to pass send data
                    name: activeItem.name,
                    argTypes: activeItem.argTypes,
                    args: activeItem.args,
                    testCases: activeItem.testCases
                },
                "timestamp": timestamp,

                // most recent code snapshot from item status of selected item
                "code": itemStatus[uid][activeItem.problem_set][activeItem.name].current_code
            }

            // setting up all request options
            const options: RequestInit = {
                method: "POST",
                mode: "cors",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
            }

            fetch(apiUrl, options)
                .then((response) => response.json())
                .then((data: ResultsResponse) => {
                    // store results in redux
                    dispatch(setResults(data))
                })
                .catch(error => console.log(error))
        }
    }
    
    return (
        <>
            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', mt: 1 }} >
                <FormControl sx={{ display: 'flex', width: '90vw', maxWidth: "300px", margin: 1}} size='medium' >
                    <InputLabel id="select-practice-item-label">Select an item</InputLabel>
                    <Select
                        labelId="practice-item-select-label"
                        id="practice-item-select"
                        value={selectedItemId}
                        label="Select an Item"
                        onChange={handleItemChange}
                        sx={sxContainer}
                    >
                        {_.isObject(practiceItems) &&
                            Object.keys(practiceItems).map((itemId, index) => {
                                return (<MenuItem key={index} value={itemId}>{itemId + ' | ' + practiceItems[itemId].problem_set}</MenuItem>)
                            })
                        }
                    </Select>
                </FormControl>
                <Box>
                    <Typography sx={{ fontWeight: '700' }}>
                        {"Item Statistics:"}
                    </Typography>
                    <Typography>
                        {(itemStatus && uid && activeItem.name !== "")
                        ?
                        "Item Passed: " + String(itemPassed).toUpperCase() + " - " + getAttemptsForItem(activeItem.name, activeItem.problem_set) + " attempt(s)"
                        :
                        "Please select an item to view user statistics."}
                    </Typography>
                    
                </Box>
            </Box>
            <Box sx={{ flexDirection: 'column', ...sxOuter }}>
                <Box sx={{ fontSize: "1rem", fontWeight: "400", color: "black" }} >
                    <ItemPrompt />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-evenly' }}>
                    <Box sx={{ display: 'flex', width: '50%', flexDirection: 'column', paddingRight: 1 }}>
                        <Box>
                            <CodeEditor
                                codeSubmission={currentCode}
                                starterCode={starterCode}
                                readOnly={true}
                                isReplayMode={true}
                                fullReplay={true}
                            />
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', paddingTop: 1, paddingBottom: 1 }}>
                            <ReplayControls fullReplay={true}/>
                        </Box>
                    </Box>
                    <Box sx={{ width: '50%', paddingLeft: 1 }}>
                        <ResultsViewer />
                    </Box>
                </Box>
            </Box>
        </>
    )
}

export default ReplayView