import express, { NextFunction } from 'express';
import request from 'supertest';
import { bootstrap, Middleware, Wrapper } from '../../src';
import { Controller } from '../../src/decorators/controller';
import { Get } from '../../src/decorators/method';
import { Request, Response, Application } from 'express-serve-static-core';

const wrapper = (fn: any) => {
  return (req: any, res: any, next?: any) => {
    res.set('x-wrapped', 'true');
    fn(req, res, next)
  }
}

@Controller('/class')
@Wrapper(wrapper)
export class WrapperController {

  @Get('/methodA')
  public methodA(req: Request, res: Response) {
    res.send('methodA');
  }

  @Get('/methodB')
  public methodB(req: Request, res: Response) {
    res.send('methodB')
  }
}

describe('WrapperController - when the controller has a wrapper', () => {
  let app: Application;
  let instance;

  beforeEach(() => {
    app = express();
    instance = new WrapperController();
    bootstrap(app, [instance]);
  });

  it('invokes the wrapper for all methods in the controller', async () => {
    const methodA = await request(app).get('/class/methodA').expect(200, 'methodA');
    expect(methodA.get('x-wrapped')).toEqual('true');

    const methodB = await request(app).get('/class/methodB').expect(200, 'methodB');
    expect(methodB.get('x-wrapped')).toEqual('true');
  });
});
