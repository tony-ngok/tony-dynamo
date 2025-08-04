import * as zustand from 'zustand'

const usePageStoreBase = zustand.create((set) => ({
  page: 1,
  keys: {},
  prevKey: undefined,
  nextKey: undefined,
  reset: () => set({
    page: 1,
    keys: {},
    prevKey: undefined,
    nextKey: undefined
  })
}))

export const setPage = (p, newPrevKey, newNextKey) => {
  usePageStoreBase.setState((state) => {
    if (newPrevKey === undefined) p = 1

    let new_keys = {}
    if (p > 1) new_keys[p - 1] = newPrevKey
    if (newNextKey) new_keys[p + 1] = newNextKey

    return { page: p, keys: new_keys, prevKey: newPrevKey, nextKey: newNextKey }
  }, true)
}

const createSelectors = (s) => {
  let store = s
  store.use = {}
  for (let k of Object.keys(store.getState())) {
    store.use[k] = () => store(s => s[k])
  }

  return store
}

export const usePageStore = createSelectors(usePageStoreBase)
