import 'reflect-metadata';
import {
  Application,
  RequestHandler,
  Request,
  Response,
  NextFunction,
} from 'express-serve-static-core';
import { Router } from 'express';
import {
  Controller,
  ControllerMetadata,
  Route,
  ExpressRouter,
  MethodMetadata,
  CreateOptions,
  RouterConfig,
  BootstrapOptions,
} from './types';
import { getControllerMetadata, getMethodMetadata } from './utils/reflection';

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
  members.forEach((method) => registerMethod(router as ExpressRouter, controller, method, options));
  controllerMetadata.errorMiddlewares.forEach((m) => router.use(m));

  return { basePath: controllerMetadata.basePath, router };
}

function registerMethod(
  router: ExpressRouter,
  controller: Controller,
  member: string,
  options: CreateOptions
): void {
  const methodMeta: MethodMetadata = getMethodMetadata(controller.constructor, member);
  const controllerMeta: ControllerMetadata = getControllerMetadata(controller.constructor);

  if (methodMeta.routes.length > 0) {
    let callback = (req: Request, res: Response, next?: NextFunction): RequestHandler => {
      return controller[member](req, res, next);
    };

    if (options.globalWrapper) {
      callback = options.globalWrapper(callback);
    }

    if (controllerMeta.wrapper) {
      callback = controllerMeta.wrapper(callback);
    }

    if (methodMeta.wrapper) {
      callback = methodMeta.wrapper(callback);
    }

    methodMeta.routes.forEach((route: Route) => {
      const { verb, path }: Route = route;
      router[verb](path,
        ...methodMeta.middlewares,
        callback,
        ...methodMeta.errorMiddlewares
      );
    });
  }
}
