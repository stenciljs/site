---
title: Stencil Copy Tasks
sidebar_label: Copy Tasks
description: Stencil Copy Tasks
slug: /copy-tasks
---


# Copy Tasks for Output Targets

All of Stencil's non-documentation output targets
([`dist-custom-elements`](./custom-elements.md), [`dist`](./dist.md), and
[`www`](./www.md)) support a `copy` config which allows you to define file copy
operations which Stencil will automatically perform as part of the build. This
could be useful if, for instance, you had some static assets like images which
should be distributed alongside your components.

The `copy` attribute on these output targets expects an array of objects corresponding to the following `CopyTask` interface:

```ts reference title="CopyTask"
https://github.com/ionic-team/stencil/blob/6ed2d4e285544945949ad8e4802fe7f70e392636/src/declarations/stencil-public-compiler.ts#L1594-L1665
```

## Options

A copy task can take the following options:

#### `src`

The source file path for a copy operation. This may be an absolute or relative path to a directory or a file, and may also include a glob pattern.

If the path is a relative path it will be treated as relative to `Config.srcDir`.

__Type:__ `string`

#### `dest`

An optional destination file path for a copy operation. This may be an absolute or relative path.

If relative, this will be treated as relative to the output directory for the output target for which this copy operation is configured.

__Type:__ `string`

#### `ignore`

An optional array of glob patterns to exclude from the copy operation.

__Type:__ `string[]`

__Default:__ `['**\/__mocks__/**', '**\/__fixtures__/**', '**\/dist/**', '**\/.{idea,git,cache,output,temp}/**', '.ds_store', '.gitignore', 'desktop.ini', 'thumbs.db']`

#### `warn`

Whether or not Stencil should issue warnings if it cannot find the specified source files or directories. Defaults to `false`.

To receive warnings if a copy task source can't be found set this to `true`.

__Type:__ `boolean`

#### `keepDirStructure`

Whether or not directory structure should be preserved when copying files from a source directory. Defaults to `true` if no `dest` path is supplied, else it defaults to `false`.

If this is set to `false`, all the files from a source directory will be copied directly to the destination directory, but if it's set to `true` they will be copied to a new directory inside the destination directory with the same name as their original source directory.

So if, for instance, `src` is set to `"images"` and `keepDirStructure` is set to `true` the copy task will then produce the following directory structure:

```
images
└── foo.png
dist
└── images
    └── foo.png
```

Conversely if `keepDirStructure` is set to `false` then files in `images/` will be copied to `dist` without first creating a new subdirectory, resulting in the following directory structure:

```
images
└── foo.png
dist
└── foo.png
```

If a `dest` path is supplied then `keepDirStructure` will default to `false`, so that Stencil will write the copied files directly into the `dest` directory without creating a new subdirectory. This behavior can be overridden by setting `keepDirStructure` to `true`.

## Examples

### Images in the `www` Output Target

The `copy` config within the following [`www` output target](./www.md) config
will cause Stencil to copy the entire directory from `src/images` to
`www/images`:

```tsx
  outputTargets: [
    {
      type: 'www',
      copy: [
        { src: 'images' }
      ]
    }
  ]
```

In this example, since the `srcDir` property is not set, the default source
directory is `src/`, and since `dest` is not set the contents of `src/images`
will be copied to a new `images` directory in `www`, the default destination
directory for the `www` Output Target.


### Setting the `dest` option

The `dest` property can also be optionally set on a `CopyTask` to either an
absolute path or a path relative to the build directory of the output target.

In this example we've customized the build directory to be `public` instead of
the default (`'www'`), which, in combination with `dest: 'static/web-fonts'`
will copy the contents of `src/files/fonts` over to `public/static/web-fonts`:

```tsx
  outputTargets: [
    {
      type: 'www',
      dir: 'public',
      copy: [
        { src: 'files/fonts', dest: 'static/web-fonts' }
      ]
    }
  ]
```

:::note
When `dest` is set on a `CopyTask` Stencil will, by default, copy all the contents
of the `src` directory to the `dest` directory without creating a new
subdirectory for the contents of `src`. The `keepDirStructure` option can
control this behavior. If it's set to `true` Stencil will always create a
new subdirectory within `dest` with the same name as the `src` directory. In the
above example this would result in the contents of `src/files/fonts` being copied
to `public/static/web-fonts/fonts` instead of `public/static/web-fonts`.

See the above documentation for the `keepDirStructure` option for more details.
:::

### Opting-in to warnings

By default, Stencil will not log a warning if a file or directory specified in
`src` cannot be located. To opt-in to warnings if a copy task source cannot be
found, set `warn: true` in the `CopyTask` object, like so:

```tsx
  outputTargets: [
    {
      type: 'dist',
      copy: [
        { src: 'fonts', warn: true }
      ]
    }
  ]
```
