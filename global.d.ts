type ValueInObject<T extends {}> = T[keyof T]

type DeepPartial<T extends {}> = {
  [P in keyof T]?: DeepPartial<T[P]>
}

type Unit = import('./src/entities/Unit').default
type Grid = import('./src/entities/Grid').default
type Game = import('./src/entities/Game').default
type Terrain = import('./src/entities/Terrain').default
type Tile = import('./src/entities/Tile').default
type Team = import('./src/entities/Team').default
type Weapon = import('./src/entities/Weapon').default

type RawCoords = import('./src/types').RawCoords
type Coords = import('./src/services/Coords').default
type Pathfinder = import('./src/services/Pathfinder').default
type BattleManager = import('./src/services/BattleManager').default
type TurnManager = import('./src/services/BattleManager/services').TurnManager
type ConflictManager = import('./src/services/BattleManager/services').ConflictManager
type RangeConstraint = import('./src/services/RangeConstraint').default

type GeneratorReturnValues<Type> = Type extends Generator<
  infer IteratorValue,
  infer ReturnValue
>
  ? IteratorValue | ReturnValue
  : Type
