import express from 'express';
import request from 'supertest';
import { bootstrap } from '../../src';
import { Controller } from '../../src/decorators/controller';
import { Middleware } from '../../src/decorators/middleware';
import { Get } from '../../src/decorators/method';
import { Request, Response, Application } from 'express-serve-static-core';

const firstMiddleware = () => {
  return (req: any, res: any, next?: any) => {
    const header = res.get('x-executed') ?? ''
    res.set('x-executed', [header, 'first'].filter(v => v).join(' | '))
    next && next();
  }
}

const secondMiddleware = () => {
  return (req: any, res: any, next?: any) => {
    const header = res.get('x-executed') ?? ''
    res.set('x-executed', [header, 'second'].filter(v => v).join(' | '))
    next && next();
  }
}

@Controller('/class')
export class MethodMiddlewareController {

  @Get('/noMiddlewares')
  public noMiddlewares(req: Request, res: Response) {
    res.send('noMiddlewares');
  }

  @Middleware(firstMiddleware())
  @Get('/oneMiddleware')
  public oneMiddleware(req: Request, res: Response) {
    res.send('oneMiddleware');
  }

  @Middleware([firstMiddleware(), secondMiddleware()])
  @Get('/multipleMiddlewares')
  public multipleMiddlewares(req: Request, res: Response) {
    res.send('multipleMiddlewares');
  }
}

describe('MethodMiddlewareController - when middlewares are being applied to methods', () => {
  let app: Application;
  let instance;

  beforeEach(() => {
    app = express();
    instance = new MethodMiddlewareController();
    bootstrap(app, [instance]);
  });

  it('does not invoke the middleware for methods without a middleware', async () => {
    const response = await request(app).get('/class/noMiddlewares').expect(200);
    expect(response.get('x-executed')).toBeUndefined();
  });

  it('invokes the middleware when a method has a single middleware', async () => {
    const response = await request(app).get('/class/oneMiddleware').expect(200);
    expect(response.get('x-executed')).toEqual('first');
  });

  it('invokes all middlewares in the order they were defined', async () => {
    const response = await request(app).get('/class/multipleMiddlewares').expect(200);
    expect(response.get('x-executed')).toEqual('first | second');
  });
});
