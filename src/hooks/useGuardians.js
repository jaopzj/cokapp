import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useGuardians() {
    const [guardians, setGuardians] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        fetchGuardians()
    }, [])

    async function fetchGuardians() {
        setLoading(true)
        setError(null)

        const { data, error } = await supabase
            .from('guardians')
            .select('*')
            .order('ordem_progressao', { ascending: true })

        if (error) {
            console.error('Erro ao buscar guardiões:', error)
            setError(error.message)
        } else {
            setGuardians(data || [])
        }
        setLoading(false)
    }

    return { guardians, loading, error, refetch: fetchGuardians }
}
