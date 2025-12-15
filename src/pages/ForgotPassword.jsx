import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export function ForgotPassword() {
    const [email, setEmail] = useState('')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [loading, setLoading] = useState(false)
    const { resetPassword } = useAuth()

    async function handleSubmit(e) {
        e.preventDefault()
        setError('')
        setSuccess('')
        setLoading(true)

        const { error } = await resetPassword(email)

        if (error) {
            setError(error.message)
        } else {
            setSuccess('Email de recuperação enviado! Verifique sua caixa de entrada.')
        }
        setLoading(false)
    }

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
            <h1>Recuperar Senha</h1>

            {error && (
                <div style={{ color: 'red', marginBottom: '10px', padding: '10px', background: '#fee' }}>
                    {error}
                </div>
            )}

            {success && (
                <div style={{ color: 'green', marginBottom: '10px', padding: '10px', background: '#efe' }}>
                    {success}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="email">Email:</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    style={{ width: '100%', padding: '10px', cursor: loading ? 'wait' : 'pointer' }}
                >
                    {loading ? 'Enviando...' : 'Enviar Email de Recuperação'}
                </button>
            </form>

            <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <Link to="/login">Voltar ao Login</Link>
            </div>
        </div>
    )
}
