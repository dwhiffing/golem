import Tile from '../../entities/Tile'

export default function toDeepMap(source) {
  const map = new Map()
  const keys = Object.keys(source)

  keys.forEach(key => {
    const val = source[key]
    if (val instanceof Tile) {
      return map.set(key, val)
    }
    return map.set(key, toDeepMap(val))
  })

  return map
}
