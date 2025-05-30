import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import'./index.css'
import './App.css'
import LoginPage from './LoginPage'
import ForgotPasswordPage from './ForgotPasswordPage.tsx'
import SignUpPage from './SignUpPage.tsx'

function App() {
  const [count, setCount] = useState(0)
  const [view, setView] = useState<'home' | 'login' | 'forgot' | 'signup'>('home')

  if (view === 'login') {
    return (
      <LoginPage
        onBack={() => setView('home')}
        onForgot={() => setView('forgot')}
        onSignUp={() => setView('signup')}
      />
    )
  }

  if (view === 'forgot') {
    return (
      <ForgotPasswordPage
        onBack={() => setView('login')}
      />
    )
  }
   if (view === 'signup') {
    return (
      <SignUpPage
        onBack={() => setView('login')}
      />
    )
  }

  return (
    <>

      <div className="flex flex-row justify-center items-center gap-4">
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
        <button onClick={() => setView('login')} style={{ marginTop: 10 }}>
          Go to Login Page
        </button>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App