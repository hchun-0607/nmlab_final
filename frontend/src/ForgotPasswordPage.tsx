// ForgotPasswordPage.tsx
import React, { useState } from 'react'
import { Button } from "./components/ui/button"
import { Input } from "./components/ui/input"
import { Label } from "./components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card"

interface Props {
  onBack: () => void
}

export default function ForgotPasswordPage({ onBack }: Props) {
  const [email, setEmail] = useState("")

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault()
    alert(`Reset link sent to ${email}`)
    onBack()  // 發完連結後回到 login
  }

  return (
    <Card className="w-full max-w-md p-8 mx-auto mt-16">
      <CardHeader>
        <CardTitle>Forgot Password</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleReset} className="space-y-4">
          <div>
            <Label htmlFor="email">Enter your email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="mt-1 w-full"
            />
          </div>
          <Button type="submit" className="w-full bg-indigo-600 text-white">
            Send Reset Link
          </Button>
        </form>
        <Button variant="ghost" onClick={onBack} className="w-full mt-4">
          Back to Login
        </Button>
      </CardContent>
    </Card>
  )
}
