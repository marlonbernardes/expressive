import { PathParams } from 'express-serve-static-core';

export function normalisePath<T extends PathParams>(path?: T): PathParams {
  if (!path) {
    return '';
  } else if (path instanceof RegExp) {
    return path;
  } else if (typeof path === 'string') {
    return path.charAt(0) === '/' ? path : `/${path}`;
  } else {
    throw Error('Path should be a string or RegExp');
  }
}
