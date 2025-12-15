import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export function useUserStats() {
    const { user } = useAuth()
    const [stats, setStats] = useState({
        lastLesson: null,
        activeGuardian: null,
        streak: 0,
        totalLessons: 0,
        totalFragments: 0,
        progressPercent: 0
    })
    const [loading, setLoading] = useState(true)

    const fetchStats = useCallback(async () => {
        if (!user) {
            setLoading(false)
            return
        }

        setLoading(true)

        try {
            // Buscar última aula concluída
            const { data: lastLessonData } = await supabase
                .from('completed_lessons')
                .select(`
          completed_at,
          lesson:lessons(id, titulo, guardian_id, guardian:guardians(nome, area))
        `)
                .eq('user_id', user.id)
                .order('completed_at', { ascending: false })
                .limit(1)
                .maybeSingle()

            // Buscar total de aulas concluídas
            const { count: totalLessons } = await supabase
                .from('completed_lessons')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id)

            // Buscar fragmentos do usuário
            const { data: fragmentsData } = await supabase
                .from('user_fragments')
                .select('quantidade_atual, fragment:fragments(guardian:guardians(nome))')
                .eq('user_id', user.id)

            // Calcular total de fragmentos
            const totalFragments = fragmentsData?.reduce((sum, f) => sum + (f.quantidade_atual || 0), 0) || 0

            // Encontrar guardião ativo (com mais fragmentos)
            let activeGuardian = null
            if (fragmentsData && fragmentsData.length > 0) {
                const sorted = [...fragmentsData].sort((a, b) => b.quantidade_atual - a.quantidade_atual)
                if (sorted[0]?.fragment?.guardian?.nome) {
                    activeGuardian = sorted[0].fragment.guardian.nome
                }
            }

            // Calcular sequência de dias (streak)
            const streak = await calculateStreak(user.id)

            // Calcular progresso geral (fragmentos / total possível)
            // 4 guardiões x 15 fragmentos = 60 total
            const maxFragments = 60
            const progressPercent = Math.round((totalFragments / maxFragments) * 100)

            setStats({
                lastLesson: lastLessonData?.lesson || null,
                activeGuardian,
                streak,
                totalLessons: totalLessons || 0,
                totalFragments,
                progressPercent
            })
        } catch (error) {
            console.error('Erro ao buscar estatísticas:', error)
        } finally {
            setLoading(false)
        }
    }, [user])

    // Calcular sequência de dias estudados
    async function calculateStreak(userId) {
        const { data } = await supabase
            .from('completed_lessons')
            .select('completed_at')
            .eq('user_id', userId)
            .order('completed_at', { ascending: false })

        if (!data || data.length === 0) return 0

        // Agrupar por dia
        const days = new Set()
        data.forEach(item => {
            const date = new Date(item.completed_at).toDateString()
            days.add(date)
        })

        const sortedDays = Array.from(days).map(d => new Date(d)).sort((a, b) => b - a)

        // Contar dias consecutivos
        let streak = 0
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        for (let i = 0; i < sortedDays.length; i++) {
            const expectedDate = new Date(today)
            expectedDate.setDate(today.getDate() - i)
            expectedDate.setHours(0, 0, 0, 0)

            const actualDate = new Date(sortedDays[i])
            actualDate.setHours(0, 0, 0, 0)

            if (expectedDate.getTime() === actualDate.getTime()) {
                streak++
            } else if (i === 0 && expectedDate.getTime() - actualDate.getTime() === 86400000) {
                // Se hoje não estudou mas ontem sim, continua contando
                continue
            } else {
                break
            }
        }

        return streak
    }

    useEffect(() => {
        fetchStats()
    }, [fetchStats])

    return {
        stats,
        loading,
        refetch: fetchStats
    }
}
