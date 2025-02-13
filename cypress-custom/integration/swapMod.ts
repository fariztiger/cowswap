describe('Swap (mod)', () => {
  beforeEach(() => {
    cy.visit('/swap')
  })
  it('can enter an amount into input', () => {
    cy.get('#swap-currency-input .token-amount-input')
      .type('0.001', { delay: 400, force: true })
      .should('have.value', '0.001')
  })

  it('zero swap amount', () => {
    cy.get('#swap-currency-input .token-amount-input')
      .type('0.0', { delay: 400, force: true })
      .should('have.value', '0.0')
  })

  it('invalid swap amount', () => {
    cy.get('#swap-currency-input .token-amount-input')
      .type('\\', { delay: 400, force: true })
      .should('have.value', '')
  })

  it.skip('can enter an amount into output', () => {
    cy.get('#swap-currency-output .token-amount-input')
      .type('0.001', { delay: 400, force: true })
      .should('have.value', '0.001')
  })

  it('zero output amount', () => {
    cy.get('#swap-currency-output .token-amount-input')
      .type('0.0', { delay: 400, force: true })
      .should('have.value', '0.0')
  })

  it.skip('can swap ETH for DAI', () => {
    cy.get('#swap-currency-output .open-currency-select-button').click()
    cy.get('.token-item-0xc7AD46e0b8a400Bb3C915120d284AafbA8fc4735').should('be.visible')
    cy.get('.token-item-0xc7AD46e0b8a400Bb3C915120d284AafbA8fc4735').click({ force: true })
    cy.get('#swap-currency-input .token-amount-input').should('be.visible')
    cy.get('#swap-currency-input .token-amount-input').type('0.001', { delay: 400, force: true })
    cy.get('#swap-currency-output .token-amount-input').should('not.equal', '')
    cy.get('#swap-button').click()
    cy.get('#confirm-swap-or-send').should('contain', 'Confirm Swap')
  })

  it('add a recipient does not exist unless in expert mode', () => {
    cy.get('#add-recipient-button').should('not.exist')
  })

  describe('expert mode', () => {
    beforeEach(() => {
      cy.window().then(win => {
        cy.stub(win, 'prompt').returns('confirm')
      })
      cy.get('#open-settings-dialog-button').click()
      cy.get('#toggle-expert-mode-button').click()
      cy.get('#confirm-expert-mode').click()
    })

    it.skip('add a recipient is visible', () => {
      cy.get('#add-recipient-button').should('be.visible')
    })

    it.skip('add a recipient', () => {
      cy.get('#add-recipient-button').click()
      cy.get('#recipient').should('exist')
    })

    it.skip('remove recipient', () => {
      cy.get('#add-recipient-button').click()
      cy.get('#remove-recipient-button').click()
      cy.get('#recipient').should('not.exist')
    })
  })
})
