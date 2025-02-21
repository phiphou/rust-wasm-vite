extern crate anyhow;

use game_of_life::native::Universe;

fn main() {
    let universe = Universe::new(20, 10);
    println!("\n{}\n", universe.render());
}
