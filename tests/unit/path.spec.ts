import { normalisePath } from '../../src/utils/path';

describe('#normalisePath', () => {
  describe('when the input is falsy', () => {
    it('returns an empty string', () => {
      expect(normalisePath(undefined)).toEqual('');
      expect(normalisePath(null as never)).toEqual('');
      expect(normalisePath('')).toEqual('');
    });
  });

  describe('when the input is a string', () => {
    it('adds a forward slash when the string does not start with one', () => {
      expect(normalisePath('foo')).toEqual('/foo');
      expect(normalisePath('foo/bar')).toEqual('/foo/bar');
      expect(normalisePath('foo/bar/')).toEqual('/foo/bar/');
    });

    it('adds does not add a  forward slash when the stringstart with one', () => {
      expect(normalisePath('/foo')).toEqual('/foo');
      expect(normalisePath('/foo/bar')).toEqual('/foo/bar');
      expect(normalisePath('/foo/bar/')).toEqual('/foo/bar/');
    });
  });

  describe('when the input is a RegExp', () => {
    it('does not change its value', () => {
      expect(normalisePath(/foo/)).toEqual(/foo/);
      expect(normalisePath(/foo\/bar/)).toEqual(/foo\/bar/);
    });
  });

  describe('when the input is not a string or RegExp', () => {
    it('throws an error', () => {
      expect(() => normalisePath(['test'])).toThrowError('Path should be a string or RegExp');
      expect(() => normalisePath([])).toThrowError('Path should be a string or RegExp');
      expect(() => normalisePath((() => true) as never)).toThrowError(
        'Path should be a string or RegExp'
      );
    });
  });
});
