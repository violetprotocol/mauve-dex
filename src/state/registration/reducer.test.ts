import { createStore, Store } from 'redux'

import reducer, { EnrollmentState, updateRegistrationState } from './reducer'

const ACCOUNT_ADDRESS = "0x33FaabBe19057C30d1405Fd8d16039255ff7EEf4"

describe('registration reducer', () => {
  let store: Store<EnrollmentState>

  beforeEach(() => {
    store = createStore(reducer, {
      isRegistered: {},
    })
  })

  describe('updateRegistrationState', () => {
    describe('account is enrolled', () => {
      it('sets registration state to true', () => {
        store.dispatch(updateRegistrationState({ address: ACCOUNT_ADDRESS, registrationState: true }))
        expect(store.getState()).toEqual({
          isRegistered: {
            [ACCOUNT_ADDRESS]: true
          }
        })
      })
    })

    describe('account is not enrolled', () => {
      it('sets registration state to false', () => {
        store.dispatch(updateRegistrationState({ address: ACCOUNT_ADDRESS, registrationState: false }))
        expect(store.getState()).toEqual({
          isRegistered: {
            [ACCOUNT_ADDRESS]: false
          }
        })
      })
    })
  })
})
