import Coords, { RawCoords } from '../Coords'
import Graph from './Dijkstra/Graph'
import { Grid, Unit } from '../../entities'

export default class Pathfinder {
  readonly grid: Grid
  readonly unit: Unit
  readonly graph: Graph
  private _coordinates: Coords

  constructor({
    grid,
    unit,
    coordinates,
  }: {
    grid: Grid
    unit: Unit
    coordinates: RawCoords
  }) {
    this.grid = grid
    this.unit = unit
    this._coordinates = new Coords(coordinates)
    this.graph = this.unit.movement.buildPathfinderGraph(this.grid)
  }

  get coordinates() {
    return this._coordinates
  }

  move = (path: RawCoords[]) => {
    if (path.length < 1) {
      console.error(
        `Paths must contain at least one set of coordinates. Pathfinder#move receieved a path with a length of 0.`
      )
      return []
    }

    return path.reduce(
      (acc, coordinates, index) => {
        if (acc.abort || this.unit.isDead) {
          return acc
        }

        const data = this.grid.getData(coordinates)
        if (!data) {
          throw new Error(
            `No data was found at coordinates: { x: ${coordinates.x}; y: ${coordinates.y} }`
          )
        }

        const { pathfinder, tile } = data
        const isLastStep = index === path.length - 1

        if (tile.guard.entry(this.unit)) {
          acc.abort = true
          tile.on.guard.entry(this.unit)
          tile.on.unit.stop(this.unit)
        } else {
          const prev = path[index - 1] as RawCoords | undefined
          if (prev) this.grid.getData(prev)?.tile.on.unit.exit(this.unit)

          acc.path.push(coordinates)
          tile.on.unit.enter(this.unit)

          if (isLastStep) {
            tile.on.unit.stop(this.unit)
          } else if (!pathfinder && tile.guard.crossover(this.unit)) {
            acc.abort = true
            tile.on.guard.crossover(this.unit)
            tile.on.unit.stop(this.unit)
          }
        }

        return acc
      },
      { path: [] as RawCoords[], abort: false }
    ).path
  }

  getRoute = (toCoords: RawCoords) => {
    const result = this.graph.path(
      this.unit,
      this.coordinates.hash,
      Coords.hash(toCoords),
      { cost: true }
    ) as { path: null | string[]; cost: number }

    return result.path?.map(Coords.parse).slice(1) || []
  }

  getReachable = () => this.unit.movement.getReachableCoordinates(this)

  getTargetable = (fromCoords = this.coordinates) =>
    this.unit.weapon?.range.adjacent(fromCoords).filter(coords => {
      if (!this.grid.withinBounds(coords)) {
        return false
      }
      const otherTeam = this.grid.getData(coords)?.pathfinder?.unit?.team
      return !!(
        otherTeam?.isHostile(this.unit.team) ||
        otherTeam?.isWildcard(this.unit.team)
      )
    }) || []
}
