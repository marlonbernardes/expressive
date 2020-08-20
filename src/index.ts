export * from './decorators';
export * from './injector';
import express, { Response, Request, NextFunction } from 'express';
import { Controller, Get, Middleware, ClassMiddleware } from './decorators';
import { registerControllers } from './injector';

function cmd(req: Request, res: Response, next: NextFunction) {
  console.log('to no class middleware')
  next();
}

function md(req: Request, res: Response, next: NextFunction) {
  console.log('to no middleware')
  next();
}

@Controller('/v1/users')
@ClassMiddleware([cmd])
class Foo {

  @Get('/')
  @Middleware([md])
  public test(req: Request, res: Response) {
    return res.send('foo');
  }

  // @Get('/:id')
  // public test2(req: Request, res: Response) {
  //   return res.send('foo');
  // }
}


// const router = express.Router();
// router.get('/bar', (req, res) => res.send('foobar'));

const app = express();
registerControllers(app, [new Foo()], []);

// app.use('/foo', router);
app.listen(3232);
console.log('ready')
