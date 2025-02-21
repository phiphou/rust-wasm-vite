#!/bin/bash

# Construire le projet WebAssembly
cargo build --release --features wasm

wasm-pack build --target web  --features wasm

# Copier le dossier pkg vers le frontend
cp -r ./pkg ../game_of_life_web


