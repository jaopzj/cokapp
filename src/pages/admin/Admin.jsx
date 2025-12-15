import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'

export function Admin() {
    const { isAdmin, loading } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        if (!loading && !isAdmin) {
            navigate('/dashboard')
        }
    }, [loading, isAdmin, navigate])

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="text-4xl"
                >
                    ⏳
                </motion.div>
            </div>
        )
    }

    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
                <div className="text-6xl mb-4">🚫</div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">Acesso Negado</h2>
                <p className="text-gray-500 mb-6">Apenas administradores.</p>
                <Link to="/dashboard" className="bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold">
                    Voltar ao Início
                </Link>
            </div>
        )
    }

    return (
        <div className="max-w-5xl mx-auto py-12 px-6">
            <div className="flex justify-between items-center mb-10">
                <h1 className="text-3xl font-bold text-gray-800">🔧 Painel Admin</h1>
                <Link to="/dashboard" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Voltar ao Dashboard
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link
                    to="/admin/lessons"
                    className="group bg-white p-8 rounded-2xl shadow-sm border border-blue-200 hover:border-blue-400 hover:shadow-md transition-all flex flex-col items-start"
                >
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Gerenciar Micro-aulas</h2>
                    <p className="text-gray-500 text-sm">Criar, editar e excluir conteúdo didático.</p>
                </Link>

                <Link
                    to="/admin/activities"
                    className="group bg-white p-8 rounded-2xl shadow-sm border border-orange-200 hover:border-orange-400 hover:shadow-md transition-all flex flex-col items-start"
                >
                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 mb-4 group-hover:scale-110 transition-transform">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Gerenciar Atividades</h2>
                    <p className="text-gray-500 text-sm">Criar quizzes e exercícios para as aulas.</p>
                </Link>

                <Link
                    to="/admin/notifications"
                    className="group bg-white p-8 rounded-2xl shadow-sm border border-purple-200 hover:border-purple-400 hover:shadow-md transition-all flex flex-col items-start"
                >
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 mb-4 group-hover:scale-110 transition-transform">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Gerenciar Notificações</h2>
                    <p className="text-gray-500 text-sm">Enviar alertas push para os alunos.</p>
                </Link>

                <div className="bg-gray-50 p-8 rounded-2xl border border-gray-200 opacity-60 flex flex-col items-start cursor-not-allowed">
                    <div className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center text-gray-400 mb-4">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-400 mb-2">Gerenciar Usuários</h2>
                    <p className="text-gray-400 text-sm">Em breve...</p>
                </div>
            </div>
        </div>
    )
}
