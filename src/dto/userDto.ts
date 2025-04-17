import { roleDto } from "./roleDto"

export type userDto = {
  userId: string,
  name: string,
  blocked: boolean,
  role: roleDto,
  avatarUrl: string
}