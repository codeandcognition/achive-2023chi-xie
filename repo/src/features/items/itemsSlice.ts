import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '../../app/store'
import _ from 'lodash'
import { PracticeItem } from '../../constants/dbSchemas'

// TODO: phase out
export interface Item {
  name: string,
  test_cases: {
    [key: string]: {
      inputs: Array<any>,
      output_expected: any
    }
  },
  params: Array<any>,
  param_types: Array<any>,
  prompt: string
}

// TODO: phase out
export interface Items {
  [key: string]: Item
}

export interface ItemsState {
  activeItemId: string,
  activeItem: PracticeItem,
  items: { // TODO: phase this out
    [key: string]: Item
  },
  itemBacklog: Array<PracticeItem>
}

export const emptyItem: PracticeItem = {
  name: '',
  problem_set: '',
  args: [],
  argTypes: [],
  prompt: '',
  testCases: {
    t0: {
      inputs: [],
      outputExpected: ''
    }
  },
  exampleSolution: '',
  order: 0
}

const initialState: ItemsState = {
  activeItemId: '',
  activeItem: emptyItem,
  items: {},
  itemBacklog: []
}

/**
 * redux state for active practice item
 */
export const itemsSlice = createSlice({
  name: 'items',
  initialState,
  reducers: {

    // load all items. TODO: phase out
    setAllItems: (state, action: PayloadAction<Items>) => {
      state.items = action.payload
    },

    // specify id of which item is active
    setActiveItemId: (state, action: PayloadAction<string>) => {
      state.activeItemId = action.payload
    },

    setActiveItem: (state, action: PayloadAction<PracticeItem>) => {
      state.activeItem = action.payload
    },

    updateBacklog: (state, action: PayloadAction<Array<PracticeItem>>) => {
      state.itemBacklog = _.concat(state.itemBacklog, action.payload)
    }
  }
})

export const { setAllItems, setActiveItemId, setActiveItem, updateBacklog } = itemsSlice.actions

// TODO: phase out
export const selectItems = (state: RootState) => state.items.items

export const selectItemBacklog = (state: RootState) => state.items.itemBacklog

export const selectActiveItemId = (state: RootState) => state.items.activeItemId

export const selectActiveItem = (state: RootState) => state.items.activeItem

export default itemsSlice.reducer