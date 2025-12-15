import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export function useFragments() {
    const { user } = useAuth()
    const [fragments, setFragments] = useState([])
    const [userFragments, setUserFragments] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Buscar fragmentos e progresso do usuário
    const fetchFragments = useCallback(async () => {
        if (!user) {
            setLoading(false)
            return
        }

        setLoading(true)
        setError(null)

        try {
            // Buscar todos os fragmentos com dados do guardião
            const { data: fragmentsData, error: fragmentsError } = await supabase
                .from('fragments')
                .select(`
          *,
          guardian:guardians(id, nome, area, ordem_progressao, porcentagem_desbloqueio_necessaria, status)
        `)
                .order('guardian(ordem_progressao)', { ascending: true })

            if (fragmentsError) throw fragmentsError

            // Buscar progresso do usuário
            const { data: userFragmentsData, error: userFragmentsError } = await supabase
                .from('user_fragments')
                .select('*')
                .eq('user_id', user.id)

            if (userFragmentsError) throw userFragmentsError

            setFragments(fragmentsData || [])
            setUserFragments(userFragmentsData || [])
        } catch (err) {
            console.error('Erro ao buscar fragmentos:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [user])

    useEffect(() => {
        fetchFragments()
    }, [fetchFragments])

    // Obter quantidade atual de fragmentos do usuário para um tipo específico
    const getFragmentProgress = useCallback((fragmentId) => {
        const userFragment = userFragments.find(uf => uf.fragment_id === fragmentId)
        return userFragment?.quantidade_atual || 0
    }, [userFragments])

    // Calcular porcentagem de progresso
    const getProgressPercentage = useCallback((fragmentId, total) => {
        const current = getFragmentProgress(fragmentId)
        return Math.min((current / total) * 100, 100)
    }, [getFragmentProgress])

    // Adicionar fragmentos ao usuário
    const addFragments = useCallback(async (fragmentId, amount = 1) => {
        if (!user) return { error: 'Usuário não logado' }

        try {
            // Verificar se já existe registro
            const existingFragment = userFragments.find(uf => uf.fragment_id === fragmentId)

            if (existingFragment) {
                // Atualizar quantidade existente
                const newAmount = Math.min(existingFragment.quantidade_atual + amount, 15)

                const { error } = await supabase
                    .from('user_fragments')
                    .update({
                        quantidade_atual: newAmount,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', existingFragment.id)

                if (error) throw error
            } else {
                // Criar novo registro
                const { error } = await supabase
                    .from('user_fragments')
                    .insert({
                        user_id: user.id,
                        fragment_id: fragmentId,
                        quantidade_atual: Math.min(amount, 15)
                    })

                if (error) throw error
            }

            // Recarregar dados
            await fetchFragments()
            return { success: true }
        } catch (err) {
            console.error('Erro ao adicionar fragmentos:', err)
            return { error: err.message }
        }
    }, [user, userFragments, fetchFragments])

    // Verificar se guardião deve ser desbloqueado
    const checkGuardianUnlock = useCallback((guardianOrdemProgressao) => {
        if (guardianOrdemProgressao === 1) return true // Primeiro sempre disponível

        // Encontrar guardião anterior
        const previousGuardian = fragments.find(
            f => f.guardian?.ordem_progressao === guardianOrdemProgressao - 1
        )

        if (!previousGuardian) return false

        // Calcular progresso do guardião anterior
        const progress = getProgressPercentage(previousGuardian.id, previousGuardian.quantidade_total)

        // Encontrar porcentagem necessária do guardião atual
        const currentGuardianFragment = fragments.find(
            f => f.guardian?.ordem_progressao === guardianOrdemProgressao
        )

        if (!currentGuardianFragment) return false

        const requiredPercentage = currentGuardianFragment.guardian?.porcentagem_desbloqueio_necessaria || 0

        return progress >= requiredPercentage
    }, [fragments, getProgressPercentage])

    // Combinar fragmentos com progresso do usuário
    const fragmentsWithProgress = fragments.map(fragment => ({
        ...fragment,
        quantidade_atual: getFragmentProgress(fragment.id),
        porcentagem: getProgressPercentage(fragment.id, fragment.quantidade_total),
        desbloqueado: checkGuardianUnlock(fragment.guardian?.ordem_progressao)
    }))

    return {
        fragments: fragmentsWithProgress,
        loading,
        error,
        addFragments,
        refetch: fetchFragments,
        getFragmentProgress,
        getProgressPercentage,
        checkGuardianUnlock
    }
}
