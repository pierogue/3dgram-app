import { downloadDto } from "./downloadDto"
import { likeDto } from "./likeDto"
import { userDto } from "./userDto"

export type modelDto = {
  modelID:number,
  title:string,
  description:string,
  modelUrl:string,
  owner: userDto,
  createdAt: Date
}

export type modelDetailsDto = {
  modelID:number,
  title:string,
  description:string,
  modelUrl:string,
  createdAt: Date,
  downloads: downloadDto[],
  likes: likeDto[]
}