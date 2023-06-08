import { configureStore, combineReducers, getDefaultMiddleware } from '@reduxjs/toolkit'
import { FirebaseReducer, firebaseReducer } from 'react-redux-firebase'
import storage from 'redux-persist/lib/storage'
import { persistReducer, persistStore } from 'redux-persist'
import thunk from 'redux-thunk'
// import logger from 'redux-logger'

import codeEditorReducer, { CodeEditorState } from '../features/codeEditor/codeEditorSlice'
import itemsReducer, { ItemsState } from '../features/items/itemsSlice'
import reflectionsReducer, { ReflectionsState } from '../features/reflectionPrompt/reflectionsSlice'
import resultsReducer, { ResultsState } from '../features/results/resultsSlice'
import loggerReducer, { LoggerState } from '../features/logger/loggerSlice'
import problemSetReducer, {ProblemSetsState} from '../features/problemSets/problemSetsSlice'


import itemStatusesReducer, { ItemStatusesState } from '../features/progress/itemStatusSlice'
import milestonesReducer, { MilestoneState } from '../features/progress/milestoneSlice'


import { UserData, PracticeItem, KeyStrokeLog, ReflectionItem, ReflectionResponse, ItemStatus, Milestone } from '../constants/dbSchemas'

interface UserProfile {
  email: string
}

const customizedMiddleware = getDefaultMiddleware({
  serializableCheck: false
})

const rootPersistConfig = {
  key: 'root',
  storage,
  whitelist: ['problemSets'],
  blacklist: ['itemStatuses']
}

// for redux persist with problemSetsSlice
const problemSetPersistConfig = {
  key: 'problemSet',
  storage
}

// schemas for collections in firebase realtime database
interface DBSchema {
  users: UserData,
  practice: PracticeItem,
  reflection: ReflectionItem,
  reflection_response: ReflectionResponse,
  item_status: ItemStatus,
  milestone: Milestone,
  ksl: KeyStrokeLog,
  [name: string]: any // anything goes. TODO: remove later
}

const rootReducer = combineReducers({
  // add new reducers as needed
  problemSets: persistReducer(problemSetPersistConfig, problemSetReducer),
  codeEditor: codeEditorReducer,
  // items: persistReducer(itemsPersistConfig, itemsReducer),
  items: itemsReducer,
  reflections: reflectionsReducer,
  itemStatuses: itemStatusesReducer,
  milestones: milestonesReducer,
  results: resultsReducer,
  logger: loggerReducer,
  firebase: firebaseReducer // from react-redux-firebase
})

const persistedReducer = persistReducer(rootPersistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  // middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger)
  middleware: customizedMiddleware
})

// typed for redux state selection. Do this manually to type firebase reducer
export type RootState = {
  problemSets: ProblemSetsState,
  codeEditor: CodeEditorState,
  items: ItemsState,
  reflections: ReflectionsState,
  itemStatuses: ItemStatusesState,
  milestones: MilestoneState,
  results: ResultsState,
  logger: LoggerState,
  firebase: FirebaseReducer.Reducer<UserProfile, DBSchema>
}

// typed redux state dispatch
export type AppDispatch = typeof store.dispatch

// for redux-persist
export const persistor = persistStore(store)