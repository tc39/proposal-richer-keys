'use strict';
class CompositeNode {
  constructor() {
    this.primitiveNodes = new Map;
    this.hasValue = false;
    this.value = null;
  }
  emplacePrimitive(position, value) {
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
module.exports = (...parts) => {
  let node = compoundStore;
  let hasNonPrimitive = false;
  let refs = [];
  let primitives = [];
  for (let i = 0; i < parts.length; i++) {
    const value = parts[i];
    let map;
    if (typeof value === 'object' || typeof value === 'function') {
      refs.push({i, value});
    } else {
      primitives.push({i, value});
    }
  }
  if (refs.length === 0) {
    throw new ReferenceError('Composite keys must contain a non-primitive component');
  }
  for (const {value, i} of refs) {
    node = node.emplaceLifetime(value, i);
  }
  for (const {value, i} of primitives) {
    node = node.emplacePrimitive(value, i);
  }
  if (!node.hasValue) {
    node.hasValue = true;
    node.value = Object.freeze({__proto__: null});
  }
  return node.value;
};

