"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState } from "react"
import * as z from "zod"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client";
import { useCart } from "../contexts@/CartContext"

// 1️⃣ Zod validation schema
const userSchema = z.object({
  password: z.string()
    .min(2, "Password must be at least 2 characters")
    // .max(32, "Password must be at most 32 characters")
    // .regex(/[A-Z]/, "Password must contain an uppercase letter")
    // .regex(/[a-z]/, "Password must contain a lowercase letter")
    // .regex(/[0-9]/, "Password must contain a number")
    // .regex(/[@$!%*?&]/, "Password must contain a special character (@$!%*?&)")
  ,
  email: z.string().email({ message: "Invalid email" }),
  image: z.string().optional(),
})

// 2️⃣ TS type
type UserFormValues = z.infer<typeof userSchema>

export default function UserForm() {
  const [values, setValues] = useState<UserFormValues>({
    password: "",
    email: "",
  })
  const router = useRouter()
  const [errors, setErrors] = useState<Partial<Record<keyof UserFormValues, string>>>({})

  const { refreshCart } = useCart()

  async function mergeCartAfterLogin() {
    try {
      const response = await fetch('/api/cart/merge', {
        method: 'POST',
        credentials: 'include', // must include cookies so backend can identify current user and anonymous ID
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Cart merge failed', errorData)
        // can show an error message here
        return
      }

      const result = await response.json()

      // After successful merge, refresh the cart state (if using CartContext)
      refreshCart()
    } catch (error) {
      console.error('Network error or merge endpoint exception', error)
    }
  }

  // 3️⃣ Submit handler
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const result = userSchema.safeParse(values)

    if (!result.success) {
      const fieldErrors: Partial<Record<keyof UserFormValues, string>> = {}
      result.error.issues.forEach(err => {
        const key = err.path[0] as keyof UserFormValues
        fieldErrors[key] = err.message
      })
      setErrors(fieldErrors)
      return
    }

    setErrors({})

    try {
      

      const { data, error } = await authClient.signIn.email({
        email: values.email,
        password: values.password,
      })

      if (error) {
        console.log("Login error:", error)
        return
      }
      mergeCartAfterLogin()

      router.replace("/")   // using replace is safer
      router.refresh()
    } catch (err) {
      // TODO: call API to create/update user
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-lg mx-auto space-y-6 p-6 border rounded-lg shadow-md bg-white mt-5"
    >
      <h2 className="text-2xl font-bold text-center">LOGIN</h2>

      {/* Email */}
      <div className="flex flex-col">
        <label className="mb-1 font-medium text-gray-700">Email</label>
        <Input
          type="email"
          placeholder="Enter email"
          value={values.email || ""}
          onChange={e => {
            setErrors({...errors, email: ""})
            setValues({ ...values, email: e.target.value })
          }}
          className={`border ${errors.email ? "border-red-500" : "border-gray-300"} rounded-md px-3 py-2`}
        />
        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
      </div>

      {/* Password */}
      <div className="flex flex-col">
        <label className="mb-1 font-medium text-gray-700">Password</label>
        <Input
          type="password"
          placeholder="Enter password"
          value={values.password || ""}
          onChange={e => {
            setErrors({...errors, password: ""})
            setValues({ ...values, password: e.target.value })
          }}
          className={`border ${errors.password ? "border-red-500" : "border-gray-300"} rounded-md px-3 py-2`}
        />
        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
      </div>

      <Button type="submit" className="w-full bg-black text-white py-2">
        Submit
      </Button>
    </form>
  )
}