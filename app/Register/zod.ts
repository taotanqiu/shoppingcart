import { z } from "zod"

export const userSchema = z.object({
  name: z.string().optional(),
  email: z.string().email("Please enter a valid email").optional(),
  emailVerified: z.date().optional(),
  image: z.string().url("Please enter a valid image URL").optional(),
})