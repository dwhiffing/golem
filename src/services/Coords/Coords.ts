export default class Coords {
  x: number
  y: number

  constructor({ x, y }: { x: number; y: number }) {
    this.x = x
    this.y = y
  }

  static hash({ x, y }: RawCoords) {
    return `${x},${y}`
  }

  static parse(hash: string): Coords {
    const [x, y] = hash.split(',').map(Number)
    return new Coords({ x, y })
  }

  get hash() {
    return Coords.hash(this)
  }

  deltas(coordinates: RawCoords) {
    return new Coords({
      x: this.x - coordinates.x,
      y: this.y - coordinates.y,
    })
  }

  outOfBounds = (grid: Grid) =>
    this.x < 0 || this.x >= grid.size.x || this.y < 0 || this.y >= grid.size.y

  withinBounds = (grid: Grid) => !this.outOfBounds(grid)

  update = ({ x = this.x, y = this.y }: Partial<{ x: number; y: number }>) => {
    this.y = y
    this.x = x
    return this
  }
}
