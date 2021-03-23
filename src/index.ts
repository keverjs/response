import { Context } from '@kever/core'
import { BasePlugin, PluginType, Plugin } from '@kever/ioc'

type MsgType = {[key: number]: string}

const ERR_MSG: MsgType = {
  10000: '成功',
  10001: '失败'
}

export type Response = <T>(ctx: Context, errno: number, data: T) => {
  errno: keyof typeof ERR_MSG;
  errmsg: string;
  data: T;
  traceid?: string;
};

@Plugin('response', PluginType.property)
export class ResponsePlugin implements BasePlugin {
  private errMsg = ERR_MSG
  constructor(errMsg: MsgType) {
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
