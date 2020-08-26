import express from 'express';
import request from 'supertest';
import {
  bootstrap,
  Get,
  Controller,
  Post,
  Head,
  Put,
  Delete,
  Options,
  Patch,
  All,
} from '../../src';
import { Response, Request, Application } from 'express-serve-static-core';

@Controller('/first')
export class FirstController {
  @Get()
  public first(req: Request, res: Response) {
    res.send('first');
  }
}

@Controller('/second')
export class SecondController {
  @Get()
  public second(req: Request, res: Response) {
    res.send('second');
  }
}

describe('MultipleControllers - register multiple controllers at once', () => {
  let app: Application;
  let first;
  let second;

  beforeEach(() => {
    app = express();
    first = new FirstController();
    second = new SecondController();
    bootstrap(app, [first, second]);
  });

  it('matches handlers from different controllers', async () => {
    await request(app).get('/first').expect(200, 'first');
    await request(app).get('/second').expect(200, 'second');
  });
});
