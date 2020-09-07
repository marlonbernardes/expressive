# 🚀 Expressive

Simple, flexible and lightweight library for creating express routers
using decorators.

[![npm version](https://badge.fury.io/js/%40bitmountain%2Fexpressive.svg)](https://www.npmjs.com/package/@bitmountain/expressive)
[![codecov](https://codecov.io/gh/BitMountain/expressive/branch/main/graph/badge.svg)](https://codecov.io/gh/BitMountain/expressive)

![demo](https://user-images.githubusercontent.com/2975955/92334361-f7163b00-f084-11ea-9ced-847db66d230d.gif)

### Features

- Create routers using `@Controller` (or its alias, `@Router`) in a class.
- Define endpoints by decorating methods with `@Get`, `@Post`, `@Put`, `@Delete`, `@All`, etc. More obscure http methods can be used via `@Route(<http-method>, <path>)`
- Define class or method-level middlewares using `@Middleware`
- Optionally wrap your methods using `@Wrapper` - ideal for handling errors in async methods!
- Provides aliases for most commonly used http methods (e.g `Get, @Post, @Put, etc`) and also allows custom http methods to be used via `@Route(<verb>)`
- Lightweight: depends directly only on `reflect-metadata` and the codebase has around 250 lines of code!
- Can be gradually adopted: you can use it only for parts of your api, if you desire.

### Installation

Install both `@bitmountain/expressive` and `express` (or `express@next` if you want to give express 5.x a try).

```sh
npm install @bitmountain/expressive express
```

Expressive is compatible with express 4.x and express 5.x (alpha).

Note that this library make heavy use of decorators - so make sure you have them enabled in your TypeScript settings:

```json5
{
  "compilerOptions": {
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    // other compiler options
  }
}
```

### Getting started

```ts
import bootstrap, { Controller, Get } from '@bitmountain/expressive';
import express from 'express';

@Controller('/hello')
export class FooController {

  @Get('/world')
  public bar(req: Request, res: Response) {
    res.send('Hello world!');
  }
}

// create your express app like you normally would
const app = express();

//  the line below will create and register the routers into the app
// (you can also pass additional options or use .create to manually register the routers
// - see the rest of the documentation below)
expressive.bootstrap(app, [new FooController()])
app.listen(3000);
```

### Decorators

| Decorator                                                | Description                                                                                                                                                                                                                                                                                | Where can it be applied?  |
|----------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------  |
| `@Controller(basePath: string, options?: RouterOptions)` | Allow classes to group methods/endpoints under a common base path. An express [RouterOptions](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/0d9e09b48c0b6ed03299163d78db1b87f97fa448/types/express/index.d.ts#L74-L93) object can also be provided with additional configuration | Classes                   |
| `@Router(basePath: string, options: RouterOptions)`      | Alias for `@Controller`                                                                                                                                                                                                                                                                    | Classes                   |
| `@Get/@Post/@Put/@Delete/@Options/@Patch/@Head(path: string \| RegExp \| string[] \| RegExp[])` | Used to convert a class method/property to an express route for serving requests matching the equivalent HTTP Verb.                                                                                                                                 | Methods   |
| `@Route(verb: string, path: string \| RegExp \| string[] \| RegExp[])` | Same as above, but allows you to manually specify the http verb you want to use. | Methods |
| `@All(path: string \| RegExp \| string[] \| RegExp[])` | Same as above, but matches all http verbs (see [express.all()](https://expressjs.com/en/api.html#app.all)) | Methods |
| `@Middleware(RequestHandler \| RequestHandler[])`         | Used to apply one or more middlewares to a method or a class. Middlewares applied to classes will be invoked for each method of the class. | Classes and methods  |
| `@ErrorMiddleware(ErrorRequestHandler \| ErrorRequestHandler[])` | Used to apply one or more error middlewares to a method or a class. Error middlewares applied to classes will be invoked for each method of the class. | Classes and methods |
| `@Wrapper(wrapperFunction: () => RequestHandler)` | Can be applied to a method or class. When applied to a class, wraps all methods of the class with the provided function.  | Classes and methods  |

### API

**expressive.bootstrap(app, [controllers], options?)**

Creates one express router for each controller instance provided and
registers them in the given express app.

- options:
```ts
{

  // Array of middlewares which will be applied to all routes.
  // Middlewares can also be specified at a class/method level
  // using the @Middleware decorator.
  globalMiddlewares?: []

  // Wwrapper function which will "wrap" each one of the routes.
  // Wrappers can also be specified at a class/method level using the
  // @Wrapper decorator.
  globalWrapper?: (fn) => (req, res, next) => fn(req, res, next)

  // By default, expressive uses express.Router(opts) to construct
  // router instances (where the "opts" variable is optionally provided
  // via the @Controller decorator. You can use this variable if you want
  // expressive to use a custom router.
  routerFactory: (opts?: RouterOptions) => Router;
}
```

**expressive.create([controllers], options?)**

Creates one express router for each one of the controller instances provided.
When using this function you have to manually register the controllers in the express app,
like so:

```ts
const app = express();
const cfgs = expressive.create([new UsersController()]);
cfgs.forEach(cfg => app.use(cfg.basePath, cfg.router));
```

- options:

```ts
{

  // Wrapper function which will "wrap" each one of the routes.
  // Wrappers can also be specified at a class/method level using the
  // @Wrapper decorator
  globalWrapper?: (fn) => (req, res, next) => fn(req, res, next)

  // By default, expressive uses express.Router(opts) to construct
  // router instances (where the "opts" variable is optionally provided
  // via the @Controller decorator. You can use this variable if you want
  // expressive to use a custom router.
  routerFactory: (opts?: RouterOptions) => Router;
}
```

### Examples

**Applying a middleware to a single method in a controller**
```ts
@Controller('/users')
export class UsersController {

  @Get('/:id')
  // the middleware below will be invoked before findById is executed
  @Middleware([loggingMiddleware()])
  public findById(req: Request, res: Response) {
    res.json({ foo: 'bar' });
  }
}
```

**Applying a middleware to all methods in a controller**

```ts
@Controller('/users')
// the middleware below will be executed for all methods in this controller
@Middleware([authMiddleware()])
export class UsersController {

  @Get('/:id')
  public findById(req: Request, res: Response) {
    res.json({ foo: 'bar' });
  }

  @Get('/')
  public findAll(req: Request, res: Response) {
    res.send([{ user: '' ]);
  }
}
```

**Adding a middleware to all methods in ALL controllers**

```ts
@Controller('/users')
export class UsersController {  /* methods here */ }

@Controller('/projects')
export class ProjectsController {  /* methods here */ }

const app = express();
expressive.bootstrap(app, [new UsersController(), new ProjectsController()], {
  // The middleware below will be added to all methods in all controllers registered above.
  // You can also add middlewares at controller or method level using the @Middleware decorator.
  globalMiddlewares: [loggingMiddleware()]
})
```

**Handling async methods**

One way to handle async methods is to wrap the functions using an async handler. You can wrap
all the methods in a controller using `@Wrapper` or provide a value to the `globalWrapper` property
when calling `expressive.bootstrap`:

> Note: This is only needed for express 4.x or below.
> Starting from express 5.x an async wrapper will no longer be needed, as express automatically
takes care of handlers that return promises.

```ts
import asyncHandler from 'express-async-handler';

@Controller('/users')
@Wrapper(asyncHandler)
export class UsersController {

  @Get('/:id')
  public async findById(req: Request, res: Response) {
    const user = await db.findUserById(req.params.id);
    res.json(user);
  }
}

const app = express();
express.bootstrap(app, [new UsersController()]);

// alternatively, you can get rid of the @Wrapper decorator above
// and apply it to all controllers at once:
// express.bootstrap(app, [new UsersController()], {
//  globalWrapper: asyncHandler
//});
```

### FAQ

**- In what order are routes matched?**

If a request match 2 different routes, only the first matched route (the one the appears first in the class) will be executed. This matches express' behaviours, where
the first route always takes priority. As an example:

```ts
@Controller('/users')
export class UsersController {

  @Get('/:id')
  public foo() {}

  // IMPORTANT: this will never be executed, as the route above (GET /:id) was
  // registered first and also matches the endpoint GET /users/hello
  @Get('/hello')
  public hello() {}
}

```

**- In what order are middlewares executed?**

In the order they were provided (just like in express)

```ts
// execution order goes from left to right
@Middleware([first(), second(), third()])
@Get('/:id')
public loadById(req: Request, res: Response) {

}
```

**- How do I handle async methods?**

If using express 5.x (in alpha as of this writing) you don't have to do anything,
as async routes are automatically handled by express. If using express <= 4.x you need to
either add a try/catch block around your async methods (and call `next()` accordingly) or use an async wrapper. You can
write your own async wrapper in a few lines of code or use a library such as `express-async-handler`.

There's one example above in this documentation that covers how to use an async wrapper.

### Why expressive?

- There are other libraries/frameworks out there that serve a similar purpose (NestJS, tsed, Overnight, inversify-express-utils), but they either have a much steeper learning curve or they are too opinionated in the way you create your app and controllers. Expressive just provides decorators so you can create and register the routers in a more elegant way.

### Contributing

→ See [Contribution Guidelines](./CONTRIBUTING.md) for more details.

### Code of Conduct

→ See [Code of Conduct](./CODE_OF_CONDUCT.md) for more details.

### License

[MIT](./LICENSE)
