import { TileConfig } from './types'

export default class Tile {
  readonly id = Symbol()

  shouldGuardEntry: NonNullable<TileConfig['shouldGuardEntry']>
  shouldGuardCrossover: NonNullable<TileConfig['shouldGuardCrossover']>
  cost: NonNullable<TileConfig['cost']>

  constructor(
    {
      shouldGuardEntry = () => false,
      shouldGuardCrossover = () => false,
      cost = () => 1,
    } = {} as TileConfig
  ) {
    this.cost = cost
    this.shouldGuardEntry = shouldGuardEntry
    this.shouldGuardCrossover = shouldGuardCrossover
  }
}
