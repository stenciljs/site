---
title: Webapp Output Target
sidebar_label: www
description: Webapp Output Target
slug: /www
---

# Webapp Output Target: `www`

The `www` output target type is oriented for webapps and websites, hosted from an http server, which can benefit from prerendering and service workers, such as this very site you're reading. If the `outputTarget` config is not provided it'll default to having just the `www` type.

Even if a project is meant to only build a reusable component library, the `www` output target is useful to build out and test the components throughout development.

```tsx
outputTargets: [
  {
    type: 'www'
  }
]
```

## Config

| Property        | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Default       |
|-----------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------|
| `baseUrl`       | The `baseUrl` represents the site's "base" url to be served from. For example, this site's base url is `https://stenciljs.com/`. However, if the entire site's output is to live within a sub directory, then this directory's path should be the `baseUrl`. For example, Ionic's documentation is a stand-alone Stencil site that lives in the `/docs` directory within `https://ionicframework.com/`. In this example, `https://ionicframework.com/docs/` would be the base url.                                                                                                                                                     | `/`           |
| `buildDir`      | The `buildDir` is the directory of Stencil's generated scripts, such as the component files. For production builds, this directory will contain both `es5` and `esm` builds for each component.  (Don't worry, users only request the one their browser needs.)                                                                                                                                                                                                                                                                                                                                                                                                                                                | `build`       |
| `dir`           | The `dir` config specifies the public web distribution directory. This directory is commonly the root directory of an app to be served, such as serving static files from. This directory is built and rebuilt directly from the source files. Additionally, since this is a build target, all files will be deleted and rebuilt after each build, so it's best to always copy source files into this directory. It's recommended this directory is not committed to a repository.                                                                                                                                                               | `www`         |
| `empty`         | By default, before each build the `dir` directory will be emptied of all files. However, to prevent this directory from being emptied change this value to `false`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | `true`        |
| `indexHtml`     | The `indexHtml` property represents the location of the root index html file.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | `index.html`  |
| `serviceWorker` | The `serviceWorker` config lets you customize the service worker that gets automatically generated by the Stencil compiler. To override Stencil's defaults, set any of the values listed in the [Workbox documentation](https://developers.google.com/web/tools/workbox/modules/workbox-build#full_generatesw_config).

