# Tool Guide

Forge groups tools by workflow, not by implementation detail.

## Editors

### Markdown Preview

Write Markdown and preview the rendered result side by side. Useful for docs,
release notes, READMEs, and quick content drafts.

### HTML Preview

Write HTML and inspect the result in a constrained preview surface. Useful for
snippets, templates, and quick markup checks. Inline scripts run in an isolated
iframe without access to Forge's DOM or browser storage. Forms, popups, modal
dialogs and downloads initiated inside the preview are restricted. Use the
Forge toolbar to download the source. Auto updates after a short delay; turn it
off to apply edits only with Run preview.

The HTML editor currently uses native text rendering for reliable caret and
scroll alignment; syntax coloring and line numbers are deferred until a shared
editor integration has browser regression coverage.

### Diff Checker

Compare original and changed text with split and unified review modes. It
supports whitespace controls, unchanged-line hiding, synchronized scrolling,
syntax selection, copy actions, and export.

## Data

### JSON Formatter

Format, validate, inspect, edit, and copy JSON. It supports spacing options,
line wrapping control, syntax coloring, and text/tree views.

### JSON YAML Converter

Convert between JSON and YAML for config and API workflows.

### JWT Decoder

Decode JWT headers and payloads, inspect claim details, generate examples, and
verify HMAC signatures locally when supported.

## Encoding

### Base64

Encode and decode text using standard and URL-safe alphabets.

### URL Encoder

Encode, decode, and inspect URL-safe strings for links, query parameters, and
redirect values.

## Crypto

### JWT Secret Generator

Generate HMAC-friendly JWT secrets with common preset lengths.

### Hash Generator

Generate common hashes from text input and copy individual outputs.

### Password Generator

Generate passwords with configurable length and character sets.

## Utilities

### UUID Generator

Generate UUIDs for identifiers, test data, and local workflows.

### Timestamp Converter

Convert Unix timestamps and human-readable dates.

### Case Converter

Convert text between common naming styles.

### Slugify

Create URL-friendly slugs from human text.

### Regex Tester

Test regular expressions against sample input with match feedback.
