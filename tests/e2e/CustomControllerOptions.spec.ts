import express from 'express';
import request from 'supertest';
import { bootstrap } from '../../src';
import { Controller } from '../../src/decorators/controller';
import { Get } from '../../src/decorators/method';
import { Response, Request, Application } from 'express-serve-static-core';

@Controller('/sensitive', { caseSensitive: true })
export class CaseSensitiveController {
  @Get('/foo')
  public foo(req: Request, res: Response) {
    res.send('foo');
  }
}

@Controller('/insensitive', { caseSensitive: false })
export class CaseInsensitiveController {
  @Get('/foo')
  public foo(req: Request, res: Response) {
    res.send('foo');
  }
}

describe('CustomControllerOptions - when custom options are passed to the controller', () => {
  let app: Application;
  let sensitive;
  let insensitive;

  beforeEach(() => {
    app = express();
    sensitive = new CaseSensitiveController();
    insensitive = new CaseInsensitiveController();
    bootstrap(app, [sensitive, insensitive]);
  });

  describe('when calling a case sensitive controller', () => {
    it('does not matches methods with a different casing', async () => {
      await request(app).get('/sensitive/foo').expect(200, 'foo');
      await request(app).get('/sensitive/FOO').expect(404);
      await request(app).get('/sensitive/fOO').expect(404);
    });
  });

  describe('when calling a case insensitive controller', () => {
    it('matches methods regardless of casing', async () => {
      await request(app).get('/insensitive/foo').expect(200, 'foo');
      await request(app).get('/insensitive/FOO').expect(200, 'foo');
      await request(app).get('/insensitive/fOO').expect(200, 'foo');
    });
  });
});
