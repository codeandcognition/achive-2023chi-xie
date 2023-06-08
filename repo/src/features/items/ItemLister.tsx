import { useState, useEffect } from 'react'
import {
  Box,
  Icon,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText
} from '@mui/material'

import { useAppSelector, useAppDispatch } from '../../app/hooks'
import { setActiveItemId, selectActiveItemId, selectActiveItem } from './itemsSlice'
import { COLLECTION_ITEMS, COLLECTION_ITEM_STATUSES, COLLECTION_MILESTONES, getItemStatusPath, getMilestonePath } from '../../utils/dbPaths'
import { Milestone, PracticeItem } from '../../constants/dbSchemas'
import { current } from '@reduxjs/toolkit'
import _, { map } from 'lodash'
import { useFirebase, useFirebaseConnect } from 'react-redux-firebase'
import { setCompletedPS1, setCompletedPS2, setCompletedPS3 } from '../progress/milestoneSlice'
import DoneIcon from '@mui/icons-material/Done';
import { setProblemSet } from '../problemSets/problemSetsSlice'
import { useLocation } from 'react-router-dom'
import { itemStatusesSlice } from '../progress/itemStatusSlice'

const ItemLister: React.FC = () => {

  // sync collection from firebase to redux
  useFirebaseConnect({
    path: COLLECTION_ITEMS // practice items
  })

  useFirebaseConnect({
    path: COLLECTION_ITEM_STATUSES
  })
  useFirebaseConnect({
    path: COLLECTION_MILESTONES
  })

  // typescript friendly redux dispatch
  const dispatch = useAppDispatch()

  // get all items
  // const items = useAppSelector(selectItems)  
  const items = useAppSelector(state => state.firebase.data.practice)
  const activeItem = useAppSelector(selectActiveItem)
  const activeItemId = useAppSelector(selectActiveItemId)

  //get the active problem set from the redux store
  const currentProblemSet = useAppSelector(state => state.problemSets.activeProblemSet)

  const firebase = useFirebase()
  const uid = useAppSelector(({ firebase }) => firebase.auth.uid)

  const itemStatuses = useAppSelector(state => state.firebase.data.item_status)

  // to allow for refresh while in problem set view without things breaking
  // const [activeProblemSet, setActiveProblemSet] = useState(currentProblemSet)

  // when new item selected, update redux state
  const handleItemSelect = (itemId: string) => {
    dispatch(setActiveItemId(itemId)) 
  }

  
  const sortItems = (a: any, b: any) => {
    if (a.order < b.order) {
      return -1
    } 
    if (a.order > b.order) {
      return 1
    }
    return 0
  }

  let filteredArray: any[] = []

  const PS1_PATH = '/problem_set_1'
  const PS2_PATH = '/problem_set_2'
  const PS3_PATH = '/problem_set_3'
  const location = useLocation()
  useEffect(() => {
    if (location.pathname === PS1_PATH){
      dispatch(setProblemSet("PS1"))
    }
    if (location.pathname === PS2_PATH){
      dispatch(setProblemSet("PS2"))
    }
    if (location.pathname === PS3_PATH){
      dispatch(setProblemSet("PS3"))
    }
  }, [currentProblemSet])

  if (items) {
    Object.values(items).map((item) => {
      if (item.problem_set === currentProblemSet) {
        filteredArray.push(item)
      }
    })
  }

  return (
    <Box sx={{ minWidth: 120 }}>
      <List>
        {filteredArray.sort(sortItems).map((item) => {
          return (
            <ListItem key={item.name}>
              <ListItemButton onClick={() => handleItemSelect(item.name)} selected={item.name === activeItemId}>
                <ListItemText primary={item.name} />
              </ListItemButton>
              {itemStatuses[uid][currentProblemSet][item.name] && itemStatuses[uid][currentProblemSet][item.name].reflection_completed ? 
                <IconButton>
                  <DoneIcon />
                </IconButton>
                  :
                <></>
              }
            </ListItem>
          )
        })
        }
      </List>
    </Box >
  )


  // show all prompts from the active problem set
  // if (uid && itemStatuses && currentProblemSet && itemStatuses[uid] && itemStatuses[uid][currentProblemSet]){
  //   return (
  //     <Box sx={{ minWidth: 120 }}>
  //       <List>
  //         {uid && itemStatuses && itemStatuses[uid] ? 
            
  //           Object.entries(itemStatuses[uid][currentProblemSet]).map((item: any) => {
  //             if (item) {
  //               return (
  //                 <ListItem key={item[0]}>
  //                   <ListItemButton onClick={() => handleItemSelect(item[0])} selected={item[0] === activeItemId}>
  //                     <ListItemText primary={[item[0]]} />  
  //                   </ListItemButton>
  //                   {item[1].attempted || item[1].passed ?
  //                     <IconButton color='primary'>
  //                       <DoneIcon />
  //                     </IconButton>
  //                     :
  //                     <></>
  //                   }
  //                 </ListItem>
  //               )
  //             } 
  //           })
  //           :
  //           <></>
  //         }
  //       </List>
  //     </Box >
  //   )
  // }
}

export default ItemLister