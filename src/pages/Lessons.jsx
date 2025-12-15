import { useEffect, useState, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useLessons } from '../hooks/useLessons'
import { supabase } from '../lib/supabase'
import { BottomNav } from '../components/DashboardComponents'

// Cores padrão do app (mesmas de DashboardComponents)
const AREA_COLORS = {
    'português': { bg: '#3B82F6', light: '#DBEAFE' },
    'matemática': { bg: '#EF4444', light: '#FEE2E2' },
    'humanas': { bg: '#F97316', light: '#FFEDD5' },
    'natureza': { bg: '#22C55E', light: '#DCFCE7' },
}

const getAreaColor = (area) => {
    const key = Object.keys(AREA_COLORS).find(k => area?.toLowerCase().includes(k))
    return AREA_COLORS[key] || { bg: '#6366F1', light: '#E0E7FF' }
}

export function Lessons() {
    const { guardianId } = useParams()
    const { lessons, loading, error } = useLessons(guardianId)
    const [guardian, setGuardian] = useState(null)

    useEffect(() => {
        async function fetchGuardian() {
            if (!guardianId) return
            const { data } = await supabase
                .from('guardians')
                .select('*')
                .eq('id', guardianId)
                .single()
            setGuardian(data)
        }
        fetchGuardian()
    }, [guardianId])

    // Agrupar aulas por unidade
    const units = useMemo(() => {
        if (!lessons) return {}
        return lessons.reduce((acc, lesson) => {
            const unit = lesson.unidade || 1
            if (!acc[unit]) acc[unit] = []
            acc[unit].push(lesson)
            return acc
        }, {})
    }, [lessons])

    const colors = getAreaColor(guardian?.area)

    if (loading) return <LoadingState />
    if (error) return <ErrorState error={error} />

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Header Fixo */}
            <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md px-4 py-4 shadow-sm">
                <div className="flex items-center gap-3">
                    <Link
                        to="/guardians"
                        className="p-2 -ml-1 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </Link>
                    <div>
                        <h1 className="text-lg font-bold text-gray-800">
                            {guardian?.nome || 'Carregando...'}
                        </h1>
                        <p className="text-xs text-gray-500 font-medium">
                            {guardian?.area}
                        </p>
                    </div>
                </div>
            </header>

            {/* Banner do Guardião */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="mx-4 mt-4 p-5 rounded-3xl relative overflow-hidden"
                style={{ backgroundColor: colors.bg }}
            >
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl">
                        {guardian?.area?.toLowerCase().includes('matemática') ? '📐' :
                            guardian?.area?.toLowerCase().includes('natureza') ? '🔬' :
                                guardian?.area?.toLowerCase().includes('humanas') ? '⚖️' :
                                    guardian?.area?.toLowerCase().includes('português') ? '📚' : '✨'}
                    </div>
                    <div className="flex-1">
                        <p className="text-white/80 text-sm font-medium">Guardião</p>
                        <h2 className="text-white text-xl font-bold">{guardian?.nome}</h2>
                        <p className="text-white/70 text-xs mt-1">
                            {lessons.length} aula{lessons.length !== 1 ? 's' : ''} disponíve{lessons.length !== 1 ? 'is' : 'l'}
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Lista de Aulas por Unidade */}
            <main className="px-4 pt-6 space-y-6">
                <AnimatePresence mode="wait">
                    {Object.keys(units).length > 0 ? (
                        Object.keys(units).sort((a, b) => a - b).map((unitNum, unitIndex) => (
                            <motion.div
                                key={unitNum}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.35, delay: unitIndex * 0.1, ease: "easeOut" }}
                                className="space-y-3"
                            >
                                <h3 className="text-base font-bold text-gray-700 flex items-center gap-2">
                                    <span
                                        className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-sm font-bold"
                                        style={{ backgroundColor: colors.bg }}
                                    >
                                        {unitNum}
                                    </span>
                                    Unidade {unitNum}
                                </h3>

                                <div className="space-y-3">
                                    {units[unitNum].map((lesson, idx) => (
                                        <LessonCard
                                            key={lesson.id}
                                            lesson={lesson}
                                            index={idx}
                                            colors={colors}
                                            delay={unitIndex * 0.1 + idx * 0.05}
                                        />
                                    ))}
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-16"
                        >
                            <div className="text-5xl mb-4">📭</div>
                            <p className="text-gray-500 font-medium">Nenhuma aula disponível ainda.</p>
                            <p className="text-gray-400 text-sm mt-1">Em breve novos conteúdos!</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            <BottomNav />
        </div>
    )
}

function LessonCard({ lesson, index, colors, delay = 0 }) {
    const isLocked = !lesson.ativo

    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay, ease: "easeOut" }}
        >
            <Link
                to={isLocked ? '#' : `/lesson/${lesson.id}`}
                className={`block ${isLocked ? 'pointer-events-none' : ''}`}
            >
                <div className={`bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 transition-all duration-200
                    ${isLocked ? 'opacity-50' : 'hover:shadow-md hover:border-gray-200 active:scale-[0.98]'}
                `}>
                    {/* Número/Ícone */}
                    <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold shrink-0 transition-colors`}
                        style={{
                            backgroundColor: isLocked ? '#F3F4F6' : colors.light,
                            color: isLocked ? '#9CA3AF' : colors.bg
                        }}
                    >
                        {isLocked ? '🔒' : (index + 1)}
                    </div>

                    {/* Conteúdo */}
                    <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-800 truncate">{lesson.titulo}</h4>
                        <p className="text-gray-400 text-xs font-medium mt-0.5">
                            Aula {lesson.ordem} • Unidade {lesson.unidade || 1}
                        </p>
                    </div>

                    {/* Seta */}
                    {!isLocked && (
                        <svg className="w-5 h-5 text-gray-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    )}
                </div>
            </Link>
        </motion.div>
    )
}

function LoadingState() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                    className="text-4xl mb-3 inline-block"
                >
                    ⏳
                </motion.div>
                <p className="text-gray-500 font-medium">Carregando aulas...</p>
            </div>
        </div>
    )
}

function ErrorState({ error }) {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <div className="text-center max-w-sm">
                <div className="text-5xl mb-4">😕</div>
                <h2 className="text-lg font-bold text-gray-800">Ops! Algo deu errado.</h2>
                <p className="text-gray-500 text-sm my-4">{error}</p>
                <Link
                    to="/guardians"
                    className="inline-block bg-blue-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-600 transition-colors"
                >
                    Voltar
                </Link>
            </div>
        </div>
    )
}
