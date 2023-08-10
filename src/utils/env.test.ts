import { isDevelopmentEnv, isProductionEnv, isStagingEnv, isTestEnv } from './env'

describe('env', () => {
  const ENV = process.env
  afterEach(() => {
    process.env = ENV
  })

  function setEnv(env: Record<string, unknown>) {
    process.env = {
      PUBLIC_URL: 'http://example.com',
      NODE_ENV: "test",
      REACT_APP_VIOLET_ENV: 'development',
      ...env,
    }
  }

  it('isDevelopmentEnv is true if REACT_APP_VIOLET_ENV=development', () => {
    setEnv({ REACT_APP_VIOLET_ENV: 'development' })
    expect(isDevelopmentEnv()).toBe(true)
  })

  it('isTestEnv is true if REACT_APP_VIOLET_ENV=test', () => {
    setEnv({ REACT_APP_VIOLET_ENV: 'test' })
    expect(isTestEnv()).toBe(true)
  })

  it('isStagingEnv is true REACT_APP_STAGING=1', () => {
    setEnv({ REACT_APP_STAGING: 1 })
    expect(isStagingEnv()).toBe(true)
  })

  describe('isProductionEnv', () => {
    it('is true if REACT_APP_VIOLET_ENV=production', () => {
      setEnv({ REACT_APP_VIOLET_ENV: 'production' })
      expect(isProductionEnv()).toBe(true)
    })

    it('is false if REACT_APP_VIOLET_ENV=production and REACT_APP_STAGING=1', () => {
      setEnv({ REACT_APP_VIOLET_ENV: 'production', REACT_APP_STAGING: 1 })
      expect(isProductionEnv()).toBe(false)
    })
  })
})
