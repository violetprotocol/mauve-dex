import { createSlice } from '@reduxjs/toolkit'
import { Address } from '@uniswap/conedison/types'

interface EnrollmentState {
  isRegistered: Record<Address, Boolean | undefined>
}

const initialState: EnrollmentState = {
  isRegistered: {}
}

export const enrollmentSlice = createSlice({
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

export const { updateRegistrationState } = enrollmentSlice.actions
export default enrollmentSlice.reducer
