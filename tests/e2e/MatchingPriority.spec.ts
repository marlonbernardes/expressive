import express from 'express';
import request from 'supertest';
import { bootstrap } from '../../src';
import { Controller } from '../../src/decorators/controller';
import { Get } from '../../src/decorators/method';
import { Response, Request, Application } from 'express-serve-static-core';

@Controller('/priority')
export class MatchingPriorityGenericRouteFirst {
  @Get('/:id')
  public firstMatchingRoute(req: Request, res: Response) {
    res.send('firstMatchingRoute');
  }

  // this function would never be matched if configured
  // via express routers, as the route /:id (which comes first)
  // would also match the route below.
  // To fix it we could define this handler before
  // the /:id handler, but we first want to test this is behaving
  // the same way it would behave if we were using express directly.
  @Get('/never')
  public never(req: Request, res: Response) {
    res.send('never');
  }
}

describe('MatchingPriorityGenericRouteFirst - request is handled by first matching route', () => {
  let app: Application;
  let instance;

  beforeEach(() => {
    app = express();
    instance = new MatchingPriorityGenericRouteFirst();
    bootstrap(app, [instance]);
  });

  it('handles the request using the first matching route', async () => {
    await request(app).get('/priority/123').expect(200, 'firstMatchingRoute');
    await request(app).get('/priority/never').expect(200, 'firstMatchingRoute');
  });
});

@Controller('/priority')
export class MatchingPrioritySpecificRouteFirst {
  @Get('/specific')
  public specific(req: Request, res: Response) {
    res.send('specific');
  }

  @Get('/:id')
  public id(req: Request, res: Response) {
    res.send(req.params.id);
  }
}

describe('MatchingPrioritySpecificRouteFirst - request is handled by first matching route', () => {
  let app: Application;
  let instance;

  beforeEach(() => {
    app = express();
    instance = new MatchingPrioritySpecificRouteFirst();
    bootstrap(app, [instance]);
  });

  it('handles the request using the first matching route', async () => {
    await request(app).get('/priority/specific').expect(200, 'specific');
    await request(app).get('/priority/123').expect(200, '123');
  });
});
