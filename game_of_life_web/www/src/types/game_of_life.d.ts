declare module 'game_of_life/game_of_life_bg' {
  export const memory: WebAssembly.Memory
  export function get_memory(): WebAssembly.Memory
}
