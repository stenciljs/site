---
title: Design Systems
sidebar_label: Design Systems
description: Design Systems in Stencil
slug: /design-systems
---

# Design Systems

## What is a Design System?

A Design System consists of UI components and a clearly defined visual style, released as both code implementations and design artifacts.
When adopted by all product teams, a more cohesive customer experience emerges.

There are several aspects that Design Systems consist of:

### Components
A component is a standalone UI element designed to be reusable across many projects.
Its goal is to do one thing well, while remaining abstract enough to allow for a variety of use cases.
Developers can use them as building blocks to build new user experiences.
One of the key benefits of reusable components is that developers don't have to worry about the core design and functionality of each component every time they use them.
Examples include buttons, links, forms, input fields, and modals.

### Patterns
A pattern is an opinionated use of components.
Often, multiple components are combined in order to create a standardized user experience (UX).
As a result, they improve both the user and developer experience.
After implementing patterns, users will understand the application better and accomplish their tasks faster.
When the development team understands the proper way to use components together, software applications become easier to use.
Examples include saving data to the system, capturing data from forms, and filtering and analyzing data.

### Visual Language
A cohesive company brand strengthens its value in the minds of the customer.
In the context of design systems, this means defining various aspects of the visual style, including colors, typography, and icons.
Defining primary, secondary, and tertiary colors helps an application stand out and is more user-friendly.
The right typography ensures users are not distracted while using an app.
Finally, icons increase engagement in a product and make it “pop” visually.

### Design Artifacts and Code Implementations
By leveraging the components, patterns, and visual language of the design system, designers can create design artifacts representing UI workflows.
Developers refer to the artifacts as guidance for implementing the design with code.

## The Value of Design Systems
With a design system in place, its true value is revealed.
The entire product development team is freed up to focus on what matters most: solving customer problems and delivering value.
Additionally, the avoidance of having teams working in parallel, recreating the same UI elements over and over, has a real-world project impact in terms of reduced time to market and increased cost savings.

Design systems allow project teams to work better together.
Designers define a centralized “source of truth” for software application best practices which can be referenced by anyone in a product organization.
Developers no longer need to spend time rethinking how to build common app scenarios, such as application search or data table grids.
When the business inevitably makes changes to the design system, they can easily be applied to all projects.
The end result is a better product for your users.

## Using Stencil to Build a Design System

There’s a lot that goes into creating amazing UI components.
Performance, accessibility, cross-platform capabilities, and user experience (not only of the UI component itself but how it fits into the entire design system) all must be considered.

These aspects take real effort to do well.

Enter Stencil, a robust and highly extensible tool for building components and patterns, the building blocks of a design system.
With its intentionally minimalistic tooling and API footprint, it’s simple to incorporate into your existing development workflows.
It brings substantial performance out of the box by leveraging a tiny runtime.
Most importantly, all UI components built with Stencil are based 100% on open web standards.

### The Importance of Open Web Standards
By using the web components standard, supported in all modern browsers, Stencil-built UI components offer many distinct advantages for use in a design system, namely:

* They work on any platform or device
* They work with any front-end framework, so they can easily be used across teams and projects using different tech stacks
* They facilitate the creation of one company-wide code implementation instead of one per framework or platform

Learn more about why web components are ideal for design systems in [this blog post](https://blog.ionicframework.com/5-reasons-web-components-are-perfect-for-design-systems/).

### How to Get Started
Stencil’s out-the-box features will help you build your own library of universal UI components that will work across platforms, devices, and front-end frameworks.
Review the documentation on this site to get started.
