import { createSlice } from "@reduxjs/toolkit"

export const pagingSlice = createSlice({
  name: 'paging',
  initialState: {
    page: 1,
    totalPages: 1,
    keys: {}
  },
  reducers: {
    setPage: (state, action) => {
      const p = action.payload.p
      const newTotalP = action.payload.newTotalP
      const newKeys = action.payload.newKeys

      state.page = p
      state.totalPages = newTotalP
      state.keys = newKeys
    }
  }
})

export const { setPage } = pagingSlice.actions
export default pagingSlice.reducer
