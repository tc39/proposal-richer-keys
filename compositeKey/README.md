# compositeKey

This proposal seeks to add an API to create composite keys while still allowing the components of the composite key to be GC'd.

## Where will it live

A builtin module; how to import builtin modules TBD based upon current TC39 discussions.

## FAQ

### Why a frozen empty Object?

So that properties cannot be added to the object that will leak to the global or can be used as a public side channel.

This gives a few constraints:

1. The return value must be frozen and a frozen prototype to prevent the side channel from being able to be obtained purely off the reference itself. This leads to `null` being a good choice for the prototype.

2. This constraint must be applied to all properties of the object. While no properties are planned for the return value, the values of properties should follow these rules and/or be a primitive.

### Why require a lifetime?

This prevents accidental leakage by always ensuring keys have a lifetime associated with them.

### What scope is the idempotentcy?

Still up for debate but some TC39 members would like it to be per Realm.

Having it be per Realm allows the key store to be more granular and free up segments as Realms are GC'd, but means that there could be multiple keys that correspond to `compositeKey(A, B)` if you obtain multiple `compositeKey` instances from multiple realms.

### When can the key be GC'd

The path to a key in the key store can be GC'd once any owner of a lifetime in the path is GC'd. This means once any single non-primitive component is GC'd the key cannot be obtained again using `compositeKey`. The key itself is an object subject to normal GC rules and will be removed when it is no longer strongly held.

If you only store keys in `WeakMap`s the key and associated values can be GC'd as soon a component of the key is GC'd.

If you store keys in strongly held structues like a `Map`; the key will not be able to be GC'd since the key could still be obtained inspecting `map.keys()` which could be used to get the value associated with the key.

### How could I create a composite key that can return its components?

You can create a `Map` that strongly preserves your components in order: 

```mjs
const myValues = new Map();

const components = [a, b];
const myKey = compositeKey(...components);
myValues.set(myKey, components);


// ...

let [a, b] = myValues.get(myKey);
```
