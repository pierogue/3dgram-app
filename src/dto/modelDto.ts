import { downloadDto } from "./downloadDto"
import { likeDto } from "./likeDto"
import { userDto } from "./userDto"

export type modelDto = {
  modelID:number,
  title:string,
  description:string,
  modelUrl:string,
  owner: userDto
}

export type modelDetailsDto = {
  modelID:number,
  title:string,
  description:string,
  modelUrl:string,
  downloads: downloadDto[],
  likes: likeDto[]
}