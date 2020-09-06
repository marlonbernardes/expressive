import { WrapperFunction, MethodMetadata, ControllerMetadata } from '../types';
import {
  getControllerMetadata,
  getMethodMetadata,
  setMethodMetadata,
  setControllerMetadata,
} from '../utils/reflection';

export function Wrapper(
  wrapper: WrapperFunction
): MethodDecorator & PropertyDecorator & ClassDecorator {
  return (target: InstanceType<any>, methodName?: string | symbol): void => {
    if (methodName) {
      const metadata: MethodMetadata = getMethodMetadata(target.constructor, methodName);
      metadata.wrapper = wrapper;
      setMethodMetadata(target.constructor, methodName, metadata);
    }

    if (typeof target === 'function') {
      const metadata: ControllerMetadata = getControllerMetadata(target);
      metadata.wrapper = wrapper;
      setControllerMetadata(target, metadata);
    }
  };
}
