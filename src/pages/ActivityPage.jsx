import { useEffect, useState, useRef } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useActivities } from '../hooks/useActivities'
import { useLessons } from '../hooks/useLessons'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

// Mapeamento de fragmentos por área
const FRAGMENT_NAMES = {
    'português': 'do Ar',
    'matemática': 'do Fogo',
    'natureza': 'da Água',
    'humanas': 'da Terra',
}

const FRAGMENT_EMOJIS = {
    'português': '💨',
    'matemática': '🔥',
    'natureza': '💧',
    'humanas': '🌍',
}

const getFragmentInfo = (area) => {
    const key = Object.keys(FRAGMENT_NAMES).find(k => area?.toLowerCase().includes(k))
    return {
        name: FRAGMENT_NAMES[key] || 'Místico',
        emoji: FRAGMENT_EMOJIS[key] || '✨'
    }
}

// Cores por área
const AREA_COLORS = {
    'português': '#3B82F6',
    'matemática': '#EF4444',
    'humanas': '#F97316',
    'natureza': '#22C55E',
}

const getAreaColor = (area) => {
    const key = Object.keys(AREA_COLORS).find(k => area?.toLowerCase().includes(k))
    return AREA_COLORS[key] || '#6366F1'
}

export function ActivityPage() {
    const { lessonId } = useParams()
    const navigate = useNavigate()
    const { user, profile } = useAuth()
    const { activities, loading: activitiesLoading, validateAnswers } = useActivities(lessonId)
    const { getLessonById, markLessonCompleted } = useLessons()

    const [lesson, setLesson] = useState(null)
    const [loading, setLoading] = useState(true)
    const [currentQuestion, setCurrentQuestion] = useState(0)
    const [answers, setAnswers] = useState({})
    const [showResult, setShowResult] = useState(false)
    const [result, setResult] = useState(null)
    const [showCelebration, setShowCelebration] = useState(false)
    const [isReviewMode, setIsReviewMode] = useState(false)

    const audioRef = useRef(null)

    useEffect(() => {
        async function fetchLesson() {
            const { data } = await getLessonById(lessonId)
            setLesson(data)
            setLoading(false)
        }
        fetchLesson()
    }, [lessonId, getLessonById])

    const handleAnswer = (questionIndex, answer) => {
        setAnswers(prev => ({ ...prev, [questionIndex]: answer }))
    }

    const handleSubmit = async () => {
        try {
            console.log('Submitting answers:', answers)
            console.log('Activities:', activities)

            const validationResult = validateAnswers(answers)
            console.log('Validation result:', validationResult)

            setResult(validationResult)

            if (validationResult.passed) {
                // Marcar aula como concluída e verificar se já estava concluída
                let wasAlreadyCompleted = false
                try {
                    const result = await markLessonCompleted(lessonId)
                    console.log('Lesson completed result:', result)
                    wasAlreadyCompleted = result?.alreadyCompleted || false
                } catch (e) {
                    console.error('Error completing lesson:', e)
                }

                // Adicionar fragmento APENAS se a aula NÃO estava concluída antes
                if (!wasAlreadyCompleted) {
                    const guardianId = lesson?.guardian_id
                    console.log('Adding fragment for guardian:', guardianId, 'user:', user?.id)

                    if (guardianId && user) {
                        try {
                            // Buscar fragment_id correspondente ao guardian
                            const { data: fragmentData, error: fragmentFetchError } = await supabase
                                .from('fragments')
                                .select('id')
                                .eq('guardian_id', guardianId)
                                .single()

                            if (fragmentFetchError) {
                                console.error('Error fetching fragment:', fragmentFetchError)
                            } else if (fragmentData) {
                                const fragmentId = fragmentData.id
                                console.log('Found fragment_id:', fragmentId)

                                // Verificar se já existe registro de user_fragments
                                const { data: existingUserFragment } = await supabase
                                    .from('user_fragments')
                                    .select('*')
                                    .eq('user_id', user.id)
                                    .eq('fragment_id', fragmentId)
                                    .maybeSingle()

                                if (existingUserFragment) {
                                    // Atualizar quantidade existente
                                    const newAmount = Math.min((existingUserFragment.quantidade_atual || 0) + 1, 15)
                                    const { error: updateError } = await supabase
                                        .from('user_fragments')
                                        .update({
                                            quantidade_atual: newAmount,
                                            updated_at: new Date().toISOString()
                                        })
                                        .eq('id', existingUserFragment.id)

                                    if (updateError) {
                                        console.error('Error updating fragment:', updateError)
                                    } else {
                                        console.log('Fragment updated to:', newAmount)
                                    }
                                } else {
                                    // Criar novo registro
                                    const { error: insertError } = await supabase
                                        .from('user_fragments')
                                        .insert({
                                            user_id: user.id,
                                            fragment_id: fragmentId,
                                            quantidade_atual: 1
                                        })

                                    if (insertError) {
                                        console.error('Error inserting fragment:', insertError)
                                    } else {
                                        console.log('Fragment inserted successfully')
                                    }
                                }
                            }
                        } catch (e) {
                            console.error('Error adding fragment:', e)
                        }
                    }
                } else {
                    console.log('Lesson was already completed, no fragment awarded')
                }

                // Mostrar celebração
                setIsReviewMode(wasAlreadyCompleted)
                setShowCelebration(true)
                playCelebrationSound()
            } else {
                setShowResult(true)
            }
        } catch (error) {
            console.error('handleSubmit error:', error)
            alert('Erro ao enviar: ' + error.message)
        }
    }

    const playCelebrationSound = () => {
        // Criar som de celebração usando Web Audio API
        const audioContext = new (window.AudioContext || window.webkitAudioContext)()

        // Notas de celebração (fanfarra)
        const notes = [523.25, 659.25, 783.99, 1046.50] // C5, E5, G5, C6

        notes.forEach((freq, i) => {
            const oscillator = audioContext.createOscillator()
            const gainNode = audioContext.createGain()

            oscillator.connect(gainNode)
            gainNode.connect(audioContext.destination)

            oscillator.frequency.value = freq
            oscillator.type = 'triangle'

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime + i * 0.15)
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.15 + 0.5)

            oscillator.start(audioContext.currentTime + i * 0.15)
            oscillator.stop(audioContext.currentTime + i * 0.15 + 0.5)
        })
    }

    // Verificar se uma questão foi respondida
    const hasAnswered = (index) => {
        const answer = answers[index]
        if (answer === undefined || answer === null) return false
        if (answer === '') return false
        if (Array.isArray(answer) && answer.length === 0) return false
        return true
    }

    const activity = activities[currentQuestion]
    const progress = activities.length > 0 ? ((currentQuestion + 1) / activities.length) * 100 : 0
    const fragmentInfo = getFragmentInfo(lesson?.guardian?.area)
    const areaColor = getAreaColor(lesson?.guardian?.area)
    const firstName = profile?.nome?.split(' ')[0] || 'Estudante'

    if (loading || activitiesLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-4xl">⏳</motion.div>
            </div>
        )
    }

    if (activities.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <div className="text-center">
                    <div className="text-5xl mb-4">📭</div>
                    <h2 className="text-lg font-bold text-gray-800">Sem atividades</h2>
                    <p className="text-gray-500 mt-2">Esta aula ainda não possui atividades.</p>
                    <Link to={`/lesson/${lessonId}`} className="mt-4 inline-block px-6 py-3 bg-blue-500 text-white rounded-xl font-bold">
                        Voltar
                    </Link>
                </div>
            </div>
        )
    }

    // Tela de Celebração
    if (showCelebration) {
        return <CelebrationScreen firstName={firstName} fragmentInfo={fragmentInfo} areaColor={areaColor} lesson={lesson} isReview={isReviewMode} />
    }

    // Tela de Resultado (não passou)
    if (showResult && result) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-xl"
                >
                    <div className="text-6xl mb-4">{result.passed ? '🎉' : '😔'}</div>
                    <h2 className="text-2xl font-bold text-gray-800">
                        {result.passed ? 'Parabéns!' : 'Quase lá!'}
                    </h2>
                    <p className="text-gray-600 mt-2">
                        Você acertou {result.correct} de {result.total} ({Math.round(result.percentage)}%)
                    </p>
                    <p className="text-gray-400 text-sm mt-1">
                        {result.passed ? 'Você ganhou o fragmento!' : 'Você precisa de 70% para passar.'}
                    </p>

                    <div className="flex gap-3 mt-6 justify-center">
                        <button
                            onClick={() => {
                                setAnswers({})
                                setCurrentQuestion(0)
                                setShowResult(false)
                                setResult(null)
                            }}
                            className="px-5 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold"
                        >
                            Tentar Novamente
                        </button>
                        <Link
                            to={`/lesson/${lessonId}`}
                            className="px-5 py-3 bg-blue-500 text-white rounded-xl font-bold"
                        >
                            Voltar à Aula
                        </Link>
                    </div>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-white shadow-sm">
                <div className="flex items-center justify-between px-4 py-3">
                    <Link to={`/lesson/${lessonId}`} className="p-2 -ml-2 rounded-full hover:bg-gray-100">
                        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </Link>
                    <div className="text-center flex-1">
                        <p className="text-xs text-gray-400 font-medium">Questão {currentQuestion + 1} de {activities.length}</p>
                    </div>
                    <div className="w-10"></div>
                </div>

                {/* Progress Bar */}
                <div className="h-2 bg-gray-100">
                    <motion.div
                        className="h-full"
                        style={{ backgroundColor: areaColor }}
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>
            </header>

            {/* Questão */}
            <main className="p-6">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentQuestion}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                    >
                        <h2 className="text-xl font-bold text-gray-800 mb-6">{activity.pergunta}</h2>

                        {/* Opções de resposta baseado no tipo */}
                        {activity.tipo === 'quiz' && (
                            <div className="space-y-3">
                                {activity.dados?.opcoes?.map((opcao, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleAnswer(currentQuestion, idx)}
                                        className={`w-full p-4 text-left rounded-2xl border-2 transition-all font-medium ${answers[currentQuestion] === idx
                                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                                            : 'border-gray-200 bg-white hover:border-gray-300'
                                            }`}
                                    >
                                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-600 font-bold text-sm mr-3">
                                            {String.fromCharCode(65 + idx)}
                                        </span>
                                        {opcao}
                                    </button>
                                ))}
                            </div>
                        )}

                        {activity.tipo === 'fill_blank' && (
                            <div className="space-y-4">
                                {/* Sentença com blank */}
                                <div className="bg-gray-100 p-4 rounded-2xl text-center">
                                    <p className="text-lg text-gray-700 leading-relaxed">
                                        {activity.dados?.sentenca?.split('___').map((part, idx, arr) => (
                                            <span key={idx}>
                                                {part}
                                                {idx < arr.length - 1 && (
                                                    <span className={`inline-block min-w-[80px] mx-1 px-3 py-1 rounded-lg font-bold ${answers[currentQuestion]
                                                        ? 'bg-blue-500 text-white'
                                                        : 'bg-gray-300 text-gray-500'
                                                        }`}>
                                                        {answers[currentQuestion] || '___'}
                                                    </span>
                                                )}
                                            </span>
                                        )) || activity.pergunta}
                                    </p>
                                </div>

                                {/* Opções de preenchimento */}
                                <div className="grid grid-cols-2 gap-3">
                                    {activity.dados?.opcoes?.map((opcao, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleAnswer(currentQuestion, opcao)}
                                            className={`p-4 text-center rounded-2xl border-2 transition-all font-medium ${answers[currentQuestion] === opcao
                                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                : 'border-gray-200 bg-white hover:border-gray-300'
                                                }`}
                                        >
                                            {opcao}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activity.tipo === 'checkbox' && (
                            <div className="space-y-3">
                                {activity.dados?.opcoes?.map((opcao, idx) => {
                                    const selected = answers[currentQuestion] || []
                                    const isSelected = selected.includes(idx)
                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => {
                                                const current = answers[currentQuestion] || []
                                                if (isSelected) {
                                                    handleAnswer(currentQuestion, current.filter(i => i !== idx))
                                                } else {
                                                    handleAnswer(currentQuestion, [...current, idx])
                                                }
                                            }}
                                            className={`w-full p-4 text-left rounded-2xl border-2 transition-all font-medium ${isSelected
                                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                : 'border-gray-200 bg-white hover:border-gray-300'
                                                }`}
                                        >
                                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded border-2 mr-3 ${isSelected ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-300'
                                                }`}>
                                                {isSelected && '✓'}
                                            </span>
                                            {opcao}
                                        </button>
                                    )
                                })}
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* Botões de navegação */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100">
                <div className="flex gap-3">
                    {currentQuestion > 0 && (
                        <button
                            onClick={() => setCurrentQuestion(prev => prev - 1)}
                            className="px-6 py-4 bg-gray-200 text-gray-700 rounded-xl font-bold"
                        >
                            ← Anterior
                        </button>
                    )}

                    {currentQuestion < activities.length - 1 ? (
                        <button
                            onClick={() => setCurrentQuestion(prev => prev + 1)}
                            disabled={!hasAnswered(currentQuestion)}
                            className={`flex-1 py-4 rounded-xl font-bold text-white transition-all ${hasAnswered(currentQuestion)
                                ? 'bg-blue-500 hover:bg-blue-600'
                                : 'bg-gray-300 cursor-not-allowed'
                                }`}
                        >
                            Próxima →
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={answers[currentQuestion] === undefined}
                            className={`flex-1 py-4 rounded-xl font-bold text-white transition-all ${answers[currentQuestion] !== undefined
                                ? 'bg-green-500 hover:bg-green-600'
                                : 'bg-gray-300 cursor-not-allowed'
                                }`}
                        >
                            Finalizar ✓
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

// Componente de Celebração
function CelebrationScreen({ firstName, fragmentInfo, areaColor, lesson, isReview }) {
    const navigate = useNavigate()
    const [phase, setPhase] = useState(0) // 0: drumroll, 1: reveal, 2: confetti
    const [confetti, setConfetti] = useState([])

    useEffect(() => {
        // Fase 1: Spotlight busca (drumroll)
        const timer1 = setTimeout(() => setPhase(1), 2000)
        // Fase 2: Revelação com confetti
        const timer2 = setTimeout(() => {
            setPhase(2)
            // Gerar confetti
            const pieces = []
            for (let i = 0; i < 50; i++) {
                pieces.push({
                    id: i,
                    x: Math.random() * 100,
                    delay: Math.random() * 0.5,
                    color: ['#FFD700', '#FF6B6B', '#4ECDC4', '#A855F7', '#3B82F6'][Math.floor(Math.random() * 5)]
                })
            }
            setConfetti(pieces)

            // Som de celebração
            playCelebration()
        }, 3500)

        return () => {
            clearTimeout(timer1)
            clearTimeout(timer2)
        }
    }, [])

    const playCelebration = () => {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)()
        const notes = [523.25, 659.25, 783.99, 1046.50]
        notes.forEach((freq, i) => {
            const osc = audioContext.createOscillator()
            const gain = audioContext.createGain()
            osc.connect(gain)
            gain.connect(audioContext.destination)
            osc.frequency.value = freq
            osc.type = 'triangle'
            gain.gain.setValueAtTime(0.3, audioContext.currentTime + i * 0.12)
            gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.12 + 0.4)
            osc.start(audioContext.currentTime + i * 0.12)
            osc.stop(audioContext.currentTime + i * 0.12 + 0.4)
        })
    }

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center overflow-hidden relative">
            {/* Confetti */}
            {phase >= 2 && confetti.map(piece => (
                <motion.div
                    key={piece.id}
                    initial={{ y: -20, x: `${piece.x}vw`, opacity: 1 }}
                    animate={{ y: '100vh', rotate: 360 * 3 }}
                    transition={{ duration: 3, delay: piece.delay, ease: 'linear' }}
                    className="absolute w-3 h-3 rounded-sm"
                    style={{ backgroundColor: piece.color, left: 0 }}
                />
            ))}

            {/* Spotlight */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{
                    opacity: phase >= 1 ? 0.8 : 0.3,
                    scale: phase >= 1 ? 1 : [1, 1.1, 1]
                }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0"
                style={{
                    background: `radial-gradient(circle at 50% 40%, ${areaColor}40 0%, transparent 50%)`
                }}
            />

            {/* Conteúdo Central */}
            <div className="text-center z-10 px-6">
                {phase < 1 && (
                    <motion.div
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ repeat: Infinity, duration: 0.5 }}
                        className="text-6xl mb-4"
                    >
                        🥁
                    </motion.div>
                )}

                {phase >= 1 && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', damping: 10 }}
                    >
                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                            className="text-8xl mb-6"
                        >
                            {fragmentInfo.emoji}
                        </motion.div>

                        {phase >= 2 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <h1 className="text-3xl font-bold text-white mb-2">
                                    Parabéns, {firstName}!
                                </h1>
                                <p className="text-white/80 text-lg">
                                    {isReview
                                        ? "Você é o mestre da revisão! 📚"
                                        : `Você conquistou 1x Fragmento ${fragmentInfo.name}!`
                                    }
                                </p>

                                <motion.button
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 1 }}
                                    onClick={() => navigate(`/lessons/${lesson?.guardian_id}`)}
                                    className="mt-8 px-8 py-4 bg-white text-gray-800 rounded-2xl font-bold text-lg shadow-xl hover:scale-105 transition-transform"
                                >
                                    Continuar →
                                </motion.button>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </div>
        </div>
    )
}
