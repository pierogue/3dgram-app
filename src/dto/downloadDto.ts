import { modelDetailsDto, modelDto } from "./modelDto"
import { userDto } from "./userDto"

export type downloadDto = {
  downloadID: number,
  timestamp: Date,
  user: userDto,
  model: modelDetailsDto
}