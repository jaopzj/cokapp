import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export function useActivities(lessonId = null) {
    const { user, isAdmin } = useAuth()
    const [activities, setActivities] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Buscar atividades de uma lição
    const fetchActivities = useCallback(async () => {
        if (!lessonId) {
            setLoading(false)
            return
        }

        setLoading(true)
        setError(null)

        try {
            const { data, error: fetchError } = await supabase
                .from('activities')
                .select('*')
                .eq('lesson_id', lessonId)
                .order('ordem', { ascending: true })

            if (fetchError) throw fetchError

            setActivities(data || [])
        } catch (err) {
            console.error('Erro ao buscar atividades:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [lessonId])

    // Buscar todas atividades (admin)
    const fetchAllActivities = useCallback(async () => {
        setLoading(true)
        setError(null)

        try {
            const { data, error: fetchError } = await supabase
                .from('activities')
                .select(`
          *,
          lesson:lessons(id, titulo, guardian_id)
        `)
                .order('lesson_id')
                .order('ordem', { ascending: true })

            if (fetchError) throw fetchError

            setActivities(data || [])
        } catch (err) {
            console.error('Erro ao buscar atividades:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [])

    // Criar atividade (admin)
    const createActivity = useCallback(async (activityData) => {
        try {
            const { data, error } = await supabase
                .from('activities')
                .insert({
                    lesson_id: activityData.lesson_id,
                    tipo: activityData.tipo,
                    pergunta: activityData.pergunta,
                    dados: activityData.dados,
                    resposta_correta: activityData.resposta_correta,
                    ordem: activityData.ordem || 1
                })
                .select()
                .single()

            if (error) throw error

            return { data, error: null }
        } catch (err) {
            console.error('Erro ao criar atividade:', err)
            return { data: null, error: err.message }
        }
    }, [])

    // Atualizar atividade (admin)
    const updateActivity = useCallback(async (activityId, updates) => {
        try {
            const { data, error } = await supabase
                .from('activities')
                .update(updates)
                .eq('id', activityId)
                .select()
                .single()

            if (error) throw error

            return { data, error: null }
        } catch (err) {
            console.error('Erro ao atualizar atividade:', err)
            return { data: null, error: err.message }
        }
    }, [])

    // Deletar atividade (admin)
    const deleteActivity = useCallback(async (activityId) => {
        try {
            const { error } = await supabase
                .from('activities')
                .delete()
                .eq('id', activityId)

            if (error) throw error

            return { error: null }
        } catch (err) {
            console.error('Erro ao deletar atividade:', err)
            return { error: err.message }
        }
    }, [])

    // Validar respostas do usuário
    const validateAnswers = useCallback((userAnswers) => {
        let correct = 0
        const results = []

        activities.forEach((activity, index) => {
            const userAnswer = userAnswers[index]
            let isCorrect = false

            switch (activity.tipo) {
                case 'quiz':
                    // Múltipla escolha: compara índice selecionado
                    isCorrect = userAnswer === activity.resposta_correta.indice
                    break

                case 'checkbox':
                    // Checkbox: compara arrays de índices
                    if (Array.isArray(userAnswer) && Array.isArray(activity.resposta_correta.indices)) {
                        const sortedUser = [...userAnswer].sort()
                        const sortedCorrect = [...activity.resposta_correta.indices].sort()
                        isCorrect = JSON.stringify(sortedUser) === JSON.stringify(sortedCorrect)
                    }
                    break

                case 'fill_blank':
                    // Completar: compara valor (case insensitive)
                    const userValue = (userAnswer || '').toString().trim().toLowerCase()
                    const correctValue = (activity.resposta_correta.valor || '').toString().trim().toLowerCase()
                    isCorrect = userValue === correctValue
                    break
            }

            if (isCorrect) correct++

            results.push({
                activityId: activity.id,
                isCorrect,
                userAnswer,
                correctAnswer: activity.resposta_correta
            })
        })

        const total = activities.length
        const percentage = total > 0 ? (correct / total) * 100 : 0
        const passed = percentage >= 70

        return {
            correct,
            total,
            percentage,
            passed,
            results
        }
    }, [activities])

    useEffect(() => {
        if (lessonId) {
            fetchActivities()
        }
    }, [lessonId, fetchActivities])

    return {
        activities,
        loading,
        error,
        isAdmin,
        fetchActivities,
        fetchAllActivities,
        createActivity,
        updateActivity,
        deleteActivity,
        validateAnswers,
        refetch: fetchActivities
    }
}
