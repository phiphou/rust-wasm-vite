# Construire le projet WebAssembly
cargo build --release --features wasm

wasm-pack build --target bundler  --features wasm

# Copier le dossier pkg vers ton répertoire frontend (avec remplacement forcé)
Copy-Item -Recurse -Force -Path .\pkg -Destination ..\game_of_life_web\