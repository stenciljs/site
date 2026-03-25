---
title: Telemetry
description: Stencil Telemetry usage information
---

# Stencil CLI telemetry

As of version 2.7.0, Stencil collects anonymous telemetry data about usage of our command line interface. Participation in this program is optional, and [you may opt-out](#how-do-i-opt-out) if you'd prefer not to share any information.

### Why Is Telemetry Collected?

Ionic continues to invest in Stencil to make it the best web component compiler in the market. We spend hundreds of hours every year engaging with our community to learn how we can improve the product and create a more streamlined developer experience.

However, qualitative conversations are only half the picture. To fully understand the behavior of our users, we also need to look at quantitative data. Telemetry allows us to accurately gauge Stencil feature usage. The combination of qualitative and quantitative data helps us generate the most informed roadmap possible, ensuring Stencil’s growth for years to come.

### What Is Being Collected?

We track command line usage including commands and options. Specifically, we track the following anonymously:

- Command invoked (eg: stencil generate, stencil build, etc) with arguments
- Versions of Stencil and other dependencies like TypeScript
- Output targets
- Stencil packages
- General machine information like OS

An example telemetry event looks like this:

```javascript
{
   "yarn": false,
   "duration": 2762,
   "componentCount": 13,
   "targets": [ "www", "dist-lazy", "docs-readme", "docs-vscode" ],
   "packages": [ "@capacitor/cli@^3.1.1", "@capacitor/core@^3.1.1", "@stencil/core@latest", "@stencil/store@latest" ],
   "arguments": [ "--debug" ],
   "task": "build",
   "stencil": "2.6.0",
   "system": "node 16.4.2",
   "os_name": "darwin",
   "os_version": "20.5.0",
   "cpu_model": "Apple M1",
   "build": "20210714145743",
   "typescript": "4.2.3",
   "rollup": "2.42.3"
}
```

### What about Sensitive Data (e.g. Secrets)?

We do not collect any metrics which may contain sensitive data. This includes, but is not limited to: environment variables, file paths, contents of files, logs, or serialized JavaScript errors.

### Will This Data Be Shared?

No. Data collected will not be shared outside of Ionic. The data collected is anonymous, not traceable to the source, and only meaningful in aggregate form. We take your privacy and our security very seriously. Stencil telemetry falls under the [Ionic Privacy Policy](https://ionicframework.com/privacy).

### How Do I Opt-Out?

You may opt-out by running the following command in the root of your project directory:

`npx stencil telemetry off`

You may check the status of telemetry collection at any time by running the command with no arguments in the root of your project directory:

`npx stencil telemetry`

You may re-enable telemetry if you'd like to re-join the program by running the following in the root of your project directory:

`npx stencil telemetry on`
