import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useLessons } from '../hooks/useLessons'
import { useActivities } from '../hooks/useActivities'
import { BottomNav } from '../components/DashboardComponents'

// Cores por área
const AREA_COLORS = {
    'português': { bg: '#3B82F6', light: '#DBEAFE' },
    'matemática': { bg: '#EF4444', light: '#FEE2E2' },
    'humanas': { bg: '#F97316', light: '#FFEDD5' },
    'natureza': { bg: '#22C55E', light: '#DCFCE7' },
}

const getAreaColor = (area) => {
    const key = Object.keys(AREA_COLORS).find(k => area?.toLowerCase().includes(k))
    return AREA_COLORS[key] || { bg: '#6366F1', light: '#E0E7FF' }
}

// Extrair ID do YouTube
const getYouTubeId = (url) => {
    const match = url?.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
    return match ? match[1] : null
}

export function LessonView() {
    const { lessonId } = useParams()
    const navigate = useNavigate()
    const { getLessonById, checkLessonCompleted } = useLessons()
    const { activities, loading: activitiesLoading } = useActivities(lessonId)
    const [lesson, setLesson] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [alreadyCompleted, setAlreadyCompleted] = useState(false)
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0)

    useEffect(() => {
        async function fetchLesson() {
            setLoading(true)
            const { data, error } = await getLessonById(lessonId)
            if (error) {
                setError(error)
                setLoading(false)
                return
            }
            setLesson(data)
            const completed = await checkLessonCompleted(lessonId)
            setAlreadyCompleted(completed)
            setLoading(false)
        }
        fetchLesson()
    }, [lessonId, getLessonById, checkLessonCompleted])

    const colors = getAreaColor(lesson?.guardian?.area)
    const hasActivities = activities.length > 0
    const videos = lesson?.video_urls || []
    const images = lesson?.imagens || []

    if (loading) return <LoadingState />
    if (error || !lesson) return <ErrorState error={error} />

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Header Fixo */}
            <header className="sticky top-0 z-30 bg-white shadow-sm">
                <div className="flex items-center justify-between px-4 py-3">
                    <Link
                        to={`/lessons/${lesson.guardian_id}`}
                        className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </Link>
                    <div className="text-center flex-1">
                        <p className="text-xs text-gray-400 font-medium">{lesson.guardian?.area}</p>
                        <h1 className="text-sm font-bold text-gray-800 truncate max-w-[200px] mx-auto">{lesson.titulo}</h1>
                    </div>
                    <div className="w-10"></div>
                </div>

                {/* Progress Bar */}
                <div className="h-1 bg-gray-100">
                    <motion.div
                        className="h-full"
                        style={{ backgroundColor: colors.bg }}
                        initial={{ width: 0 }}
                        animate={{ width: alreadyCompleted ? '100%' : '50%' }}
                        transition={{ duration: 0.5 }}
                    />
                </div>
            </header>

            {/* Badge Revisão */}
            <AnimatePresence>
                {alreadyCompleted && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mx-4 mt-4 px-4 py-3 bg-green-50 border border-green-200 rounded-2xl flex items-center gap-3"
                    >
                        <span className="text-2xl">✅</span>
                        <div>
                            <p className="text-green-800 font-bold text-sm">Aula Concluída!</p>
                            <p className="text-green-600 text-xs">Você está revisando este conteúdo.</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Banner do Guardião */}
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mx-4 mt-4 p-5 rounded-3xl relative overflow-hidden"
                style={{ backgroundColor: colors.bg }}
            >
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-3xl">
                        {lesson.guardian?.area?.toLowerCase().includes('matemática') ? '📐' :
                            lesson.guardian?.area?.toLowerCase().includes('natureza') ? '🔬' :
                                lesson.guardian?.area?.toLowerCase().includes('humanas') ? '⚖️' :
                                    lesson.guardian?.area?.toLowerCase().includes('português') ? '📚' : '✨'}
                    </div>
                    <div className="flex-1">
                        <p className="text-white/80 text-xs font-medium uppercase">Aula {lesson.ordem} • Unidade {lesson.unidade || 1}</p>
                        <h2 className="text-white text-lg font-bold leading-tight">{lesson.titulo}</h2>
                    </div>
                </div>
            </motion.div>

            {/* Vídeo-aulas */}
            {videos.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mx-4 mt-6"
                >
                    <h3 className="text-gray-800 font-bold text-base mb-3 flex items-center gap-2">
                        <span>📹</span> Vídeo-aulas
                    </h3>

                    {videos.length > 1 && (
                        <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
                            {videos.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentVideoIndex(idx)}
                                    className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${idx === currentVideoIndex
                                        ? 'bg-gray-800 text-white'
                                        : 'bg-gray-200 text-gray-600'
                                        }`}
                                >
                                    Vídeo {idx + 1}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="bg-black rounded-2xl overflow-hidden aspect-video shadow-lg">
                        {getYouTubeId(videos[currentVideoIndex]) ? (
                            <iframe
                                src={`https://www.youtube.com/embed/${getYouTubeId(videos[currentVideoIndex])}`}
                                className="w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        ) : (
                            <video src={videos[currentVideoIndex]} controls className="w-full h-full" />
                        )}
                    </div>
                </motion.div>
            )}

            {/* Conteúdo Textual */}
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mx-4 mt-6"
            >
                <h3 className="text-gray-800 font-bold text-base mb-3 flex items-center gap-2">
                    <span>📖</span> Conteúdo
                </h3>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <div className="prose prose-gray max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {lesson.conteudo}
                    </div>
                </div>
            </motion.div>

            {/* Galeria de Imagens */}
            {images.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mx-4 mt-6"
                >
                    <h3 className="text-gray-800 font-bold text-base mb-3 flex items-center gap-2">
                        <span>🖼️</span> Imagens
                    </h3>
                    <div className="space-y-4">
                        {images.map((img, idx) => (
                            <div key={idx} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                                <img src={img.url} alt={`Imagem ${idx + 1}`} className="w-full" />
                                {img.creditos && (
                                    <p className="text-xs text-gray-400 px-4 py-2 bg-gray-50 italic">
                                        {img.creditos}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* CTA Final */}
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mx-4 mt-8 mb-6"
            >
                {alreadyCompleted ? (
                    <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6 text-center">
                        <div className="text-4xl mb-2">🎉</div>
                        <h3 className="text-green-800 font-bold text-lg">Você já dominou esta aula!</h3>
                        <p className="text-green-600 text-sm mt-1">Que tal revisar ou avançar para a próxima?</p>

                        <div className="flex gap-3 mt-5 justify-center">
                            {hasActivities && (
                                <button
                                    onClick={() => navigate(`/activity/${lessonId}`)}
                                    className="px-5 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-300 transition-colors"
                                >
                                    📝 Refazer Atividade
                                </button>
                            )}
                            <button
                                onClick={() => navigate(`/lessons/${lesson.guardian_id}`)}
                                className="px-5 py-3 bg-green-500 text-white rounded-xl font-bold text-sm hover:bg-green-600 transition-colors"
                            >
                                Próxima Aula →
                            </button>
                        </div>
                    </div>
                ) : hasActivities ? (
                    <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 text-center">
                        <div className="text-4xl mb-2">📝</div>
                        <h3 className="text-gray-800 font-bold text-lg">Pronto para testar seus conhecimentos?</h3>
                        <p className="text-gray-500 text-sm mt-1">Acerte 70% para ganhar o fragmento!</p>

                        {/* Recompensa */}
                        <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-full">
                            <span className="text-lg">✨</span>
                            <span className="text-amber-700 text-sm font-medium">
                                Receba 1x Fragmento {lesson.guardian?.area?.toLowerCase().includes('português') ? 'do Ar' :
                                    lesson.guardian?.area?.toLowerCase().includes('matemática') ? 'do Fogo' :
                                        lesson.guardian?.area?.toLowerCase().includes('natureza') ? 'da Água' :
                                            lesson.guardian?.area?.toLowerCase().includes('humanas') ? 'da Terra' : 'Místico'}
                            </span>
                        </div>

                        <button
                            onClick={() => navigate(`/activity/${lessonId}`)}
                            className="mt-5 w-full py-4 rounded-xl font-bold text-white text-base shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-transform"
                            style={{ backgroundColor: colors.bg }}
                        >
                            Fazer Atividade ({activities.length} questão{activities.length > 1 ? 'ões' : ''})
                        </button>
                    </div>
                ) : (
                    <div className="bg-gray-100 border-2 border-gray-200 rounded-2xl p-6 text-center">
                        <div className="text-4xl mb-2">⏳</div>
                        <h3 className="text-gray-600 font-bold">Atividade em breve!</h3>
                        <p className="text-gray-400 text-sm mt-1">Esta aula ainda não possui atividade.</p>

                        <button
                            onClick={() => navigate(`/lessons/${lesson.guardian_id}`)}
                            className="mt-5 px-6 py-3 bg-gray-300 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-400 transition-colors"
                        >
                            ← Voltar às Aulas
                        </button>
                    </div>
                )}
            </motion.div>

            <BottomNav />
        </div>
    )
}

function LoadingState() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                    className="text-4xl mb-3 inline-block"
                >
                    ⏳
                </motion.div>
                <p className="text-gray-500 font-medium">Carregando aula...</p>
            </div>
        </div>
    )
}

function ErrorState({ error }) {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <div className="text-center max-w-sm">
                <div className="text-5xl mb-4">😕</div>
                <h2 className="text-lg font-bold text-gray-800">Ops! Algo deu errado.</h2>
                <p className="text-gray-500 text-sm my-4">{error || 'Aula não encontrada'}</p>
                <Link
                    to="/guardians"
                    className="inline-block bg-blue-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-600 transition-colors"
                >
                    Voltar aos Guardiões
                </Link>
            </div>
        </div>
    )
}
