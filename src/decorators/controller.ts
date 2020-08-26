import { RouterOptions } from 'express';
import { PathParams } from 'express-serve-static-core';
import { ControllerMetadata } from '../types';
import { normalisePath } from '../utils/path';
import { getControllerMetadata, setControllerMetadata } from '../utils/reflection';

export function Controller(basePath: PathParams, options?: RouterOptions): ClassDecorator {
  return <T extends Function>(target: T): void => {
    const meta: ControllerMetadata = getControllerMetadata(target);
    meta.basePath = normalisePath(basePath);

    if (options) {
      meta.options = options;
    }
    setControllerMetadata(target, meta);
  };
}

// Router can be used as an alias for Controller
export const Router = Controller;
