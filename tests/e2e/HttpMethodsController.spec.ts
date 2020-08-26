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
import { RoutingMethod } from '../../src/types';

@Controller('/http')
export class HttpMethodsController {
  @Get('/get')
  public get(req: Request, res: Response) {
    res.send('get');
  }

  @Post('/post')
  public string(req: Request, res: Response) {
    res.send('post');
  }

  @Put('/put')
  public put(req: Request, res: Response) {
    res.send('put');
  }

  @Head('/head')
  public head(req: Request, res: Response) {
    res.end();
  }

  @Delete('/del')
  public del(req: Request, res: Response) {
    res.send('del');
  }

  @Options('/options')
  public options(req: Request, res: Response) {
    res.send('options');
  }

  @Patch('/patch')
  public patch(req: Request, res: Response) {
    res.send('patch');
  }

  @All('/all')
  public all(req: Request, res: Response) {
    res.send('all');
  }
}

describe('HttpMethodsController - match most commonly used http verbs', () => {
  let app: Application;
  let instance;

  beforeEach(() => {
    app = express();
    instance = new HttpMethodsController();
    bootstrap(app, [instance]);
  });

  it('matches GET requests to methods decorated with @Get', async () => {
    await request(app).get('/http/get').expect(200, 'get');
  });

  it('matches POST requests to methods decorated with @Post', async () => {
    await request(app).post('/http/post').expect(200, 'post');
  });

  it('matches PUT requests to methods decorated with @Put', async () => {
    await request(app).put('/http/put').expect(200, 'put');
  });

  it('matches DELETE request to methods decorated with @Delete', async () => {
    await request(app).del('/http/del').expect(200, 'del');
  });

  it('matches HEAD requests to methods decorated with @Head', async () => {
    await request(app).head('/http/head').expect(200);
  });

  it('matches OPTIONS requests to methods decorated with @Options', async () => {
    await request(app).options('/http/options').expect(200, 'options');
  });

  it('matches PATCH requests to methods decorated with @Patch', async () => {
    await request(app).patch('/http/patch').expect(200, 'patch');
  });

  it('matches all http verbs to methods decorated with @All', async () => {
    const someVerbs: RoutingMethod[] = [
      'get',
      'post',
      'put',
      'delete',
      'options',
      'subscribe',
      'patch',
    ];

    for (const verb of someVerbs) {
      const response = await (<any>request(app))[verb]('/http/all');
      const errorMessage = `Verb '${verb}' does not match method decorated with @All`;
      expect({ errorMessage, status: response.statusCode }).toEqual({ errorMessage, status: 200 });
    }
  });
});
