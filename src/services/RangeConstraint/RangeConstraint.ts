import { Pathfinder, Coords } from '..'
import { TileInteractionCallback, Grid, Unit } from '../../entities'
import { graphMergeStrategies, coordinatesHashesMergeStrategies } from './utils'
import Graph from '../Pathfinder/Dijkstra/Graph'
import { RangeConstraintConfig, ConstraintMergeStrategy } from './types'
import Constraint from './Constraint'

export default class RangeConstraint {
  constraints: Constraint[]
  mergeStrategy: ConstraintMergeStrategy
  steps: number
  canPassThroughUnit: TileInteractionCallback<boolean>
  unitPassThroughLimit: number

  constructor({
    constraints = [],
    mergeStrategy = 'union',
    steps = 1,
    canPassThroughUnit = () => false,
    unitPassThroughLimit = Infinity,
  }: Partial<RangeConstraintConfig>) {
    this.constraints = constraints.map(config => new Constraint(config))
    this.mergeStrategy = mergeStrategy
    this.steps = steps
    this.canPassThroughUnit = canPassThroughUnit
    this.unitPassThroughLimit = unitPassThroughLimit
  }

  buildPathfinderGraph = (grid: Grid) =>
    new Graph(
      this.mergeGraph(
        ...this.constraints.map(constraint =>
          constraint.buildPathfinderGraph(grid)
        )
      )
    )

  getReachableCoordinates = (pathfinder: Pathfinder) =>
    this.mergeReachableCoordinates(
      ...this.constraints.map(constraint =>
        this.getReachableCoordinatesForConstraint({
          unit: pathfinder.unit,
          grid: pathfinder.grid,
          constraint,
          fromCoords: pathfinder.coordinates,
          stepsLeft: this.steps,
        })
      )
    )

  adjacent = (fromCoords: Coords) => [
    ...this.constraints.reduce((acc, constraint) => {
      acc.push(...constraint.adjacent(fromCoords))
      return acc
    }, [] as Coords[]),
  ]

  private get mergeReachableCoordinates() {
    return coordinatesHashesMergeStrategies[this.mergeStrategy]
  }

  private get mergeGraph() {
    return graphMergeStrategies[this.mergeStrategy]
  }

  private getReachableCoordinatesForConstraint = (
    {
      unit,
      grid,
      constraint,
      fromCoords,
      stepsLeft,
    }: {
      unit: Unit
      grid: Grid
      constraint: Constraint
      fromCoords: Coords
      stepsLeft: number
    },
    accumulator = {
      passThroughCount: 0,
      accessible: new Set<string>(),
      inaccessible: new Set<string>(),
    }
  ) => [
    ...constraint
      .adjacent(fromCoords)
      .filter(grid.withinBounds)
      .reduce((acc, coordinates) => {
        if (stepsLeft <= 0 || acc.inaccessible.has(fromCoords.hash)) {
          return acc
        }

        const { pathfinder, tile } = grid.getData(coordinates)!
        const movementCost = tile.terrain.cost(unit)

        if (movementCost > stepsLeft) return acc

        let didPassThroughUnit = false
        if (pathfinder?.unit && pathfinder.unit.id !== unit.id) {
          if (!this.canPassThroughUnit(pathfinder, tile)) {
            acc.inaccessible.add(coordinates.hash)
            return acc
          }
          didPassThroughUnit = true
          acc.passThroughCount++
        }

        acc.accessible.add(coordinates.hash)
        if (
          stepsLeft - movementCost > 0 &&
          (!didPassThroughUnit ||
            acc.passThroughCount < this.unitPassThroughLimit)
        ) {
          this.getReachableCoordinatesForConstraint(
            {
              unit,
              grid,
              constraint,
              fromCoords: coordinates,
              stepsLeft: stepsLeft - movementCost,
            },
            acc
          )
        }

        return acc
      }, accumulator).accessible,
  ]
}
