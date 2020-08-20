import 'reflect-metadata';
import { PathParams } from 'express-serve-static-core';
import {
  Application,
  IRouter,
  NextFunction,
  Request,
  RequestHandler,
  ErrorRequestHandler,
  Response,
  Router,
  RouterOptions,
} from 'express';
import { Controller, ControllerMetadata, Route, MethodMetadata } from './decorators/types';
import { getControllerMetadata, getMethodMetadata } from './utils/reflection';

type CreateOptions = {
  routerFactory: (opts?: RouterOptions) => IRouter;
};

type CreateAndRegisterOptions = CreateOptions & {
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

export function register(
  app: Application,
  controllers: Controller[],
  options?: Partial<CreateAndRegisterOptions>
) {
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

function registerMethod(router: IRouter, controller: Controller, member: string) {
  const methodMeta: MethodMetadata = getMethodMetadata(controller.constructor, member);
  const controllerMeta: ControllerMetadata = getControllerMetadata(controller.constructor);

  if (methodMeta.routes.length > 0) {
    let callback = (req: Request, res: Response, next: NextFunction) => {
      return controller[member](req, res, next);
    };

    if (controllerMeta.wrapper) {
      callback = controllerMeta.wrapper(callback);
    }

    if (methodMeta.wrapper) {
      callback = methodMeta.wrapper(callback);
    }

    if (methodMeta.errorMiddlewares) {
      methodMeta.errorMiddlewares.forEach((errorMiddleware: ErrorRequestHandler) => {
        callback = wrapErrorMiddleware(errorMiddleware, callback);
      });
    }

    methodMeta.routes.forEach((route: Route) => {
      const { verb, path }: Route = route;
      router[verb](path, methodMeta.middlewares, callback);
    });
  }
}

function wrapErrorMiddleware(
  errorMiddleware: ErrorRequestHandler,
  requestHandler: RequestHandler
): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      requestHandler(req, res, next);
    } catch (error) {
      errorMiddleware(error, req, res, next);
    }
  };
}
