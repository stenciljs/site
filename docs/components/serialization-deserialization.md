---
title: Serialization & Deserialization
sidebar_label: Serialization & Deserialization
description: Serialization & Deserialization
slug: /serialization
---

# Serialization & Deserialization

Custom elements interact with the DOM either via HTML [attributes](https://open-wc.org/guides/knowledge/attributes-and-properties/#attributes) (always strings) or JavaScript [properties](https://open-wc.org/guides/knowledge/attributes-and-properties/#properties). Stencil automatically tries to keep properties and attributes in-sync via **serialization** (turning properties into strings) and **deserialization** (turning strings back into properties).

For example, if you have a component defined like this:

```tsx
@Component({
  tag: 'my-component',
})
export class MyComponent {
  @Prop({ reflect: true }) myNumber: number; // Stencil 'sees' this as a number type
}
```

When the property is set via JavaScript:

```js
const myComponent = document.querySelector('my-component');
myComponent.myNumber = 42;
```

Stencil will automatically serialize `myNumber` to an attribute:

```html
<my-component my-number="42"></my-component>
```

Conversely, if the attribute is set in HTML:

```html
<!-- in html -->
<my-component my-number="42"></my-component>
<!-- or js -->
<script>
  const myComponent = document.querySelector('my-component');
  myComponent.setAttribute('my-number', '43');
</script>
```

Stencil will automatically deserialize the attribute back to the property:

```js
console.log(myComponent.myNumber); // 43
```

Most of the time Stencil's automatic serialization and deserialization is enough, however there are cases where you might want to customize this behaviour, especially when dealing with complex data.


## The PropSerializer Decorator (`@PropSerializer()`)

The `@PropSerializer()` decorator allows you to define custom serialization logic; converting a JavaScript property to a attribute string. The decorator accepts a single argument; the name of the class member `@Prop()` it is associated with. A method decorated with `@PropSerializer()` will automatically run when its associated property changes.

```tsx
import { Component, Prop, PropSerializer } from '@stencil/core';

@Component({
  tag: 'my-component',
})
export class MyComponent {
  @Prop() aStringArray: string[];

  @PropSerializer('aStringArray')
  serializeStringArray(value: string[]) {
    try {
      return JSON.stringify(value); // must return a string
    } catch (e) {
      return null; // returning null removes the attribute
    }
  }
}
```

In the example above, the `serializeStringArray` method will run whenever the `aStringArray` property changes - the returned value will be used to update the attribute (no need to set `{reflect: true}` on the `@Prop()` decorator). E.g.

```js
const myComponent = document.querySelector('my-component');
myComponent.aStringArray = ['Hello', 'World'];
```

Becomes:

```html
<my-component a-string-array='["Hello","World"]'></my-component>
```

## The AttrDeserializer Decorator (`@AttrDeserializer()`)

The `@AttrDeserializer()` decorator allows you to define custom deserialization logic; converting an attribute string to a JavaScript property. The decorator accepts a single argument; the name of the class member `@Prop()` it is associated with. A method decorated with `@AttrDeserializer()` will automatically run when its associated attribute changes.

```tsx
import { Component, Prop, AttrDeserializer } from '@stencil/core';

@Component({
  tag: 'my-component',
})
export class MyComponent {
  @Prop() aStringArray: string[];

  @AttrDeserializer('aStringArray')
  deserializeStringArray(value: string): string[] | null {
    try {
      return JSON.parse(value);
    } catch (e) {
      return null;
    }
  }
}
```

In the example above, the `deserializeStringArray` method will run whenever the `a-string-array` attribute changes. The method takes the new value of the attribute as an argument and must return the deserialized value.

Now, when you set the attribute in HTML:

```html
<my-component a-string-array='["Hello","World"]'></my-component>
```

Stencil will automatically deserialize the attribute back to the property:

```js
const myComponent = document.querySelector('my-component');
console.log(myComponent.aStringArray); // ['Hello', 'World']
```

## Practical uses of PropSerializer

Practically speaking, there is little disadvantage in using a `@AttrDeserializer()` on a complex property; it just adds another method for users to provide data to your component.

The use-cases around using `@PropSerializer()` is slightly less obvious as in general, [it is not considered best practice to reflect complex data (like objects or arrays) as attributes](https://web.dev/articles/custom-elements-best-practices#aim-to-only-accept-rich-data-objects,-arrays-as-properties.) 

The following example illustrates a practical use case for `@PropSerializer()` using the [hydrate script output](../guides/hydrate-app.md) on a server we can fetch and serialize complex data to an attribute. When the same component loads in a browser, the component can de-serialize the data immediately without having to do another fetch. 

```tsx
import { AttrDeserialize, Build, Component, h, Prop, PropSerialize } from '@stencil/core';

interface User {
  userName: string;
  avatarUrl: string;
  posts: any[]
}

@Component({
  tag: 'user-login-panel',
})
export class UserLogin {
  @Prop() user: User;

  // On the server *only* let's represent the user's data as an attribute
  // this allows the browser to get the data immediately without having to do a client-side fetch

  @PropSerialize('user')
  userSerialize(newVal: User) {
    if (Build.isBrowser) {
      return null;
    } 
    try { return JSON.stringify(newVal); } 
    catch (e) { return null; }
  }
  
  // Whenever we have an attribute (including on client init)
  // let's turn it back into an object that we can use and render

  @AttrDeserialize('user')
  userDeserialize(newVal: string) {
    try { return JSON.parse(newVal); } 
    catch (e) { return null; }
  }

  async componentWillLoad() {
    
    // On the server *only*, let's do a secret login involving private keys etc.
    
    if (Build.isServer) {  
      // Because we have a serializer method, 
      // setting a value automatically reflects it to the dom attribute 
      
      this.user = login(credentials);
    }    
  }

  render() {
    if (this.user) return (`Welcome ${this.user.userName}!`);
    else return (`Please login`);
  }
}
```