"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Formik, Form, Field } from "formik"
import * as Yup from "yup"
import { useMutation } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { useAuthStore } from "@/store/auth-store"
import api from "@/lib/api"
import { inter } from "@/lib/fonts"
import { AxiosError } from "axios"

const loginSchema = Yup.object().shape({
  emailOrUsername: Yup.string().required("Email or username is required"),
  password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
})

interface LoginFormValues {
  emailOrUsername: string
  password: string
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const setUser = useAuthStore((state) => state.setUser)

  const loginMutation = useMutation({
    mutationFn: async (values: LoginFormValues) => {
      try {
        const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const response = await api.post("/auth/login", {
          ...values,
          timezone: userTimezone
        })
        return response.data
      } catch (error) {
        console.error('Login error:', error)
        throw error
      }
    },
    onSuccess: (data) => {
      console.log('Login successful:', data)
      setUser(data.user)
      console.log('User set, redirecting to dashboard...')
      router.replace('/dashboard')
    },
    onError: (error) => {
      console.error('Login mutation error:', error)
    }
  })

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center p-4 ${inter.className}`}
    >
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h1>
          <p className="text-gray-600">Sign in to continue your habit journey</p>
        </div>

        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-semibold text-center">Sign In</CardTitle>
            <CardDescription className="text-center text-gray-600">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Formik
              initialValues={{ emailOrUsername: "", password: "" }}
              validationSchema={loginSchema}
              onSubmit={(values) => loginMutation.mutate(values)}
            >
              {({ errors, touched, isSubmitting }) => (
                <Form className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="emailOrUsername">Email or Username</Label>
                    <Field
                      as={Input}
                      id="emailOrUsername"
                      name="emailOrUsername"
                      type="text"
                      placeholder="Enter your email or username"
                      className="h-12"
                    />
                    {errors.emailOrUsername && touched.emailOrUsername && (
                      <p className="text-sm text-red-600">{errors.emailOrUsername}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Field
                        as={Input}
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        className="h-12 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    {errors.password && touched.password && <p className="text-sm text-red-600">{errors.password}</p>}
                  </div>

                  {loginMutation.error && (
                    <Alert variant="destructive">
                      <AlertDescription>
                        {(loginMutation.error as AxiosError<{ message: string }>)?.response?.data?.message || "Login failed. Please try again."}
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-12 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-xl"
                    disabled={isSubmitting && !loginMutation.isError}
                  >
                    {loginMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </Form>
              )}
            </Formik>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                {"Don't have an account? "}
                <Link href="/signup" className="text-amber-600 hover:text-amber-700 font-medium">
                  Sign up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
