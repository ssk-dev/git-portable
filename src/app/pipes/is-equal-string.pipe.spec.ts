import { IsEqualStringPipe } from './is-equal-string.pipe';

describe('IsEqualStringPipe', () => {
  it('create an instance', () => {
    const pipe = new IsEqualStringPipe();
    expect(pipe).toBeTruthy();
  });
});
