import express, { Request, Response, Application } from 'express';
import request from 'supertest';
import { bootstrap } from '../../src';
import { Controller } from '../../src/decorators/controller';
import { Middleware } from '../../src/decorators/middleware';
import { Get } from '../../src/decorators/method';

const firstMiddleware = () => {
  return (req: any, res: any, next?: any) => {
    const header = res.get('x-executed') ?? '';
    res.set('x-executed', [header, 'first'].filter((v) => v).join(' | '));
    next && next();
  };
};

const secondMiddleware = () => {
  return (req: any, res: any, next?: any) => {
    const header = res.get('x-executed') ?? '';
    res.set('x-executed', [header, 'second'].filter((v) => v).join(' | '));
    next && next();
  };
};

@Controller('/class')
@Middleware([firstMiddleware()])
export class SingleControllerMiddleware {
  @Get('/methodA')
  public methodA(req: Request, res: Response) {
    res.send('methodA');
  }

  @Get('/methodB')
  public methodB(req: Request, res: Response) {
    res.send('methodB');
  }
}

describe('SingleControllerMiddleware - when the controller has one middleware', () => {
  let app: Application;
  let instance;

  beforeEach(() => {
    app = express();
    instance = new SingleControllerMiddleware();
    bootstrap(app, [instance]);
  });

  it('invokes the middleware for all methods', async () => {
    const methodAResponse = await request(app).get('/class/methodA').expect(200);
    expect(methodAResponse.get('x-executed')).toEqual('first');

    const methodBResponse = await request(app).get('/class/methodB').expect(200);
    expect(methodBResponse.get('x-executed')).toEqual('first');
  });
});

@Controller('/class')
@Middleware([firstMiddleware(), secondMiddleware()])
export class MultipleControllerMiddlewares {
  @Get('/methodA')
  public methodA(req: Request, res: Response) {
    res.send('methodA');
  }

  @Get('/methodB')
  public methodB(req: Request, res: Response) {
    res.send('methodB');
  }
}

describe('MultipleControllerMiddlewares - when the controller has more than one middleware', () => {
  let app: Application;
  let instance;

  beforeEach(() => {
    app = express();
    instance = new MultipleControllerMiddlewares();
    bootstrap(app, [instance]);
  });

  it('invokes middlewares for all methods in the order they were defined', async () => {
    const methodAResponse = await request(app).get('/class/methodA').expect(200);
    expect(methodAResponse.get('x-executed')).toEqual('first | second');

    const methodBResponse = await request(app).get('/class/methodB').expect(200);
    expect(methodBResponse.get('x-executed')).toEqual('first | second');
  });
});
