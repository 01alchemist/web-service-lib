import './env.d.ts'

jest.mock(
  'process.env',
  () => {
    const default_obj = new Proxy(
      {},
      {
        get: (target: any, prop: string) => {
          return process.env[prop]
        },
        set(target: any, prop: string, newValue) {
          process.env[prop] = newValue
          return newValue
        }
      }
    )
    return { default: default_obj }
  },
  { virtual: true }
)

import { env, envInt, envFloat, envBoolean, envJson } from './env'
import * as runtime from './runtime'

jest.mock(
  './runtime',
  () =>
    new Proxy(
      {},
      {
        get(target: any, prop: string) {
          if (prop === 'setIsNode') {
            return (value: boolean) => (target['isNode'] = value)
          }
          return target[prop]
        }
      }
    )
)
type RuntimeMock = {
  isNode: boolean
  setIsNode: (value: boolean) => void
}
const runtimeMock = (runtime as unknown) as RuntimeMock

beforeEach(() => {
  global.window = { ENV: {} } as any
  runtimeMock.setIsNode(false)
})

describe('NodeJS env test suite', () => {
  beforeEach(() => {
    global.window = { ENV: {} } as any
    runtimeMock.setIsNode(true)
  })
  describe('env test suite', () => {
    describe('When an env var is present in the window.ENV', () => {
      it('Should return it', () => {
        process.env.SOME_VAR = 'Some Another Value'
        window.ENV = { SOME_VAR: 'Some Value' }
        expect(env('SOME_VAR')).toBe('Some Another Value')
      })
    })
    describe('When an env var is undefined', () => {
      it('Should return it default value', () => {
        delete process.env.SOME_VAR
        window.ENV = {}
        expect(env('SOME_VAR', 'Default Value 1')).toBe('Default Value 1')
      })
    })
    describe('When an env var is not present in the window.ENV', () => {
      it("Should return it's value from process.env", () => {
        process.env.SOME_VAR2 = 'Some Another Value'
        window.ENV = { SOME_VAR: 'Some Value' }
        expect(env('SOME_VAR2')).toBe('Some Another Value')
      })
    })
    describe('When window.ENV contains falsy boolean env var', () => {
      it('Should return it', () => {
        process.env.SOME_VAR = 'true'
        window.ENV = { SOME_VAR: 'false' }
        expect(env('SOME_VAR')).toBe('true')
      })
    })
  })

  describe('envInt test suite', () => {
    describe('When accessing undefined value', () => {
      it('Should return default value', () => {
        delete process.env.SOME_INT_VAR
        expect(envInt('SOME_INT_VAR', 123456789)).toBe(123456789)
      })
    })
    describe('When accessing int string from envInt', () => {
      it('process.env: Should return the same JS Number', () => {
        process.env.SOME_INT_VAR = '12345'
        expect(envInt('SOME_INT_VAR', 0)).toBe(12345)
      })
      it('window.ENV: Should return the same JS Number', () => {
        window.ENV.SOME_INT_VAR = '12345'
        expect(envInt('SOME_INT_VAR', 0)).toBe(12345)
      })
    })
    describe('When accessing float string from envInt', () => {
      it('process.env: Should return the converted number', () => {
        process.env.SOME_INT_VAR = '12345.12345'
        expect(envInt('SOME_INT_VAR', 0)).toBe(12345)
      })
      it('window.ENV: Should return the converted number', () => {
        window.ENV.SOME_INT_VAR = '12345.12345'
        expect(envInt('SOME_INT_VAR', 0)).toBe(12345)
      })
    })
    describe('When accessing non-number from envInt', () => {
      it('process.env: Should return NaN', () => {
        process.env.SOME_INT_VAR = 'asdasd'
        expect(isNaN(envInt('SOME_INT_VAR', 0))).toBeTruthy()
        process.env.SOME_INT_VAR = 'true'
        expect(isNaN(envInt('SOME_INT_VAR', 0))).toBeTruthy()
        process.env.SOME_INT_VAR = '[]'
        expect(isNaN(envInt('SOME_INT_VAR', 0))).toBeTruthy()
      })
      it('window.ENV: Should return NaN', () => {
        window.ENV.SOME_INT_VAR = 'asdasd'
        expect(isNaN(envInt('SOME_INT_VAR', 0))).toBeTruthy()
        window.ENV.SOME_INT_VAR = 'true'
        expect(isNaN(envInt('SOME_INT_VAR', 0))).toBeTruthy()
        window.ENV.SOME_INT_VAR = '[]'
        expect(isNaN(envInt('SOME_INT_VAR', 0))).toBeTruthy()
      })
    })
  })

  describe('envFloat test suite', () => {
    describe('When accessing undefined value', () => {
      it('Should return default value', () => {
        delete process.env.SOME_INT_VAR
        expect(envFloat('SOME_INT_VAR', 1.23456789)).toBe(1.23456789)
      })
    })
    describe('When accessing int string from envFloat', () => {
      it('process.env: Should return the same JS Number', () => {
        process.env.SOME_FLOAT_VAR = '12345'
        expect(envFloat('SOME_FLOAT_VAR', 0)).toBe(12345)
      })
      it('window.ENV: Should return the same JS Number', () => {
        window.ENV.SOME_FLOAT_VAR = '12345'
        expect(envFloat('SOME_FLOAT_VAR', 0)).toBe(12345)
      })
    })
    describe('When accessing float string from envFloat', () => {
      it('process.env: Should return the same JS number', () => {
        process.env.SOME_FLOAT_VAR = '12345.12345'
        expect(envFloat('SOME_FLOAT_VAR', 0)).toBe(12345.12345)
      })
      it('window.ENV: Should return the same JS number', () => {
        window.ENV.SOME_FLOAT_VAR = '12345.12345'
        expect(envFloat('SOME_FLOAT_VAR', 0)).toBe(12345.12345)
      })
    })
    describe('When accessing non-number from envFloat', () => {
      it('process.env: Should return NaN', () => {
        process.env.SOME_FLOAT_VAR = 'asdasd'
        expect(isNaN(envFloat('SOME_FLOAT_VAR', 0))).toBeTruthy()
        process.env.SOME_FLOAT_VAR = 'true'
        expect(isNaN(envFloat('SOME_FLOAT_VAR', 0))).toBeTruthy()
        process.env.SOME_FLOAT_VAR = '[]'
        expect(isNaN(envFloat('SOME_FLOAT_VAR', 0))).toBeTruthy()
      })
      it('window.ENV: Should return NaN', () => {
        window.ENV.SOME_FLOAT_VAR = 'asdasd'
        expect(isNaN(envFloat('SOME_FLOAT_VAR', 0))).toBeTruthy()
        window.ENV.SOME_FLOAT_VAR = 'true'
        expect(isNaN(envFloat('SOME_FLOAT_VAR', 0))).toBeTruthy()
        window.ENV.SOME_FLOAT_VAR = '[]'
        expect(isNaN(envFloat('SOME_FLOAT_VAR', 0))).toBeTruthy()
      })
    })
  })

  describe('envBoolean test suite', () => {
    describe('When accessing undefined value', () => {
      it('Should return default value', () => {
        delete process.env.SOME_BOOLEAN_VAR
        expect(envFloat('SOME_BOOLEAN_VAR', true)).toBe(true)
      })
    })
    describe('When accessing `true` string from envBoolean', () => {
      it('Should return true', () => {
        process.env.SOME_BOOLEAN_VAR = 'true'
        expect(envBoolean('SOME_BOOLEAN_VAR', false)).toBe(true)
      })
    })
    describe('When accessing `True` string from envBoolean', () => {
      it('Should return true', () => {
        process.env.SOME_BOOLEAN_VAR = 'True'
        expect(envBoolean('SOME_BOOLEAN_VAR', false)).toBe(true)
      })
    })
    describe('When accessing `TRUE` string from envBoolean', () => {
      it('Should return true', () => {
        process.env.SOME_BOOLEAN_VAR = 'TRUE'
        expect(envBoolean('SOME_BOOLEAN_VAR', false)).toBe(true)
      })
    })
    describe('When accessing `false` string from envBoolean', () => {
      it('Should return false', () => {
        process.env.SOME_BOOLEAN_VAR = 'false'
        expect(envBoolean('SOME_BOOLEAN_VAR', false)).toBe(false)
      })
    })
    describe('When accessing `0` string from envBoolean', () => {
      it('Should return false', () => {
        process.env.SOME_BOOLEAN_VAR = '0'
        expect(envBoolean('SOME_BOOLEAN_VAR', false)).toBe(false)
      })
    })
    describe('When accessing `1` string from envBoolean', () => {
      it('Should return true', () => {
        process.env.SOME_BOOLEAN_VAR = '1'
        expect(envBoolean('SOME_BOOLEAN_VAR', false)).toBe(true)
      })
    })
    describe('When accessing empty string from envBoolean', () => {
      it('Should return false', () => {
        process.env.SOME_BOOLEAN_VAR = ''
        expect(envBoolean('SOME_BOOLEAN_VAR', false)).toBe(false)
      })
    })
    describe('When accessing `null` string from envBoolean', () => {
      it('Should return false', () => {
        process.env.SOME_BOOLEAN_VAR = 'null'
        expect(envBoolean('SOME_BOOLEAN_VAR', false)).toBe(false)
      })
    })
  })

  describe('envJson test suite', () => {
    describe('When accessing non json value', () => {
      it('Should return default value', () => {
        process.env.SOME_JSON_VAR = "{some'nonjson-value':1231321}"
        expect(
          envJson('SOME_JSON_VAR', { defaultKey: 'default-value' })
        ).toEqual({
          defaultKey: 'default-value'
        })
      })
    })
    describe('When accessing json string from envJson', () => {
      it('Should return the parsed JSON object', () => {
        process.env.SOME_JSON_VAR = '{"key":"value"}'
        expect(envJson('SOME_JSON_VAR')).toEqual({ key: 'value' })
      })
    })
    describe('When accessing undefined value from envJson', () => {
      it('Should return default value', () => {
        delete process.env.SOME_JSON_VAR
        expect(
          envJson('SOME_JSON_VAR', { defaultKey: 'default-value' })
        ).toEqual({ defaultKey: 'default-value' })
      })
    })
    describe('When accessing int string from envJson', () => {
      it('Should return the JS Number', () => {
        process.env.SOME_JSON_VAR = '12345'
        expect(envJson('SOME_JSON_VAR')).toBe(12345)
      })
    })
    describe('When accessing float string from envJson', () => {
      it('Should return the JS Number', () => {
        process.env.SOME_JSON_VAR = '12345.12345'
        expect(envJson('SOME_JSON_VAR')).toBe(12345.12345)
      })
    })
    describe('When accessing boolean string from envJson', () => {
      it('Should return the same boolean', () => {
        process.env.SOME_JSON_VAR = 'true'
        expect(envJson('SOME_JSON_VAR')).toBe(true)
        process.env.SOME_JSON_VAR = 'false'
        expect(envJson('SOME_JSON_VAR')).toBe(false)
      })
    })
    describe('When accessing raw string from envJson', () => {
      it('Should return the same string', () => {
        process.env.SOME_JSON_VAR = '"12345.12345"'
        expect(envJson('SOME_JSON_VAR')).toBe('12345.12345')
      })
    })
    describe('When accessing nested json string from envJson', () => {
      it('Should return the same JSON object', () => {
        const value = {
          intVlaue: 12355,
          floatValue: 12345.12345,
          stringValue: 'I am a little string',
          booleanValue: true,
          nullValue: null,
          child: {
            name: 'My name is child',
            intVlaue: 12355,
            floatValue: 12345.12345,
            stringValue: 'I am a little string',
            booleanValue: true,
            nullValue: null
          }
        }
        process.env.SOME_JSON_VAR = `{
        "intVlaue": 12355,
        "floatValue": 12345.12345,
        "stringValue": "I am a little string",
        "booleanValue": true,
        "nullValue": null,
        "child": {
          "name": "My name is child",
          "intVlaue": 12355,
          "floatValue": 12345.12345,
          "stringValue": "I am a little string",
          "booleanValue": true,
          "nullValue": null
        }
      }`
        expect(envJson('SOME_JSON_VAR')).toEqual(value)
      })
    })
  })
})

describe('Browser env test suite', () => {
  describe('env test suite', () => {
    beforeEach(() => {
      global.window = { ENV: {} } as any
      runtimeMock.setIsNode(false)
    })
    describe('When an env var is present in the window.ENV', () => {
      it('Should return it', () => {
        process.env.SOME_VAR = 'Some Another Value'
        window.ENV = { SOME_VAR: 'Some Value' }
        expect(env('SOME_VAR')).toBe('Some Value')
      })
    })
    describe('When an env var is not present in the window.ENV', () => {
      it("Should return it's value from process.env", () => {
        process.env.SOME_VAR2 = 'Some Another Value'
        window.ENV = { SOME_VAR: 'Some Value' }
        expect(env('SOME_VAR2')).toBe('Some Another Value')
      })
    })
    describe('When window.ENV contains falsy boolean env var', () => {
      it('Should return it', () => {
        process.env.SOME_VAR = 'true'
        window.ENV = { SOME_VAR: 'false' }
        expect(env('SOME_VAR')).toBe('false')
      })
    })
  })

  describe('envInt test suite', () => {
    describe('When accessing int string from envInt', () => {
      it('process.env: Should return the same JS Number', () => {
        process.env.SOME_INT_VAR = '12345'
        expect(envInt('SOME_INT_VAR', 0)).toBe(12345)
      })
      it('window.ENV: Should return the same JS Number', () => {
        window.ENV.SOME_INT_VAR = '12345'
        expect(envInt('SOME_INT_VAR', 0)).toBe(12345)
      })
    })
    describe('When accessing float string from envInt', () => {
      it('process.env: Should return the converted number', () => {
        process.env.SOME_INT_VAR = '12345.12345'
        expect(envInt('SOME_INT_VAR', 0)).toBe(12345)
      })
      it('window.ENV: Should return the converted number', () => {
        window.ENV.SOME_INT_VAR = '12345.12345'
        expect(envInt('SOME_INT_VAR', 0)).toBe(12345)
      })
    })
    describe('When accessing non-number from envInt', () => {
      it('process.env: Should return NaN', () => {
        process.env.SOME_INT_VAR = 'asdasd'
        expect(isNaN(envInt('SOME_INT_VAR', 0))).toBeTruthy()
        process.env.SOME_INT_VAR = 'true'
        expect(isNaN(envInt('SOME_INT_VAR', 0))).toBeTruthy()
        process.env.SOME_INT_VAR = '[]'
        expect(isNaN(envInt('SOME_INT_VAR', 0))).toBeTruthy()
      })
      it('window.ENV: Should return NaN', () => {
        window.ENV.SOME_INT_VAR = 'asdasd'
        expect(isNaN(envInt('SOME_INT_VAR', 0))).toBeTruthy()
        window.ENV.SOME_INT_VAR = 'true'
        expect(isNaN(envInt('SOME_INT_VAR', 0))).toBeTruthy()
        window.ENV.SOME_INT_VAR = '[]'
        expect(isNaN(envInt('SOME_INT_VAR', 0))).toBeTruthy()
      })
    })
  })

  describe('envFloat test suite', () => {
    describe('When accessing int string from envFloat', () => {
      it('process.env: Should return the same JS Number', () => {
        process.env.SOME_FLOAT_VAR = '12345'
        expect(envFloat('SOME_FLOAT_VAR', 0)).toBe(12345)
      })
      it('window.ENV: Should return the same JS Number', () => {
        window.ENV.SOME_FLOAT_VAR = '12345'
        expect(envFloat('SOME_FLOAT_VAR', 0)).toBe(12345)
      })
    })
    describe('When accessing float string from envFloat', () => {
      it('process.env: Should return the same JS number', () => {
        process.env.SOME_FLOAT_VAR = '12345.12345'
        expect(envFloat('SOME_FLOAT_VAR', 0)).toBe(12345.12345)
      })
      it('window.ENV: Should return the same JS number', () => {
        window.ENV.SOME_FLOAT_VAR = '12345.12345'
        expect(envFloat('SOME_FLOAT_VAR', 0)).toBe(12345.12345)
      })
    })
    describe('When accessing non-number from envFloat', () => {
      it('process.env: Should return NaN', () => {
        process.env.SOME_FLOAT_VAR = 'asdasd'
        expect(isNaN(envFloat('SOME_FLOAT_VAR', 0))).toBeTruthy()
        process.env.SOME_FLOAT_VAR = 'true'
        expect(isNaN(envFloat('SOME_FLOAT_VAR', 0))).toBeTruthy()
        process.env.SOME_FLOAT_VAR = '[]'
        expect(isNaN(envFloat('SOME_FLOAT_VAR', 0))).toBeTruthy()
      })
      it('window.ENV: Should return NaN', () => {
        window.ENV.SOME_FLOAT_VAR = 'asdasd'
        expect(isNaN(envFloat('SOME_FLOAT_VAR', 0))).toBeTruthy()
        window.ENV.SOME_FLOAT_VAR = 'true'
        expect(isNaN(envFloat('SOME_FLOAT_VAR', 0))).toBeTruthy()
        window.ENV.SOME_FLOAT_VAR = '[]'
        expect(isNaN(envFloat('SOME_FLOAT_VAR', 0))).toBeTruthy()
      })
    })
  })

  describe('envBoolean test suite', () => {
    describe('When accessing `true` string from envBoolean', () => {
      it('Should return true', () => {
        process.env.SOME_BOOLEAN_VAR = 'true'
        expect(envBoolean('SOME_BOOLEAN_VAR', false)).toBe(true)
      })
    })
    describe('When accessing `True` string from envBoolean', () => {
      it('Should return true', () => {
        process.env.SOME_BOOLEAN_VAR = 'True'
        expect(envBoolean('SOME_BOOLEAN_VAR', false)).toBe(true)
      })
    })
    describe('When accessing `TRUE` string from envBoolean', () => {
      it('Should return true', () => {
        process.env.SOME_BOOLEAN_VAR = 'TRUE'
        expect(envBoolean('SOME_BOOLEAN_VAR', false)).toBe(true)
      })
    })
    describe('When accessing `false` string from envBoolean', () => {
      it('Should return false', () => {
        process.env.SOME_BOOLEAN_VAR = 'false'
        expect(envBoolean('SOME_BOOLEAN_VAR', false)).toBe(false)
      })
    })
    describe('When accessing `0` string from envBoolean', () => {
      it('Should return false', () => {
        process.env.SOME_BOOLEAN_VAR = '0'
        expect(envBoolean('SOME_BOOLEAN_VAR', false)).toBe(false)
      })
    })
    describe('When accessing `1` string from envBoolean', () => {
      it('Should return true', () => {
        process.env.SOME_BOOLEAN_VAR = '1'
        expect(envBoolean('SOME_BOOLEAN_VAR', false)).toBe(true)
      })
    })
    describe('When accessing empty string from envBoolean', () => {
      it('Should return false', () => {
        process.env.SOME_BOOLEAN_VAR = ''
        expect(envBoolean('SOME_BOOLEAN_VAR', false)).toBe(false)
      })
    })
    describe('When accessing `null` string from envBoolean', () => {
      it('Should return false', () => {
        process.env.SOME_BOOLEAN_VAR = 'null'
        expect(envBoolean('SOME_BOOLEAN_VAR', false)).toBe(false)
      })
    })
  })

  describe('envJson test suite', () => {
    describe('When accessing json string from envJson', () => {
      it('Should return the parsed JSON object', () => {
        process.env.SOME_JSON_VAR = '{"key":"value"}'
        expect(envJson('SOME_JSON_VAR')).toEqual({ key: 'value' })
      })
    })
    describe('When accessing int string from envJson', () => {
      it('Should return the JS Number', () => {
        process.env.SOME_JSON_VAR = '12345'
        expect(envJson('SOME_JSON_VAR')).toBe(12345)
      })
    })
    describe('When accessing float string from envJson', () => {
      it('Should return the JS Number', () => {
        process.env.SOME_JSON_VAR = '12345.12345'
        expect(envJson('SOME_JSON_VAR')).toBe(12345.12345)
      })
    })
    describe('When accessing boolean string from envJson', () => {
      it('Should return the same boolean', () => {
        process.env.SOME_JSON_VAR = 'true'
        expect(envJson('SOME_JSON_VAR')).toBe(true)
        process.env.SOME_JSON_VAR = 'false'
        expect(envJson('SOME_JSON_VAR')).toBe(false)
      })
    })
    describe('When accessing raw string from envJson', () => {
      it('Should return the same string', () => {
        process.env.SOME_JSON_VAR = '"12345.12345"'
        expect(envJson('SOME_JSON_VAR')).toBe('12345.12345')
      })
    })
    describe('When accessing nested json string from envJson', () => {
      it('Should return the same JSON object', () => {
        const value = {
          intVlaue: 12355,
          floatValue: 12345.12345,
          stringValue: 'I am a little string',
          booleanValue: true,
          nullValue: null,
          child: {
            name: 'My name is child',
            intVlaue: 12355,
            floatValue: 12345.12345,
            stringValue: 'I am a little string',
            booleanValue: true,
            nullValue: null
          }
        }
        process.env.SOME_JSON_VAR = `{
        "intVlaue": 12355,
        "floatValue": 12345.12345,
        "stringValue": "I am a little string",
        "booleanValue": true,
        "nullValue": null,
        "child": {
          "name": "My name is child",
          "intVlaue": 12355,
          "floatValue": 12345.12345,
          "stringValue": "I am a little string",
          "booleanValue": true,
          "nullValue": null
        }
      }`
        expect(envJson('SOME_JSON_VAR')).toEqual(value)
      })
    })
  })
})
