# Object.compositeKey

This proposal seeks to add an API to create composite keys while still allowing the components of the composite key to be GC'd.

## FAQ

### Why a frozen empty Object?

So that properties cannot be added to the object that will leak to the global or can be used as a public side channel.

### Why require a lifetime?

This prevents accidental leakage by always ensuring keys have a lifetime associated with them.

### What scope is the idempotentcy?

Still up for debate but some TC39 members would like it to be per realm.

### How could I create a composite key that can return its components?

You can create a `Map` that strongly preserves your components in order: 

```mjs
const myValues = new Map();

const components = [a, b];
const myKey = Object.compositeKey(...components);
myValues.set(myKey, components);


// ...

let [a, b] = myValues.get(myKey);
```
