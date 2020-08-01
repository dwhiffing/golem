import { Constraint } from './types'

export const ORTHOGONAL_CONSTRAINT: Constraint = {
  offsets: {
    x: [[-1, 1]],
    y: [[-1, 1]],
  },
  exceptions: [({ x, y }) => Math.abs(x) !== Math.abs(y)],
}

export const DIAGONAL_CONSTRAINT: Constraint = {
  offsets: {
    x: [-1, 1],
    y: [-1, 1],
  },
}
