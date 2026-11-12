---
title: Support Policy
sidebar_label: Support Policy
description: Support Policy
slug: /support-policy
---

# Support Policy

## Community Maintenance

Stencil is an open-source (MIT) project, backed by [OutSystems](https://www.outsystems.com/) and maintained by the community together with developers from Ionic. The team ships regular releases and bug fixes, and welcomes pull requests.

## Version Status

The Stencil team recommends updating to the newest version of Stencil for the latest features, improvements, and fixes.

| Version | Status | Released | Maintenance Ends |
|:-------:|:------:|:--------:|:----------------:|
| V5 | Release candidate | TBD | TBD |
| V4 | **Active** | Jun 26, 2023 | 6 months after the V5 stable release |
| V3 | End of Support | Jan 25, 2023 | Dec 26, 2023 |
| V2 | End of Support | Aug 08, 2020 | Jul 25, 2023 |
| V1 | End of Support | Jun 03, 2019 | Aug 08, 2020 |

When a new major version of Stencil is released, the previous major version enters **maintenance** for six months: it receives only critical bug and security fixes, and no new features. After that, it reaches **end of support**.

## Browser Support

Stencil builds Web Components that run natively in all widely used desktop and mobile browsers.
Custom Elements are natively supported in Chrome, Edge, Firefox, and Safari, including on iOS.

Stencil supports the following browsers. Stencil v5 supports browsers that implement ES2022:

| Stencil Version | Chrome | Edge | Firefox | Safari | Internet Explorer | Pre-Chromium Edge |
|:---------------:|:------:|:----:|:-------:|:------:|:-----------------:|:-----------------:|
|       V5        |  v94+  | v94+ |  v93+   | v16.4+ |     &#10060;      |     &#10060;      |
|       V4        |  v79+  | v79+ |  v70+   |  v14+  |     &#10060;      |     &#10060;      |
|       V3        |  v79+  | v79+ |  v70+   |  v14+  |      &#9989;      |      &#9989;      |
|       V2        |  v60+  | v79+ |  v63+   | v10.1+ |      &#9989;      |      &#9989;      |

## TypeScript Support

Stencil acts as a compiler for a project's web components, and works closely with the TypeScript compiler to transform
TSX to vanilla JavaScript. To ensure compatibility between the two, Stencil takes an opinionated stance on which version
of the TypeScript compiler must be used.

Stencil v5 uses the TypeScript compiler installed in your project, and supports TypeScript versions later than 5.0 and
earlier than 7.0. If your project doesn't list `typescript` in its dependencies, the latest supported version is
installed with Stencil.

Stencil v4 and earlier include a recent copy of the TypeScript compiler in their distributable* to guarantee this
compatibility. The table below describes those versions of Stencil and the version of TypeScript each version shipped with.

| Stencil Version | TypeScript Version |
|:---------------:|:------------------:|
|     v4.20.0     |       v5.5.3       |
|     v4.16.0     |       v5.4.5       |
|     v4.15.0     |       v5.4.4       |
|     v4.14.0     |       v5.4.3       |
|     v4.13.0     |       v5.4.2       |
|     v4.10.0     |       v5.3.0       |
|     v4.4.0      |       v5.2.2       |
|     v4.2.0      |       v5.1.6       |
|     v3.3.0      |       v5.0.4       |
|     v3.0.0      |       v4.9.4       |
|     v2.21.0     |       v4.9.3       |
|     v2.20.0     |       v4.8.4       |
|     v2.18.0     |       v4.7.4       |
|     v2.14.0     |       v4.5.4       |
|     v2.10.0     |       v4.3.5       |
|     v2.5.0      |       v4.2.3       |
|     v2.4.0      |       v4.1.3       |
|     v2.2.0      |       v4.0.5       |

\* The TypeScript compiler is never included in the output of your Stencil project, and is only used for compilation 
and type checking purposes.

## Compatibility Recommendations

Stencil is in many regards an opinionated library, and includes much of the software necessary to get users building web
components as quickly as possible. There are a few pieces of software that Stencil allows users to choose to best fit
their team, organizational structure, and existing technical stack. The Stencil team has compiled a series of
compatibility tables to describe the interoperability requirements of these pieces of software and Stencil.

### JavaScript Runtime

Stencil v5 requires Node.js 22 or later, including newer releases such as Node.js 24. Once a Node.js version reaches its [end of life](https://nodejs.org/en/about/previous-releases), a later Stencil release may stop supporting it without that being treated as a breaking change.

| Stencil Version | Node v10 | Node v12 | Node v14 | Node v16 | Node v18 | Node v20 | Node v22 | Node v24 |
|:---------------:|:--------:|:--------:|:--------:|:--------:|:--------:|:--------:|:--------:|:--------:|
|       V5        | &#10060; | &#10060; | &#10060; | &#10060; | &#10060; | &#10060; | &#9989;  | &#9989;  |
|       V4        | &#10060; | &#10060; | &#10060; | &#9989;  | &#9989;  | &#9989;  | &#9989;  | &#9989;  |
|       V3        | &#10060; | &#10060; | &#9989;  | &#9989;  | &#9989;  | &#9989;  | &#10060; | &#10060; |
|       V2        | &#10060; | &#9989;  | &#9989;  | &#9989;  | &#9888;  | &#10060; | &#10060; | &#10060; |
|       V1        | &#9989;  | &#9989;  | &#9989;  | &#9989;  | &#10060; | &#10060; | &#10060; | &#10060; |

### Testing Libraries

Stencil v5 has no built-in test runner. Its testing packages support these versions:

#### Vitest with [`@stencil/vitest`](../testing/vitest/01-overview.md)

| Stencil Version | Vitest v2 | Vitest v3 | Vitest v4 | Vitest v5 |
|:---------------:|:---------:|:---------:|:---------:|:---------:|
|       V5        |  &#9989;  |  &#9989;  |  &#9989;  |  &#9989;  |
|       V4        |  &#9989;  |  &#9989;  |  &#9989;  |  &#9989;  |

#### Playwright with [`@stencil/playwright`](../testing/playwright/01-overview.md)

| Stencil Version | Playwright v1.50+ |
|:---------------:|:-----------------:|
|       V5        |      &#9989;      |
|       V4        |      &#9989;      |

The tables below cover the test runner that was built into Stencil v4 and earlier.

#### Jest with [Jest Stencil Runner](https://github.com/stenciljs/jest-stencil-runner)

| Stencil Version | Jest v30 *  |
|:---------------:|:-----------:|
|       V4        |   &#9989;   |

#### Jest

| Stencil Version | Jest v24-26 | Jest v27 | Jest v28 * | Jest v29 *  | Jest v30 * |
|:---------------:|:-----------:|:--------:|:----------:|:-----------:|:----------:|
|       V4        |   &#9989;   | &#9989;  |  &#9989;   |   &#9989;   |  &#10060;  |
|       V3        |   &#9989;   | &#9989;  |  &#10060;  |  &#10060;   |  &#10060;  |
|       V2        |   &#9989;   | &#9989;  |  &#10060;  |  &#10060;   |  &#10060;  |
|       V1        |   &#9989;   | &#10060; |  &#10060;  |  &#10060;   |  &#10060;  |

\* Support for Jest 28 & 29 has been included since Stencil v4.7.0.

#### Puppeteer

| Stencil Version | Puppeteer v5-9 | Puppeteer v10 | Puppeteer v11-21 | Puppeteer v22-24 |
|:---------------:|:--------------:|:-------------:|:----------------:|:----------------:|
|       V4        |    &#10060;    |    &#9989;    |     &#9989;      |     &#9989;      |
|       V3        |    &#10060;    |    &#9989;    |     &#9989;      |     &#10060;     |
|       V2        |    &#9989;     |    &#9989;    |     &#10060;     |     &#10060;     |
|       V1        |    &#9989;     |   &#10060;    |     &#10060;     |     &#10060;     |
