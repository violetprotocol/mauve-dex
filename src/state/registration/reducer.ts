import { configureStore, createSlice } from '@reduxjs/toolkit'
import { Address } from '@uniswap/conedison/types'

interface EnrolmentState {
  isRegistered: Record<Address, Boolean | undefined>
}

const initialState: EnrolmentState = {
  isRegistered: {}
}

export const enrolmentSlice = createSlice({
  name: 'registration',
  initialState,
  reducers: {
    updateRegistrationState(
      state,
      { payload: { address, registrationState } }: { payload: { address: Address, registrationState: Boolean } }
    ) {
      state.isRegistered[address] = registrationState
    },
  },
})

export const { updateRegistrationState } = enrolmentSlice.actions
export default enrolmentSlice.reducer
