import { createContext, useContext, useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

const NotificationContext = createContext({})

export const useNotifications = () => useContext(NotificationContext)

export function NotificationProvider({ children }) {
    const { user } = useAuth()
    const [notifications, setNotifications] = useState([])
    const [unreadCount, setUnreadCount] = useState(0)
    const audioContextRef = useRef(null)

    // Tocar som suave de "pop"
    const playNotificationSound = () => {
        try {
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)()
            }
            const ctx = audioContextRef.current
            const oscillator = ctx.createOscillator()
            const gainNode = ctx.createGain()

            oscillator.type = 'sine'
            oscillator.frequency.setValueAtTime(500, ctx.currentTime) // Frequência inicial
            oscillator.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.1) // Subida rápida

            gainNode.gain.setValueAtTime(0.1, ctx.currentTime) // Volume baixo
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5) // Fade out

            oscillator.connect(gainNode)
            gainNode.connect(ctx.destination)

            oscillator.start()
            oscillator.stop(ctx.currentTime + 0.5)
        } catch (e) {
            console.error('Erro ao tocar som:', e)
        }
    }

    // Carregar notificações iniciais
    useEffect(() => {
        if (!user) return

        const fetchNotifications = async () => {
            const { data } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            if (data) {
                setNotifications(data)
                setUnreadCount(data.filter(n => !n.read).length)
            }
        }

        fetchNotifications()

        // Inscrever no canal Realtime
        const channel = supabase
            .channel('public:notifications')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${user.id}`
                },
                (payload) => {
                    // Nova notificação recebida!
                    const newNotification = payload.new
                    setNotifications(prev => [newNotification, ...prev])
                    setUnreadCount(prev => prev + 1)
                    playNotificationSound()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [user])

    // Marcar todas como lidas
    const markAllAsRead = async () => {
        if (unreadCount === 0) return

        const { error } = await supabase
            .from('notifications')
            .update({ read: true })
            .eq('user_id', user.id)
            .eq('read', false)

        if (!error) {
            setNotifications(prev => prev.map(n => ({ ...n, read: true })))
            setUnreadCount(0)
        }
    }

    // Deletar notificação
    const deleteNotification = async (id) => {
        await supabase.from('notifications').delete().eq('id', id)
        setNotifications(prev => prev.filter(n => n.id !== id))
    }

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            markAllAsRead,
            deleteNotification
        }}>
            {children}
        </NotificationContext.Provider>
    )
}
