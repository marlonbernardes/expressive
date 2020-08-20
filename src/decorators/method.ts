import { MethodMetadata, RoutingMethod } from './types';
import { normalisePath } from '../utils/path';
import { PathParams } from 'express-serve-static-core';
import { getMethodMetadata, setRouteMetadata } from '../utils/reflection';

type Decorator = MethodDecorator & PropertyDecorator;

function addRoute(verb: RoutingMethod, path?: PathParams): Decorator {
  return (target: Object, property: string | symbol): void => {
    const normalisedPath = normalisePath(path);
    const metadata = getMethodMetadata(target, property);
    metadata.routes = [{ verb, path: normalisedPath }, ...metadata.routes];
    setRouteMetadata(metadata, target, property);
  };
}

export const Route = (method: RoutingMethod, path?: PathParams) => addRoute(method, path);
export const All = (path?: PathParams) => Route('all', path);
export const Delete = (path?: PathParams) => Route('delete', path);
export const Get = (path?: PathParams) => Route('get', path);
export const Head = (path?: PathParams) => Route('head', path);
export const Options = (path?: PathParams) => Route('options', path);
export const Patch = (path?: PathParams) => Route('patch', path);
export const Post = (path?: PathParams) => Route('post', path);
export const Put = (path?: PathParams) => Route('put', path);
