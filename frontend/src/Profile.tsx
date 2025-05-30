import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from './components/ui/card'
import { Input } from './components/ui/input'
import { Button } from './components/ui/button'
import { Label } from './components/ui/label'
import { useNavigate } from 'react-router-dom'


export default function Profile() {
    const nav = useNavigate()

  // Placeholder user data
  const user = {
    name: 'John Doe',
    email: 'john.doe@example.com',
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-3xl p-8 rounded-2xl shadow-xl">
        <CardHeader className="mb-6 text-center">
          <CardTitle className="text-4xl font-semibold text-indigo-600">
            My Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-6">
            {/* Name */}
            <div>
              <Label htmlFor="name" className="block text-sm font-semibold text-gray-700">
                Name
              </Label>
              <Input
                id="name"
                type="text"
                value={user.name}
                readOnly
                className="mt-1 w-full border-gray-300 rounded-xl"
              />
            </div>
            {/* Email */}
            <div>
              <Label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={user.email}
                readOnly
                className="mt-1 w-full border-gray-300 rounded-xl"
              />
            </div>
            {/* Change Password Button */}
            <Button className="w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700">
              Change Password
            </Button>
          </form>
           <div className="mt-6">
            <Button
              onClick={() => nav('/')}
              variant="ghost"
              className="w-full py-3 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-100 transition transform duration-200 ease-out hover:scale-105"
            >
              Back to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
