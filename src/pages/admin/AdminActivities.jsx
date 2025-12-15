import { useEffect, useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import { useActivities } from '../../hooks/useActivities'
import { supabase } from '../../lib/supabase'
import {
    WizardLayout,
    GuardianSelector,
    LessonSelector,
    ActivityTypeSelector,
    getGuardianTheme
} from '../../components/admin/AdminComponents'

export function AdminActivities() {
    const { isAdmin, loading: authLoading } = useAuth()
    const { activities, loading, fetchAllActivities, createActivity, updateActivity, deleteActivity } = useActivities()
    const [guardians, setGuardians] = useState([])
    const [lessons, setLessons] = useState([])
    const [view, setView] = useState('list') // 'list' | 'wizard' | 'edit'
    const [editingActivity, setEditingActivity] = useState(null)
    const [message, setMessage] = useState({ type: '', text: '' })
    const [saving, setSaving] = useState(false)
    const navigate = useNavigate()

    // Wizard state
    const [wizardStep, setWizardStep] = useState(0)
    const [selectedGuardianId, setSelectedGuardianId] = useState('')
    const [formData, setFormData] = useState({
        lesson_id: '',
        tipo: 'quiz',
        pergunta: '',
        opcoes: ['', '', '', ''],
        resposta_quiz: 0,
        resposta_checkbox: [],
        resposta_fill: '',
        ordem: 1
    })

    const WIZARD_STEPS = [
        'Escolher Guardião',
        'Escolher Aula',
        'Tipo de Questão',
        'Criar Questão'
    ]

    useEffect(() => {
        if (isAdmin) {
            fetchAllActivities()
            fetchGuardians()
            fetchLessons()
        }
    }, [isAdmin, fetchAllActivities])

    async function fetchGuardians() {
        const { data } = await supabase
            .from('guardians')
            .select('*')
            .order('ordem_progressao')
        setGuardians(data || [])
    }

    async function fetchLessons() {
        const { data } = await supabase
            .from('lessons')
            .select('*, guardian:guardians(id, nome, area)')
            .order('titulo')
        setLessons(data || [])
    }

    useEffect(() => {
        if (!authLoading && !isAdmin) {
            navigate('/dashboard')
        }
    }, [authLoading, isAdmin, navigate])

    // Aulas filtradas pelo guardião selecionado
    const filteredLessons = useMemo(() => {
        if (!selectedGuardianId) return lessons
        return lessons.filter(l => l.guardian_id === selectedGuardianId)
    }, [lessons, selectedGuardianId])

    const handleStartCreate = () => {
        setFormData({
            lesson_id: '',
            tipo: 'quiz',
            pergunta: '',
            opcoes: ['', '', '', ''],
            resposta_quiz: 0,
            resposta_checkbox: [],
            resposta_fill: '',
            ordem: 1
        })
        setSelectedGuardianId('')
        setWizardStep(0)
        setEditingActivity(null)
        setView('wizard')
    }

    const handleEdit = (activity) => {
        setEditingActivity(activity)

        const opcoes = activity.dados?.opcoes || ['', '', '', '']
        while (opcoes.length < 4) opcoes.push('')

        setFormData({
            lesson_id: activity.lesson_id,
            tipo: activity.tipo,
            pergunta: activity.pergunta,
            opcoes,
            resposta_quiz: activity.resposta_correta?.indice || 0,
            resposta_checkbox: activity.resposta_correta?.indices || [],
            resposta_fill: activity.resposta_correta?.valor || '',
            ordem: activity.ordem
        })

        // Encontrar guardião da aula
        const lesson = lessons.find(l => l.id === activity.lesson_id)
        setSelectedGuardianId(lesson?.guardian_id || '')

        setWizardStep(3) // Vai direto para criar questão
        setView('edit')
    }

    const handleDelete = async (activityId) => {
        if (!confirm('Tem certeza que deseja excluir esta questão?')) return

        const { error } = await deleteActivity(activityId)
        if (error) {
            setMessage({ type: 'error', text: `Erro ao excluir: ${error}` })
        } else {
            setMessage({ type: 'success', text: 'Questão excluída com sucesso!' })
            fetchAllActivities()
        }
    }

    const handleCancel = () => {
        setView('list')
        setEditingActivity(null)
        setWizardStep(0)
    }

    const canProceed = () => {
        switch (wizardStep) {
            case 0: return !!selectedGuardianId
            case 1: return !!formData.lesson_id
            case 2: return !!formData.tipo
            case 3:
                if (!formData.pergunta.trim()) return false
                const opcoesFiltradas = formData.opcoes.filter(o => o.trim() !== '')
                if (formData.tipo !== 'fill_blank' && opcoesFiltradas.length < 2) return false
                return true
            default: return false
        }
    }

    const handleNext = async () => {
        if (wizardStep < WIZARD_STEPS.length - 1) {
            setWizardStep(prev => prev + 1)
        } else {
            await handleSubmit()
        }
    }

    const handleBack = () => {
        if (wizardStep > 0) {
            setWizardStep(prev => prev - 1)
        }
    }

    const handleOpcaoChange = (index, value) => {
        const newOpcoes = [...formData.opcoes]
        newOpcoes[index] = value
        setFormData({ ...formData, opcoes: newOpcoes })
    }

    const handleCheckboxToggle = (index) => {
        const current = formData.resposta_checkbox
        const newValue = current.includes(index)
            ? current.filter(i => i !== index)
            : [...current, index]
        setFormData({ ...formData, resposta_checkbox: newValue })
    }

    const handleSubmit = async () => {
        setSaving(true)
        setMessage({ type: '', text: '' })

        try {
            const opcoesFiltradas = formData.opcoes.filter(o => o.trim() !== '')

            let dados = {}
            let resposta_correta = {}

            switch (formData.tipo) {
                case 'quiz':
                    dados = { opcoes: opcoesFiltradas }
                    resposta_correta = { indice: formData.resposta_quiz }
                    break
                case 'checkbox':
                    dados = { opcoes: opcoesFiltradas }
                    resposta_correta = { indices: formData.resposta_checkbox }
                    break
                case 'fill_blank':
                    dados = { opcoes: opcoesFiltradas }
                    resposta_correta = { valor: formData.resposta_fill }
                    break
            }

            const activityData = {
                lesson_id: formData.lesson_id,
                tipo: formData.tipo,
                pergunta: formData.pergunta,
                dados,
                resposta_correta,
                ordem: formData.ordem
            }

            if (editingActivity) {
                const { error } = await updateActivity(editingActivity.id, activityData)
                if (error) throw new Error(error)
                setMessage({ type: 'success', text: 'Questão atualizada com sucesso!' })
            } else {
                const { error } = await createActivity(activityData)
                if (error) throw new Error(error)
                setMessage({ type: 'success', text: 'Questão criada com sucesso!' })
            }

            setView('list')
            setEditingActivity(null)
            fetchAllActivities()
        } catch (err) {
            setMessage({ type: 'error', text: err.message })
        } finally {
            setSaving(false)
        }
    }

    // Loading
    if (authLoading || loading) {
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

    // Access denied
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

    // Wizard View
    if (view === 'wizard' || view === 'edit') {
        return (
            <WizardLayout
                title={editingActivity ? 'Editar Questão' : 'Nova Questão'}
                steps={WIZARD_STEPS}
                currentStep={wizardStep}
                onBack={handleBack}
                onNext={handleNext}
                onCancel={handleCancel}
                canProceed={canProceed()}
                isLastStep={wizardStep === WIZARD_STEPS.length - 1}
                isSubmitting={saving}
            >
                {/* Step 0: Escolher Guardião */}
                {wizardStep === 0 && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Escolha o Guardião</h2>
                        <GuardianSelector
                            guardians={guardians}
                            selectedId={selectedGuardianId}
                            onSelect={(id) => {
                                setSelectedGuardianId(id)
                                setFormData({ ...formData, lesson_id: '' }) // Reset lesson
                            }}
                        />
                    </div>
                )}

                {/* Step 1: Escolher Aula */}
                {wizardStep === 1 && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-gray-800 mb-2">Escolha a Aula</h2>
                        <p className="text-gray-500 text-sm mb-4">Selecione a aula para adicionar a questão</p>
                        <LessonSelector
                            lessons={filteredLessons}
                            selectedId={formData.lesson_id}
                            onSelect={(id) => setFormData({ ...formData, lesson_id: id })}
                            guardianId={selectedGuardianId}
                        />
                    </div>
                )}

                {/* Step 2: Tipo de Questão */}
                {wizardStep === 2 && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-gray-800 mb-2">Tipo de Questão</h2>
                        <p className="text-gray-500 text-sm mb-4">Como o aluno irá responder?</p>
                        <ActivityTypeSelector
                            selected={formData.tipo}
                            onSelect={(tipo) => setFormData({ ...formData, tipo })}
                        />
                    </div>
                )}

                {/* Step 3: Criar Questão */}
                {wizardStep === 3 && (
                    <div className="space-y-4 pb-20">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Criar Questão</h2>

                        {/* Pergunta */}
                        <div>
                            <label className="text-sm font-medium text-gray-600 mb-1 block">
                                Pergunta {formData.tipo === 'fill_blank' && '(use ___ para o espaço em branco)'}
                            </label>
                            <textarea
                                value={formData.pergunta}
                                onChange={(e) => setFormData({ ...formData, pergunta: e.target.value })}
                                placeholder={formData.tipo === 'fill_blank'
                                    ? "Ex: O verbo 'correr' está no tempo ___."
                                    : "Ex: Qual é a capital do Brasil?"
                                }
                                rows={3}
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-400 transition-all resize-none"
                            />
                        </div>

                        {/* Opções (para quiz e checkbox) */}
                        {(formData.tipo === 'quiz' || formData.tipo === 'checkbox') && (
                            <div>
                                <label className="text-sm font-medium text-gray-600 mb-2 block">
                                    Opções de Resposta
                                </label>
                                <div className="space-y-2">
                                    {formData.opcoes.map((opcao, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            {formData.tipo === 'quiz' ? (
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, resposta_quiz: index })}
                                                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${formData.resposta_quiz === index
                                                            ? 'border-green-500 bg-green-500 text-white'
                                                            : 'border-gray-300'
                                                        }`}
                                                >
                                                    {formData.resposta_quiz === index && '✓'}
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => handleCheckboxToggle(index)}
                                                    className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${formData.resposta_checkbox.includes(index)
                                                            ? 'border-green-500 bg-green-500 text-white'
                                                            : 'border-gray-300'
                                                        }`}
                                                >
                                                    {formData.resposta_checkbox.includes(index) && '✓'}
                                                </button>
                                            )}
                                            <input
                                                type="text"
                                                value={opcao}
                                                onChange={(e) => handleOpcaoChange(index, e.target.value)}
                                                placeholder={`Opção ${index + 1}`}
                                                className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
                                            />
                                        </div>
                                    ))}
                                </div>
                                <p className="text-xs text-gray-400 mt-2">
                                    {formData.tipo === 'quiz'
                                        ? 'Clique no círculo para marcar a resposta correta'
                                        : 'Clique nos quadrados para marcar as respostas corretas'
                                    }
                                </p>
                            </div>
                        )}

                        {/* Resposta correta (para fill_blank) */}
                        {formData.tipo === 'fill_blank' && (
                            <>
                                <div>
                                    <label className="text-sm font-medium text-gray-600 mb-1 block">
                                        Resposta Correta
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.resposta_fill}
                                        onChange={(e) => setFormData({ ...formData, resposta_fill: e.target.value })}
                                        placeholder="Ex: presente"
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600 mb-2 block">
                                        Opções de Auto-preenchimento (opcional)
                                    </label>
                                    <div className="space-y-2">
                                        {formData.opcoes.map((opcao, index) => (
                                            <input
                                                key={index}
                                                type="text"
                                                value={opcao}
                                                onChange={(e) => handleOpcaoChange(index, e.target.value)}
                                                placeholder={`Opção ${index + 1}`}
                                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
                                            />
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Ordem */}
                        <div>
                            <label className="text-sm font-medium text-gray-600 mb-1 block">Ordem</label>
                            <input
                                type="number"
                                min="1"
                                value={formData.ordem}
                                onChange={(e) => setFormData({ ...formData, ordem: parseInt(e.target.value) || 1 })}
                                className="w-24 px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-400 transition-all text-center"
                            />
                        </div>
                    </div>
                )}
            </WizardLayout>
        )
    }

    // List View
    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-white shadow-sm">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link to="/admin" className="p-2 -ml-2 rounded-full hover:bg-gray-100">
                            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </Link>
                        <h1 className="text-xl font-bold text-gray-800">Atividades</h1>
                    </div>
                    <button
                        onClick={handleStartCreate}
                        className="bg-indigo-500 text-white px-4 py-2 rounded-xl font-bold hover:bg-indigo-600 transition-colors flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Nova
                    </button>
                </div>
            </header>

            {/* Messages */}
            <AnimatePresence>
                {message.text && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className={`max-w-4xl mx-auto px-4 py-3 mx-4 mt-4 rounded-xl ${message.type === 'error'
                                ? 'bg-red-50 text-red-600'
                                : 'bg-green-50 text-green-600'
                            }`}
                    >
                        {message.type === 'error' ? '❌' : '✅'} {message.text}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Activities List */}
            <main className="max-w-4xl mx-auto px-4 py-6 space-y-4">
                {activities.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="text-6xl mb-4">🎯</div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2">Nenhuma questão criada</h3>
                        <p className="text-gray-500 mb-6">Comece criando sua primeira questão!</p>
                        <button
                            onClick={handleStartCreate}
                            className="bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-600 transition-colors"
                        >
                            Criar Primeira Questão
                        </button>
                    </div>
                ) : (
                    activities.map(activity => {
                        const lesson = lessons.find(l => l.id === activity.lesson_id)
                        const theme = getGuardianTheme(lesson?.guardian?.area)

                        const tipoLabel = {
                            'quiz': '🎯 Quiz',
                            'checkbox': '☑️ Múltipla',
                            'fill_blank': '✏️ Preencher'
                        }

                        return (
                            <motion.div
                                key={activity.id}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-2xl shadow-sm overflow-hidden"
                            >
                                <div className="p-4">
                                    <div className="flex items-start gap-4">
                                        {/* Type indicator */}
                                        <div className={`w-12 h-12 rounded-xl ${theme.light} flex items-center justify-center shrink-0`}>
                                            <span className="text-xl">
                                                {activity.tipo === 'quiz' ? '🎯' : activity.tipo === 'checkbox' ? '☑️' : '✏️'}
                                            </span>
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-gray-800 line-clamp-2">{activity.pergunta}</h3>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {lesson?.titulo || 'Aula desconhecida'}
                                            </p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-600">
                                                    {tipoLabel[activity.tipo]}
                                                </span>
                                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                                                    Ordem: {activity.ordem}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                                        <button
                                            onClick={() => handleEdit(activity)}
                                            className="flex-1 py-3 px-4 bg-indigo-50 text-indigo-600 rounded-xl font-bold hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                            </svg>
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => handleDelete(activity.id)}
                                            className="py-3 px-4 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-colors"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )
                    })
                )}
            </main>
        </div>
    )
}
