# rust-wasm-vite

This is a personal experiment in getting Rust code working in a web project (React + Vite)
via WebAssembly. The purpose is to try writing business logic once in the form of a Rust
library, and then sharing it across multiple frontends (e.g. cli tools, web apps).

## Project structure

In this particular project, a simple calculator library is shared by a cli app and
a React web app. This whole thing is a Cargo workspace with 3 packages:

- [`calculator`](./calculator/): the shareable library
- [`calculator_cli`](./calculator_cli/): a cli app consuming the library
- [`calculator_web`](./calculator_web/): a Wasm wrapper around the library + a React web app (inside [`www`](./calculator_web/www/))

The 3 major components to getting the web app working are:

- [`wasm-bindgen`](https://rustwasm.github.io/docs/wasm-bindgen/), for doing Rust -> Wasm
- [`wasm-pack`](https://rustwasm.github.io/docs/wasm-pack/introduction.html), for building the Wasm package consumed by the web app, and
- [`vite-plugin-wasm`](https://github.com/Menci/vite-plugin-wasm), which supports Wasm ESM integration in Vite projects

## Usage

Prerequisite: you'd need a stable [Rust toolchain](https://www.rust-lang.org/tools/install) installed.

### cli app

To test out the cli app:

```bash
# Clone the repo and navigate to the cli package dir
$ git clone https://github.com/ndinata/rust-wasm-vite.git
$ cd rust-wasm-vite/calculator_cli/

# Will print out "10 / 2 is 5"
$ cargo run --release 10 2

# Will print out an error
$ cargo run --release 10 0
```

### web app

Prerequisites:

- you'd need an installation of [Node.js and `npm`](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
- you'd also need [`wasm-pack`](https://rustwasm.github.io/wasm-pack/installer/)
  to handle the Wasm package and glue code generation

To run the web app locally in your browser:

```bash
$ cd rust-wasm-vite/calculator_web/

# Generate the `pkg/` dir containing the Wasm package
$ wasm-pack build

# Install dependencies of the React app (including the Wasm package generated above!)
$ cd www && npm install

# Spin up a local server, which you can open with your browser
$ npm run dev
```

A deployed version is also available here: https://ndinata.github.io/rust-wasm-vite/

_P.S. The error message you see on the web app when doing division by 0 comes from
the [Rust lib](./calculator/src/lib.rs)!_

## License

Licensed under the [MIT license](./license).
