import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export function ResetPassword() {
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [loading, setLoading] = useState(false)
    const { updatePassword, user } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        // Se não há sessão de recovery, redireciona
        if (!user) {
            // Aguarda um pouco pois a sessão pode ainda estar sendo carregada
            const timeout = setTimeout(() => {
                if (!user) {
                    navigate('/login')
                }
            }, 2000)
            return () => clearTimeout(timeout)
        }
    }, [user, navigate])

    async function handleSubmit(e) {
        e.preventDefault()
        setError('')
        setSuccess('')

        if (password !== confirmPassword) {
            setError('As senhas não coincidem')
            return
        }

        if (password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres')
            return
        }

        setLoading(true)

        const { error } = await updatePassword(password)

        if (error) {
            setError(error.message)
        } else {
            setSuccess('Senha atualizada com sucesso!')
            setTimeout(() => navigate('/dashboard'), 2000)
        }
        setLoading(false)
    }

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
            <h1>Redefinir Senha</h1>

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
                    <label htmlFor="password">Nova Senha:</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                    />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="confirmPassword">Confirmar Nova Senha:</label>
                    <input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    style={{ width: '100%', padding: '10px', cursor: loading ? 'wait' : 'pointer' }}
                >
                    {loading ? 'Atualizando...' : 'Atualizar Senha'}
                </button>
            </form>
        </div>
    )
}
