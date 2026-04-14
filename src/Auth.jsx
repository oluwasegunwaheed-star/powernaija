import { useState } from 'react'
import { supabase } from './lib/supabaseClient'

function Auth({ setUser }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const signUp = async () => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      alert(error.message)
    } else {
      alert('Signup successful! Check your email.')
    }
  }

  const login = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      alert(error.message)
    } else {
      setUser(data.user)
    }
  }

  return (
    <div style={styles.container}>
      <h2>PowerNaija Login 🔐</h2>

      <input
        style={styles.input}
        type="email"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        style={styles.input}
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button style={styles.button} onClick={login}>
        Login
      </button>

      <button style={styles.button} onClick={signUp}>
        Sign Up
      </button>
    </div>
  )
}

const styles = {
  container: {
    padding: '20px',
    textAlign: 'center',
  },
  input: {
    display: 'block',
    margin: '10px auto',
    padding: '10px',
    width: '80%',
  },
  button: {
    margin: '5px',
    padding: '10px',
    width: '85%',
    background: '#FFC107',
    border: 'none',
    cursor: 'pointer',
  },
}

export default Auth