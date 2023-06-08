import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from './store'

// typescript friendly version of useDispatch() to set redux values
export const useAppDispatch = () => useDispatch<AppDispatch>()

// typescript friendly version of useSelector() to get redux values
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector