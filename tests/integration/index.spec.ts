import express, { Request, Response } from 'express';
import { register, Controller, Get, Post } from '../../src/';
import request from 'supertest';

describe('foo', () => {
  it('by path', async () => {
    const app = express();

    @Controller('/foo')
    class Foo {
      @Get('/abc')
      public test(req: Request, res: Response) {
        return res.send('foo');
      }
    }

    register(app, [new Foo()]);

    await request(app).get('/foo/abc').expect(200, 'foo');
  });

  it('by id', async () => {
    const app = express();
    @Controller('/foo')
    class Foo {
      @Get('/:id')
      public test2(req: Request, res: Response) {
        return res.send(req.params);
      }
    }
    register(app, [new Foo()]);

    await request(app).get('/foo/123').expect(200, { id: '123' });
  });
});
