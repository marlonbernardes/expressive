import express, { Response, Request, Application } from 'express';
import request from 'supertest';
import { bootstrap } from '../../src';
import { Controller } from '../../src/decorators/controller';
import { Get, Post, Delete } from '../../src/decorators/method';

@Controller('/multiple')
export class MultipleMethodDecorators {
  @Get('/verbs')
  @Post('/verbs')
  @Delete('/verbs')
  public multipleVerbs(req: Request, res: Response) {
    res.send('multipleVerbs');
  }

  @Get('/firstPath')
  @Get('/secondPath')
  public multiplePaths(req: Request, res: Response) {
    res.send('multiplePaths');
  }
}

describe('MultipleMethodDecorators - controllers with more than one decorator on the same handler', () => {
  let app: Application;
  let instance;

  beforeEach(() => {
    app = express();
    instance = new MultipleMethodDecorators();
    bootstrap(app, [instance]);
  });

  it('match handlers annotated with multiple http verb decorators', async () => {
    await request(app).get('/multiple/verbs').expect(200, 'multipleVerbs');
    await request(app).post('/multiple/verbs').expect(200, 'multipleVerbs');
    await request(app).delete('/multiple/verbs').expect(200, 'multipleVerbs');
    // expect 404, as the handler is not annotated with @Put
    await request(app).put('/multiple/verbs').expect(404);
  });

  it('match handlers annotated with multiple paths ', async () => {
    await request(app).get('/multiple/firstPath').expect(200, 'multiplePaths');
    await request(app).get('/multiple/secondPath').expect(200, 'multiplePaths');
  });
});
