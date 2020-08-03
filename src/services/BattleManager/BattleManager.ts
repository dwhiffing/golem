import { TurnManager } from './services'

type BattleManagerCallback<T = void> = (battle: BattleManager) => T

const DEFAULT_END_CONDITION = (battle: BattleManager) =>
  battle.grid.get.teams().length === 1

export default class BattleManager {
  turn = -1
  grid: Grid
  endCondition: BattleManagerCallback<boolean>
  private didStart = false
  private callbacks: {
    onTurnStart: BattleManagerCallback
    onTurnEnd: BattleManagerCallback
  }

  constructor(
    grid: Grid,
    {
      onTurnStart = () => {},
      onTurnEnd = () => {},
      endCondition = DEFAULT_END_CONDITION,
    } = {} as Partial<BattleManager['callbacks']> & {
      endCondition?: BattleManagerCallback<boolean>
    }
  ) {
    this.grid = grid
    this.endCondition = endCondition
    this.callbacks = { onTurnStart, onTurnEnd }
  }

  get inProgress() {
    return this.didStart && !this.endCondition(this)
  }

  *start() {
    const { onTurnStart, onTurnEnd } = this.callbacks

    while (!this.didStart || this.inProgress) {
      if (!this.didStart) this.didStart = true
      this.turn++
      const turn = new TurnManager(this)
      onTurnStart(this)
      yield {
        turn: this.turn,
        team: turn.team,
        units: turn.getActionableUnits(),
      }
      onTurnEnd(this)
    }

    return null
  }
}
