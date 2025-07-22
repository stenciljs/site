// @ts-check

const path = require('path');

const { themes } = require('prism-react-renderer');

const HOSTNAME = 'stenciljs.com';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Stencil',
  tagline: 'Build. Customize. Distribute. Adopt.',
  url: `https://${HOSTNAME}`,
  baseUrl: '/docs/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  onBrokenAnchors: 'throw',
  favicon: `https://${HOSTNAME}/favicon-32x32.png`,

  organizationName: 'ionic-team',
  projectName: 'stencil-site',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  scripts: [
    {
      src: 'https://unpkg.com/ionicons@5.5.2/dist/ionicons/ionicons.js',
      async: true,
    },
  ],

  presets: [
    [
      '@ionic-docs/preset-classic',
      /** @type {import('@ionic-docs/preset-classic').Options} */
      ({
        docs: {
          routeBasePath: '/',
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: 'https://github.com/ionic-team/stencil-site/tree/main',
          remarkPlugins: [[require('@docusaurus/remark-plugin-npm2yarn'), { sync: true }]],
          breadcrumbs: false,
          async sidebarItemsGenerator({ defaultSidebarItemsGenerator, ...props }) {
            const defaultSidebar = await defaultSidebarItemsGenerator(props);

            const EXCLUDE_TOP_LEVEL_IDS = ['build-variables', 'telemetry'];

            // remove the items in `EXCLUDE_TOP_LEVEL_IDS`, which may exist in 1+  subdirectories for versioned docs
            // note: this removes any `EXCLUDE_TOP_LEVEL_IDS` entry for _all_ versioned docs and the top level `./docs`
            const filteredSidebar = defaultSidebar.filter(
              (item) => !EXCLUDE_TOP_LEVEL_IDS.find((toExclude) => item.id?.match(`.*${toExclude}$`)),
            );

            return filteredSidebar;
          },
        },
        theme: {
          customCss: require.resolve('./src/css/custom.scss'),
        },
        googleTagManager: {
          containerId: 'GTM-TKMGCBC',
        },
      }),
    ],
  ],

  plugins: [
    [
      '@signalwire/docusaurus-plugin-llms-txt',
      {
        siteTitle: 'StencilJS',
        siteDescription:
          'Stencil is a library for building reusable, scalable component libraries. Generate small, blazing fast Web Components that run everywhere.',
        depth: 2,
        content: {
          includeBlog: false,
          includePages: true,
          enableMarkdownFiles: true,
          enableLlmsFullTxt: true,
        },
      },
    ],
  ],

  themes: ['docusaurus-theme-github-codeblock'],

  themeConfig:
    /** @type {import('@ionic-docs/preset-classic').ThemeConfig} */
    ({
      announcementBar: {
        id: 'announcement-bar',
        content:
          '<a href="https://www.outsystems.com/?utm_source=ionic&utm_medium=referral&utm_campaign=ionic-referral&utm_term=none&utm_content=other&utm_campaignteam=digital-mktg&utm_partner=none" target="_blank" rel="noopener"><span>An <strong>OutSystems</strong> Company →</span></a>',
        isCloseable: false,
      },
      logo: {
        alt: 'Site Logo',
        src: `/img/logo-light.png`,
        srcDark: `/img/logo-dark.png`,
        href: `https://${HOSTNAME}`,
        target: '_self',
        width: 96,
        height: 20,
        after: {
          html: `<a href="/docs"><svg xmlns="http://www.w3.org/2000/svg" width="50" height="14" fill="none"><path fill="#92A0B3" d="M4.53 13C8.69 13 11 10.52 11 6.96 11 3.42 8.7.93 4.53.93H.43V13h4.1Zm4.3-6.04c0 2.5-1.4 4.14-4.37 4.14H2.48V2.83h1.98c2.97 0 4.37 1.64 4.37 4.13Zm5.9 0c0-2.6 1.7-4.31 4.06-4.31 2.36 0 4.06 1.71 4.06 4.31 0 2.6-1.7 4.32-4.06 4.32-2.37 0-4.07-1.71-4.07-4.31Zm-2.18 0a6.06 6.06 0 0 0 6.24 6.3c3.67 0 6.24-2.7 6.24-6.3A6.06 6.06 0 0 0 18.79.67a6.06 6.06 0 0 0-6.24 6.3Zm14.01-.01c0 3.72 2.52 6.29 6.03 6.29 3 0 5.3-1.79 5.8-4.66h-2.2c-.4 1.7-1.78 2.69-3.6 2.69-2.4 0-3.85-1.72-3.85-4.32 0-2.6 1.44-4.3 3.85-4.3 1.82 0 3.2.98 3.6 2.68h2.2C37.9 2.46 35.6.67 32.6.67c-3.51 0-6.03 2.57-6.03 6.28Zm17.79 4.43c-1.63 0-2.5-.86-2.59-2.15h-2.04c.07 1.97 1.31 4 4.52 4 2.9 0 4.8-1.42 4.8-3.61 0-4.83-6.8-2.77-6.8-5.43 0-1.07.87-1.66 2.28-1.66 1.54 0 2.34.95 2.36 2.14h2.02c-.05-2.26-1.54-4-4.38-4-2.69 0-4.32 1.65-4.32 3.58 0 4.82 6.75 2.51 6.75 5.45 0 1.09-.95 1.69-2.6 1.69Z"/></svg></a>`,
        },
      },
      navbar: {
        hideOnScroll: false,
        items: [
          {
            type: 'search',
            position: 'right',
          },
          {
            type: 'doc',
            docId: 'introduction/overview',
            position: 'right',
            label: 'Docs',
          },
          { href: `https://${HOSTNAME}/resources`, target: '_self', label: 'Resources', position: 'right' },
          {
            type: 'html',
            position: 'right',
            value: '<div class="separator"></div>',
          },
          {
            href: 'https://github.com/stencil-community',
            label: 'Community',
            position: 'right',
          },
          {
            href: 'https://ionic.io/blog/tag/stencil',
            label: 'Blog',
            position: 'right',
          },
          {
            type: 'html',
            position: 'right',
            value: '<div class="separator"></div>',
          },
          {
            type: 'localeDropdown',
            position: 'right',
            dropdownItemsAfter: [
              {
                to: 'https://stenciljs.jp/docs/introduction',
                label: '日本語',
                target: '_blank',
                rel: null,
              },
            ],
            className: 'icon-link language navbar__item',
          },
          {
            href: 'https://twitter.com/stenciljs',
            position: 'right',
            className: 'icon-link icon-link-mask icon-link-twitter',
            'aria-label': 'Twitter',
            target: '_blank',
          },
          {
            href: 'https://chat.stenciljs.com',
            position: 'right',
            className: 'icon-link icon-link-mask icon-link-discord',
            'aria-label': 'Discord',
            target: '_blank',
          },
          {
            href: 'https://github.com/ionic-team/stencil',
            position: 'right',
            className: 'icon-link icon-link-mask icon-link-github',
            'aria-label': 'GitHub repository',
            target: '_blank',
          },
        ],
      },
      sidebar: {
        versionDropdown: {},
        productDropdown: {
          title: 'Stencil Docs',
          logo: {
            width: 20,
            height: 20,
            alt: 'Stencil Logo',
            src: 'img/components/product-dropdown/logo-dark.png',
            srcDark: 'img/components/product-dropdown/logo-light.png',
          },
          textLinks: [
            {
              url: {
                href: 'https://forum.ionicframework.com/c/stencil/21',
                target: '_blank',
                rel: 'noopener nofollow',
              },
              label: 'Forum',
            },
          ],
          iconLinks: [
            {
              key: 'github',
              url: {
                href: 'https://github.com/ionic-team/stencil',
                target: '_blank',
                rel: 'noopener nofollow',
              },
            },
            {
              key: 'twitter',
              url: {
                href: 'https://twitter.com/stenciljs',
                target: '_blank',
                rel: 'noopener nofollow',
              },
            },
            {
              key: 'discord',
              url: {
                href: 'https://chat.stenciljs.com',
                target: '_blank',
                rel: 'noopener nofollow',
              },
            },
          ],
        },
      },
      prism: {
        theme: themes.github,
        darkTheme: themes.dracula,
        additionalLanguages: ['jsx', 'tsx', 'bash', 'typescript', 'javascript', 'markup', 'css', 'json', 'diff'],
      },
      algolia: {
        // The application ID provided by Algolia
        appId: 'BH4D9OD16A',

        // Public API key: it is safe to commit it
        apiKey: '6399791d239c7e56a6b47685a64f8873',

        indexName: 'stenciljs',

        // Optional: see doc section below
        contextualSearch: true,
      },
      image: `https://${HOSTNAME}/stencil-og.png`,
      codeblock: {
        showGithubLink: true,
        githubLinkLabel: 'View on GitHub',
        showRunmeLink: false,
      },
    }),
};

module.exports = config;
