import { createSlice } from "@reduxjs/toolkit"

export const pagingSlice = createSlice({
  name: 'paging',
  initialState: {
    page: 1,
    keys: {},
    prevKey: undefined,
    nextKey: undefined
  },
  reducers: {
    setPage: (state, action) => {
      let p = action.payload.p
      const newPrevKey = action.payload.newPrevKey
      const newNextKey = action.payload.newNextKey

      console.log("state change")
      if (newPrevKey === undefined) p = 1

      let new_keys = {}
      if (p > 1) new_keys[p - 1] = newPrevKey
      if (newNextKey) new_keys[p + 1] = newNextKey

      state.page = p
      state.keys = new_keys
      state.prevKey = newPrevKey
      state.nextKey = newNextKey
    }
  }
})

export const { setPage } = pagingSlice.actions
export default pagingSlice.reducer
