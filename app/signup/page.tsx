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
import { Eye, EyeOff, Loader2, Check, X, AlertCircle } from "lucide-react"
import { useAuthStore } from "@/store/auth-store"
import { useDebouncedUsername } from "@/hooks/use-debounced-username"
import api from "@/lib/api"
import { inter } from "@/lib/fonts"
import { AxiosError } from "axios"

const signupSchema = Yup.object().shape({
  username: Yup.string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be less than 20 characters")
    .matches(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores")
    .required("Username is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required")
})

interface SignupFormValues {
  username: string
  email: string
  password: string
}

function UsernameField({ value, onChange, onBlur, error, touched }: any) {
  const { isAvailable, isLoading } = useDebouncedUsername(value)

  const getValidationState = () => {
    if (!value || value.length < 3) return null
    if (isLoading) return "loading"
    if (isAvailable === false) return "taken"
    if (isAvailable === true) return "available"
    if (error && touched) return "error"
    return null
  }

  const validationState = getValidationState()

  return (
    <div className="space-y-2">
      <Label htmlFor="username">Username</Label>
      <div className="relative">
        <Input
          id="username"
          name="username"
          type="text"
          placeholder="Choose a username"
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          className={`h-12 pr-10 ${validationState === "available"
            ? "border-green-500 focus:border-green-500"
            : validationState === "taken"
              ? "border-red-500 focus:border-red-500"
              : ""
            }`}
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {validationState === "loading" && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
          {validationState === "available" && <Check className="h-4 w-4 text-green-500" />}
          {validationState === "taken" && <X className="h-4 w-4 text-red-500" />}
          {validationState === "error" && <AlertCircle className="h-4 w-4 text-red-500" />}
        </div>
      </div>

      {/* Validation messages */}
      {error && touched && <p className="text-sm text-red-600">{error}</p>}
      {validationState === "taken" && <p className="text-sm text-red-600">This username is already taken</p>}
      {validationState === "available" && !error && !touched && <p className="text-sm text-green-600">Username is available!</p>}
      {value && value.length > 0 && value.length < 3 && !(error && touched) && (
        <p className="text-sm text-gray-500">Username must be at least 3 characters</p>
      )}
    </div>
  )
}

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const router = useRouter()
  const setUser = useAuthStore((state) => state.setUser)

  const signupMutation = useMutation({
    mutationFn: async (values: SignupFormValues) => {
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const response = await api.post("/auth/signup", {
        ...values,
        timezone: userTimezone
      })
      return response.data
    },
    onSuccess: (data) => {
      setUser(data.user)
      router.push("/onboarding")
    },
  })

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center p-4 ${inter.className}`}
    >
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Join Vane</h1>
          <p className="text-gray-600">Start building better habits today</p>
        </div>

        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-semibold text-center">Create Account</CardTitle>
            <CardDescription className="text-center text-gray-600">
              Enter your information to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Formik
              initialValues={{ username: "", email: "", password: "" }}
              validationSchema={signupSchema}
              onSubmit={(values, { setSubmitting }) => {
                signupMutation.mutate(values, {
                  onSettled: () => setSubmitting(false)
                })
              }}
            >
              {({ errors, touched, isSubmitting, values, handleChange, handleBlur }) => (
                <Form className="space-y-4">
                  <UsernameField
                    value={values.username}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.username}
                    touched={touched.username}
                  />

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Field
                      as={Input}
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      className="h-12"
                    />
                    {errors.email && touched.email && <p className="text-sm text-red-600">{errors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Field
                        as={Input}
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password"
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

                  {/* <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Field
                        as={Input}
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        className="h-12 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div> */}

                  {signupMutation.error && (
                    <Alert variant="destructive">
                      <AlertDescription>
                        {(signupMutation.error as AxiosError<{ message: string }>)?.response?.data?.message || "Signup failed. Please try again."}
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-12 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-xl"
                    disabled={isSubmitting || signupMutation.isPending}
                  >
                    {signupMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </Form>
              )}
            </Formik>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Already have an account?{" "}
                <Link href="/login" className="text-amber-600 hover:text-amber-700 font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
