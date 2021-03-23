a kever property plugin, standard response output format.



## Install

> npm install @kever/response --save

## Start

```ts
//index.ts
import { createApp } from '@kever/core'

createApp({
  port: 9000,
  plugins: [
    '@kever/response'
  ]
})
```

```ts
// controller.ts
import { BaseController, Context, Controller } from '@kever/core'
import { PluginType, UsePlugin } from '@kever/ioc'
import { Get } from '@kever/router'
import { Response } from '@kever/response'

@Controller('/')
export class GroupController extends BaseController {

  @UsePlugin(PluginType.property, 'response')
  private response: Response

  @Get('/index')
  async index(ctx: Context) {

    ctx.body = this.response(ctx, 10000, {
      name: 'kever',
      message: 'Hello world'
    })
  }
}

```