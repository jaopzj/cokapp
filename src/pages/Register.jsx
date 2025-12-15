import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { FloatingBubbles } from '../components/FloatingBubbles'
import { GuardiansDisplay } from '../components/GuardianCircles'

export function Register() {
    const [nome, setNome] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [dataNascimento, setDataNascimento] = useState('')
    const [escola, setEscola] = useState('')
    const [serie, setSerie] = useState('')
    const [avatarFile, setAvatarFile] = useState(null)
    const [avatarPreview, setAvatarPreview] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const { signUp, uploadAvatar } = useAuth()
    const navigate = useNavigate()

    async function handleSubmit(e) {
        e.preventDefault()
        setError('')

        if (password !== confirmPassword) {
            setError('As senhas não coincidem')
            return
        }

        if (password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres')
            return
        }

        if (!dataNascimento) {
            setError('Informe sua data de nascimento')
            return
        }

        if (!serie) {
            setError('Selecione sua série')
            return
        }

        setLoading(true)

        // Garantir que serie é número
        const serieNum = parseInt(serie)

        const { data, error } = await signUp({
            email,
            password,
            nome,
            dataNascimento,
            escola,
            serie: serieNum
        })

        if (error) {
            console.error('Erro no cadastro:', error)
            setError(error.message || 'Erro ao criar conta. Tente novamente.')
            setLoading(false)
        } else {
            console.log('✅ Usuário criado com sucesso:', data.user?.id)

            // Salvar avatar em localStorage
            if (avatarFile && data?.user) {
                const reader = new FileReader()
                reader.onloadend = () => {
                    localStorage.setItem('pendingAvatar', JSON.stringify({
                        userId: data.user.id,
                        base64: reader.result,
                        fileName: avatarFile.name
                    }))
                    // Redirecionar APÓS salvar
                    navigate('/dashboard')
                }
                reader.readAsDataURL(avatarFile)
            } else {
                navigate('/dashboard')
            }
        }
    }

    if (success) {
        return (
            <div className="h-screen bg-[#2C4C9E] relative overflow-hidden flex flex-col items-center justify-center">
                <FloatingBubbles />
                <motion.div
                    className="bg-white rounded-3xl p-8 mx-4 text-center z-10 max-w-sm"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                >
                    <span className="text-5xl mb-4 block">🎉</span>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Conta criada!</h2>
                    <p className="text-gray-600 text-sm mb-4">
                        Verifique seu email para confirmar sua conta.
                    </p>
                    <Link
                        to="/login"
                        className="block w-full py-3 bg-[#2C4C9E] text-white rounded-2xl font-semibold"
                    >
                        Ir para Login
                    </Link>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="h-screen bg-[#2C4C9E] relative overflow-hidden flex flex-col">
            {/* Bolhas flutuantes */}
            <FloatingBubbles />

            {/* Área superior - Guardiões */}
            <div className="flex-1 relative z-10 flex flex-col items-center justify-center pt-2 pb-1 min-h-0">
                {/* Guardiões - menor em telas pequenas */}
                <div className="scale-50 sm:scale-75 md:scale-90">
                    <GuardiansDisplay />
                </div>

                {/* Título */}
                <motion.h1
                    className="text-white text-xl sm:text-2xl md:text-3xl font-bold text-center px-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    Vamos criar a<br />sua conta!
                </motion.h1>
            </div>

            {/* Card inferior - Formulário */}
            <motion.div
                className="relative z-20 bg-white rounded-t-[32px] px-6 py-4 pb-6 max-h-[65vh] overflow-y-auto"
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, type: 'spring', damping: 20 }}
            >
                {/* Subtítulo */}
                <div className="text-center mb-3">
                    <h2 className="text-gray-800 text-lg font-semibold">Cadastro</h2>
                </div>

                {/* Formulário */}
                <form onSubmit={handleSubmit} className="space-y-2.5">
                    {/* Foto de Perfil */}
                    <div className="flex justify-center mb-2">
                        <label className="cursor-pointer group">
                            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300 group-hover:border-[#2C4C9E] transition-colors">
                                {avatarPreview ? (
                                    <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="text-center">
                                        <span className="text-2xl text-gray-400">📷</span>
                                        <p className="text-[10px] text-gray-400 mt-1">Foto</p>
                                    </div>
                                )}
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file) {
                                        setAvatarFile(file)
                                        setAvatarPreview(URL.createObjectURL(file))
                                    }
                                }}
                                className="hidden"
                            />
                        </label>
                    </div>

                    {/* Nome */}
                    <input
                        type="text"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        placeholder="Seu nome completo"
                        required
                        className="w-full px-4 py-2.5 bg-gray-100 rounded-xl border-none outline-none focus:ring-2 focus:ring-[#2C4C9E]/30 transition-all text-gray-700 text-sm"
                    />

                    {/* Data de Nascimento */}
                    <div>
                        <label className="text-gray-500 text-xs mb-1 block">Data de Nascimento</label>
                        <input
                            type="date"
                            value={dataNascimento}
                            onChange={(e) => setDataNascimento(e.target.value)}
                            required
                            className="w-full px-4 py-2.5 bg-gray-100 rounded-xl border-none outline-none focus:ring-2 focus:ring-[#2C4C9E]/30 transition-all text-gray-700 text-sm"
                        />
                    </div>

                    {/* Escola e Série - lado a lado */}
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={escola}
                            onChange={(e) => setEscola(e.target.value)}
                            placeholder="Nome da escola"
                            className="flex-1 px-4 py-2.5 bg-gray-100 rounded-xl border-none outline-none focus:ring-2 focus:ring-[#2C4C9E]/30 transition-all text-gray-700 text-sm"
                        />
                        <select
                            value={serie}
                            onChange={(e) => setSerie(e.target.value)}
                            required
                            className="w-24 px-3 py-2.5 bg-gray-100 rounded-xl border-none outline-none focus:ring-2 focus:ring-[#2C4C9E]/30 transition-all text-gray-700 text-sm"
                        >
                            <option value="">Série</option>
                            <option value="6">6º ano</option>
                            <option value="7">7º ano</option>
                            <option value="8">8º ano</option>
                            <option value="9">9º ano</option>
                        </select>
                    </div>

                    {/* Email */}
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="seu@email.com"
                        required
                        className="w-full px-4 py-2.5 bg-gray-100 rounded-xl border-none outline-none focus:ring-2 focus:ring-[#2C4C9E]/30 transition-all text-gray-700 text-sm"
                    />

                    {/* Senha */}
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Senha (mín. 6 caracteres)"
                            required
                            className="w-full px-4 py-2.5 bg-gray-100 rounded-xl border-none outline-none focus:ring-2 focus:ring-[#2C4C9E]/30 transition-all text-gray-700 pr-12 text-sm"
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

                    {/* Confirmar Senha */}
                    <input
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirme a senha"
                        required
                        className="w-full px-4 py-2.5 bg-gray-100 rounded-xl border-none outline-none focus:ring-2 focus:ring-[#2C4C9E]/30 transition-all text-gray-700 text-sm"
                    />

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

                    {/* Botão Criar Conta */}
                    <motion.button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-[#2C4C9E] text-white rounded-2xl font-semibold text-base shadow-lg shadow-[#2C4C9E]/30 hover:bg-[#1E3A7A] disabled:opacity-70 transition-all"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {loading ? 'Criando...' : 'Criar conta'}
                    </motion.button>

                    {/* Link para login */}
                    <p className="text-center text-gray-500 text-xs">
                        Já tem conta?{' '}
                        <Link to="/login" className="text-[#2C4C9E] font-semibold hover:underline">
                            Entrar
                        </Link>
                    </p>
                </form>
            </motion.div>
        </div>
    )
}
