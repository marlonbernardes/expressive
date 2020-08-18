import { foo } from '../src';

describe('#foo', () => {
  it('returns bar', () => {
    expect(foo).toEqual('bar');
  })
})
