"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, X } from "lucide-react"
import { inter } from "@/lib/fonts"

const onboardingSteps = [
  {
    title: "Be very welcome",
    description:
      "In life goals, wellbeing is the most important... and often the most overlooked. We want to help you keep it in mind by tracking your habits.",
    illustration:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/onboarding%20ideas-aOo6QQQzHtLCsbdYnp3Zg34SxJbTxQ.webp",
  },
  {
    title: "Form habits that last",
    description:
      "We all have good intentions, but it's difficult to keep them. The stress of giving up good habits is unbearable, right? Let us help you fix it.",
    illustration:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/onboarding%20ideas-aOo6QQQzHtLCsbdYnp3Zg34SxJbTxQ.webp",
  },
  {
    title: "Motivation calls for positive change",
    description:
      "We all need positive reinforcement and we are all capable of giving it to ourselves if we do things right. Once the change begins, we will want more.",
    illustration:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/onboarding%20ideas-aOo6QQQzHtLCsbdYnp3Zg34SxJbTxQ.webp",
  },
]

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const router = useRouter()

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      router.push("/dashboard")
    }
  }

  const handleSkip = () => {
    router.push("/dashboard")
  }

  const currentStepData = onboardingSteps[currentStep]

  return (
    <div className={`min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 ${inter.className}`}>
      {/* Progress bar */}
      <div className="w-full bg-white/20 h-1">
        <div
          className="h-full bg-amber-500 transition-all duration-300"
          style={{ width: `${((currentStep + 1) / onboardingSteps.length) * 100}%` }}
        />
      </div>

      {/* Skip button */}
      <div className="absolute top-4 right-4 z-10">
        <Button variant="ghost" size="sm" onClick={handleSkip} className="text-gray-600 hover:text-gray-800">
          <X size={20} />
        </Button>
      </div>

      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md border-0 shadow-xl bg-white/90 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            {/* Illustration placeholder */}
            <div className="w-64 h-64 mx-auto mb-8 bg-gradient-to-br from-orange-200 to-amber-200 rounded-3xl flex items-center justify-center">
              <div className="text-6xl">🌟</div>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-4">{currentStepData.title}</h1>

            <p className="text-gray-600 leading-relaxed mb-8">{currentStepData.description}</p>

            <Button
              onClick={handleNext}
              className="w-16 h-16 rounded-full bg-amber-500 hover:bg-amber-600 text-white shadow-lg"
            >
              <ArrowRight size={24} />
            </Button>

            {/* Step indicators */}
            <div className="flex justify-center space-x-2 mt-6">
              {onboardingSteps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentStep ? "bg-amber-500" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
