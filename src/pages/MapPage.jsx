import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { BottomNav } from '../components/DashboardComponents'

export function MapPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 flex flex-col pb-24">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-white/10 backdrop-blur-md px-6 py-4">
                <div className="flex items-center gap-3">
                    <Link to="/dashboard" className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </Link>
                    <h1 className="text-2xl font-extrabold text-white tracking-tight">Mapa</h1>
                </div>
            </header>

            {/* Conteúdo Central */}
            <main className="flex-1 flex flex-col items-center justify-center px-8 text-center">
                {/* Ícone animado */}
                <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', damping: 10, stiffness: 100 }}
                    className="mb-8"
                >
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-2xl shadow-orange-500/30">
                        <motion.span
                            className="text-6xl"
                            animate={{
                                y: [0, -5, 0],
                                rotate: [0, 5, -5, 0]
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: 'easeInOut'
                            }}
                        >
                            🗺️
                        </motion.span>
                    </div>
                </motion.div>

                {/* Estrelas decorativas */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {[...Array(20)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-1 h-1 bg-white rounded-full"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                            }}
                            animate={{
                                opacity: [0.2, 1, 0.2],
                                scale: [1, 1.5, 1],
                            }}
                            transition={{
                                duration: 2 + Math.random() * 2,
                                repeat: Infinity,
                                delay: Math.random() * 2,
                            }}
                        />
                    ))}
                </div>

                {/* Título */}
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-3xl font-extrabold text-white mb-4"
                >
                    Em Construção
                </motion.h2>

                {/* Mensagem */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-lg text-white/70 leading-relaxed max-w-sm"
                >
                    Estamos criando o mapa para você se aventurar!
                    <br />
                    <span className="text-amber-400 font-semibold">Por favor, aguarde pacientemente...</span>
                </motion.p>

                {/* Barra de progresso fake */}
                <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: '100%' }}
                    transition={{ delay: 0.7 }}
                    className="mt-8 max-w-xs w-full"
                >
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                            initial={{ width: '0%' }}
                            animate={{ width: '35%' }}
                            transition={{ delay: 1, duration: 2, ease: 'easeOut' }}
                        />
                    </div>
                    <p className="text-white/50 text-xs mt-2">35% concluído</p>
                </motion.div>

                {/* Botão voltar */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                    className="mt-10"
                >
                    <Link
                        to="/dashboard"
                        className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-8 rounded-2xl backdrop-blur-sm border border-white/20 transition-all hover:scale-105 active:scale-95"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Voltar ao Início
                    </Link>
                </motion.div>
            </main>

            <BottomNav />
        </div>
    )
}
