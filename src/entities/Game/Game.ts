type EntityMappings = {
  unit: Unit
  team: Team
  grid: Grid
  terrain: Terrain
}

export default class Game {
  entities = {
    unit: new Map<Symbol, Unit>(),
    grid: new Map<Symbol, Grid>(),
    terrain: new Map<Symbol, Terrain>(),
    team: new Map<Symbol, Team>(),
  } as const

  private getEntity = <K extends keyof EntityMappings>(type: K, id: Symbol) =>
    this.entities[type].get(id) as EntityMappings[K] | undefined

  get = {
    unit: (id: Symbol) => this.getEntity('unit', id),
    grid: (id: Symbol) => this.getEntity('grid', id),
    terrain: (id: Symbol) => this.getEntity('terrain', id),
    team: (id: Symbol) => this.getEntity('team', id),
  }
}
