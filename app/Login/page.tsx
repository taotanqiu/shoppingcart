"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState } from "react"
import * as z from "zod"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"
import { useMergeCartAfterLogin } from "@/lib/useMergeCartAfterLogin"

// 1️⃣ Zod validation schema
const userSchema = z.object({
password: z.string().min(2, "Password must be at least 2 characters"),
email: z.email("Invalid email format"),
image: z.string().optional(),
})

// 2️⃣ TS type
type UserFormValues = z.infer<typeof userSchema>

export default  function UserForm() {
  const [values, setValues] = useState<UserFormValues>({
    password: "",
    email: "",
  })
  const router = useRouter()
  const [errors, setErrors] = useState<Partial<Record<keyof UserFormValues, string>>>({})
  const [loginError, setLoginError] = useState<string | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)


  // 1️⃣ 从 cookie 读取 anonymousId 的辅助函数
const getAnonymousIdFromCookie = () => {
    if (typeof document === 'undefined') return null; // optional guard
    const cookies = document.cookie.split('; ').find(row => row.startsWith('anonymous_id='));
    return cookies ? cookies.split('=')[1] : null;
  };

  // 2️⃣ 合并购物车的函数（新版本）


const anonymousId = getAnonymousIdFromCookie();
   const mergeCart = useMergeCartAfterLogin();








  // 3️⃣ 提交处理
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setLoginError(undefined)

    // 验证表单
    const result = userSchema.safeParse(values)
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof UserFormValues, string>> = {}
      result.error.issues.forEach(err => {
        const key = err.path[0] as keyof UserFormValues
        fieldErrors[key] = err.message
      })
      setErrors(fieldErrors)
      setIsLoading(false)
      return
    }

    setErrors({})

    try {
      const { data, error } = await authClient.signIn.email({
        email: values.email,
        password: values.password,
      })

      if (error) {
        setLoginError(error.message || "登录失败，请检查邮箱和密码")
        setIsLoading(false)
        return
      }




     




 
if (data?.user) {

await mergeCart(anonymousId);
  
 
 
}




      // 跳转至首页
      router.replace("/")
      // 刷新服务端组件（使首页重新获取数据）
      router.refresh()
    } catch (err) {
      console.error("登录异常", err)
      setLoginError("网络错误，请稍后重试")
      setIsLoading(false)
    }
  }

  // 更新字段并清除该字段的错误
  const handleChange = (field: keyof UserFormValues, value: string) => {
    setValues(prev => ({ ...prev, [field]: value }))
    setErrors(prev => ({ ...prev, [field]: "" }))
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-lg mx-auto space-y-6 p-6 border rounded-lg shadow-md bg-white mt-5"
    >
      <h2 className="text-2xl font-bold text-center">Login</h2>

      {loginError && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {loginError}
        </div>
      )}

      {/* 邮箱 */}
      <div className="flex flex-col">
        <label className="mb-1 font-medium text-gray-700">email</label>
        <Input
          type="email"
          placeholder="email"
          value={values.email}
          onChange={e => handleChange("email", e.target.value)}
          className={`border ${errors.email ? "border-red-500" : "border-gray-300"} rounded-md px-3 py-2`}
          disabled={isLoading}
        />
        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
      </div>

      {/* 密码 */}
      <div className="flex flex-col">
        <label className="mb-1 font-medium text-gray-700">password</label>
        <Input
          type="password"
          placeholder="password"
          value={values.password}
          onChange={e => handleChange("password", e.target.value)}
          className={`border ${errors.password ? "border-red-500" : "border-gray-300"} rounded-md px-3 py-2`}
          disabled={isLoading}
        />
        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
      </div>

      <Button
        type="submit"
        className="w-full bg-black text-white py-2"
        disabled={isLoading}
      >
        {isLoading ? "Logging..." : "Logged"}
      </Button>
    </form>
  )
}