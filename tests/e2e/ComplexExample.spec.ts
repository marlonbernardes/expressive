import express, { Request, Response, Application } from 'express';
import request from 'supertest';
import { bootstrap, Wrapper } from '../../src';
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

const classWrapper = (fn: any) => {
  return (req: any, res: any, next?: any) => {
    res.set('x-class-wrapped', 'true');
    fn(req, res, next);
  };
};

const methodWrapper = (fn: any) => {
  return (req: any, res: any, next?: any) => {
    res.set('x-method-wrapped', 'true');
    fn(req, res, next);
  };
};

@Controller('/first')
@Wrapper(classWrapper)
@Middleware([firstMiddleware()])
export class ComplexController {
  @Wrapper(methodWrapper)
  @Middleware(secondMiddleware())
  @Get('/methodA')
  public methodA(req: Request, res: Response) {
    res.send('methodA');
  }

  @Get('/methodB')
  public methodB(req: Request, res: Response) {
    res.send('methodB');
  }
}

@Controller('/second')
@Middleware([secondMiddleware()])
export class AnotherComplexController {
  @Wrapper(methodWrapper)
  @Get('/methodC')
  public methodC(req: Request, res: Response) {
    res.send('methodA');
  }

  @Get('/methodD')
  public methodD(req: Request, res: Response) {
    res.send('methodD');
  }
}

describe('foo', () => {
  let app: Application;
  let first;
  let second;

  beforeEach(() => {
    app = express();
    first = new ComplexController();
    second = new AnotherComplexController();
    bootstrap(app, [first, second]);
  });

  describe('when invoking methodA', () => {
    it('executes both class and method wrapper/middlewares', async () => {
      const response = await request(app).get('/first/methodA').expect(200);
      expect(response.get('x-class-wrapped')).toEqual('true');
      expect(response.get('x-executed')).toEqual('first | second');
      expect(response.get('x-method-wrapped')).toEqual('true');
    });
  });

  describe('when invoking methodB', () => {
    it('invokes the class wrapper and the class middleware', async () => {
      const response = await request(app).get('/first/methodB').expect(200);
      expect(response.get('x-class-wrapped')).toEqual('true');
      expect(response.get('x-executed')).toEqual('first');
      expect(response.get('x-method-wrapped')).toBeUndefined();
    });
  });

  describe('when invoking methodC', () => {
    it('invokes the class middleware and method wrapper', async () => {
      const response = await request(app).get('/second/methodC').expect(200);
      expect(response.get('x-class-wrapped')).toBeUndefined();
      expect(response.get('x-executed')).toEqual('second');
      expect(response.get('x-method-wrapped')).toEqual('true');
    });
  });

  describe('when invoking methodD', () => {
    it('invokes the class middleware', async () => {
      const response = await request(app).get('/second/methodD').expect(200);
      expect(response.get('x-class-wrapped')).toBeUndefined();
      expect(response.get('x-executed')).toEqual('second');
      expect(response.get('x-method-wrapped')).toBeUndefined();
    });
  });
});
