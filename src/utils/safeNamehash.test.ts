import { safeNamehash } from './safeNamehash'

describe('#safeNamehash', () => {
  const emoji = '🤔'

  // suppress console.debug for the next test
  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    jest.spyOn(console, 'debug').mockImplementation(() => {})
  })

  it('works', () => {
    expect(safeNamehash(emoji)).toEqual('0x9c0c5bf9a185012d3b3b586a357a19ab95718d9eb5a2bf845924c40cc13f82b0')
  })
})
