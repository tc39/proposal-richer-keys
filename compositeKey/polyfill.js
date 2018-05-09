'use strict';
const hasLifetime = value => value !== null && (typeof value === 'object' || typeof value === 'function');
class CompositeNode {
  constructor() {
    this.primitiveNodes = new Map;
    this.value = null;
  }
  get() {
    if (this.value === null) {
      return this.value = Object.freeze({__proto__: null});
    }
    return this.value;
  }
  emplacePrimitive(value, position) {
    if (!this.primitiveNodes.has(value)) {
      this.primitiveNodes.set(value, new Map);
    }
    let positions = this.primitiveNodes.get(value);
    if (!positions.has(position)) {
      positions.set(position, new CompositeNode);
    }
    return positions.get(position);
  }
}
class CompositeNodeWithLifetime extends CompositeNode {
  constructor() {
    super();
    this.lifetimeNodes = new WeakMap;
  }
  emplaceLifetime(value, position) {
    if (!this.lifetimeNodes.has(value)) {
      this.lifetimeNodes.set(value, new Map);
    }
    let positions = this.lifetimeNodes.get(value);
    if (!positions.has(position)) {
      positions.set(position, new CompositeNodeWithLifetime);
    }
    return positions.get(position);
  }
}
const compoundStore = new CompositeNodeWithLifetime();
// accepts multiple objects as a key and does identity on the parts of the iterable
const compositeKey = (...parts) => {
  let node = compoundStore;
  for (let i = 0; i < parts.length; i++) {
    const value = parts[i];
    if (hasLifetime(value)) {
      node = node.emplaceLifetime(value, i);
    }
  }
  // does not leak WeakMap paths since there are none added
  if (node === compoundStore) {
    throw new TypeError('Composite keys must contain a non-primitive component');
  }
  for (let i = 0; i < parts.length; i++) {
    const value = parts[i];
    if (!hasLifetime(value)) {
      node = node.emplacePrimitive(value, i);
    }
  }
  return node.get();
};
const symbols = new WeakMap;
const compositeSymbol = (...parts) => {
  if (parts.length === 1 && typeof parts[0] === 'string') {
    return Symbol.for(parts[0]);
  }
  const key = compositeKey(symbols, ...parts);
  if (!symbols.has(key)) symbols.set(key, Symbol());
  return symbols.get(key);
};
module.exports = {
  compositeKey,
  compositeSymbol,
};

