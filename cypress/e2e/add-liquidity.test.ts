//  Tokens on Optimism Goerli
const OUT1 = '0x32307adfFE088e383AFAa721b06436aDaBA47DBE'
const OUT2 = '0xb378eD8647D67b5dB6fD41817fd7a0949627D87a'
const WETH = '0x4200000000000000000000000000000000000006'
const TEST_USDC = '0x1888649D566908E0A4Ac17978740F6A04f600a51'

describe('Add Liquidity', () => {
  it('loads the two correct tokens', () => {
    cy.visit(`/add/${OUT1}/${WETH}/500`)
    cy.get('#add-liquidity-input-tokena .token-symbol-container').should('contain.text', 'OUT-1')
    cy.get('#add-liquidity-input-tokenb .token-symbol-container').should('contain.text', 'ETH')
  })

  it('does not crash if ETH is duplicated', () => {
    cy.visit('/add/eth/eth')
    cy.get('#add-liquidity-input-tokena .token-symbol-container').should('contain.text', 'ETH')
    cy.get('#add-liquidity-input-tokenb .token-symbol-container').should('not.contain.text', 'ETH')
  })

  it('token not in storage is loaded', () => {
    cy.visit(`/add/${TEST_USDC}/${OUT2}`)
    cy.get('#add-liquidity-input-tokena .token-symbol-container').should('contain.text', 'tUSDC')
    cy.get('#add-liquidity-input-tokenb .token-symbol-container').should('contain.text', 'OUT-2')
  })

  it('single token can be selected', () => {
    cy.visit(`/add/${TEST_USDC}`)
    cy.get('#add-liquidity-input-tokena .token-symbol-container').should('contain.text', 'tUSDC')
    cy.visit(`/add/${OUT1}`)
    cy.get('#add-liquidity-input-tokena .token-symbol-container').should('contain.text', 'OUT-1')
  })

  // TODO: Un-skip when subgraph is done
  it.skip('loads fee tier distribution', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    cy.fixture('feeTierDistribution.json').then((_feeTierDistribution) => {
      cy.visit('/add/0xF9bA5210F91D0474bd1e1DcDAeC4C58E359AaD85/0xc778417E063141139Fce010982780140Aa0cD5Ab')

      cy.wait('@FeeTierDistributionQuery')

      cy.get('#add-liquidity-selected-fee .selected-fee-label').should('contain.text', '0.3% fee tier')
      cy.get('#add-liquidity-selected-fee .selected-fee-percentage').should('contain.text', '40%')
    })
  })
})
