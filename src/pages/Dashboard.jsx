import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { useUserStats } from '../hooks/useUserStats'
import { useFragments } from '../hooks/useFragments'
import { supabase } from '../lib/supabase'
import {
    DashboardHeader,
    HeroSlider,
    CurrentLessonCard,
    GuardianCard,
    StatsSection,
    BottomNav
} from '../components/DashboardComponents'

export function Dashboard() {
    const { user, profile, signOut, isAdmin } = useAuth()
    const { stats, loading: statsLoading } = useUserStats()
    const { fragments, loading: fragmentsLoading } = useFragments()
    const [guardians, setGuardians] = useState([])
    const [currentSlide, setCurrentSlide] = useState(0)
    const [nextLesson, setNextLesson] = useState(null)
    const [loading, setLoading] = useState(true)
    const [lessonsCount, setLessonsCount] = useState({})
    const navigate = useNavigate()

    // Buscar guardiões e contagem de aulas
    const fetchGuardians = useCallback(async () => {
        const { data: guardiansData } = await supabase
            .from('guardians')
            .select('*')
            .order('ordem_progressao')

        if (guardiansData) {
            setGuardians(guardiansData)

            // Buscar contagem de aulas por guardião
            const { data: lessonsData } = await supabase
                .from('lessons')
                .select('guardian_id')

            if (lessonsData) {
                const countMap = {}
                lessonsData.forEach(lesson => {
                    countMap[lesson.guardian_id] = (countMap[lesson.guardian_id] || 0) + 1
                })
                setLessonsCount(countMap)
            }
        }
    }, [])

    // Buscar PRÓXIMA aula (Lógica de Continuidade)
    // Considera: guardiões desbloqueados, grupo_serie do usuário, aulas ativas
    const fetchNextLesson = useCallback(async () => {
        if (!user || !profile) return

        // Obter IDs de guardiões desbloqueados a partir dos fragments
        const unlockedIds = fragments
            .filter(f => f.desbloqueado && f.guardian?.id)
            .map(f => f.guardian.id)

        if (unlockedIds.length === 0) {
            setNextLesson(null)
            return
        }

        // Filtro de série do usuário (ex: "6-7" ou "8-9" ou "todos")
        const userSerie = profile.grupo_serie || 'todos'

        // 1. Buscar última aula concluída para saber onde parou
        const { data: lastCompleted } = await supabase
            .from('completed_lessons')
            .select(`lesson:lessons(id, titulo, ordem, guardian_id, unidade)`)
            .eq('user_id', user.id)
            .order('completed_at', { ascending: false })
            .limit(1)
            .maybeSingle()

        // 2. Se tem última concluída, tentar pegar a próxima (mesmo guardião)
        if (lastCompleted?.lesson) {
            let query = supabase
                .from('lessons')
                .select('*, guardian:guardians(id, nome, area)')
                .eq('guardian_id', lastCompleted.lesson.guardian_id)
                .in('guardian_id', unlockedIds)
                .gt('ordem', lastCompleted.lesson.ordem)
                .eq('ativo', true)
                .order('ordem', { ascending: true })
                .limit(1)

            // Filtrar por série se não for "todos"
            if (userSerie !== 'todos') {
                query = query.or(`grupo_serie.eq.${userSerie},grupo_serie.eq.todos`)
            }

            const { data: next } = await query.maybeSingle()

            if (next) {
                setNextLesson(next)
                return
            }

            // 3. Se não tem próxima no mesmo guardião, buscar aula ordem=1 de outro guardião desbloqueado
            let fallbackQuery = supabase
                .from('lessons')
                .select('*, guardian:guardians(id, nome, area)')
                .in('guardian_id', unlockedIds)
                .neq('guardian_id', lastCompleted.lesson.guardian_id)
                .eq('ordem', 1)
                .eq('ativo', true)
                .order('created_at', { ascending: true })
                .limit(1)

            if (userSerie !== 'todos') {
                fallbackQuery = fallbackQuery.or(`grupo_serie.eq.${userSerie},grupo_serie.eq.todos`)
            }

            const { data: nextGuardianLesson } = await fallbackQuery.maybeSingle()

            if (nextGuardianLesson) {
                setNextLesson(nextGuardianLesson)
                return
            }

            // 4. Se chegou aqui, usuário completou todas as aulas disponíveis
            setNextLesson('completed')
            return
        }

        // 5. Fallback: Usuário novo - buscar primeira aula de guardião desbloqueado
        let firstQuery = supabase
            .from('lessons')
            .select('*, guardian:guardians(id, nome, area)')
            .in('guardian_id', unlockedIds)
            .eq('ordem', 1)
            .eq('ativo', true)
            .order('created_at', { ascending: true })
            .limit(1)

        if (userSerie !== 'todos') {
            firstQuery = firstQuery.or(`grupo_serie.eq.${userSerie},grupo_serie.eq.todos`)
        }

        const { data: firstLesson } = await firstQuery.maybeSingle()

        if (firstLesson) {
            setNextLesson(firstLesson)
        } else {
            // Nenhuma aula disponível para este usuário
            setNextLesson(null)
        }
    }, [user, profile, fragments])

    // Carregar guardiões ao montar
    useEffect(() => {
        fetchGuardians()
    }, [fetchGuardians])

    // Carregar próxima aula quando fragments e profile estiverem prontos
    useEffect(() => {
        if (!fragmentsLoading && profile && fragments.length > 0) {
            fetchNextLesson()
        }
    }, [fragmentsLoading, profile, fragments, fetchNextLesson])

    // Controlar loading geral
    useEffect(() => {
        if (!fragmentsLoading && !statsLoading) {
            setLoading(false)
        }
    }, [fragmentsLoading, statsLoading])

    // Criar mapa de guardiões desbloqueados a partir dos fragments
    const unlockedGuardianIds = new Set()
    const guardianProgress = {}

    fragments.forEach(fragment => {
        if (fragment.desbloqueado && fragment.guardian) {
            unlockedGuardianIds.add(fragment.guardian.id)
            guardianProgress[fragment.guardian.id] = fragment.quantidade_atual || 0
        }
    })

    // Guardiões disponíveis = desbloqueados pelo usuário E com aulas cadastradas
    const availableGuardians = guardians.filter(g => {
        const isUnlocked = unlockedGuardianIds.has(g.id)
        const hasLessons = (lessonsCount[g.id] || 0) > 0
        return isUnlocked && hasLessons
    })

    // Estado para controlar reset do timer
    const [timerKey, setTimerKey] = useState(0)

    // Auto slide a cada 10 segundos - reinicia quando timerKey muda
    useEffect(() => {
        if (availableGuardians.length <= 1) return

        const interval = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % availableGuardians.length)
        }, 10000)

        return () => clearInterval(interval)
    }, [availableGuardians.length, timerKey])

    // Callback para quando usuário muda slide manualmente
    const handleSlideChange = (newIndex) => {
        setCurrentSlide(newIndex)
        setTimerKey(prev => prev + 1) // Reinicia o timer
    }

    async function handleLogout() {
        await signOut()
        navigate('/login')
    }

    if (loading || statsLoading || fragmentsLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <motion.div
                        className="text-4xl mb-3"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    >
                        ⏳
                    </motion.div>
                    <p className="text-gray-500">Carregando...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <DashboardHeader
                userName={profile?.nome}
                avatarUrl={profile?.avatar_url}
            />

            {/* Hero Slider - APENAS guardiões disponíveis (desbloqueados + com aulas) */}
            {availableGuardians.length > 0 && (
                <HeroSlider
                    guardians={availableGuardians}
                    currentIndex={currentSlide}
                    onSlideChange={handleSlideChange}
                    progressData={guardianProgress}
                />
            )}

            {/* Mensagem se nenhum guardião disponível */}
            {availableGuardians.length === 0 && (
                <div className="mx-4 p-6 bg-gray-100 rounded-2xl text-center">
                    <span className="text-4xl mb-2 block">🔒</span>
                    <p className="text-gray-600">Nenhum guardião disponível ainda.</p>
                    <p className="text-gray-400 text-sm">Continue progredindo para desbloquear!</p>
                </div>
            )}

            {/* Card Desafio Atual / Parabéns */}
            {(nextLesson || nextLesson === 'completed') && (
                <CurrentLessonCard
                    lesson={nextLesson}
                    subject={typeof nextLesson === 'object' ? nextLesson?.guardian?.area : 'portugues'}
                />
            )}

            {/* Seção Guardiões */}
            <motion.div
                className="mt-6 px-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
            >
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-gray-800 text-lg font-bold">Guardiões</h2>
                    <Link to="/guardians" className="text-blue-500 text-sm font-medium">
                        Ver todos
                    </Link>
                </div>

                <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                    {guardians.map((guardian, index) => {
                        // Guardião desbloqueado = está no set de desbloqueados pelos fragments
                        const isUnlocked = unlockedGuardianIds.has(guardian.id)
                        const hasLessons = (lessonsCount[guardian.id] || 0) > 0
                        // Bloqueado se: não desbloqueado OU não tem aulas
                        const isLocked = !isUnlocked || !hasLessons
                        const progress = guardianProgress[guardian.id] || 0

                        return (
                            <GuardianCard
                                key={guardian.id}
                                guardian={guardian}
                                isLocked={isLocked}
                                progress={progress}
                                delay={0.3 + index * 0.1}
                            />
                        )
                    })}
                </div>
            </motion.div>

            {/* Seção Histórico/Stats */}
            <StatsSection stats={stats} />

            {/* Admin Link */}
            {isAdmin && (
                <motion.div
                    className="mx-4 mt-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    <Link
                        to="/admin"
                        className="block text-center text-gray-500 text-sm hover:text-blue-500 transition-colors"
                    >
                        🔧 Painel Admin
                    </Link>
                </motion.div>
            )}

            {/* Logout */}
            <motion.div
                className="mx-4 mt-4 mb-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
            >
                <button
                    onClick={handleLogout}
                    className="block w-full text-center text-gray-400 text-sm hover:text-red-500 transition-colors"
                >
                    Sair da conta
                </button>
            </motion.div>

            {/* Créditos Footer */}
            <motion.div
                className="text-center pb-8 px-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
            >
                <p className="text-[10px] text-gray-400 opacity-60 font-medium tracking-wide">
                    Site criado com ❣️ durante o EDUCKATHON 2025 - FAPITEC + SergipeTec º Chronicles of Knowledge
                </p>
            </motion.div>

            {/* Bottom Navigation */}
            <BottomNav />
        </div>
    )
}
