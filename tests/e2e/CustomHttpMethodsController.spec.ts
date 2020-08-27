import express from 'express';
import request from 'supertest';
import { bootstrap } from '../../src';
import { Controller } from '../../src/decorators/controller';
import { Route } from '../../src/decorators/method';
import { Response, Request, Application } from 'express-serve-static-core';

@Controller('/custom')
export class CustomHttpMethodsController {
  @Route('get', '/get')
  public get(req: Request, res: Response) {
    res.send('get');
  }

  @Route('subscribe', '/subscribe')
  public custom(req: Request, res: Response) {
    res.send('subscribe');
  }

  @Route('subscribe', '/multiple')
  @Route('unsubscribe', '/multiple')
  public multiple(req: Request, res: Response) {
    res.send('multiple');
  }
}

describe('CustomHttpMethodsController - allow custom http verbs to be used', () => {
  let app: Application;
  let instance;

  beforeEach(() => {
    app = express();
    instance = new CustomHttpMethodsController();
    bootstrap(app, [instance]);
  });

  it(`matches @Route('get', ...) to GET calls`, async () => {
    await request(app).get('/custom/get').expect(200, 'get');
  });

  it(`matches @Route('subscribe', ...) to SUBSCRIBE calls`, async () => {
    await request(app).subscribe('/custom/subscribe').expect(200, 'subscribe');
  });

  it('allows multiple custom @Routes to be applied to the same method', async () => {
    await request(app).subscribe('/custom/multiple').expect(200, 'multiple');
    await request(app).unsubscribe('/custom/multiple').expect(200, 'multiple');
  });
});
