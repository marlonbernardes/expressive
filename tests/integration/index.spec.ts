import express, { RequestHandler } from 'express';
import { bootstrap, Controller, Get } from '../../src/';
import request from 'supertest';
import { Response, Request } from 'express-serve-static-core';

describe('foo', () => {
  it('by path', async () => {
    const app = express();

    @Controller('/foo')
    class Foo {
      @Get('/abc')
      public test(req: Request, res: Response): RequestHandler {
        return res.send('foo');
      }
    }

    bootstrap(app, [new Foo()]);

    await request(app).get('/foo/abc').expect(200, 'foo');
  });

  it('by id', async () => {
    const app = express();
    @Controller('/foo')
    class Foo {
      @Get('/:id')
      public test2(req: Request, res: Response): any {
        res.send(req.params);
      }
    }
    bootstrap(app, [new Foo()]);

    await request(app).get('/foo/123').expect(200, { id: '123' });
  });
});
