import range from 'lodash/range'
import { RangeConstraintConfig } from './types'
import Coords from '../Coords'
import Graph from '../Pathfinder/Dijkstra/Graph'
import { GraphNodeNeighbour } from '../Pathfinder/Dijkstra/types'

export default class RangeConstraint {
  private constraint: RangeConstraintConfig
  private offsets = {
    x: new Set<number>(),
    y: new Set<number>(),
  }

  constructor(constraint: RangeConstraintConfig) {
    this.constraint = constraint
    this.offsets = this.buildOffsets()
  }

  /**
   * get coordinates considered adjacent to the coordinates passed in
   */
  adjacent = (coordsA: Coords) => {
    const coordinates: string[] = []
    for (const xOffset of this.offsets.x) {
      for (const yOffset of this.offsets.y) {
        const coordsB = {
          x: coordsA.x + xOffset,
          y: coordsA.y + yOffset,
        }
        const deltas = coordsA.deltas(coordsB)
        if (
          !this.constraint.exceptions ||
          this.constraint.exceptions.every(exception => exception(deltas))
        ) {
          coordinates.push(Coords.hash(coordsB))
        }
      }
    }
    return coordinates.map(hash => Coords.parse(hash))
  }

  private buildOffsets = () =>
    (['x', 'y'] as const).reduce(
      (acc, key) => {
        this.constraint.offsets[key].forEach(offset => {
          const offsetRange = Array.isArray(offset)
            ? range(offset[0], offset[1] + 1)
            : [offset]

          offsetRange.forEach(value =>
            acc[key as keyof RangeConstraintConfig['offsets']].add(value)
          )
        })
        return acc
      },
      { x: new Set<number>(), y: new Set<number>() }
    )
}
