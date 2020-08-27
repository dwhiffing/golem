import { SIMPLE_ORTHOGONAL_CONSTRAINT } from '../../recipes/constraints'
import { UnitConfig, ExtraMovementOptions } from './types'
import { Team, Weapon } from '..'
import {
  RangeConstraint,
  Deployment,
  GetReachableCooordinatesOptions,
} from '../../services'

export default class Unit {
  readonly id = Symbol()
  _team!: Team
  movement: RangeConstraint
  actions: number
  maxHealth: number
  currentHealth: number
  weapon?: Weapon
  extraMovementOptions: ExtraMovementOptions

  constructor({
    actions = 2,
    movement: {
      constraints = [SIMPLE_ORTHOGONAL_CONSTRAINT],
      mergeStrategy = 'union',
      steps = 1,
      canPassThroughUnit = (deployment: Deployment) =>
        deployment.unit.team.isFriendly(this.team) ||
        deployment.unit.team.isNeutral(this.team),
      unitPassThroughLimit = Infinity,
      getSpecialCoordinates = () => [],
    } = {},
    health = 1,
    team,
    ...rest
  }: UnitConfig) {
    if (health < 0) {
      throw new Error(
        `Unit health must be greater than 0. Received value: ${health}`
      )
    }

    this.setTeam(team)
    this.actions = actions
    this.extraMovementOptions = {
      canPassThroughUnit,
      unitPassThroughLimit,
      getSpecialCoordinates,
    }
    this.movement = new RangeConstraint({
      constraints,
      steps,
      mergeStrategy,
    })

    this.maxHealth = health
    this.currentHealth = this.maxHealth

    if ('weapon' in rest) {
      if (rest.weapon !== undefined) this.weapon = new Weapon(rest.weapon)
    } else {
      this.weapon = new Weapon()
    }
  }

  get isArmed() {
    return !!this.weapon
  }

  get isDead() {
    return this.currentHealth <= 0
  }

  get team() {
    return this._team
  }

  equip = (weapon: Weapon) => {
    this.weapon = weapon
    return this
  }

  disarm = () => {
    this.weapon = undefined
    return this
  }

  setTeam = (team: Team) => {
    this._team?.['__removeUnit'](this)
    this._team = team
    this._team['__addUnit'](this)
    return this
  }
}
