import express from 'express';
import request from 'supertest';
import { bootstrap, Wrapper } from '../../src';
import { Controller } from '../../src/decorators/controller';
import { Middleware, ErrorMiddleware } from '../../src/decorators/middleware';
import { Get } from '../../src/decorators/method';
import { Request, Response, Application } from 'express-serve-static-core';

const errorMiddleware = () => {
  return (err: any, req: any, res: any, next: any) => {
    const message = err.message ?? 'default error message';
    res.set('x-error', message);
    res.end();
  };
}

const asyncWrapper = (cb: any) => {
  return async (req: any, res: any, next: any) => {
    try {
      return await cb(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};

const delay = (ms = 100) => {
  return new Promise((resolve) => setTimeout(() => resolve(), ms));
};

@Controller('/class')
@ErrorMiddleware(errorMiddleware())
export class ClassErrorMiddleware {
  @Get('/success')
  public success(req: Request, res: Response) {
    res.send('methodA');
  }

  @Get('/error')
  public error(req: Request, res: Response) {
    throw Error('error message')
  }

  @Get('/async-error')
  // async wrapper is no longer needed for express >= 5.0.0.alpha8
  @Wrapper(asyncWrapper)
  public async asyncError(req: Request, res: Response) {
    await delay(100);
    throw Error('async error');
  }
}

describe(`ClassErrorMiddleware - when the class has an error middleware`, () => {
  let app: Application;
  let instance;

  beforeEach(() => {
    app = express();
    instance = new ClassErrorMiddleware();
    bootstrap(app, [instance]);
  });

  it('does not invoke the error middleware when the method succeeds', async () => {
    const response = await request(app).get('/class/success').expect(200);
    expect(response.get('x-error')).toBeUndefined();
  });

  it('invokes the error middleware when the method throws an error', async () => {
    const response = await request(app).get('/class/error').expect(200);
    expect(response.get('x-error')).toEqual('error message');
  });

  it('handles async errors if they have been handled by a wrapper', async () => {
    const response = await request(app).get('/class/async-error').expect(200);
    expect(response.get('x-error')).toEqual('async error');
  });
});

