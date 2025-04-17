import { modelDto } from "./modelDto"

export type categoryDto = {
  categoryID: number,
  categoryName: string,
  models: modelDto[]
}

export type categoryLightDto = {
  categoryID: number,
  categoryName: string
}