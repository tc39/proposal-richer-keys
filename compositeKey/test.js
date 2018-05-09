#!/usr/bin/env node
const { compositeKey, compositeSymbol } = require('./polyfill.js');
const assert = require('assert');
const test = (fn, type) => {
  const a = {};
  const b = [];
  const c = () => {};
  assert.strictEqual(fn(a), fn(a));
  assert.strictEqual(fn(b), fn(b));
  assert.strictEqual(fn(a, b), fn(a, b));
  assert.strictEqual(fn(b, a), fn(b, a));
  assert.notStrictEqual(fn(a, b), fn(b, a));
  assert.strictEqual(fn(a, 0), fn(a, 0));
  assert.notStrictEqual(fn(a, 0), fn(a, 1));
  assert.notStrictEqual(fn(a, 0), fn(0, a));
  assert.notStrictEqual(fn(a, 0), fn(1, a));
  assert.strictEqual(typeof fn(a), type);
}
test(compositeKey, 'object');
assert.throws(() => compositeKey(null));
assert.throws(() => compositeKey(1));
assert.throws(() => compositeKey(true));
assert.throws(() => compositeKey(''));
assert.throws(() => compositeKey(Symbol()));
assert.throws(() => compositeKey(undefined));
for (const _ of [null, 1, true, '', Symbol()]) {
  assert.throws(() => compositeKey(null, _));
  assert.throws(() => compositeKey(Symbol(), _));
  assert.throws(() => compositeKey(_, 1));
  assert.throws(() => compositeKey(_, undefined));
  assert.throws(() => compositeKey(_, true, _));
  assert.throws(() => compositeKey(_, '', _));
}

test(compositeSymbol, 'symbol');
assert.strictEqual(typeof compositeSymbol(1), 'symbol');
assert.strictEqual(compositeSymbol('x'), Symbol.for('x'));
