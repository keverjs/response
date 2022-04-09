import { Context, BaseMiddleware, MType, Middleware } from 'kever'

type MessageType = {[key: number]: string}

const ERR_MESSAGE: MessageType = {
  10000: '成功',
  10001: '失败'
}

export type Response = <T>(ctx: Context, errno: number, data: T) => {
  errno: keyof typeof ERR_MESSAGE;
  errmsg: string;
  data: T;
  traceid?: string;
};

@Middleware('response', MType.Property)
export class ResponseMiddleware implements BaseMiddleware<MType.Property> {
  private errMsg = ERR_MESSAGE
  constructor(errMsg: MessageType) {
    this.errMsg = errMsg
  }

  ready() {
    return this.body.bind(this)
  }

  body<T>(ctx: Context, errno: number, data: T) {
    const response: ReturnType<Response> = {
      errno,
      errmsg: this.errMsg[errno] || '',
      data
    }
    if (ctx.traceId) {
      response.traceid = ctx.traceId
    }
    return response
  }
}
