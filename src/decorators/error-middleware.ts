import{ ErrorMiddleware, MethodMetadata, ControllerMetadata } from '../types';
import {
  getMethodMetadata,
  setMethodMetadata,
  getControllerMetadata,
  setControllerMetadata,
} from '../utils/reflection';


export function ErrorMiddleware(
  val: ErrorMiddleware | ErrorMiddleware[]
): MethodDecorator & PropertyDecorator & ClassDecorator {
  return <T extends Function>(target: Object | T, methodName?: string | symbol): void => {
    const errorMiddlewares = Array.isArray(val) ? val : [val];
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
