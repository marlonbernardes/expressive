import { Middleware, MethodMetadata, ControllerMetadata, ParamsDictionary } from '../types';
import {
  getMethodMetadata,
  setMethodMetadata,
  getControllerMetadata,
  setControllerMetadata,
} from '../utils/reflection';

export function Middleware<T extends ParamsDictionary> (
  val: Middleware<T> | Middleware<T>[]
): MethodDecorator & PropertyDecorator & ClassDecorator {
  return <T extends Function>(target: Object | T, methodName?: string | symbol): void => {
    const middlewares = Array.isArray(val) ? val : [val];
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
