import express from 'express';
import request from 'supertest';
import { bootstrap } from '../../src';
import { Controller } from '../../src/decorators/controller';
import { Get } from '../../src/decorators/method';
import { Response, Request, Application } from 'express-serve-static-core';

@Controller('v1')
export class BasePathAsStringController {
  @Get()
  public empty(req: Request, res: Response) {
    res.send('empty');
  }

  @Get('string')
  public string(req: Request, res: Response) {
    res.send('string');
  }

  @Get(/foo|bar/)
  public regexp(req: Request, res: Response) {
    res.send('regexp');
  }
}

describe('StringBasePathController - when the base path is a string', () => {
  let app: Application;
  let instance;

  beforeEach(() => {
    app = express();
    instance = new BasePathAsStringController();
    bootstrap(app, [instance]);
  });

  it('matches methods with an empty path', async () => {
    await request(app).get('/v1').expect(200, 'empty');
  });

  it('matches methods with a string path', async () => {
    await request(app).get('/v1/string').expect(200, 'string');
  });

  it('matches methods with a regexp path', async () => {
    await request(app).get('/v1/foo').expect(200, 'regexp');
    await request(app).get('/v1/bar').expect(200, 'regexp');
  });

  it('does not match paths not covered by the regexp', async () => {
    await request(app).get('/v1/baz').expect(404);
  });
});

// matches /v1, /v2, /v100, etc
@Controller(/\/v\d+/)
export class BasePathAsRegExpController {
  @Get()
  public empty(req: Request, res: Response) {
    res.send('empty');
  }

  @Get('string')
  public string(req: Request, res: Response) {
    res.send('string');
  }

  @Get(/foo|bar/)
  public regexp(req: Request, res: Response) {
    res.send('regexp');
  }
}

describe('RegExpBasePathController - when the base path is a regexp', () => {
  let app: Application;
  let instance;

  beforeEach(() => {
    app = express();
    instance = new BasePathAsRegExpController();
    bootstrap(app, [instance]);
  });

  it('matches methods with an empty path', async () => {
    await request(app).get('/v9000').expect(200, 'empty');
  });

  it('matches methods with a string path', async () => {
    await request(app).get('/v1/string').expect(200, 'string');
  });

  it('matches methods with a regexp path', async () => {
    await request(app).get('/v100/foo').expect(200, 'regexp');
    await request(app).get('/v100/bar').expect(200, 'regexp');
  });

  it('does not match paths not covered by the regexp', async () => {
    await request(app).get('/vABC/foo').expect(404);
  });
});
