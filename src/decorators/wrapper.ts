import { RouteMetadata, WrapperFunction, MethodMetadata, ControllerMetadata } from './types';
import { setRouteMetadata, getControllerMetadata, getMethodMetadata } from '../utils/reflection';

// @TODO: Have a single wrapper and detect if being applied to method or class?

export function Wrapper(wrapper: WrapperFunction): MethodDecorator & PropertyDecorator {
  return (target: Object, methodName: string | symbol): void => {
    addWrapperToMetadata(wrapper, target, methodName);
  };
}

export function ClassWrapper(wrapper: WrapperFunction): ClassDecorator {
  return <T extends Function>(target: T): void => {
    addWrapperToMetadata(wrapper, target.prototype);
  };
}

function addWrapperToMetadata(
  wrapper: WrapperFunction,
  target: Object,
  methodName?: string | symbol
): void {
  const metadata: MethodMetadata | ControllerMetadata = methodName
    ? getMethodMetadata(target, methodName)
    : getControllerMetadata(target);
  metadata.wrapper = wrapper;
  setRouteMetadata(metadata, target, methodName);
}
