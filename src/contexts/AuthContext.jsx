import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [isAdmin, setIsAdmin] = useState(false)

    useEffect(() => {
        let mounted = true

        // Verificar sessão atual
        async function initSession() {
            try {
                const { data: { session } } = await supabase.auth.getSession()

                if (!mounted) return

                if (session?.user) {
                    setUser(session.user)
                    await fetchProfile(session.user.id)
                    await checkAdmin(session.user.id)
                } else {
                    setUser(null)
                    setProfile(null)
                    setIsAdmin(false)
                }
            } catch (error) {
                console.error('Erro ao inicializar sessão:', error)
            } finally {
                if (mounted) {
                    setLoading(false)
                }
            }
        }

        initSession()

        // Escutar mudanças de autenticação
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (!mounted) return

                if (session?.user) {
                    setUser(session.user)
                    await fetchProfile(session.user.id)
                    await checkAdmin(session.user.id)

                    // Verificar se há avatar pendente para upload
                    await checkPendingAvatar(session.user.id)
                } else {
                    setUser(null)
                    setProfile(null)
                    setIsAdmin(false)
                }
                setLoading(false)
            }
        )

        return () => {
            mounted = false
            subscription.unsubscribe()
        }
    }, [])

    // Verificar se é admin
    async function checkAdmin(userId) {
        try {
            const { data } = await supabase
                .from('admins')
                .select('id')
                .eq('user_id', userId)
                .maybeSingle()

            setIsAdmin(!!data)
        } catch (error) {
            console.error('Erro ao verificar admin:', error)
            setIsAdmin(false)
        }
    }

    // Buscar perfil do usuário
    async function fetchProfile(userId) {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .maybeSingle()

            if (error) {
                console.error('Erro ao buscar perfil:', error)
            } else {
                setProfile(data)
            }
        } catch (error) {
            console.error('Erro ao buscar perfil:', error)
        }
    }

    // Verificar e fazer upload de avatar pendente
    async function checkPendingAvatar(userId) {
        try {
            const pendingData = localStorage.getItem('pendingAvatar')
            if (!pendingData) return

            const { userId: savedUserId, base64, fileName } = JSON.parse(pendingData)

            // Verificar se é o mesmo usuário
            if (savedUserId !== userId) return

            // Aguardar 3 segundos para garantir que o profile foi criado pelo trigger
            await new Promise(resolve => setTimeout(resolve, 3000))

            // Converter base64 para Blob
            const response = await fetch(base64)
            const blob = await response.blob()

            // Fazer upload
            const fileExt = fileName.split('.').pop()
            const filePath = `${userId}/${Date.now()}.${fileExt}`

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, blob, { upsert: true })

            if (uploadError) {
                console.error('Erro no upload:', uploadError)
                localStorage.removeItem('pendingAvatar')
                return
            }

            // Obter URL pública
            const { data: urlData } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath)

            const avatarUrl = urlData.publicUrl

            // Usar UPSERT para criar ou atualizar o profile
            const { data: profileData, error: upsertError } = await supabase
                .from('profiles')
                .upsert({
                    id: userId,
                    avatar_url: avatarUrl,
                    atualizado_em: new Date().toISOString()
                }, {
                    onConflict: 'id'
                })
                .select()
                .single()

            if (!upsertError && profileData) {
                setProfile(profileData)
                console.log('Avatar enviado com sucesso!')
            } else if (upsertError) {
                console.error('Erro ao atualizar profile:', upsertError)
            }

            // Limpar localStorage
            localStorage.removeItem('pendingAvatar')
        } catch (error) {
            console.error('Erro ao fazer upload do avatar pendente:', error)
            localStorage.removeItem('pendingAvatar')
        }
    }

    // Registrar novo usuário
    async function signUp({ email, password, nome, dataNascimento, escola, serie }) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    nome,
                    data_nascimento: dataNascimento,
                    escola,
                    serie
                }
            }
        })

        return { data, error }
    }

    // Fazer login
    async function signIn({ email, password }) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        })
        return { data, error }
    }

    // Fazer logout
    async function signOut() {
        const { error } = await supabase.auth.signOut()
        if (!error) {
            setUser(null)
            setProfile(null)
            setIsAdmin(false)
        }
        return { error }
    }

    // Solicitar reset de senha
    async function resetPassword(email) {
        const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`
        })
        return { data, error }
    }

    // Atualizar senha
    async function updatePassword(newPassword) {
        const { data, error } = await supabase.auth.updateUser({
            password: newPassword
        })
        return { data, error }
    }

    // Atualizar perfil
    async function updateProfile(updates) {
        if (!user) return { data: null, error: 'Usuário não logado' }

        const { data, error } = await supabase
            .from('profiles')
            .update({ ...updates, atualizado_em: new Date().toISOString() })
            .eq('id', user.id)
            .select()
            .single()

        if (!error) {
            setProfile(data)
        }
        return { data, error }
    }

    // Upload de avatar
    async function uploadAvatar(file) {
        if (!user) return { url: null, error: 'Usuário não logado' }

        try {
            // Gerar nome único para o arquivo
            const fileExt = file.name.split('.').pop()
            const fileName = `${user.id}/${Date.now()}.${fileExt}`

            // Fazer upload para o bucket
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(fileName, file, { upsert: true })

            if (uploadError) {
                return { url: null, error: uploadError.message }
            }

            // Obter URL pública
            const { data: urlData } = supabase.storage
                .from('avatars')
                .getPublicUrl(fileName)

            const avatarUrl = urlData.publicUrl

            // Atualizar perfil com nova URL
            await updateProfile({ avatar_url: avatarUrl })

            return { url: avatarUrl, error: null }
        } catch (err) {
            return { url: null, error: err.message }
        }
    }

    const value = {
        user,
        profile,
        loading,
        isAdmin,
        signUp,
        signIn,
        signOut,
        resetPassword,
        updatePassword,
        updateProfile,
        uploadAvatar
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}
