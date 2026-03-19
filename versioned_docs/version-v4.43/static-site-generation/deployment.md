---
title: Deploying a Static Site
sidebar_label: Deployment
description: Deploying a Static Site
slug: /static-site-generation-deployment
---

# Deploying a Stencil Static Site

Deploying a prerendered static site built with Stencil is exactly like deploying any static site, because the output is just a set of HTML files.

Every path that Stencil detects (or is provided using `entryUrls` in the prerender config) is generated in the `www` output target's directory, with each url given an `index.html` that becomes the root for the app.

Think of it as turning every URL in your app into a standalone web page that bootstraps the entire app. No matter what URL a visitor comes to, they will be served an `index.html` file with that page's specific content already rendered, but with the entire app then hydrating and loading.

This means you can simply deploy the `www` output target's directory to any static host!