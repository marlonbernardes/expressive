import {
  Middleware,
  ErrorMiddleware,
  RouteMetadata,
  MethodMetadata,
  ControllerMetadata,
} from './types';
import { setRouteMetadata, getRouteMetadata } from '../utils/reflection';

// @TODO combine Middleware/ClassMiddleware ahd ErrorMiddleware/ClassErrorMiddleware
export function Middleware(middleware: Middleware[]): MethodDecorator & PropertyDecorator {
  return (target: Object, propertyKey: string | symbol): void => {
    console.log('non-class middleware being added to ', target.constructor, typeof target);
    addMiddlewareToMetadata(middleware, target.constructor, propertyKey);
  };
}

export function ErrorMiddleware(
  errorMiddleware: ErrorMiddleware[]
): MethodDecorator & PropertyDecorator {
  return (target: Object, propertyKey: string | symbol): void => {
    addErrorMiddlewareToMetadata(errorMiddleware, target.constructor, propertyKey);
  };
}

export function ClassMiddleware(middleware: Middleware[]): ClassDecorator {
  return <T extends Function>(target: T): void => {
    addMiddlewareToMetadata(middleware, target);
  };
}

export function ClassErrorMiddleware(errorMiddleware: ErrorMiddleware[]): ClassDecorator {
  return <T extends Function>(target: T): void => {
    addErrorMiddlewareToMetadata(errorMiddleware, target);
  };
}

function addMiddlewareToMetadata(
  middlewares: Middleware[],
  target: Object,
  methodName?: string | symbol
): void {
  const metadata: RouteMetadata = getRouteMetadata(target, methodName);
  metadata.middlewares = [...middlewares, ...metadata.middlewares];
  setRouteMetadata(metadata, target, methodName);
}

function addErrorMiddlewareToMetadata(
  errorMiddlewares: ErrorMiddleware[],
  target: Object,
  methodName?: string | symbol
): void {
  const metadata: RouteMetadata = getRouteMetadata(target, methodName);
  metadata.errorMiddlewares = [...errorMiddlewares, ...(metadata.errorMiddlewares || [])];
  setRouteMetadata(metadata, target, methodName);
}
