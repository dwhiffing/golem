export default class Game {
  entities = {
    unit: new Map<Symbol, Unit>(),
    grid: new Map<Symbol, Grid>(),
    terrain: new Map<Symbol, Terrain>(),
    team: new Map<Symbol, Team>(),
    weapon: new Map<Symbol, Weapon>(),
  } as const
}
