import { TileConfig, TileInteractionCallback } from './types'
import { Terrain } from '..'

export default class Tile {
  readonly id = Symbol()

  terrain: Terrain
  constructor(terrain: Terrain, callbacks = {} as TileConfig) {
    this.terrain = terrain
    if (callbacks.guard) this.guard = { ...this.guard, ...callbacks.guard }
    if (callbacks.on) this.on = { ...this.on, ...callbacks.on }
  }

  guard = {
    entry: (() => false) as TileInteractionCallback<boolean>,
    crossover: (() => false) as TileInteractionCallback<boolean>,
  }

  on = {
    unit: {
      enter: (() => {}) as TileInteractionCallback<void>,
      exit: (() => {}) as TileInteractionCallback<void>,
      stop: (() => {}) as TileInteractionCallback<void>,
    },
    guard: {
      entry: (() => {}) as TileInteractionCallback<void>,
      crossover: (() => {}) as TileInteractionCallback<void>,
    },
  }
}
