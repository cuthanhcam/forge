# Product Overview

Forge is a local-first toolbox for developer workflows that are too small for a
full application but too important for random paste-and-copy websites.

It brings common utilities into one interface:

- editors and previews
- diff review
- structured data formatting
- encoders and decoders
- token inspection
- secret and password generation
- timestamp, UUID, case, slug, and regex helpers

## Start with a tool

The home page opens with the Forge signature. Scroll down or choose Explore
tools to reach the directory, which lists available tools by category. Filter by name, format or task
(for example JSON, Mermaid or encode), then open a tool directly. The header's
command palette remains available with `Ctrl K` from any page.

UI text and headings use one self-hosted Inter family. Source editors, structured
data and keyboard keys use a shared monospace role; math and user-authored HTML
retain their specialized rendering. See the [typography guide](development/typography.md)
for the implementation rules.

## Product Principles

### Local-first

Forge should process sensitive input in the browser whenever the feature can be
implemented locally.

### One workspace

Each tool should feel like part of the same product. Toolbars, pane headers,
copy actions, validation states, and keyboard shortcuts use a consistent
language.

### Quiet interface

Forge avoids loud marketing layouts inside tools. Tool screens prioritize dense,
readable panes, clear controls, stable spacing, and predictable action
placement.

### Fast recovery

Tools should make it easy to paste, inspect, copy, clear, export, or generate
sample input without interrupting the current workflow.

## Who Forge Is For

Forge is built for developers, QA engineers, support engineers, security-minded
reviewers, and anyone who repeatedly handles structured or encoded text during
technical work.

## What Forge Is Not

Forge is not a backend service, account system, security audit platform, or
replacement for production validation. Always verify generated output before
using it in critical systems.
