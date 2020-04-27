import { Equipment } from "../equipment"

export default class EquipmentMock implements Equipment {
  public src = []
  public size = 0

  public defaultSlots = []
  public currentSlots = []

  public gears = []

  public forEach = jest.fn()
  public filter = jest.fn()
  public map = jest.fn()
  public sumBy = jest.fn()
  public maxValueBy = jest.fn()
  public has = jest.fn()
  public count = jest.fn()
  public hasAircraft = jest.fn()
  public countAircraft = jest.fn()
}
