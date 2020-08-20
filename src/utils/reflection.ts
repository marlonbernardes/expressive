import { MethodMetadata, RouteMetadata, ControllerMetadata, Controller } from '../decorators/types';
import { CONTROLLER_METADATA_KEY } from '../constants';

export const getRouteMetadata = (target: Object, methodName?: string | symbol): RouteMetadata => {
  const nullableMetadata: RouteMetadata | undefined = Reflect.getOwnMetadata(
    methodName ?? CONTROLLER_METADATA_KEY,
    target
  );
  const defaultProps = { middlewares: [], errorMiddlewares: [] };
  return { ...defaultProps, ...nullableMetadata };
};

export const getMethodMetadata = (target: Object, methodName: string | symbol): MethodMetadata => {
  const route = getRouteMetadata(target.constructor, methodName);
  return { routes: [], ...route };
};

export const getControllerMetadata = (target: Controller): ControllerMetadata => {
  const newTarget = typeof target === 'function' ? target.prototype : target.constructor;
  const route = getRouteMetadata(newTarget);
  return { basePath: '', ...route };
};

export const setRouteMetadata = (
  metadata: RouteMetadata,
  target: Object,
  methodName?: string | symbol
) => {
  const newTarget = typeof target === 'function' ? target.prototype : target.constructor;
  Reflect.defineMetadata(methodName ?? CONTROLLER_METADATA_KEY, metadata, newTarget);
};
