import { configureStore } from "@reduxjs/toolkit"
import pagingReducer from "./slice"

export const makeStore = configureStore({
  reducer: { paging: pagingReducer }
})
