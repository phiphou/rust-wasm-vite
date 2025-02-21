use crate::native::{Cell, Universe};

#[cfg(target_arch = "wasm32")]
use wasm_bindgen::prelude::*;

#[cfg(target_arch = "wasm32")]
#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = Math)]
    fn random() -> f64; // Appelle Math.random() en JS
}

#[cfg(target_arch = "wasm32")]
#[wasm_bindgen]
pub struct WasmUniverse {
    universe: Universe,
}

#[cfg(target_arch = "wasm32")]
#[wasm_bindgen]
impl WasmUniverse {
    #[wasm_bindgen(constructor)]
    pub fn new(width: u32, height: u32) -> Self {
        Self {
            universe: Universe::new(width, height),
        }
    }

    // pub fn randomise(&mut self) {
    //     let width = self.universe.width(); // Obtenez la largeur depuis `universe`
    //     let height = self.universe.height(); // Obtenez la hauteur depuis `universe`

    //     // Créez un vecteur de coordonnées des cellules vivantes avec une probabilité aléatoire
    //     let cells: Vec<(u32, u32)> = (0..(width * height))
    //         .filter_map(|i| {
    //             // Générez un nombre aléatoire entre 0 et 1 à l'aide de Math.random()
    //             let is_alive: bool = random() < 0.5; // 50% de chance que la cellule soit vivante

    //             if is_alive {
    //                 // Déterminer les coordonnées (row, col) de chaque cellule vivante
    //                 Some((i / width, i % width)) // (row, col)
    //             } else {
    //                 None // Ignorer les cellules mortes
    //             }
    //         })
    //         .collect();

    //     // Débogage : affichez les cellules randomisées
    //     // println!("Randomized cells: {:?}", cells);

    //     // Passez ces coordonnées à `universe.set_cells`
    //     self.universe.set_cells(&cells);
    // }

    pub fn randomise(&mut self) {
        let width = self.universe.width();
        let height = self.universe.height();

        let mut living_cells = Vec::new();

        for row in 0..height {
            for col in 0..width {
                if fastrand::i8(..127) < 64 {
                    living_cells.push((row, col)); // On stocke uniquement les cellules vivantes
                }
            }
        }

        self.universe.set_cells(&living_cells); // Maintenant le bon format
    }

    pub fn tick(&mut self) {
        self.universe.tick();
    }

    #[wasm_bindgen(js_name = "toggle_cell")]
    pub fn toggle_cell(&mut self, row: u32, column: u32) {
        self.universe.toggle_cell(row, column);
    }

    #[wasm_bindgen(js_name = "get_cells")]
    pub fn get_cells(&self) -> *const Cell {
        self.universe.cells()
    }

    pub fn render(&self) -> String {
        self.universe.render()
    }

    pub fn width(&self) -> u32 {
        self.universe.width
    }

    pub fn height(&self) -> u32 {
        self.universe.height
    }
}

#[cfg(target_arch = "wasm32")]
#[wasm_bindgen]
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum WasmCell {
    Dead = 0,
    Alive = 1,
}

impl From<Cell> for WasmCell {
    fn from(cell: Cell) -> Self {
        match cell {
            Cell::Dead => WasmCell::Dead,
            Cell::Alive => WasmCell::Alive,
        }
    }
}

impl From<WasmCell> for Cell {
    fn from(cell: WasmCell) -> Self {
        match cell {
            WasmCell::Dead => Cell::Dead,
            WasmCell::Alive => Cell::Alive,
        }
    }
}

#[wasm_bindgen]
pub fn get_memory() -> JsValue {
    wasm_bindgen::memory()
}
