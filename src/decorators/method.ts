import { RoutingMethod, PathParams } from '../types';
import { normalisePath } from '../utils/path';
import { getMethodMetadata, setMethodMetadata } from '../utils/reflection';

type Decorator = MethodDecorator & PropertyDecorator;

function addRoute(verb: RoutingMethod, path?: PathParams): Decorator {
  return (target: InstanceType<any>, methodName: string | symbol): void => {
    const normalisedPath = normalisePath(path);
    const metadata = getMethodMetadata(target.constructor, methodName);
    metadata.routes = [{ verb, path: normalisedPath }, ...metadata.routes];
    setMethodMetadata(target.constructor, methodName, metadata);
  };
}

export const Route = (method: RoutingMethod, path?: PathParams): Decorator =>
  addRoute(method, path);
export const All = (path?: PathParams): Decorator => Route('all', path);
export const Delete = (path?: PathParams): Decorator => Route('delete', path);
export const Get = (path?: PathParams): Decorator => Route('get', path);
export const Head = (path?: PathParams): Decorator => Route('head', path);
export const Options = (path?: PathParams): Decorator => Route('options', path);
export const Patch = (path?: PathParams): Decorator => Route('patch', path);
export const Post = (path?: PathParams): Decorator => Route('post', path);
export const Put = (path?: PathParams): Decorator => Route('put', path);
