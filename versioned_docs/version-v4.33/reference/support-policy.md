---
title: Support Policy
sidebar_label: Support Policy
description: Support Policy
slug: /support-policy
---

# Support Policy

## Community Maintenance

Stencil is a 100% open source (MIT) project. Developers can ensure Stencil is the right choice for building web
components through Ionic’s community maintenance strategy. The Stencil team regularly ships new releases, bug fixes, and
is welcoming to community pull requests.

## Stencil Maintenance and Support Status

Given the reality of time and resource constraints as well as the desire to keep innovating in the frontend development
space, over time it becomes necessary for the Stencil team to shift focus to newer versions of the library. However, the
Stencil team will do everything it can to make the transition to newer versions as smooth as possible. The Stencil team
recommends updating to the newest version of the Stencil for the latest features, improvements and stability updates.

The current status of each Stencil version is:

| Version |      Status      |   Released   | Maintenance Ends | Ext. Support Ends |
|:-------:|:----------------:|:------------:|:----------------:|:-----------------:|
|   V4    |    **Active**    | Jun 26, 2023 |       TBD        |        TBD        |
|   V3    | Extended Support | Jan 25, 2023 |   Dec 26, 2023   |   Jun 26, 2024    |
|   V2    |  End of Support  | Aug 08, 2020 |   Jul 25, 2023   |   Jan 25, 2024    |
|   V1    |  End of Support  | Jun 03, 2019 |   Aug 08, 2020   |   Aug 08, 2020    |

**Maintenance Period**: Only critical bug and security fixes. No major feature improvements.

**Extended Support Period**: Available to Stencil Enterprise customers.

### Stencil Support Details

Starting with Stencil v2, the Stencil team is adopting a newly revised maintenance policy. When a new major version of
Stencil is released, the previous major version release will enter maintenance mode. While a version of Stencil is in
maintenance mode, only critical bug & security fixes will be applied to that version, and no major feature improvements
will be added. The maintenance period shall last six months from the release of the new major version.

Once the maintenance period has ended for a version of Stencil, that version enters the extended support period. During
the extended support period, only critical bug and security fixes will be applied for teams and organizations using
Stencil's Enterprise offerings. The extended support period lasts for twelve months from the release of the new major 
version.

The table below describes a theoretical timeline of releases:

| Version |        Status         |   Released   | Maintenance Ends | Ext. Support Ends |
|:-------:|:---------------------:|:------------:|:----------------:|:-----------------:|
|    D    |        Active         | Jan 01, 2022 |       TBD        |        TBD        |
|    C    |      Maintenance      | Jul 07, 2021 |   Jul 01, 2022   |   Jan 01, 2023    |
|    B    | Extended Support Only | Jan 01, 2021 |   Jan 07, 2022   |   Jul 07, 2022    |
|    A    |    End of Support     | Jul 07, 2020 |   Jul 01, 2021   |   Jan 01, 2021    |

In the example above, when Version D is released, Version C enters maintenance mode. Version D was released on January
1st, 2022. Version C shall be in maintenance mode until July 1st, 2022, three months after the release of Version D.
After July 1st 2022, Version C will be in extended support until Jun 1st, 2023, twelve months after the release of
Version D.

## Browser Support

Stencil builds Web Components that run natively in all widely used desktop and mobile browsers.
Custom Elements are natively supported in Chrome, Edge, Firefox, and Safari (including iOS)!

Stencil supports the following browsers:

| Stencil Version | Chrome | Edge | Firefox | Safari | Internet Explorer | Pre-Chromium Edge |
|:---------------:|:------:|:----:|:-------:|:------:|:-----------------:|:-----------------:|
|       V4        |  v79+  | v79+ |  v70+   |  v14+  |     &#10060;      |     &#10060;      |
|       V3        |  v79+  | v79+ |  v70+   |  v14+  |      &#9989;      |      &#9989;      |
|       V2        |  v60+  | v79+ |  v63+   | v10.1+ |      &#9989;      |      &#9989;      |

## TypeScript Support

Stencil acts as a compiler for a project's web components, and works closely with the TypeScript compiler to transform
TSX to vanilla JavaScript. To ensure compatibility between the two, Stencil takes an opinionated stance on which version
of the TypeScript compiler must be used.

Stencil includes a recent copy of the TypeScript compiler in its distributable* to guarantee this compatibility. 
The Stencil team is committed to keeping its version of TypeScript up to date and, as of Stencil v2.10.0, attempts to be
within one minor version of the latest TypeScript release.

The table below describes recent versions of Stencil and the version of TypeScript each version shipped with.

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

The TypeScript team releases a new minor version of the TypeScript compiler approximately once every three months. To
accomplish its goal of staying within one minor version of the latest release, Stencil will update its version of
TypeScript once every three months as well. Updates to the version of TypeScript will often, but not always, occur in a
[minor version release](./versioning.md#minor-release) of Stencil.

The Stencil team acknowledges that TypeScript minor version releases may contain breaking changes. The Stencil team will
do everything in its power to avoid propagating breaking changes to its user base.

\* The TypeScript compiler is never included in the output of your Stencil project, and is only used for compilation 
and type checking purposes.

## Compatibility Recommendations

Stencil is in many regards an opinionated library, and includes much of the software necessary to get users building web
components as quickly as possible. There are a few pieces of software that Stencil allows users to choose to best fit
their team, organizational structure, and existing technical stack. The Stencil team has compiled a series of
compatibility tables to describe the interoperability requirements of these pieces of software and Stencil.

### JavaScript Runtime

| Stencil Version | Node v10 | Node v12 | Node v14 | Node v16 | Node v18 | Node v20 | Node v22 |
|:---------------:|:--------:|:--------:|:--------:|:--------:|:--------:|:--------:|:--------:|
|       V4        | &#10060; | &#10060; | &#10060; | &#9989;  | &#9989;  | &#9989;  | &#9989;  |
|       V3        | &#10060; | &#10060; | &#9989;  | &#9989;  | &#9989;  | &#9989;  | &#10060; |
|       V2        | &#10060; | &#9989;  | &#9989;  | &#9989;  | &#9888;  | &#10060; | &#10060; |
|       V1        | &#9989;  | &#9989;  | &#9989;  | &#9989;  | &#10060; | &#10060; | &#10060; |

### Testing Libraries

#### Jest

| Stencil Version | Jest v24-26 | Jest v27 | Jest v28 * | Jest v29 *  |
|:---------------:|:-----------:|:--------:|:----------:|:-----------:|
|       V4        |   &#9989;   | &#9989;  |  &#9989;   |   &#9989;   |
|       V3        |   &#9989;   | &#9989;  |  &#10060;  |  &#10060;   |
|       V2        |   &#9989;   | &#9989;  |  &#10060;  |  &#10060;   |
|       V1        |   &#9989;   | &#10060; |  &#10060;  |  &#10060;   |

\* Support for Jest 28 & 29 has been included since Stencil v4.7.0.

#### Puppeteer

| Stencil Version | Puppeteer v5-9 | Puppeteer v10 | Puppeteer v11-21 | Puppeteer v22-24 |
|:---------------:|:--------------:|:-------------:|:----------------:|:----------------:|
|       V4        |    &#10060;    |    &#9989;    |     &#9989;      |     &#9989;      |
|       V3        |    &#10060;    |    &#9989;    |     &#9989;      |     &#10060;     |
|       V2        |    &#9989;     |    &#9989;    |     &#10060;     |     &#10060;     |
|       V1        |    &#9989;     |   &#10060;    |     &#10060;     |     &#10060;     |
