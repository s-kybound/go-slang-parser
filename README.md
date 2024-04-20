# go-slang-parser

## Table of Contents

- [About](#about)
- [Prerequisites](#prerequisites)
- [Usage](#usage)
- [Testing](#testing)

## About

A parser for an implementation of a subset of the language _Go_, created for CS4215 term project for AY23/24 Semester 2.

## Prerequisites

- NodeJS v20

## Usage

_go-slang-parser_ should not be used directly, but as a submodule of _go-slang_. To update the parser after a change to the PEG expression grammer in `src/raw_parser/go.peggy`, run:

```bash
$ yarn generate-ast ./src/raw_parser/go.peggy
```

## Testing

_go-slang-parser_ comes with its own suite of tests, which can be run with:

```bash
$ yarn test
```