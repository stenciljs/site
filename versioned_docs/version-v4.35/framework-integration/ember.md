---
title: Ember Integration with Stencil
sidebar_label: Ember
description: Ember Integration with Stencil
slug: /ember
---

# Ember

## For Monorepos (recommended)

It's recommended to use the [getting started](https://stenciljs.com/docs/getting-started) docs for creating a Stencil project using the native Stencil tooling.
This way, in your Ember project, you don't need to configure anything extra, and you can use Stencil components natively.

For example, if using the [Ionic Framework](https://ionicframework.com/) in your Ember project:

1. Add the Ionic Framework to your app:
```bash npm2yarn
npm install @ionic/core
```

2. Install the components from the library:
```js title="app/app.js"
import '@ionic/core'; // installs all the components from Ionic Framework
```

3. Use the components anywhere:
```js title="app/components/example.gjs"
<template>
  <ion-toggle></ion-toggle>
</template>
```

4. You can hook up events / state (controlled component pattern):
```js title="app/components/example-with-state.gjs"
import { on } from '@ember/modifier';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class Demo extends Component {
  <template>
    <ion-toggle checked="{{this.isOn}}" {{on "ionChange" this.toggle}}></ion-toggle>
  </template>

  @tracked isOn = true;
  
  toggle = () => this.isOn = !this.isOn;
}
```

[Live Demo](https://limber.glimdown.com/edit?c=MQAgqgzglgdg5iAygFwKYwMZQDYliAUQFsAjVAJwChKB9AQRhpAEMYIB3CkZAe24AsoEEAG0IyZhgDWPAG4UAZth7sQARwCuqcVB4wAuiLUBGfSAXkeREAAMAAgBkeABx42AdNSOmAXCH7IyM4QPgD0oeKSMvLkSiruGFahmtrIumyhAOwAbDkALAAMAMwArKGopBQAtCVVxlXsUMj8VRVk5FUY2FBV4uhY2FWsACZVzVDko87M5MgAnp1WrjDoyBBVMDzIDTzkUrBw1JQAPACEVVUglPjjwqjDTbsA5MIAREQzUsMqMCBEPMNUK8ADRXTggDCsEDdeStAAeqAwGjQEIBqBAJDmLGGD3gIFeMKB3D4zXRcAAVsJEoCFP1UJQLgA%2Bag2VkU4SE65EVyzEAAbxAehAAF9zJZrE87G0KKF-g8FFAKE8ANxcnnIEAAYSWelWYqsIElcG6RCIMsS3N1MGQKrVuw1AuQ5Ci9xF%2BoldmNUFNMqdUQOtsoXWYEGEABEKnxUHC0DBhsJtZaVtb%2BZQQCBjmhudhmGhmen00IAPIwPx8vm3dzFmDC4VpgvHEjkfMN9JjHhwY3ojD8RFSe4AXle5cr1drr35fKFr3Smv4rDgRMrvE72FQtcZx1CbZXXZb6cbzcP%2B4zJGRvF%2B5aFTy6UGkTwEQncu7XG%2BjaHIMGYuB7C9QW7PQI9BbLcs2cHM82odM7D9aRXWrEAB24cgtFVesX3RJCAAoAEpEMZR8ICrCAS0QkBTlHEiYFVdNKDrTMKnA3NUBAiAMHIKBnA1CByAwIcAiCEJwgwYYYHcSlARhch3BWZBQhgZwiFCOx0jvUJEnIVBQgecRtz0O9xIgV5NwidjOOQZl62OCN-hAUJmVAxiIJYyhWRsIA&format=glimdown) (using Ionic from a CDN)

## Legacy

Working with Stencil components in Ember is really easy thanks to the `ember-cli-stencil` addon. It handles:

- Importing the required files into your `vendor.js`
- Copying the component definitions into your `assets` directory
- Optionally generating a wrapper component for improved compatibility with older Ember versions

Start off by installing the Ember addon

```bash
ember install ember-cli-stencil
```

Now, when you build your application, Stencil collections in your dependencies will automatically be discovered and pulled into your application. You can just start using the custom elements in your `hbs` files with no further work needed. For more information, check out the [`ember-cli-stencil` documentation](https://github.com/alexlafroscia/ember-cli-stencil).

_NOTE_: `ember-cli-stencil` hasn't kept up with ember's evolution and will not work in newer ember apps.
