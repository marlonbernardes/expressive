import { RouterOptions } from 'express';
import { PathParams } from 'express-serve-static-core';
import { ControllerMetadata } from './types';
import { normalisePath } from '../utils/path';
import { getControllerMetadata, setRouteMetadata } from '../utils/reflection';

export function Router(basePath: PathParams, options?: RouterOptions): ClassDecorator {
  return <T extends Function>(target: T): void => {
    const meta: ControllerMetadata = getControllerMetadata(target);
    meta.basePath = normalisePath(basePath);

    if (options) {
      meta.options = options;
    }
    setRouteMetadata(meta, target);
  };
}

export const Controller = Router;
