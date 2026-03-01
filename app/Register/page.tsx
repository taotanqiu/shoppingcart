"use client"

import Image from "next/image"
import axios from "axios";

import { useRouter } from "next/navigation"

import { useState } from "react"
import * as z from "zod"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client";

// 1️⃣ Zod 验证规则
const userSchema = z.object({
    name: z.string().min(3, { message: "Name must be at least 3 characters" }).optional(),
password:z.string()
  .min(2, "密码至少2位")
  // .max(32, "密码最多32位")
  // .regex(/[A-Z]/, "密码必须包含大写字母")
  // .regex(/[a-z]/, "密码必须包含小写字母")
  // .regex(/[0-9]/, "密码必须包含数字")
  // .regex(/[@$!%*?&]/, "密码必须包含特殊字符(@$!%*?&)");
  // email: z.email({ message: "Invalid email" })
  ,



  email: z.email({ message: "Invalid email" }),
    image: z.string().optional(),

})

// 2️⃣ TS 类型
type UserFormValues = z.infer<typeof userSchema>

export default function UserForm() {
  const [values, setValues] = useState<UserFormValues>({
    name: "",
    email: "",
    image: "",
    password:""
  })
 
const [file, setFile] = useState<File | null>(null)

      const [Error, setError] = useState<string | null>(null);
  // const [success, setSuccess] = useState<string | null>(null);

  const router = useRouter()

  
  const [errors, setErrors] = useState<Partial<Record<keyof UserFormValues, string>>>({})

  // 3️⃣ 提交处理
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
     if (!file) {
       setError("please choose a file");
      return;
     }
    setError(null);
 
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
 

const formData = new FormData();
    formData.append("file", file); 

try {
      const res = await axios.post("/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });



      // ===========================

 
      if (res.statusText==="OK") {
    
              setValues((prev) => ({ ...prev, image: res.data.url }));

console.log({
email: values.email,
password: values.password,
name: values.name || "",   // fallback to empty string if undefined
image: res.data.url,
},"❤🎉🤞🎶🤞🤞🤞✌✌✌😍😊😊👌👌👌😍😊😊")

          //  const re = await axios.post("/api/register",{...values, image: res.data.filename })
const { data, error } = await authClient.signUp.email({
  email: values.email ?? '',
  password: values.password,
  name: values.name?.trim() ?? '',          // 去除前后空格，默认空字符串
  image: res.data?.url ?? "",                // 默认空字符串
});



if (error) {
   setError(error.message || '注册失败');
    return
  }
   

  router.replace("/")   // 用 replace 更安全
  router.refresh()






 
      } else {
        setError(res.data || "上传失败1");
      }



    } catch (err) {
  const errorMessage = err instanceof globalThis.Error ? err.message : "上传失败2";
  setError(errorMessage);
}
    // TODO: 调用 API 创建/更新用户
  }




  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-lg mx-auto space-y-6 p-6 border rounded-lg shadow-md bg-white mt-5"
    >
      <h2 className="text-2xl font-bold text-center">Register</h2>

      {/* Name */}
      <div className="flex flex-col">
        <label className="mb-1 font-medium text-gray-700">Name</label>
        <Input
          type="text"
          placeholder="Enter name"
          value={values.name || ""}
          onChange={e => {
            
            setErrors({...errors,name:""})
            setValues({ ...values, name: e.target.value })}}
          className="border border-gray-300 rounded-md px-3 py-2"
        />
        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
      </div>

      {/* Email */}
      <div className="flex flex-col">
        <label className="mb-1 font-medium text-gray-700">Email</label>
        <Input
          type="email"
          placeholder="Enter email"
          value={values.email || ""}
         

 onChange={e => {
            
            setErrors({...errors,email:""})
            setValues({ ...values, email: e.target.value })}}




          className={`border ${errors.email ? "border-red-500" : "border-gray-300"} rounded-md px-3 py-2`}
        />
        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
      </div>

    
      {/* 密码 */}
      <div className="flex flex-col">
        <label className="mb-1 font-medium text-gray-700">password</label>
        <Input
          type="password"
          placeholder="Enter password"
          value={values.password || ""}
         

 onChange={e => {
            
            setErrors({...errors,password:""})
            setValues({ ...values, password: e.target.value })}}




          className={`border ${errors.password ? "border-red-500" : "border-gray-300"} rounded-md px-3 py-2`}
        />
        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
      </div>




      {/* Image */}
      <div className="flex flex-col">
        <label className="mb-1 font-medium text-gray-700">Image URL</label>
        <input
  type="file"
  accept="image/*" // 限制只能上传图片
  onChange={e => {
    const f = e.target.files?.[0]
    if (f) {
      setFile(f)
    }
  }}
  className={`border ${errors.image ? "border-red-500" : "border-gray-300"} rounded-md px-3 py-2`}


/>
        {errors && <p className="text-red-500 text-sm mt-1">{Error}</p>}



{file != null && (
  <Image
    src={URL.createObjectURL(file)}
    alt="Preview"
    width={55}
    height={55}
    className="mt-2 w-24 h-24 object-cover border"
  />
)}
      </div>

      <Button type="submit" className="w-full bg-black text-white py-2">
        Submit
      </Button>
    </form>
  )
}