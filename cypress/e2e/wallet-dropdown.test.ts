import { getTestSelector } from '../utils'

describe('Wallet Dropdown', () => {
  before(() => {
    cy.visit('/pool')
  })

  it('should be able to view transactions', () => {
    cy.get(getTestSelector('web3-status-connected')).click()
    cy.get(getTestSelector('wallet-transactions')).click()
    cy.get(getTestSelector('wallet-empty-transaction-text')).should('exist')
    cy.get(getTestSelector('wallet-back')).click()
  })
})
