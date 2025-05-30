import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from './components/ui/card'
import { Button } from './components/ui/button'
import { useNavigate } from 'react-router-dom'

interface DashboardProps {
    onLogout: () => void;
}

export default function Dashboard({ onLogout }: DashboardProps) {
    const nav = useNavigate()
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-3xl p-8 rounded-2xl shadow-xl">
        <CardHeader className="mb-6 text-center">
          <CardTitle className="text-4xl font-semibold text-indigo-600">
            Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 mb-4">
            Welcome to your dashboard! Here you can see an overview of your activity and stats.
          </p>
          {/* Example action buttons */}
          <div className="flex space-x-4">
            <Button 
                onClick={() => nav('/profile')}
                className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700">
                Go to Profile
            </Button>
            <Button className="flex-1 py-3 rounded-xl bg-gray-200 text-gray-700 hover:bg-gray-300">
              View Reports
            </Button>
          </div>
          <Button
            onClick={onLogout}
            variant="ghost"
            className="w-full py-3 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-100 transition transform duration-200 ease-out hover:scale-105"
          >
            Logout
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}