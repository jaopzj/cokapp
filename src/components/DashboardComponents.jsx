import { Link, useLocation } from 'react-router-dom'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { useState } from 'react'

// Importar Assets - Slides (Hero)
import slidePortugues from '../assets/dashboard/slides/portugues.png'
import slideMatematica from '../assets/dashboard/slides/matematica.png'
import slideHumanas from '../assets/dashboard/slides/humanas.png'
import slideNatureza from '../assets/dashboard/slides/natureza.png'

// Importar Assets - Mini Guardiões
import miniPortugues from '../assets/dashboard/guardians-mini/portugues.png'
import miniMatematica from '../assets/dashboard/guardians-mini/matematica.png'
import miniHumanas from '../assets/dashboard/guardians-mini/humanas.png'
import miniNatureza from '../assets/dashboard/guardians-mini/natureza.png'

// Cores por matéria
const SUBJECT_COLORS = {
    portugues: { bg: '#3B82F6', light: '#60A5FA' },
    português: { bg: '#3B82F6', light: '#60A5FA' },
    matematica: { bg: '#EF4444', light: '#F87171' },
    matemática: { bg: '#EF4444', light: '#F87171' },
    humanas: { bg: '#F97316', light: '#FB923C' },
    natureza: { bg: '#22C55E', light: '#4ADE80' },
    ciências: { bg: '#22C55E', light: '#4ADE80' },
}

// Mapeamento de Imagens - Slides
const SLIDE_IMAGES = {
    portugues: slidePortugues,
    português: slidePortugues,
    matematica: slideMatematica,
    matemática: slideMatematica,
    humanas: slideHumanas,
    natureza: slideNatureza,
    ciências: slideNatureza,
}

// Mapeamento de Imagens - Mini Guardiões
const MINI_IMAGES = {
    portugues: miniPortugues,
    português: miniPortugues,
    matematica: miniMatematica,
    matemática: miniMatematica,
    humanas: miniHumanas,
    natureza: miniNatureza,
    ciências: miniNatureza,
}

// Nomes dos fragmentos por área
const FRAGMENT_NAMES = {
    portugues: 'Fragmento do Ar',
    português: 'Fragmento do Ar',
    matematica: 'Fragmento do Fogo',
    matemática: 'Fragmento do Fogo',
    humanas: 'Fragmento da Terra',
    natureza: 'Fragmento do Gelo',
    ciências: 'Fragmento do Gelo',
}

// Frases motivacionais
const MOTIVATIONAL_PHRASES = [
    'Falta pouco para você conseguir recuperar o',
    'Você está quase lá! Continue para conquistar o',
    'A jornada continua! Alcance o',
    'Sua dedicação está valendo a pena! Busque o',
]

import { useNotifications } from '../contexts/NotificationContext'
import { AnimatePresence } from 'framer-motion'

export function DashboardHeader({ userName, avatarUrl }) {
    // Extrair apenas o primeiro nome
    const firstName = userName?.split(' ')[0] || 'Aventureiro'
    const { unreadCount, notifications, markAllAsRead, deleteNotification } = useNotifications()
    const [showNotifications, setShowNotifications] = useState(false)

    const handleOpenNotifications = () => {
        setShowNotifications(true)
        markAllAsRead()
    }

    return (
        <>
            <motion.div
                className="flex items-center justify-between px-4 py-3 sticky top-0 bg-white/80 backdrop-blur-md z-40"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="flex items-center gap-3">
                    {/* Avatar - Foto de Perfil */}
                    <Link to="/profile">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center overflow-hidden border-2 border-white shadow-md cursor-pointer">
                            {avatarUrl ? (
                                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-white text-xl font-bold">
                                    {firstName.charAt(0).toUpperCase()}
                                </span>
                            )}
                        </div>
                    </Link>
                    {/* Saudação - Apenas primeiro nome */}
                    <h1 className="text-gray-800 text-lg font-semibold">
                        Olá, {firstName}! 👋
                    </h1>
                </div>

                {/* Botão de Notificação com Badge */}
                <motion.button
                    className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center relative shadow-sm"
                    whileTap={{ scale: 0.95 }}
                    onClick={handleOpenNotifications}
                >
                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>

                    {unreadCount > 0 && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white"
                        >
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </motion.div>
                    )}
                </motion.button>
            </motion.div>

            {/* Modal de Notificações (Slide Over) */}
            <AnimatePresence>
                {showNotifications && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.5 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowNotifications(false)}
                            className="fixed inset-0 bg-black z-50"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed right-0 top-0 bottom-0 w-80 bg-white z-50 shadow-2xl p-4 overflow-y-auto"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-800">Notificações</h2>
                                <button onClick={() => setShowNotifications(false)} className="p-2 bg-gray-100 rounded-full">
                                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="space-y-4">
                                {notifications.length === 0 ? (
                                    <div className="text-center py-10 text-gray-500">
                                        <p className="text-4xl mb-2">📭</p>
                                        <p>Nenhuma notificação por enquanto.</p>
                                    </div>
                                ) : (
                                    notifications.map((notif) => (
                                        <motion.div
                                            key={notif.id}
                                            layout
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`p-4 rounded-xl relative border ${notif.read ? 'bg-white border-gray-100' : 'bg-blue-50 border-blue-100'}`}
                                        >
                                            <div className="flex gap-3">
                                                <div
                                                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                                                    style={{ backgroundColor: notif.color || '#E5E7EB' }}
                                                >
                                                    <span className="text-lg">{notif.icon || '📢'}</span>
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-bold text-gray-800 text-sm">{notif.title}</h3>
                                                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">{notif.message}</p>
                                                    <span className="text-[10px] text-gray-400 mt-2 block">
                                                        {new Date(notif.created_at).toLocaleDateString()} às {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>

                                                    {notif.link && (
                                                        <Link to={notif.link} className="inline-block mt-2 text-xs font-semibold text-blue-600 hover:underline">
                                                            Ver agora
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    )
}

export function HeroSlider({ guardians, currentIndex, onSlideChange, progressData }) {
    const [dragStart, setDragStart] = useState(0)

    if (!guardians || guardians.length === 0) return null

    const guardian = guardians[currentIndex]
    const areaKey = guardian?.area?.toLowerCase() || 'portugues'
    const colors = SUBJECT_COLORS[areaKey] || SUBJECT_COLORS.portugues
    const fragmentName = FRAGMENT_NAMES[areaKey] || 'Fragmento do Ar'
    const phrase = MOTIVATIONAL_PHRASES[currentIndex % MOTIVATIONAL_PHRASES.length]

    // Imagem do Slide
    const slideImage = SLIDE_IMAGES[areaKey] || SLIDE_IMAGES.portugues

    // Calcular progresso real para este guardião (fragmentos conquistados / 15)
    const guardianProgress = progressData?.[guardian?.id] || 0
    const progressPercent = Math.min(100, Math.round((guardianProgress / 15) * 100))
    const remainingPercent = 100 - progressPercent
    const isComplete = progressPercent >= 100

    const handleDragStart = (e) => {
        const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX
        setDragStart(clientX)
    }

    const handleDragEnd = (e) => {
        const clientX = e.type === 'touchend' ? e.changedTouches[0].clientX : e.clientX
        const diff = dragStart - clientX

        if (Math.abs(diff) > 50) {
            if (diff > 0 && currentIndex < guardians.length - 1) {
                onSlideChange(currentIndex + 1)
            } else if (diff < 0 && currentIndex > 0) {
                onSlideChange(currentIndex - 1)
            }
        }
    }

    return (
        <motion.div
            className="mx-4 rounded-3xl overflow-hidden relative cursor-grab active:cursor-grabbing"
            style={{
                background: isComplete
                    ? `linear-gradient(135deg, #FFD700, #FFA500)`
                    : `linear-gradient(135deg, ${colors.bg}, ${colors.light})`
            }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            onMouseDown={handleDragStart}
            onMouseUp={handleDragEnd}
            onTouchStart={handleDragStart}
            onTouchEnd={handleDragEnd}
        >
            <div className="p-5 pb-6 min-h-[200px] flex">
                {/* Texto lado esquerdo */}
                <div className="flex-1 flex flex-col justify-between z-10">
                    {isComplete ? (
                        /* Estado 100% - Felicitação */
                        <div className="flex flex-col justify-center h-full">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', damping: 10 }}
                                className="text-center"
                            >
                                <span className="text-5xl">🎉</span>
                                <p className="text-white text-6xl font-bold mt-2">100%</p>
                                <p className="text-white/90 text-lg font-semibold mt-2">
                                    Parabéns! Você completou {guardian?.area}!
                                </p>
                                <p className="text-white/80 text-sm mt-1">
                                    O {fragmentName} foi conquistado!
                                </p>
                            </motion.div>
                        </div>
                    ) : (
                        /* Estado normal */
                        <>
                            <div className="max-w-[60%]">
                                <p className="text-white/90 text-sm leading-relaxed drop-shadow-sm">
                                    {phrase}{' '}
                                    <span className="font-bold text-white">{fragmentName}</span>. A Sabedoria te espera!
                                </p>
                            </div>

                            {/* Barra de progresso */}
                            <div className="mt-4 max-w-[80%]">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                        <span className="text-lg">🧙</span>
                                    </div>
                                    <div className="flex-1 h-2 bg-black/10 rounded-full overflow-hidden backdrop-blur-sm">
                                        <motion.div
                                            className="h-full bg-white rounded-full shadow-lg"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progressPercent}%` }}
                                            transition={{ delay: 0.5, duration: 0.8 }}
                                            key={guardian?.id}
                                        />
                                    </div>
                                    <div className="w-2 h-2 rounded-full bg-white/40" />
                                </div>
                                <p className="text-white/90 text-xs font-medium drop-shadow-sm">
                                    {progressPercent > 0 ? (
                                        <>
                                            Você já conquistou <span className="font-bold text-white">{progressPercent}%</span>!
                                        </>
                                    ) : (
                                        <>
                                            Inicie sua jornada em <span className="font-bold text-white">{guardian?.area}</span>!
                                        </>
                                    )}
                                </p>

                                {/* Botão Continuar */}
                                <Link
                                    to={`/lessons/${guardian?.id}`}
                                    className="mt-4 inline-block bg-white text-gray-800 font-bold py-2.5 px-6 rounded-xl text-sm shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all"
                                >
                                    {progressPercent > 0 ? 'Continuar' : 'Começar'}
                                </Link>
                            </div>
                        </>
                    )}
                </div>

                {/* Guardião lado direito - IMAGEM GRANDE */}
                {!isComplete && (
                    <motion.div
                        className="absolute right-0 bottom-0 w-[50%] h-[120%] z-0"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <img
                            src={slideImage}
                            alt={`Guardião de ${guardian?.area}`}
                            className="w-full h-full object-contain object-bottom filter drop-shadow-lg"
                        />
                        {/* Gradiente para misturar imagem com fundo na parte inferior/esquerda */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-transparent opacity-50" />
                    </motion.div>
                )}
            </div>

            {/* Badge área */}
            <div className="absolute bottom-4 right-4 z-10">
                <div className="bg-black/30 backdrop-blur-md px-4 py-1.5 rounded-full flex items-center gap-2 border border-white/10 shadow-lg">
                    <span className="text-sm">{isComplete ? '🏆' : '📚'}</span>
                    <span className="text-white text-sm font-medium">{guardian?.area}</span>
                </div>
            </div>

            {/* Indicadores de slide */}
            {guardians.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                    {guardians.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => onSlideChange(i)}
                            className={`w-2 h-2 rounded-full transition-all shadow-sm ${i === currentIndex ? 'bg-white w-4' : 'bg-white/40 hover:bg-white/60'
                                }`}
                        />
                    ))}
                </div>
            )}
        </motion.div>
    )
}

export function CurrentLessonCard({ lesson, subject }) {
    const areaKey = subject?.toLowerCase() || 'portugues'
    const colors = SUBJECT_COLORS[areaKey] || SUBJECT_COLORS.portugues

    // Estado: todas as aulas concluídas
    if (lesson === 'completed') {
        return (
            <motion.div
                className="mx-4 mt-4 rounded-2xl p-5 bg-gradient-to-r from-green-400 to-emerald-500 shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <div className="flex items-center gap-4">
                    <div className="text-4xl">🎉</div>
                    <div>
                        <h3 className="text-white font-bold text-lg">Parabéns!</h3>
                        <p className="text-white/90 text-sm">Você concluiu tudo por hoje!</p>
                    </div>
                </div>
            </motion.div>
        )
    }

    // Estado: sem aula disponível
    if (!lesson) return null

    const guardianName = lesson.guardian?.nome || ''
    const guardianArea = lesson.guardian?.area || ''

    return (
        <Link to={`/lesson/${lesson.id}`}>
            <motion.div
                className="mx-4 mt-4 rounded-2xl p-4 flex items-center justify-between shadow-lg border-2 border-transparent hover:scale-[1.01] active:scale-[0.99] transition-all"
                style={{ backgroundColor: colors.bg }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <div className="flex-1 min-w-0">
                    <p className="text-white/80 text-xs font-bold uppercase tracking-wide">
                        ATIVIDADE {lesson.ordem || 1}, UNIDADE {lesson.unidade || 1}
                    </p>
                    <h3 className="text-white font-bold text-base mt-0.5 truncate">
                        {lesson.titulo || 'Comece sua jornada!'}
                    </h3>
                    <p className="text-white/70 text-xs mt-1 truncate">
                        {guardianName} • {guardianArea}
                    </p>
                </div>
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0 ml-3">
                    <svg className="w-6 h-6" style={{ color: colors.bg }} fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                    </svg>
                </div>
            </motion.div>
        </Link>
    )
}

export function GuardianCard({ guardian, isLocked, delay = 0, progress = 0 }) {
    const areaKey = guardian?.area?.toLowerCase() || 'portugues'
    const colors = SUBJECT_COLORS[areaKey] || SUBJECT_COLORS.portugues
    const progressPercent = Math.round((progress / 15) * 100)

    // Imagem Mini
    const miniImage = MINI_IMAGES[areaKey] || MINI_IMAGES.portugues

    return (
        <motion.div
            className="flex-shrink-0 w-28"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
        >
            <Link to={isLocked ? '#' : `/lessons/${guardian?.id}`}>
                <motion.div
                    className="relative rounded-2xl overflow-hidden h-28"
                    style={{ backgroundColor: isLocked ? '#9CA3AF' : colors.bg }}
                    whileTap={{ scale: isLocked ? 1 : 0.95 }}
                >
                    {/* Guardião Image */}
                    <div className="absolute inset-0 flex items-center justify-center p-3">
                        <img
                            src={miniImage}
                            alt={guardian.area}
                            className={`w-full h-full object-contain ${isLocked ? 'grayscale opacity-50' : 'drop-shadow-md'}`}
                        />
                    </div>

                    {/* Cadeado se bloqueado */}
                    {isLocked && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[1px]">
                            <span className="text-3xl filter drop-shadow-lg">🔒</span>
                        </div>
                    )}

                    {/* Badge */}
                    <div className="absolute top-2 left-2 z-10">
                        <div className="bg-black/20 backdrop-blur-sm px-2 py-0.5 rounded-full border border-white/10">
                            <span className="text-white text-[10px] font-medium">{guardian?.area}</span>
                        </div>
                    </div>

                    {/* Barra de progresso */}
                    {!isLocked && (
                        <div className="absolute bottom-2 left-2 right-2 z-10">
                            <div className="h-1.5 bg-black/20 rounded-full overflow-hidden backdrop-blur-sm">
                                <div
                                    className="h-full bg-white rounded-full transition-all shadow-sm"
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>
                        </div>
                    )}
                </motion.div>

                {/* Nome */}
                <p className={`text-center text-sm font-medium mt-2 ${isLocked ? 'text-gray-400' : 'text-gray-800'}`}>
                    {guardian?.nome}
                </p>
            </Link>
        </motion.div>
    )
}

export function StatsSection({ stats }) {
    return (
        <motion.div
            className="mx-4 mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
        >
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-gray-800 text-lg font-bold">Seu Progresso</h2>
            </div>

            <div className="grid grid-cols-3 gap-3">
                {/* Streak */}
                <div className="bg-gradient-to-br from-orange-400 to-orange-500 rounded-2xl p-4 text-center">
                    <span className="text-2xl">🔥</span>
                    <p className="text-white font-bold text-xl mt-1">{stats.streak || 0}</p>
                    <p className="text-white/80 text-xs">dias</p>
                </div>

                {/* Fragmentos */}
                <div className="bg-gradient-to-br from-purple-400 to-purple-500 rounded-2xl p-4 text-center">
                    <span className="text-2xl">💎</span>
                    <p className="text-white font-bold text-xl mt-1">{stats.totalFragments || 0}</p>
                    <p className="text-white/80 text-xs">fragmentos</p>
                </div>

                {/* Aulas */}
                <div className="bg-gradient-to-br from-green-400 to-green-500 rounded-2xl p-4 text-center">
                    <span className="text-2xl">✅</span>
                    <p className="text-white font-bold text-xl mt-1">{stats.totalLessons || 0}</p>
                    <p className="text-white/80 text-xs">aulas</p>
                </div>
            </div>
        </motion.div>
    )
}

export function BottomNav() {
    const location = useLocation()
    const currentPath = location.pathname

    const navItems = [
        { path: '/dashboard', icon: 'home', label: 'Início' },
        { path: '/map', icon: 'map', label: 'Mapa' },
        { path: '/guardians', icon: 'guardians', label: 'Explorar' },
        { path: '/profile', icon: 'profile', label: 'Perfil' },
    ]

    const getIcon = (icon, isActive) => {
        const color = isActive ? 'text-blue-500' : 'text-gray-400'
        switch (icon) {
            case 'home':
                return (
                    <svg className={`w-6 h-6 ${color}`} fill={isActive ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive ? 0 : 2} d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                    </svg>
                )
            case 'map':
                return (
                    <svg className={`w-6 h-6 ${color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                )
            case 'guardians':
                return (
                    <svg className={`w-6 h-6 ${color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                )
            case 'profile':
                return (
                    <svg className={`w-6 h-6 ${color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                )
            default:
                return null
        }
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-2 flex justify-around items-center z-50">
            {navItems.map((item) => {
                const isActive = currentPath === item.path ||
                    (item.path === '/dashboard' && currentPath === '/') ||
                    (item.path === '/guardians' && currentPath.startsWith('/lessons'))

                return (
                    <Link
                        key={item.path}
                        to={item.path}
                        className="flex flex-col items-center py-1 px-3 rounded-xl transition-all"
                    >
                        {getIcon(item.icon, isActive)}
                        <span className={`text-[10px] mt-1 font-medium ${isActive ? 'text-blue-500' : 'text-gray-400'}`}>
                            {item.label}
                        </span>
                    </Link>
                )
            })}
        </div>
    )
}
