import { Middleware, ErrorMiddleware, MethodMetadata, ControllerMetadata } from './types';
import {
  getMethodMetadata,
  setMethodMetadata,
  getControllerMetadata,
  setControllerMetadata,
} from '../utils/reflection';

export function Middleware(
  middlewares: Middleware[]
): MethodDecorator & PropertyDecorator & ClassDecorator {
  return (target: Object | Function, methodName?: string | symbol): void => {
    // if methodName is defined...
    if (methodName) {
      // ... it means this decorator is being applied to a property or method
      const metadata: MethodMetadata = getMethodMetadata(target.constructor, methodName);
      metadata.middlewares = [...middlewares, ...metadata.middlewares];
      setMethodMetadata(target.constructor, methodName, metadata);
    } else if (typeof target === 'function') {
      const metadata: ControllerMetadata = getControllerMetadata(target);
      metadata.middlewares = [...middlewares, ...metadata.middlewares];
      setControllerMetadata(target, metadata);
    }
  };
}

export function ErrorMiddleware(
  errorMiddlewares: ErrorMiddleware[]
): MethodDecorator & PropertyDecorator {
  return (target: Object | Function, methodName?: string | symbol): void => {
    // if methodName is defined...
    if (methodName) {
      // ... it means this decorator is being applied to a property or method
      const metadata: MethodMetadata = getMethodMetadata(target.constructor, methodName);
      metadata.errorMiddlewares = [...errorMiddlewares, ...metadata.errorMiddlewares];
      setMethodMetadata(target.constructor, methodName, metadata);
    } else if (typeof target === 'function') {
      const metadata: ControllerMetadata = getControllerMetadata(target);
      metadata.errorMiddlewares = [...errorMiddlewares, ...metadata.errorMiddlewares];
      setControllerMetadata(target, metadata);
    }
  };
}
