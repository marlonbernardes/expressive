import { create } from '../../src/expressive';
import { Controller } from '../../src';

@Controller()
class ExampleController {}

describe('#create', () => {
  describe('when the controllers argument is null or undefined', () => {
    it('throws an error', () => {
      expect(() => create(null as any)).toThrowError(
        Error(`Expected an array of @Controller()/@Router() instances, but got 'null' instead.`)
      );

      expect(() => create(undefined as any)).toThrowError(
        Error(
          `Expected an array of @Controller()/@Router() instances, but got 'undefined' instead.`
        )
      );
    });
  });

  describe('when the controllers argument is not an array of controllers', () => {
    it('throws an error when the controller was not instantiated', () => {
      try {
        create([ExampleController]);
        fail('an error was expected, controller is not an instance');
      } catch (e) {
        expect(e.message).toContain(
          'One or more controllers instances do not have metadata associated with them.'
        );
      }
    });

    it('throws an error when the controllers array has a null entry', () => {
      try {
        create([new ExampleController(), null]);
        fail('an error was expected');
      } catch (e) {
        expect(e.message).toContain(
          'One or more controllers instances do not have metadata associated with them.'
        );
      }
    });
  });
});
