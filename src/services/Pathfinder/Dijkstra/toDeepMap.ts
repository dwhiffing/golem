import { DeepMap, GraphNodeMap, GraphNodeNeighbour } from './types'
import Terrain from '../../../entities/Terrain'

export default function toDeepMap(source: GraphNodeMap | GraphNodeNeighbour) {
  const map: DeepMap = new Map()
  const keys = Object.keys(source)

  keys.forEach(key => {
    const val = source[key as keyof typeof source]
    if (val instanceof Terrain) {
      return map.set(key, val)
    }
    return map.set(key, toDeepMap(val))
  })

  return map
}
