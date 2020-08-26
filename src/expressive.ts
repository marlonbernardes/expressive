import 'reflect-metadata';
import {
  Application,
  PathParams,
  RequestHandler,
  ErrorRequestHandler,
  Request,
  Response,
  NextFunction,
} from 'express-serve-static-core';
import { IRouter, Router, RouterOptions } from 'express';
import { Controller, ControllerMetadata, Route, MethodMetadata } from './types';
import { getControllerMetadata, getMethodMetadata } from './utils/reflection';

type CreateOptions = {
  routerFactory: (opts?: RouterOptions) => IRouter;
};

type BootstrapOptions = CreateOptions & {
  globalMiddlewares: RequestHandler[];
};

type RouterConfig = {
  basePath: PathParams;
  router: IRouter;
};

export function create(
  controllers: Controller[],
  options?: Partial<CreateOptions>
): RouterConfig[] {
  const defaults = { routerFactory: Router };
  return controllers.map((ctrl) => createRouter(ctrl, { ...defaults, ...options }));
}

export function bootstrap(
  app: Application,
  controllers: Controller[],
  options?: Partial<BootstrapOptions>
): void {
  const defaults = { globalMiddlewares: [], routerFactory: Router };
  const config = { ...defaults, ...options };
  const routers: RouterConfig[] = create(controllers, config);

  for (const routerConfig of routers) {
    app.use(routerConfig.basePath, config.globalMiddlewares, routerConfig.router);
  }
}

function createRouter(controller: Controller, options: CreateOptions): RouterConfig {
  const controllerMetadata: ControllerMetadata = getControllerMetadata(controller.constructor);
  const router = options.routerFactory(controllerMetadata.options);
  const prototype = Object.getPrototypeOf(controller);

  const members = [
    ...Object.getOwnPropertyNames(controller),
    ...Object.getOwnPropertyNames(prototype),
  ];

  controllerMetadata.middlewares.forEach((m) => router.use(m));
  members.forEach((method) => registerMethod(router, controller, method));

  controllerMetadata.errorMiddlewares.forEach((m) => router.use(m));
  return { basePath: controllerMetadata.basePath, router };
}

function registerMethod(router: IRouter, controller: Controller, member: string): void {
  const methodMeta: MethodMetadata = getMethodMetadata(controller.constructor, member);
  const controllerMeta: ControllerMetadata = getControllerMetadata(controller.constructor);

  if (methodMeta.routes.length > 0) {
    let callback = (req: Request, res: Response, next: NextFunction): RequestHandler => {
      return controller[member](req, res, next);
    };

    if (controllerMeta.wrapper) {
      // @ts-ignore FIX ME
      callback = controllerMeta.wrapper(callback);
    }

    if (methodMeta.wrapper) {
      // @ts-ignore FIX ME
      callback = methodMeta.wrapper(callback);
    }

    if (methodMeta.errorMiddlewares) {
      methodMeta.errorMiddlewares.forEach((errorMiddleware: ErrorRequestHandler) => {
        // @ts-ignore FIX ME
        callback = wrapErrorMiddleware(errorMiddleware, callback);
      });
    }

    methodMeta.routes.forEach((route: Route) => {
      const { verb, path }: Route = route;
      // @ts-ignore FIX ME
      router[verb](path, methodMeta.middlewares, callback);
    });
  }
}

function wrapErrorMiddleware(
  errorMiddleware: ErrorRequestHandler,
  requestHandler: RequestHandler
): RequestHandler {
  return (req: Request, res: Response, next?: NextFunction): void => {
    try {
      requestHandler(req, res, next);
    } catch (error) {
      errorMiddleware(error, req, res, next!);
    }
  };
}
