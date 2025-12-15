import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { FloatingBubbles } from '../components/FloatingBubbles'
import { GuardiansDisplay } from '../components/GuardianCircles'

export function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const { signIn } = useAuth()
    const navigate = useNavigate()

    async function handleSubmit(e) {
        e.preventDefault()
        setError('')
        setLoading(true)

        const { error } = await signIn({ email, password })

        if (error) {
            setError('Email ou senha incorretos')
            setLoading(false)
        } else {
            navigate('/dashboard')
        }
    }

    return (
        <div className="h-screen bg-[#2C4C9E] relative overflow-hidden flex flex-col">
            {/* Bolhas flutuantes */}
            <FloatingBubbles />

            {/* Área superior - Guardiões */}
            <div className="flex-1 relative z-10 flex flex-col items-center justify-center pt-4 pb-2 min-h-0">
                {/* Guardiões - menor em telas pequenas */}
                <div className="scale-75 sm:scale-90 md:scale-100">
                    <GuardiansDisplay />
                </div>

                {/* Título */}
                <motion.h1
                    className="text-white text-2xl sm:text-3xl md:text-4xl font-bold text-center mt-2 px-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    Seja bem-vindo!
                </motion.h1>
            </div>

            {/* Card inferior - Formulário */}
            <motion.div
                className="relative z-20 bg-white rounded-t-[32px] px-6 py-5 pb-6"
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, type: 'spring', damping: 20 }}
            >
                {/* Subtítulo */}
                <div className="text-center mb-4">
                    <p className="text-gray-500 text-xs">Já tem uma conta?</p>
                    <h2 className="text-gray-800 text-lg font-semibold">Login</h2>
                </div>

                {/* Formulário */}
                <form onSubmit={handleSubmit} className="space-y-3">
                    {/* Email */}
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="seu@email.com"
                        required
                        className="w-full px-4 py-3 bg-gray-100 rounded-xl border-none outline-none focus:ring-2 focus:ring-[#2C4C9E]/30 transition-all text-gray-700 text-sm"
                    />

                    {/* Senha */}
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••••••"
                            required
                            className="w-full px-4 py-3 bg-gray-100 rounded-xl border-none outline-none focus:ring-2 focus:ring-[#2C4C9E]/30 transition-all text-gray-700 pr-12 text-sm"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            {showPassword ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            )}
                        </button>
                    </div>

                    {/* Erro */}
                    {error && (
                        <motion.p
                            className="text-red-500 text-xs text-center"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            {error}
                        </motion.p>
                    )}

                    {/* Link Esqueceu a senha */}
                    <div className="text-center">
                        <Link to="/forgot-password" className="text-gray-500 text-xs hover:text-[#2C4C9E] transition-colors">
                            Esqueceu a senha?
                        </Link>
                    </div>

                    {/* Botão Entrar */}
                    <motion.button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-[#2C4C9E] text-white rounded-2xl font-semibold text-base shadow-lg shadow-[#2C4C9E]/30 hover:bg-[#1E3A7A] disabled:opacity-70 transition-all"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {loading ? 'Entrando...' : 'Entrar'}
                    </motion.button>

                    {/* Link para cadastro */}
                    <p className="text-center text-gray-500 text-xs">
                        Não tem conta?{' '}
                        <Link to="/register" className="text-[#2C4C9E] font-semibold hover:underline">
                            Criar conta
                        </Link>
                    </p>
                </form>
            </motion.div>
        </div>
    )
}
