import express, { Response, Request, Application } from 'express';
import request from 'supertest';
import { bootstrap } from '../../src';
import { Controller } from '../../src/decorators/controller';
import { Get } from '../../src/decorators/method';

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
