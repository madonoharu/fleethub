import { Equipment } from "../equipment"
import {} from "ts-jest/utils"

export class EquipmentMock implements Equipment {
  public src: any
  public size: any

  public defaultSlots: any
  public currentSlots: any

  public gears: any

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
