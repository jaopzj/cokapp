import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export function useLessons(guardianId = null) {
    const { user, isAdmin } = useAuth()
    const [lessons, setLessons] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Buscar lições
    const fetchLessons = useCallback(async () => {
        setLoading(true)
        setError(null)

        try {
            let query = supabase
                .from('lessons')
                .select(`
          *,
          guardian:guardians(id, nome, area)
        `)
                .eq('ativo', true)
                .order('ordem', { ascending: true })

            if (guardianId) {
                query = query.eq('guardian_id', guardianId)
            }

            const { data, error: fetchError } = await query

            if (fetchError) throw fetchError

            setLessons(data || [])
        } catch (err) {
            console.error('Erro ao buscar lições:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [guardianId])

    // Buscar todas as lições (admin - inclui inativas)
    const fetchAllLessons = useCallback(async () => {
        setLoading(true)
        setError(null)

        try {
            const { data, error: fetchError } = await supabase
                .from('lessons')
                .select(`
          *,
          guardian:guardians(id, nome, area)
        `)
                .order('guardian_id')
                .order('ordem', { ascending: true })

            if (fetchError) throw fetchError

            setLessons(data || [])
        } catch (err) {
            console.error('Erro ao buscar lições:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [])

    // Criar lição (admin)
    const createLesson = useCallback(async (lessonData) => {
        try {
            const { data, error } = await supabase
                .from('lessons')
                .insert({
                    guardian_id: lessonData.guardian_id,
                    titulo: lessonData.titulo,
                    conteudo: lessonData.conteudo,
                    ordem: lessonData.ordem || 1,
                    ativo: lessonData.ativo ?? true
                })
                .select()
                .single()

            if (error) throw error

            return { data, error: null }
        } catch (err) {
            console.error('Erro ao criar lição:', err)
            return { data: null, error: err.message }
        }
    }, [])

    // Atualizar lição (admin)
    const updateLesson = useCallback(async (lessonId, updates) => {
        try {
            const { data, error } = await supabase
                .from('lessons')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString()
                })
                .eq('id', lessonId)
                .select()
                .single()

            if (error) throw error

            return { data, error: null }
        } catch (err) {
            console.error('Erro ao atualizar lição:', err)
            return { data: null, error: err.message }
        }
    }, [])

    // Deletar lição (admin)
    const deleteLesson = useCallback(async (lessonId) => {
        try {
            const { error } = await supabase
                .from('lessons')
                .delete()
                .eq('id', lessonId)

            if (error) throw error

            return { error: null }
        } catch (err) {
            console.error('Erro ao deletar lição:', err)
            return { error: err.message }
        }
    }, [])

    // Buscar lição por ID
    const getLessonById = useCallback(async (lessonId) => {
        try {
            const { data, error } = await supabase
                .from('lessons')
                .select(`
          *,
          guardian:guardians(id, nome, area)
        `)
                .eq('id', lessonId)
                .single()

            if (error) throw error

            return { data, error: null }
        } catch (err) {
            console.error('Erro ao buscar lição:', err)
            return { data: null, error: err.message }
        }
    }, [])

    // Verificar se aula foi concluída
    const checkLessonCompleted = useCallback(async (lessonId) => {
        if (!user) return false

        try {
            const { data } = await supabase
                .from('completed_lessons')
                .select('id')
                .eq('user_id', user.id)
                .eq('lesson_id', lessonId)
                .maybeSingle()

            return !!data
        } catch (err) {
            console.error('Erro ao verificar conclusão:', err)
            return false
        }
    }, [user])

    // Marcar aula como concluída
    const markLessonCompleted = useCallback(async (lessonId) => {
        if (!user) return { alreadyCompleted: false, error: 'Usuário não logado' }

        try {
            // Verificar se já foi concluída
            const alreadyCompleted = await checkLessonCompleted(lessonId)
            if (alreadyCompleted) {
                return { alreadyCompleted: true, error: null }
            }

            // Marcar como concluída
            const { error } = await supabase
                .from('completed_lessons')
                .insert({
                    user_id: user.id,
                    lesson_id: lessonId
                })

            if (error) throw error

            return { alreadyCompleted: false, error: null }
        } catch (err) {
            console.error('Erro ao marcar conclusão:', err)
            return { alreadyCompleted: false, error: err.message }
        }
    }, [user, checkLessonCompleted])

    useEffect(() => {
        if (user) {
            fetchLessons()
        } else {
            setLoading(false)
        }
    }, [user, fetchLessons])

    return {
        lessons,
        loading,
        error,
        isAdmin,
        fetchLessons,
        fetchAllLessons,
        createLesson,
        updateLesson,
        deleteLesson,
        getLessonById,
        checkLessonCompleted,
        markLessonCompleted,
        refetch: fetchLessons
    }
}
