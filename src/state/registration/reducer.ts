import { createSlice } from '@reduxjs/toolkit'
import { Address } from '@uniswap/conedison/types'

interface EnrollmentState {
  isRegistered: Record<Address, boolean | undefined>
}

const initialState: EnrollmentState = {
  isRegistered: {},
}

const enrollmentSlice = createSlice({
  name: 'registration',
  initialState,
  reducers: {
    updateRegistrationState(
      state,
      { payload: { address, registrationState } }: { payload: { address: Address; registrationState: boolean } }
    ) {
      state.isRegistered[address] = registrationState
    },
  },
})

export const { updateRegistrationState } = enrollmentSlice.actions
export default enrollmentSlice.reducer
