---
title: Screenshot Connector
sidebar_label: Screenshot Connector
description: Screenshot Connector
slug: /screenshot-connector
---

# Screenshot connector
You can configure a screenshot connector module to be used by the screenshot testing process, to modify the default behavior of the caching, comparing and publishing of your tests.
Just create a file which defines a connector class and point to it in your stencil testing config:

```tsx
export const config: Config = {
  ...
  testing: {
    screenshotConnector: './connector.js'
  }
};
```

## Writing a connector
To write a connector, import the base `ScreenshotConnector` class from stencil and extend it:
```javascript
const { ScreenshotConnector } = require('@stencil/core/screenshot');

module.exports = class ScreenshotCustomConnector extends ScreenshotConnector {
  ...
};
```

:::note
For a good reference on how this can be done, have a look at the default `StencilLocalConnector` [here](https://github.com/ionic-team/stencil/blob/main/src/screenshot/connector-local.ts)
:::

## Methods
The base connector which can be imported and extended from stencil has the following methods which can be overwritten:

```tsx reference title="ScreenshotConnector"
https://github.com/ionic-team/stencil/blob/a2e119d059ba0d0fa6155dbd3d82c17612630828/src/declarations/stencil-private.ts#L1631-L1645
```
For references to the interfaces, [see here](#interfaces)

### initBuild(options)
This method is being called to setup the connector and ready everything for running the tests. It is responsible for setting up the variables, filepaths and folder structures needed for running the screenshot tests.

:::note
Only overwrite this method if you know what you do! For easy extension, make sure to call `super.initBuild`
:::

### pullMasterBuild()
After initializing the connector, and setting up the build, this method is being run to give the possibility to pull the master build. This can be very useful in case the screenshots are stored somewhere else then on the machine on which the tests are running.

### getMasterBuild()
Now that the tests are setup an ready to run this method is being called to return the master build. So instead of loading the master build from a file it could be fetched from an api and returned in this method.

### getScreenshotCache()
This method is being called to return the screenshot cache which will then be extended with the current build results.

### completeBuild(masterBuild)
After running the tests and generating the screenshots into the configured folder, this method is being called to create the result json data. At this time the images are there and the master build is being passed in as an option.

:::note
Only overwrite this method if you know what you do! For easy extension, make sure to call `super.completeBuild`
:::

### publishBuild(buildResults)
Now that the build has been completed and the results were generated, this method will be called with the result data. In here the results can be written to a json file, or sent to a remote location. In the default `StencilLocalConnector` this method will create the compare app html.

### updateScreenshotCache(screenshotCache, buildResults)
At the end of the whole run, the screenshot cache should be updated with this method. So it can be written to a file or be sent to an api from here.


## Interfaces

```tsx reference title="ScreenshotConnectorOptions"
https://github.com/ionic-team/stencil/blob/a2e119d059ba0d0fa6155dbd3d82c17612630828/src/declarations/stencil-private.ts#L1676-L1698
```

```tsx reference title="ScreenshotBuild"
https://github.com/ionic-team/stencil/blob/a2e119d059ba0d0fa6155dbd3d82c17612630828/src/declarations/stencil-private.ts#L1725-L1734
```

```tsx reference title="ScreenshotBuildResults"
https://github.com/ionic-team/stencil/blob/a2e119d059ba0d0fa6155dbd3d82c17612630828/src/declarations/stencil-private.ts#L1647-L1652
```

```tsx reference title="ScreenshotCompareResults"
https://github.com/ionic-team/stencil/blob/a2e119d059ba0d0fa6155dbd3d82c17612630828/src/declarations/stencil-private.ts#L1654-L1674
```

```ts reference title="ScreenshotCache"
https://github.com/ionic-team/stencil/blob/a2e119d059ba0d0fa6155dbd3d82c17612630828/src/declarations/stencil-private.ts#L1736-L1756
```

```ts reference title="Screenshot"
https://github.com/ionic-team/stencil/blob/a2e119d059ba0d0fa6155dbd3d82c17612630828/src/declarations/stencil-private.ts#L1758-L1772
```

```ts reference title="ScreenshotDiff"
https://github.com/ionic-team/stencil/blob/a2e119d059ba0d0fa6155dbd3d82c17612630828/src/declarations/stencil-private.ts#L1774-L1792
```
