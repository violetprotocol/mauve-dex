describe('Link', () => {
  it('should update route', () => {
    cy.visit('/')
    cy.contains('Pool').click()
    cy.get('[data-cy="join-pool-button"]').should('exist')
  })
})
