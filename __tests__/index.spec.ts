import { Middleware, MType} from 'kever'
import { TResponse } from '../src'

describe('response', () => {
  class ResponseTest {
    @Middleware.use(MType.Property,'response')
    public response: TResponse | undefined
    test() {
      console.log(this.response)
    }
  }
  test('response', () => {
    const responseTest = new ResponseTest()
    expect(typeof responseTest.response).toBe('function')
  })
})
