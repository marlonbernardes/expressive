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
} from 'express';
import {
  Controller,
  ControllerMetadata,
  Route,
  MethodMetadata,
  RouteMetadata,
} from './decorators/types';
import { getControllerMetadata, getMethodMetadata } from './utils/reflection';

export function registerControllers(
  app: Application,
  controllers: Controller[],
  globalMiddlewares: RequestHandler[]
) {
  for (const controller of controllers) {
    registerSingleController(app, controller, globalMiddlewares);
  }
}

function registerSingleController(
  app: Application,
  controller: Controller,
  globalMiddlewares: RequestHandler[]
) {
  const classMetadata: ControllerMetadata = getControllerMetadata(controller);
  const router = Router(classMetadata.options);

  registerMethods(router, controller);
  registerRouter(app, router, globalMiddlewares, classMetadata.basePath);
}

function registerRouter(
  app: Application,
  router: IRouter,
  globalMiddlewares: RequestHandler[],
  basePath: PathParams
) {
  app.use(basePath, globalMiddlewares, router);
}

function registerMethods(router: IRouter, controller: Controller) {
  const prototype = Object.getPrototypeOf(controller);
  const members = [
    ...Object.getOwnPropertyNames(controller),
    ...Object.getOwnPropertyNames(prototype),
  ];

  const controllerMetadata: RouteMetadata = getControllerMetadata(controller);
  console.log('class middlewares detected', controllerMetadata.middlewares.length);
  controllerMetadata.middlewares.forEach((m) => router.use(m));

  for (const member of members) {
    const metadata: MethodMetadata = getMethodMetadata(controller.constructor, member);
    console.log('metaaaa', member, metadata, prototype);
    if (metadata.routes.length > 0) {
      registerSingleMethod(router, controller, member, metadata);
    }
  }

  controllerMetadata.errorMiddlewares.forEach((m) => router.use(m));
}

function registerSingleMethod(
  router: IRouter,
  controller: Controller,
  member: any,
  metadata: MethodMetadata
) {
  const { routes, middlewares, errorMiddlewares, wrapper }: MethodMetadata = metadata;
  console.log('method middlewares detected', middlewares.length);
  let callBack: (...args: any[]) => any = (...args: any[]): any => {
    return controller[member](...args);
  };

  // @TODO Add support for class wrapper here
  // if (classWrapper) {
  //   callBack = classWrapper(callBack);
  // }

  if (wrapper) {
    callBack = wrapper(callBack);
  }

  if (errorMiddlewares) {
    errorMiddlewares.forEach((errorMiddleware: ErrorRequestHandler) => {
      callBack = wrapErrorMiddleware(errorMiddleware, callBack);
    });
  }

  routes.forEach((route: Route) => {
    const { verb, path }: Route = route;
    router[verb](path, middlewares, callBack);
  });
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
