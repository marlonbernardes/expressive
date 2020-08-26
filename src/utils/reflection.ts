import { MethodMetadata, ControllerMetadata } from '../types';

const CONTROLLER_METADATA_KEY = Symbol('expressive:controller-metadata');

export const getMethodMetadata = <T extends Function>(
  constructor: T,
  methodName: string | symbol
): MethodMetadata => {
  const defaultProps = { middlewares: [], errorMiddlewares: [], routes: [] };
  const metadata: MethodMetadata | undefined = Reflect.getMetadata(methodName, constructor);
  return metadata ?? defaultProps;
};

export const setMethodMetadata = <T extends Function>(
  constructor: T,
  methodName: string | symbol,
  value: MethodMetadata
): void => {
  Reflect.defineMetadata(methodName, value, constructor);
};

export const getControllerMetadata = <T extends Function>(constructor: T): ControllerMetadata => {
  const defaultProps = { middlewares: [], errorMiddlewares: [], basePath: '' };
  const metadata: ControllerMetadata | undefined = Reflect.getMetadata(
    CONTROLLER_METADATA_KEY,
    constructor
  );
  return metadata ?? defaultProps;
};

export const setControllerMetadata = <T extends Function>(
  constructor: T,
  value: ControllerMetadata
): void => {
  Reflect.defineMetadata(CONTROLLER_METADATA_KEY, value, constructor);
};
