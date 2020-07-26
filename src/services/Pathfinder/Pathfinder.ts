import last from 'lodash/last'
import Coords from '../Coords'
import Graph from './Dijkstra/Graph'
import { GraphNodeNeighbour } from './Dijkstra/types'

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
    this.graph = this.buildGraph()
  }

  get coordinates() {
    return this._coordinates
  }

  move = (path: RawCoords[]) => {
    if (path.length === 0) {
      return
    }
    const newCoordinates = last(path)!
    this._coordinates.update(newCoordinates)
    return this
  }

  get = {
    route: (toCoords: RawCoords) => {
      const coords = new Coords(toCoords)

      const { path, cost } = this.graph.path(
        this.unit,
        this.coordinates.hash,
        coords.hash,
        { cost: true }
      ) as { path: null | string[]; cost: number }

      const coordsPath = (path || []).map(Coords.parse)
      return { path: coordsPath, cost }
    },
    reachable: (
      fromCoords = this.coordinates,
      stepsLeft = this.unit.get.stats().movement,
      accumulator = new Set<string>()
    ) =>
      [
        ...this.unit.directionalConstraint
          .adjacent(fromCoords)
          .reduce((acc, coordinates) => {
            if (this.coordinates.hash === coordinates.hash) return acc

            const { tile } = this.grid.get.data(coordinates) || {}
            if (!tile) return acc

            const tileCost = tile.terrain.cost(this.unit)
            if (tileCost > stepsLeft) return acc

            if (!acc.has(coordinates.hash)) acc.add(coordinates.hash)
            if (stepsLeft - tileCost > 0)
              this.get.reachable(coordinates, stepsLeft - tileCost, acc)

            return acc
          }, accumulator),
      ].map(Coords.parse),
  }

  private buildGraph() {
    const graph = new Graph()
    this.grid.mapTiles(tile => {
      const neighbours: GraphNodeNeighbour = {}
      this.unit.directionalConstraint
        .adjacent(tile.coords)
        .filter(coords => coords.withinBounds(this.grid))
        .forEach(({ x, y }) => {
          const neighbour = this.grid.graph[y]?.[x]
          if (neighbour) {
            neighbours[neighbour.coords.hash] = neighbour.tile.terrain
          }
        })
      graph.addNode(tile.coords.hash, neighbours)
    })
    return graph
  }
}
