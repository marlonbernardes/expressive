import { MethodMetadata, ControllerMetadata } from '../decorators/types';

const CONTROLLER_METADATA_KEY = Symbol('expressive:controller-metadata');

export const getMethodMetadata = (
  constructor: Function,
  methodName: string | symbol
): MethodMetadata => {
  const defaultProps = { middlewares: [], errorMiddlewares: [], routes: [] };
  const metadata: MethodMetadata | undefined = Reflect.getMetadata(methodName, constructor);
  return metadata ?? defaultProps;
};

export const setMethodMetadata = (
  constructor: Function,
  methodName: string | symbol,
  value: MethodMetadata
) => {
  Reflect.defineMetadata(methodName, value, constructor);
};

export const getControllerMetadata = (constructor: Function): ControllerMetadata => {
  const defaultProps = { middlewares: [], errorMiddlewares: [], basePath: '' };
  const metadata: ControllerMetadata | undefined = Reflect.getMetadata(
    CONTROLLER_METADATA_KEY,
    constructor
  );
  return metadata ?? defaultProps;
};

export const setControllerMetadata = (constructor: Function, value: ControllerMetadata) => {
  Reflect.defineMetadata(CONTROLLER_METADATA_KEY, value, constructor);
};
