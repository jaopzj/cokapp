import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { BottomNav } from '../components/DashboardComponents'

export function ProfilePage() {
    const { user, profile, signOut } = useAuth()
    const navigate = useNavigate()
    const fileInputRef = useRef(null)

    const [isEditing, setIsEditing] = useState(false)
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')

    // Settings panels
    const [showNotifications, setShowNotifications] = useState(false)
    const [showHelp, setShowHelp] = useState(false)
    const [notificationsEnabled, setNotificationsEnabled] = useState(true)
    const [expandedFaq, setExpandedFaq] = useState(null)

    // Form state
    const [nome, setNome] = useState(profile?.nome || '')
    const [escola, setEscola] = useState(profile?.escola || '')
    const [serie, setSerie] = useState(profile?.serie?.toString() || '')
    const [avatarPreview, setAvatarPreview] = useState(null)
    const [avatarFile, setAvatarFile] = useState(null)

    const firstName = profile?.nome?.split(' ')[0] || 'Aventureiro'

    const handleAvatarChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setAvatarFile(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setAvatarPreview(reader.result)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSave = async () => {
        setLoading(true)
        setError('')
        setSuccess(false)

        try {
            let avatarUrl = profile?.avatar_url

            // Upload novo avatar se houver
            if (avatarFile) {
                const fileExt = avatarFile.name.split('.').pop()
                const filePath = `${user.id}/${Date.now()}.${fileExt}`

                const { error: uploadError } = await supabase.storage
                    .from('avatars')
                    .upload(filePath, avatarFile, { upsert: true })

                if (uploadError) throw uploadError

                const { data: urlData } = supabase.storage
                    .from('avatars')
                    .getPublicUrl(filePath)

                avatarUrl = urlData.publicUrl
            }

            // Atualizar perfil
            const { error: updateError } = await supabase
                .from('profiles')
                .update({
                    nome,
                    escola,
                    serie: parseInt(serie),
                    avatar_url: avatarUrl,
                    atualizado_em: new Date().toISOString()
                })
                .eq('id', user.id)

            if (updateError) throw updateError

            setSuccess(true)
            setIsEditing(false)
            setAvatarFile(null)
            setAvatarPreview(null)

            // Recarregar página para atualizar profile
            setTimeout(() => window.location.reload(), 1000)
        } catch (err) {
            console.error('Erro ao salvar:', err)
            setError('Erro ao salvar alterações. Tente novamente.')
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        await signOut()
        navigate('/login')
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Header com gradiente */}
            <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-700 pt-6 pb-20 px-6 relative overflow-hidden">
                {/* Elementos decorativos */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

                {/* Navegação */}
                <div className="relative z-10 flex justify-between items-center mb-6">
                    <Link to="/dashboard" className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </Link>
                    <h1 className="text-xl font-bold text-white">Meu Perfil</h1>
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="p-2 rounded-full hover:bg-white/10 transition-colors"
                    >
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                    </button>
                </div>

                {/* Saudação */}
                <div className="relative z-10 text-center">
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-white/80 text-sm"
                    >
                        Que bom te ver de novo!
                    </motion.p>
                    <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-white text-2xl font-bold mt-1"
                    >
                        {firstName}, o Guardião do Conhecimento! ⚔️
                    </motion.h2>
                </div>
            </div>

            {/* Card do Avatar */}
            <div className="px-6 -mt-12 relative z-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl shadow-xl p-6"
                >
                    {/* Avatar */}
                    <div className="flex flex-col items-center -mt-16">
                        <div className="relative">
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                className="w-28 h-28 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 p-1 shadow-xl"
                            >
                                <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                                    {avatarPreview || profile?.avatar_url ? (
                                        <img
                                            src={avatarPreview || profile?.avatar_url}
                                            alt="Avatar"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-4xl font-bold text-indigo-500">
                                            {firstName.charAt(0).toUpperCase()}
                                        </span>
                                    )}
                                </div>
                            </motion.div>

                            {/* Botão de editar foto */}
                            {isEditing && (
                                <motion.button
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute bottom-0 right-0 w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white shadow-lg border-4 border-white"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </motion.button>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarChange}
                                className="hidden"
                            />
                        </div>

                        <h3 className="mt-4 text-xl font-bold text-gray-800">{profile?.nome || 'Aventureiro'}</h3>
                        <p className="text-gray-500 text-sm">{profile?.email || user?.email}</p>
                    </div>

                    {/* Stats rápidos */}
                    <div className="flex justify-center gap-8 mt-6 py-4 border-t border-gray-100">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-indigo-600">{profile?.serie || '-'}º</p>
                            <p className="text-xs text-gray-500">Ano</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-purple-600">🔥</p>
                            <p className="text-xs text-gray-500">Streak</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-violet-600">💎</p>
                            <p className="text-xs text-gray-500">Fragmentos</p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Formulário de Edição */}
            <AnimatePresence>
                {isEditing && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-6 mt-6"
                    >
                        <div className="bg-white rounded-3xl shadow-lg p-6 space-y-4">
                            <h3 className="font-bold text-gray-800 text-lg mb-2">✏️ Editar Informações</h3>

                            {/* Nome */}
                            <div>
                                <label className="text-sm font-medium text-gray-600 mb-1 block">Nome Completo</label>
                                <input
                                    type="text"
                                    value={nome}
                                    onChange={(e) => setNome(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-100 rounded-xl border-none outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
                                    placeholder="Seu nome"
                                />
                            </div>

                            {/* Escola */}
                            <div>
                                <label className="text-sm font-medium text-gray-600 mb-1 block">Escola</label>
                                <input
                                    type="text"
                                    value={escola}
                                    onChange={(e) => setEscola(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-100 rounded-xl border-none outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
                                    placeholder="Nome da sua escola"
                                />
                            </div>

                            {/* Série */}
                            <div>
                                <label className="text-sm font-medium text-gray-600 mb-1 block">Série/Ano</label>
                                <select
                                    value={serie}
                                    onChange={(e) => setSerie(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-100 rounded-xl border-none outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
                                >
                                    <option value="">Selecione</option>
                                    <option value="6">6º Ano</option>
                                    <option value="7">7º Ano</option>
                                    <option value="8">8º Ano</option>
                                    <option value="9">9º Ano</option>
                                </select>
                            </div>

                            {/* Mensagens */}
                            {error && (
                                <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm">
                                    {error}
                                </div>
                            )}
                            {success && (
                                <div className="bg-green-50 text-green-600 px-4 py-3 rounded-xl text-sm">
                                    ✅ Alterações salvas com sucesso!
                                </div>
                            )}

                            {/* Botões */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => {
                                        setIsEditing(false)
                                        setAvatarPreview(null)
                                        setAvatarFile(null)
                                    }}
                                    className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-bold transition-all hover:bg-gray-200"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={loading}
                                    className="flex-1 py-3 px-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                                >
                                    {loading ? 'Salvando...' : 'Salvar'}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Seções do Perfil */}
            <div className="px-6 mt-6 space-y-4">
                {/* Informações da Conta */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-2xl shadow-sm p-5"
                >
                    <h3 className="font-bold text-gray-800 mb-4">📋 Informações</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center py-2">
                            <span className="text-gray-500">Escola</span>
                            <span className="font-medium text-gray-800">{profile?.escola || 'Não informado'}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-t border-gray-100">
                            <span className="text-gray-500">Série</span>
                            <span className="font-medium text-gray-800">{profile?.serie ? `${profile.serie}º Ano` : 'Não informado'}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-t border-gray-100">
                            <span className="text-gray-500">Email</span>
                            <span className="font-medium text-gray-800 text-sm">{user?.email}</span>
                        </div>
                    </div>
                </motion.div>

                {/* Configurações */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-2xl shadow-sm p-5"
                >
                    <h3 className="font-bold text-gray-800 mb-4">⚙️ Configurações</h3>
                    <div className="space-y-2">
                        {/* Notificações */}
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="w-full flex justify-between items-center py-3 px-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                        >
                            <span className="text-gray-700">🔔 Notificações</span>
                            <motion.svg
                                animate={{ rotate: showNotifications ? 90 : 0 }}
                                className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </motion.svg>
                        </button>

                        {/* Painel de Notificações */}
                        <AnimatePresence>
                            {showNotifications && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="p-4 bg-indigo-50 rounded-xl space-y-4">
                                        {/* Toggle de notificações */}
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-gray-700">Receber notificações</p>
                                                <p className="text-xs text-gray-500">Alertas sobre novas aulas e lembretes</p>
                                            </div>
                                            <button
                                                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                                                className={`w-14 h-8 rounded-full transition-colors ${notificationsEnabled ? 'bg-green-500' : 'bg-gray-300'}`}
                                            >
                                                <motion.div
                                                    animate={{ x: notificationsEnabled ? 24 : 4 }}
                                                    className="w-6 h-6 bg-white rounded-full shadow"
                                                />
                                            </button>
                                        </div>

                                        {/* Limpar histórico */}
                                        <div className="pt-2 border-t border-indigo-100">
                                            <button
                                                onClick={async () => {
                                                    if (confirm('Tem certeza que deseja limpar todo o histórico de notificações?')) {
                                                        try {
                                                            await supabase
                                                                .from('user_notifications')
                                                                .delete()
                                                                .eq('user_id', user.id)
                                                            alert('Histórico de notificações limpo!')
                                                        } catch (err) {
                                                            console.error('Erro:', err)
                                                            alert('Erro ao limpar histórico')
                                                        }
                                                    }
                                                }}
                                                className="w-full py-3 px-4 bg-white text-red-600 rounded-xl font-medium hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                                Limpar histórico de notificações
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Ajuda */}
                        <button
                            onClick={() => setShowHelp(!showHelp)}
                            className="w-full flex justify-between items-center py-3 px-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                        >
                            <span className="text-gray-700">❓ Ajuda</span>
                            <motion.svg
                                animate={{ rotate: showHelp ? 90 : 0 }}
                                className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </motion.svg>
                        </button>

                        {/* Painel de Ajuda - Q&A */}
                        <AnimatePresence>
                            {showHelp && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="p-4 bg-purple-50 rounded-xl space-y-2">
                                        <p className="text-sm font-medium text-purple-700 mb-3">Perguntas Frequentes</p>

                                        {[
                                            {
                                                q: "O que são os Guardiões?",
                                                a: "Os Guardiões são seus guias de estudo! Cada um representa uma área do conhecimento: Português, Matemática, Ciências Humanas e Ciências da Natureza."
                                            },
                                            {
                                                q: "Como ganho fragmentos?",
                                                a: "Você ganha fragmentos completando as atividades das micro-aulas. Cada aula concluída com aproveitamento de 70% ou mais te dá 1 fragmento!"
                                            },
                                            {
                                                q: "O que são as micro-aulas?",
                                                a: "São aulas curtas e objetivas, com conteúdo focado em um único tema. Após estudar, você faz atividades para testar seu conhecimento."
                                            },
                                            {
                                                q: "Como funciona a progressão?",
                                                a: "Conforme você coleta fragmentos, desbloqueia novos guardiões e conteúdos. Continue estudando para avançar na jornada!"
                                            },
                                            {
                                                q: "Posso refazer as atividades?",
                                                a: "Sim! Você pode revisar e refazer as atividades quantas vezes quiser, mas fragmentos são ganhos apenas na primeira conclusão."
                                            },
                                            {
                                                q: "Como altero meus dados?",
                                                a: "Toque no ícone de lápis no canto superior direito da tela de Perfil para editar seu nome, escola, série e foto."
                                            }
                                        ].map((faq, index) => (
                                            <div key={index} className="bg-white rounded-xl overflow-hidden">
                                                <button
                                                    onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                                                    className="w-full flex justify-between items-center p-4 text-left"
                                                >
                                                    <span className="font-medium text-gray-700 text-sm pr-4">{faq.q}</span>
                                                    <motion.svg
                                                        animate={{ rotate: expandedFaq === index ? 180 : 0 }}
                                                        className="w-5 h-5 text-gray-400 shrink-0"
                                                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </motion.svg>
                                                </button>
                                                <AnimatePresence>
                                                    {expandedFaq === index && (
                                                        <motion.div
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: 'auto' }}
                                                            exit={{ opacity: 0, height: 0 }}
                                                            className="overflow-hidden"
                                                        >
                                                            <p className="px-4 pb-4 text-sm text-gray-500">{faq.a}</p>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>

                {/* Botão de Logout */}
                <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    onClick={handleLogout}
                    className="w-full py-4 bg-red-50 text-red-600 rounded-2xl font-bold hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sair da Conta
                </motion.button>

                {/* Frase motivacional */}
                <p className="text-center text-gray-400 text-sm py-4">
                    "O conhecimento é a maior aventura!" 🌟
                </p>
            </div>

            <BottomNav />
        </div>
    )
}
