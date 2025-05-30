// SignUpPage.tsx
import React, { useState } from 'react'
import { Button } from "./components/ui/button"
import { Input } from "./components/ui/input"
import { Label } from "./components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card"

interface Props {
  onBack: () => void
}

export default function SignUpPage({ onBack }: Props) {
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault()
    alert(`Registered ${username} (${email})`)
    onBack()
  }

  return (
    <Card className="w-full max-w-md p-8 mx-auto mt-16">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-center">
          Sign Up
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="mt-1 w-full bg-gray-100 border-gray-300 rounded-xl p-2"
            />
          </div>
          <div>
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              className="mt-1 w-full bg-gray-100 border-gray-300 rounded-xl p-2"
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="mt-1 w-full bg-gray-100 border-gray-300 rounded-xl p-2"
            />
          </div>
          <Button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl">
            Create Account
          </Button>
        </form>
        <Button variant="ghost" onClick={onBack} className="w-full mt-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl">
          Back to Login
        </Button>
      </CardContent>
    </Card>
  )
}
