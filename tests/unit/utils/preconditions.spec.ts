import { checkArgument } from '../../../src/utils/preconditions';

describe('#checkArgument', () => {
  describe('when the input is falsy', () => {
    it('throws an error with the corresponding error message', () => {
      expect(() => checkArgument(false, 'custom error')).toThrowError(Error('custom error'));
      expect(() => checkArgument('', 'another error')).toThrowError(Error('another error'));
      expect(() => checkArgument(undefined, 'custom')).toThrowError(Error('custom'));
    });
  });

  describe('when the input is truthy', () => {
    it('does not throw an error', () => {
      expect(() => checkArgument(true, 'custom error')).not.toThrowError(Error('custom error'));
      expect(() => checkArgument('value', 'another error')).not.toThrowError(
        Error('another error')
      );
      expect(() => checkArgument([], 'custom')).not.toThrowError(Error('custom'));
    });
  });
});
