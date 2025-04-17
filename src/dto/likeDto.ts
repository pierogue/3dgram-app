import { modelDto } from "./modelDto"
import { userDto } from "./userDto"

export type likeDto = {
  likeID: number,
  timestamp: Date,
  user: userDto,
  model: modelDto
}