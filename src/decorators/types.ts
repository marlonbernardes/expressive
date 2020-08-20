import { RequestHandler, ErrorRequestHandler, RouterOptions } from 'express';
import { PathParams } from 'express-serve-static-core';

export type Controller = any;

export type Middleware = RequestHandler;
export type ErrorMiddleware = ErrorRequestHandler;
export type WrapperFunction = (methodOrProperty: any) => RequestHandler;

export type RouteMetadata = {
  errorMiddlewares: ErrorMiddleware[];
  middlewares: Middleware[];
  wrapper?: WrapperFunction;
};

export type ControllerMetadata = RouteMetadata & {
  basePath: PathParams;
  options?: RouterOptions;
};

export type MethodMetadata = RouteMetadata & {
  routes: Route[];
};

export interface Route {
  verb: RoutingMethod;
  path: PathParams;
}

// Routing methods supported by express:
// https://expressjs.com/en/api.html#routing-methods
export type RoutingMethod =
  | 'all'
  | 'checkout'
  | 'copy'
  | 'delete'
  | 'get'
  | 'head'
  | 'lock'
  | 'merge'
  | 'mkactivity'
  | 'mkcol'
  | 'move'
  | 'm-search'
  | 'notify'
  | 'options'
  | 'patch'
  | 'post'
  | 'purge'
  | 'put'
  | 'report'
  | 'search'
  | 'subscribe'
  | 'trace'
  | 'unlock'
  | 'unsubscribe';
