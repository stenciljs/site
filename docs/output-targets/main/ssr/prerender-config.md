---
title: Prerender Config
sidebar_label: Prerender Config
description: Prerender Config
slug: /prerender-config
---


# Prerender Config for Static Site Generation (SSG)

As of `1.13.0`, the optional prerender config can be used while prerendering a `www` output target. The `prerender.config.ts` file can further update the parsed document of each page, before it is serialized to HTML.

Within `stencil.config.ts`, set the path to the prerendering config file path using the `prerenderConfig`
property, such as:

```tsx
import { Config } from '@stencil/core';

export const config: Config = {
  outputTargets: [
    {
      type: 'www',
      baseUrl: 'https://stenciljs.com/',
      prerenderConfig: './prerender.config.ts',
    }
  ]
};
```

Next, inside of the `prerender.config.ts` file, it should export a `config` object using the `PrerenderConfig` interface.

```tsx
import { PrerenderConfig } from '@stencil/core';
export const config: PrerenderConfig = {
  ...
};
```

| Config | Description | Default |
|--------|-------------|---------|
| `afterHydrate(document, url)` | Run after each `document` is hydrated, but before it is serialized into an HTML string. Hook is passed the `document` and its `URL`. |  |
| `beforeHydrate(document, url)` | Run before each `document` is hydrated. Hook is passed the `document` it's `URL`. |  |
| `afterSerializeTemplate(html)` | Runs after the template Document object has serialize into an HTML formatted string. Returns an HTML string to be used as the base template for all prerendered pages. |  |
| `beforeSerializeTemplate(document)` | Runs before the template Document object is serialize into an HTML formatted string. Returns the Document to be serialized which will become the base template html for all prerendered pages. |  |
| `canonicalUrl(url)` | A hook to be used to generate the canonical `<link>` tag which goes in the `<head>` of every prerendered page. Returning `null` will not add a canonical url tag to the page. |  |
| `crawlUrls` | While prerendering, crawl same-origin URLs found within `<a href>` elements. | `true` |
| `entryUrls` | URLs to start the prerendering from. By default the root URL of `/` is used. | `['/']` |
| `filterAnchor(attrs, base)` | Return `true` the given `<a>` element should be crawled or not. |  |
| `filterUrl(url, base)` | Return `true` if the given URL should be prerendered or not. |  |
| `filePath(url, filePath)` | Returns the file path which the prerendered HTML content should be written to. |  |
| `hydrateOptions(url)` | Returns the hydrate options to use for each individual prerendered page. |  |
| `loadTemplate(filePath)` | Returns the template file's content. The template is the base HTML used for all prerendered pages. |  |
| `normalizeUrl(href, base)` | Used to normalize the page's URL from a given a string and the current page's base URL. Largely used when reading an anchor's `href` attribute value and normalizing it into a `URL`. |  |
| `staticSite` | Static Site Generated (SSG). Does not include Stencil's client-side JavaScript, custom elements or preload modules. | `false` |
| `trailingSlash` | If the prerendered URLs should have a trailing "/"" or not | `false` |


## Individual Page Hydrate Options

Beyond settings for the entire prerendering process with `prerender.config.ts`, you can also
set individual hydrate options per each page. The `hydrateOptions(url)` hook can be used to further configure each page. Below is an example of the prerender config with the `hydrateOptions()` hook, which returns options for each page.

```tsx
import { PrerenderConfig } from '@stencil/core';

export const config: PrerenderConfig = {
  hydrateOptions(url) {
    return {
      prettyHtml: true
    };
  }
};


```
| Option | Description | Default |
|--------|-------------|---------|
| `addModulePreloads` | Adds `<link rel="modulepreload">` for modules that will eventually be requested. | `true` |
| `approximateLineWidth` | Sets an approximate line width the HTML should attempt to stay within. Note that this is "approximate", in that HTML may often not be able to be split at an exact line width. Additionally, new lines created is where HTML naturally already has whitespace, such as before an attribute or spaces between words. | `100` |
| `canonicalUrl` | Sets the `href` attribute on the `<link rel="canonical">` tag within the `<head>`. If the value is not defined it will ensure a canonical link tag is no included in the `<head>`. |  |
| `clientHydrateAnnotations` | Include the HTML comments and attributes used by the client-side JavaScript to read the structure of the HTML and rebuild each component. | `true` |
| `constrainTimeouts` | Constrain `setTimeout()` to 1ms, but still async. Also only allows `setInterval()` to fire once, also constrained to 1ms. | `true` |
| `cookie` | Sets `document.cookie`. |  |
| `direction` | Sets the `dir` attribute on the top level `<html>`. |  |
| `excludeComponents` | Component tag names listed here will not be prerendered, nor will hydrated on the client-side. Components listed here will be ignored as custom elements and treated no differently than a `<div>`. |  |
| `inlineExternalStyleSheets` | External stylesheets from `<link rel="stylesheet">` are instead inlined into `<style>` elements. | `true` |
| `language` | Sets the `lang` attribute on the top level `<html>`. |  |
| `maxHydrateCount` | Maximum number of components to hydrate on one page. | `300` |
| `minifyScriptElements` | Minify JavaScript content within `<script>` elements. | `true` |
| `minifyStyleElements` | Minify CSS content within `<style>` elements. | `true` |
| `prettyHtml` | Format the HTML in a nicely indented format. | `false` |
| `referrer` | Sets `document.referrer`. |  |
| `removeAttributeQuotes` | Remove quotes from attribute values when possible. | `true` |
| `removeBooleanAttributeQuotes` | Remove the `=""` from standardized `boolean` attributes, such as `hidden` or `checked`. | `true` |
| `removeEmptyAttributes` | Remove these standardized attributes when their value is empty: `class`, `dir`, `id`, `lang`, and `name`, `title`. | `true` |
| `removeHtmlComments` | Remove HTML comments. | `true` |
| `removeScripts` | Removes every `<script>` element found in the `document`. | `false` |
| `removeUnusedStyles` | Removes CSS not used by elements within the `document`. | `true` |
| `resourcesUrl` | The url the runtime uses for the resources, such as the assets directory. |  |
| `runtimeLogging` | Prints out runtime console logs to the NodeJS process. | `false` |
| `staticComponents` | Component tags listed here will only be prerendered or server-side rendered and will not be client-side hydrated. This is useful for components that are not dynamic and do not need to be defined as a custom element within the browser. For example, a header or footer component would be a good example that may not require any client-side JavaScript. |  |
| `staticDocument` | Entire `document` should be static. This is useful for specific pages that should be static, rather than the entire site. If the whole site should be static, use the `staticSite` property on the prerender config instead. If only certain components should be static then use `staticComponents` instead. | `false` |
| `timeout` | The amount of milliseconds to wait for a page to finish rendering until a timeout error is thrown. | `15000` |
| `title` | Sets `document.title`. |  |
| `url` | Sets `location.href`. |  |
| `userAgent` | Sets `navigator.userAgent`. |  |
