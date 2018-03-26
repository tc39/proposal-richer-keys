# Collection {rekey}

This proposal seeks to add a `rekey` parameter to collection creation.

## Use cases

### Specialized maps

Given an application with User Objects it may be desirable to create collections based upon username and email for separate purposes.

```mjs
new Map(undefined, {
  rekey({email}) {
    return email;
  }
});
```

```mjs
new Set(undefined, {
  rekey({username}) {
    return username;
  }
});
```

### Checked keys

It is a common occurance to want to check types when performaning operations on collections. This can be done during keying.

```mjs
new Map(undefined, {
  rekey(user) {
    if (user instanceof User !== true) {
      throw new TypeError('Expected User for key');
    }
    return username;
  }
});
```

## FAQ

### Why not `value[Symbol.toKey]`?

Having specialized identity conflicts with the idea of having multiple kinds of specialized maps per type of value. It also would cause conflicts when wanting to specialize keys that are based upon primitives.

### Why not encourage extending collections?

1. This would be resistant to prototype crawling such as:

```mjs
myCustomMap.__proto__.get.call(myCustomMap, key);
```

which would somewhat invalidate the idea of checking types of keys.

2. It prevents needing to synchronize all of the methods which is a fair amount of boiler plate and potential place for code going out of sync. It also means that your custom implementation will work even if new methods are added to collections in the JS standard library:

```mjs
class MyMap extends Map {
  constructor([...entries]) {
    super(entries.map(...));
  }
  delete(k) { ... }
  get(k) { ... }
  has(k) { ... }
  set(k, v) { ... }
}
```

If we add something like `emplace()` this code now needs to be updated or it will have bugs if people expect it to work like a standard Map.

3. Even if this is a userland solution, it seems prudent to allow easier usage of maps. We should aim to alleviate developers without requiring that all new features have new kernel semantics. I spoke of this with respect to [expanding the standard library](https://docs.google.com/presentation/d/1QSwQYJz4c1VESEKTWPqrAPbDn_y9lTBBjaWRjej1c-w/view#slide=id.p).

4. Composition, while extending is nice it doesn't always allow for simple chaining and composition of features. If we introduce `RekeyableMap` as a concrete base class it may conflict with other base classes that may be introduced like if there was `InsertIfMissingMap`. Since both are base classes it would not allow both features to be combined easily.