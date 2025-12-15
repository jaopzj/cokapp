import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useFragments } from '../hooks/useFragments'
import { BottomNav } from '../components/DashboardComponents'

// Importar imagens mini dos guardiões
import miniPortugues from '../assets/dashboard/guardians-mini/portugues.png'
import miniMatematica from '../assets/dashboard/guardians-mini/matematica.png'
import miniHumanas from '../assets/dashboard/guardians-mini/humanas.png'
import miniNatureza from '../assets/dashboard/guardians-mini/natureza.png'

// Cores Padrão do App
const AREA_THEMES = {
    'Português': { color: 'bg-blue-500', light: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-200', icon: '📚', image: miniPortugues },
    'Matemática': { color: 'bg-red-500', light: 'bg-red-100', text: 'text-red-600', border: 'border-red-200', icon: '📐', image: miniMatematica },
    'Natureza': { color: 'bg-green-500', light: 'bg-green-100', text: 'text-green-600', border: 'border-green-200', icon: '🔬', image: miniNatureza },
    'Humanas': { color: 'bg-orange-500', light: 'bg-orange-100', text: 'text-orange-600', border: 'border-orange-200', icon: '⚖️', image: miniHumanas },
    'default': { color: 'bg-indigo-500', light: 'bg-indigo-100', text: 'text-indigo-600', border: 'border-indigo-200', icon: '✨', image: miniPortugues }
}

const getTheme = (area) => {
    // Normalização simples para encontrar a chave
    const normalized = Object.keys(AREA_THEMES).find(key => area?.includes(key))
    return AREA_THEMES[normalized] || AREA_THEMES['default']
}

export function Guardians() {
    const { fragments, loading, error } = useFragments()
    const [selectedArea, setSelectedArea] = useState('Todos')
    const [searchTerm, setSearchTerm] = useState('')

    // Extrair áreas únicas para o filtro
    const areas = useMemo(() => {
        const unique = new Set(fragments.map(f => f.guardian.area).filter(Boolean))
        return ['Todos', ...Array.from(unique)]
    }, [fragments])

    // Filtrar guardiões
    const filteredGuardians = useMemo(() => {
        return fragments.filter(f => {
            const matchesArea = selectedArea === 'Todos' || f.guardian.area === selectedArea
            const matchesSearch = f.guardian.nome.toLowerCase().includes(searchTerm.toLowerCase())
            return matchesArea && matchesSearch
        })
    }, [fragments, selectedArea, searchTerm])

    // Calcular progresso geral
    const totalProgress = useMemo(() => {
        if (!fragments.length) return 0
        const total = fragments.reduce((acc, curr) => acc + (curr.porcentagem || 0), 0)
        return Math.round(total / fragments.length)
    }, [fragments])

    if (loading) return <LoadingState />
    if (error) return <ErrorState error={error} />

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Header Fixo */}
            <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md px-6 py-4 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                        <Link to="/dashboard" className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors">
                            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </Link>
                        <h1 className="text-2xl font-extrabold text-gray-800 tracking-tight">Explorar</h1>
                    </div>
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                        {fragments.filter(f => f.desbloqueado).length}
                    </div>
                </div>

                {/* Barra de Busca */}
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Buscar guardião..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-100 text-gray-700 rounded-2xl py-3 px-12 focus:bg-white focus:ring-2 focus:ring-blue-400 outline-none transition-all placeholder-gray-400 font-medium"
                    />
                    <svg className="w-5 h-5 text-gray-400 absolute left-4 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
            </header>

            <main className="px-6 pt-6 space-y-8">
                {/* Hero Banner */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 rounded-3xl p-6 text-white shadow-lg shadow-indigo-200 relative overflow-hidden"
                >
                    {/* Elementos decorativos de fundo */}
                    <div className="absolute top-0 right-0 p-8 opacity-10 text-9xl transform rotate-12 select-none">🏆</div>

                    <div className="relative z-10">
                        <h2 className="text-2xl font-bold mb-2">Vamos aprender juntos!</h2>
                        <p className="opacity-90 mb-6 text-indigo-100 font-medium">Você já completou {totalProgress}% de toda a sua jornada.</p>

                        <Link to="/dashboard" className="inline-block bg-white text-indigo-600 font-bold py-3 px-8 rounded-2xl shadow-md hover:scale-105 active:scale-95 transition-transform">
                            Continuar
                        </Link>
                    </div>
                </motion.div>

                {/* Fragmentos Conquistados */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-gray-700 text-lg">Fragmentos Conquistados</h3>
                        <span className="text-xs font-medium text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                            💎 {fragments.reduce((acc, f) => acc + (f.quantidade_atual || 0), 0)} total
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <FragmentCard
                            name="Fragmento do Ar"
                            emoji="🌬️"
                            count={fragments.find(f => f.guardian.area === 'Português')?.quantidade_atual || 0}
                            color="from-blue-400 to-blue-600"
                            lightColor="bg-blue-50"
                        />
                        <FragmentCard
                            name="Fragmento do Fogo"
                            emoji="🔥"
                            count={fragments.find(f => f.guardian.area === 'Matemática')?.quantidade_atual || 0}
                            color="from-red-400 to-red-600"
                            lightColor="bg-red-50"
                        />
                        <FragmentCard
                            name="Fragmento da Terra"
                            emoji="⌛"
                            count={fragments.find(f => f.guardian.area === 'Humanas')?.quantidade_atual || 0}
                            color="from-orange-400 to-orange-600"
                            lightColor="bg-orange-50"
                        />
                        <FragmentCard
                            name="Fragmento do Gelo"
                            emoji="❄️"
                            count={fragments.find(f => f.guardian.area === 'Natureza')?.quantidade_atual || 0}
                            color="from-green-400 to-emerald-600"
                            lightColor="bg-green-50"
                        />
                    </div>
                </div>

                {/* Filtros de Área (Carrossel Horizontal) */}
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-gray-700 text-lg">Categorias</h3>
                    </div>

                    <div className="flex gap-4 overflow-x-auto pb-4 pt-4 scrollbar-hide -mx-6 px-6">
                        <FilterPill
                            label="Todos"
                            isActive={selectedArea === 'Todos'}
                            onClick={() => setSelectedArea('Todos')}
                            icon="🦁"
                        />
                        {areas.filter(a => a !== 'Todos').map(area => {
                            const theme = getTheme(area)
                            return (
                                <FilterPill
                                    key={area}
                                    label={area.split(' ')[0]} // Pega o primeiro nome (Ciências, Matemática...)
                                    isActive={selectedArea === area}
                                    onClick={() => setSelectedArea(area)}
                                    icon={theme.icon}
                                    theme={theme}
                                />
                            )
                        })}
                    </div>
                </div>

                {/* Lista de Guardiões */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-gray-700 text-lg">Guardiões</h3>
                    </div>

                    <AnimatePresence mode='popLayout'>
                        {filteredGuardians.length > 0 ? (
                            filteredGuardians.map((fragment, index) => (
                                <GuardianCard
                                    key={fragment.id}
                                    fragment={fragment}
                                    index={index}
                                    allFragments={fragments}
                                />
                            ))
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-10 text-gray-400 bg-white rounded-3xl border-2 border-dashed border-gray-200"
                            >
                                <p>Nenhum guardião encontrado nesta categoria.</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>

            <BottomNav />
        </div>
    )
}

// --- Componentes Internos ---

function FilterPill({ label, icon, isActive, onClick, theme }) {
    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center gap-2 min-w-[70px] transition-all ${isActive ? 'scale-110' : 'opacity-70 hover:opacity-100'}`}
        >
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl shadow-sm border-b-4 transition-all
                ${isActive
                    ? (theme ? `${theme.color} border-black/20 text-white` : 'bg-gray-800 border-black/20 text-white')
                    : 'bg-white border-gray-200 text-gray-600'
                }`}
            >
                {icon}
            </div>
            <span className={`text-xs font-bold ${isActive ? 'text-gray-800' : 'text-gray-400'}`}>
                {label}
            </span>
        </button>
    )
}

function GuardianCard({ fragment, index, allFragments }) {
    const theme = getTheme(fragment.guardian.area)
    const isLocked = !fragment.desbloqueado
    const progress = Math.min(fragment.porcentagem || 0, 100)

    // Encontrar guardião anterior para mensagem de desbloqueio
    const previousGuardian = allFragments?.find(
        f => f.guardian?.ordem_progressao === (fragment.guardian?.ordem_progressao || 0) - 1
    )
    const requiredPercentage = fragment.guardian?.porcentagem_desbloqueio_necessaria || 0

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ delay: index * 0.05 }}
        >
            <Link to={`/lessons/${fragment.guardian.id}`} className={`block relative group ${isLocked ? 'pointer-events-none' : ''}`}>
                <div className={`bg-white rounded-3xl p-4 shadow-sm border-2 border-transparent transition-all hover:scale-[1.02] active:scale-95
                    ${isLocked ? 'grayscale opacity-70' : `hover:${theme.border} group-hover:shadow-md`}
                `}>
                    <div className="flex items-center gap-4">
                        {/* Ícone / Imagem do Guardião */}
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center overflow-hidden shrink-0
                            ${isLocked ? 'bg-gray-100' : theme.light}
                        `}>
                            {isLocked ? (
                                <span className="text-2xl text-gray-400">🔒</span>
                            ) : (
                                <img
                                    src={theme.image}
                                    alt={fragment.guardian.nome}
                                    className="w-full h-full object-contain p-1"
                                />
                            )}
                        </div>

                        {/* Info Principal */}
                        <div className="flex-1 min-w-0">
                            <h4 className="font-extrabold text-gray-800 text-lg truncate mb-1">
                                {fragment.guardian.nome}
                            </h4>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide truncate">
                                {fragment.guardian.area}
                            </p>

                            {/* Barra de Progresso + Stats (Desbloqueado) */}
                            {!isLocked && (
                                <>
                                    <div className="mt-3 h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <motion.div
                                            className={`h-full ${theme.color}`}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progress}%` }}
                                            transition={{ duration: 1, delay: 0.2 }}
                                        />
                                    </div>
                                    <div className="flex justify-between mt-2 text-xs font-medium text-gray-500">
                                        <span>🧩 Fragmentos: {fragment.quantidade_atual}/{fragment.quantidade_total}</span>
                                    </div>
                                </>
                            )}

                            {/* Requisito de Desbloqueio (Bloqueado) */}
                            {isLocked && previousGuardian && (
                                <p className="mt-2 text-xs text-gray-500 italic">
                                    Consiga {requiredPercentage}% com <span className="font-bold">{previousGuardian.guardian?.nome}</span> para desbloquear!
                                </p>
                            )}
                        </div>

                        {/* Status Lateral */}
                        <div className="text-right shrink-0">
                            {isLocked ? (
                                <span className="text-xs font-bold bg-gray-200 text-gray-500 px-3 py-1 rounded-full">
                                    BLOQ
                                </span>
                            ) : (
                                <div className={`text-lg font-black ${theme.text}`}>
                                    {Math.round(progress)}%
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    )
}

function LoadingState() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                className="text-4xl"
            >
                ⏳
            </motion.div>
        </div>
    )
}

function ErrorState({ error }) {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
            <div className="text-6xl mb-4">😕</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Ops! Algo deu errado.</h2>
            <p className="text-gray-500 mb-6">{error}</p>
            <Link to="/dashboard" className="bg-blue-500 text-white px-6 py-3 rounded-full font-bold shadow-lg hover:bg-blue-600 transition-colors">
                Voltar ao Início
            </Link>
        </div>
    )
}

function FragmentCard({ name, emoji, count, color, lightColor }) {
    const hasFragments = count > 0

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`relative overflow-hidden rounded-2xl p-4 ${hasFragments ? lightColor : 'bg-gray-100'} border-2 ${hasFragments ? 'border-transparent' : 'border-dashed border-gray-200'}`}
        >
            {/* Fundo gradiente (se tiver fragmentos) */}
            {hasFragments && (
                <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-10`} />
            )}

            <div className="relative z-10 flex flex-col items-center text-center">
                {/* Emoji */}
                <motion.div
                    animate={hasFragments ? {
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0]
                    } : {}}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: 'easeInOut'
                    }}
                    className={`text-3xl mb-2 ${hasFragments ? '' : 'grayscale opacity-40'}`}
                >
                    {emoji}
                </motion.div>

                {/* Nome */}
                <h4 className={`text-xs font-bold ${hasFragments ? 'text-gray-700' : 'text-gray-400'} leading-tight`}>
                    {name}
                </h4>

                {/* Contagem */}
                <div className={`mt-2 px-3 py-1 rounded-full text-sm font-extrabold ${hasFragments
                    ? `bg-gradient-to-r ${color} text-white shadow-md`
                    : 'bg-gray-200 text-gray-400'
                    }`}>
                    {count}x
                </div>
            </div>
        </motion.div>
    )
}

