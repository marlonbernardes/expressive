import express, { Request, Response, Application } from 'express';
import request from 'supertest';
import { bootstrap } from '../../src';
import { Controller } from '../../src/decorators/controller';
import { Get } from '../../src/decorators/method';

const wrapper = (fn: any) => {
  return (req: any, res: any, next?: any) => {
    res.set('x-wrapped', 'true');
    fn(req, res, next);
  };
};

@Controller('/first')
export class FirstController {
  @Get('/methodA')
  public methodA(req: Request, res: Response) {
    res.send('methodA');
  }
}

@Controller('/second')
export class SecondController {
  @Get('/methodB')
  public methodB(req: Request, res: Response) {
    res.send('methodB');
  }
}

describe('Global Wrapper - when a global wrapper has been configured', () => {
  let app: Application;
  let first, second;

  beforeEach(() => {
    app = express();
    first = new FirstController();
    second = new SecondController();
    bootstrap(app, [first, second], { globalWrapper: wrapper });
  });

  it('invokes the global wrapper for all methods in all controllers', async () => {
    const methodA = await request(app).get('/first/methodA').expect(200, 'methodA');
    expect(methodA.get('x-wrapped')).toEqual('true');

    const methodB = await request(app).get('/second/methodB').expect(200, 'methodB');
    expect(methodB.get('x-wrapped')).toEqual('true');
  });
});
