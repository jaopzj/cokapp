import { useEffect, useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import { useLessons } from '../../hooks/useLessons'
import { supabase } from '../../lib/supabase'
import {
    WizardLayout,
    GuardianSelector,
    SeriesSelector,
    UnitSelector,
    PositionSelector,
    getGuardianTheme
} from '../../components/admin/AdminComponents'

export function AdminLessons() {
    const { isAdmin, loading: authLoading } = useAuth()
    const { lessons, loading, fetchAllLessons, createLesson, updateLesson, deleteLesson } = useLessons()
    const [guardians, setGuardians] = useState([])
    const [view, setView] = useState('list') // 'list' | 'wizard' | 'edit'
    const [editingLesson, setEditingLesson] = useState(null)
    const [message, setMessage] = useState({ type: '', text: '' })
    const [saving, setSaving] = useState(false)
    const navigate = useNavigate()

    // Wizard state
    const [wizardStep, setWizardStep] = useState(0)
    const [formData, setFormData] = useState({
        guardian_id: '',
        grupo_serie: 'todos',
        unidade: 1,
        ordem: 1,
        titulo: '',
        conteudo: '',
        ativo: true,
        video_urls: [],
        imagens: []
    })

    const WIZARD_STEPS = [
        'Escolher Guardião',
        'Série/Séries',
        'Unidade',
        'Posição',
        'Conteúdo'
    ]

    useEffect(() => {
        if (isAdmin) {
            fetchAllLessons()
            fetchGuardians()
        }
    }, [isAdmin, fetchAllLessons])

    async function fetchGuardians() {
        const { data } = await supabase
            .from('guardians')
            .select('*')
            .order('ordem_progressao')
        setGuardians(data || [])
    }

    useEffect(() => {
        if (!authLoading && !isAdmin) {
            navigate('/dashboard')
        }
    }, [authLoading, isAdmin, navigate])

    // Posições existentes para o guardião e unidade selecionados
    const existingPositions = useMemo(() => {
        return lessons
            .filter(l => l.guardian_id === formData.guardian_id && l.unidade === formData.unidade)
            .map(l => l.ordem)
            .sort((a, b) => a - b)
    }, [lessons, formData.guardian_id, formData.unidade])

    const handleStartCreate = () => {
        setFormData({
            guardian_id: '',
            grupo_serie: 'todos',
            unidade: 1,
            ordem: 1,
            titulo: '',
            conteudo: '',
            ativo: true,
            video_urls: [],
            imagens: []
        })
        setWizardStep(0)
        setEditingLesson(null)
        setView('wizard')
    }

    const handleEdit = (lesson) => {
        setEditingLesson(lesson)
        setFormData({
            guardian_id: lesson.guardian_id,
            grupo_serie: lesson.grupo_serie || 'todos',
            unidade: lesson.unidade || 1,
            ordem: lesson.ordem,
            titulo: lesson.titulo,
            conteudo: lesson.conteudo,
            ativo: lesson.ativo,
            video_urls: lesson.video_urls || [],
            imagens: lesson.imagens || []
        })
        setWizardStep(4) // Vai direto para o conteúdo
        setView('edit')
    }

    const handleDelete = async (lessonId) => {
        if (!confirm('Tem certeza que deseja excluir esta aula?')) return

        const { error } = await deleteLesson(lessonId)
        if (error) {
            setMessage({ type: 'error', text: `Erro ao excluir: ${error}` })
        } else {
            setMessage({ type: 'success', text: 'Aula excluída com sucesso!' })
            fetchAllLessons()
        }
    }

    const handleCancel = () => {
        setView('list')
        setEditingLesson(null)
        setWizardStep(0)
    }

    const canProceed = () => {
        switch (wizardStep) {
            case 0: return !!formData.guardian_id
            case 1: return !!formData.grupo_serie
            case 2: return formData.unidade >= 1
            case 3: return formData.ordem >= 1
            case 4: return formData.titulo.trim() !== '' && formData.conteudo.trim() !== ''
            default: return false
        }
    }

    const handleNext = async () => {
        if (wizardStep < WIZARD_STEPS.length - 1) {
            setWizardStep(prev => prev + 1)
        } else {
            // Submit
            await handleSubmit()
        }
    }

    const handleBack = () => {
        if (wizardStep > 0) {
            setWizardStep(prev => prev - 1)
        }
    }

    const handleSubmit = async () => {
        setSaving(true)
        setMessage({ type: '', text: '' })

        try {
            if (editingLesson) {
                const { error } = await updateLesson(editingLesson.id, formData)
                if (error) throw new Error(error)
                setMessage({ type: 'success', text: 'Aula atualizada com sucesso!' })
            } else {
                const { error } = await createLesson(formData)
                if (error) throw new Error(error)
                setMessage({ type: 'success', text: 'Aula criada com sucesso!' })
            }

            setView('list')
            setEditingLesson(null)
            fetchAllLessons()
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
                title={editingLesson ? 'Editar Aula' : 'Nova Micro-Aula'}
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
                            selectedId={formData.guardian_id}
                            onSelect={(id) => setFormData({ ...formData, guardian_id: id })}
                        />
                    </div>
                )}

                {/* Step 1: Série/Séries */}
                {wizardStep === 1 && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-gray-800 mb-2">Para qual série?</h2>
                        <p className="text-gray-500 text-sm mb-4">Selecione uma ou mais séries</p>
                        <SeriesSelector
                            selected={formData.grupo_serie}
                            onSelect={(value) => setFormData({ ...formData, grupo_serie: value })}
                        />
                    </div>
                )}

                {/* Step 2: Unidade */}
                {wizardStep === 2 && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-gray-800 mb-2">Qual unidade?</h2>
                        <p className="text-gray-500 text-sm mb-4">Escolha a unidade/módulo</p>
                        <UnitSelector
                            selected={formData.unidade}
                            onSelect={(value) => setFormData({ ...formData, unidade: value })}
                        />
                    </div>
                )}

                {/* Step 3: Posição */}
                {wizardStep === 3 && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-gray-800 mb-2">Posição na lista</h2>
                        <p className="text-gray-500 text-sm mb-4">Define a ordem de exibição</p>
                        <PositionSelector
                            value={formData.ordem}
                            onChange={(value) => setFormData({ ...formData, ordem: value })}
                            existingPositions={existingPositions}
                        />
                    </div>
                )}

                {/* Step 4: Conteúdo */}
                {wizardStep === 4 && (
                    <div className="space-y-6 pb-24">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Conteúdo da Aula</h2>

                        {/* Título */}
                        <div>
                            <label className="text-sm font-medium text-gray-600 mb-1 block">Título</label>
                            <input
                                type="text"
                                value={formData.titulo}
                                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                                placeholder="Ex: Introdução aos Verbos"
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
                            />
                        </div>

                        {/* Conteúdo */}
                        <div>
                            <label className="text-sm font-medium text-gray-600 mb-1 block">Conteúdo</label>
                            <textarea
                                value={formData.conteudo}
                                onChange={(e) => setFormData({ ...formData, conteudo: e.target.value })}
                                placeholder="Escreva o conteúdo da aula aqui..."
                                rows={8}
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-400 transition-all resize-none"
                            />
                        </div>

                        {/* Vídeos */}
                        <div className="bg-white border border-gray-200 rounded-2xl p-4">
                            <div className="flex items-center justify-between mb-3">
                                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                    🎬 Vídeos
                                    <span className="text-xs text-gray-400">({formData.video_urls?.length || 0})</span>
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setFormData({
                                        ...formData,
                                        video_urls: [...(formData.video_urls || []), '']
                                    })}
                                    className="text-sm text-indigo-600 font-medium hover:text-indigo-700"
                                >
                                    + Adicionar
                                </button>
                            </div>

                            {(formData.video_urls || []).length === 0 ? (
                                <p className="text-sm text-gray-400 text-center py-4">
                                    Nenhum vídeo adicionado
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    {formData.video_urls.map((url, index) => (
                                        <div key={index} className="flex gap-2">
                                            <input
                                                type="url"
                                                value={url}
                                                onChange={(e) => {
                                                    const newUrls = [...formData.video_urls]
                                                    newUrls[index] = e.target.value
                                                    setFormData({ ...formData, video_urls: newUrls })
                                                }}
                                                placeholder="https://youtube.com/..."
                                                className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-400"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newUrls = formData.video_urls.filter((_, i) => i !== index)
                                                    setFormData({ ...formData, video_urls: newUrls })
                                                }}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Imagens */}
                        <div className="bg-white border border-gray-200 rounded-2xl p-4">
                            <div className="flex items-center justify-between mb-3">
                                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                    🖼️ Imagens
                                    <span className="text-xs text-gray-400">({formData.imagens?.length || 0})</span>
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setFormData({
                                        ...formData,
                                        imagens: [...(formData.imagens || []), { url: '', descricao: '', creditos: '' }]
                                    })}
                                    className="text-sm text-indigo-600 font-medium hover:text-indigo-700"
                                >
                                    + Adicionar
                                </button>
                            </div>

                            {(formData.imagens || []).length === 0 ? (
                                <p className="text-sm text-gray-400 text-center py-4">
                                    Nenhuma imagem adicionada
                                </p>
                            ) : (
                                <div className="space-y-4">
                                    {formData.imagens.map((img, index) => (
                                        <div key={index} className="bg-gray-50 rounded-xl p-3 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-medium text-gray-500">Imagem {index + 1}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newImgs = formData.imagens.filter((_, i) => i !== index)
                                                        setFormData({ ...formData, imagens: newImgs })
                                                    }}
                                                    className="p-1 text-red-500 hover:bg-red-100 rounded"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                            <input
                                                type="url"
                                                value={img.url}
                                                onChange={(e) => {
                                                    const newImgs = [...formData.imagens]
                                                    newImgs[index] = { ...newImgs[index], url: e.target.value }
                                                    setFormData({ ...formData, imagens: newImgs })
                                                }}
                                                placeholder="URL da imagem"
                                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-400"
                                            />
                                            <input
                                                type="text"
                                                value={img.descricao}
                                                onChange={(e) => {
                                                    const newImgs = [...formData.imagens]
                                                    newImgs[index] = { ...newImgs[index], descricao: e.target.value }
                                                    setFormData({ ...formData, imagens: newImgs })
                                                }}
                                                placeholder="Descrição da imagem"
                                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-400"
                                            />
                                            <input
                                                type="text"
                                                value={img.creditos}
                                                onChange={(e) => {
                                                    const newImgs = [...formData.imagens]
                                                    newImgs[index] = { ...newImgs[index], creditos: e.target.value }
                                                    setFormData({ ...formData, imagens: newImgs })
                                                }}
                                                placeholder="Créditos (ex: Foto por João Silva)"
                                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-400"
                                            />
                                            {img.url && (
                                                <div className="mt-2 rounded-lg overflow-hidden bg-gray-200">
                                                    <img
                                                        src={img.url}
                                                        alt={img.descricao || 'Preview'}
                                                        className="w-full h-32 object-cover"
                                                        onError={(e) => e.target.style.display = 'none'}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Status */}
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                            <span className="text-gray-700 font-medium">Aula Ativa</span>
                            <button
                                onClick={() => setFormData({ ...formData, ativo: !formData.ativo })}
                                className={`w-14 h-8 rounded-full transition-colors ${formData.ativo ? 'bg-green-500' : 'bg-gray-300'
                                    }`}
                            >
                                <motion.div
                                    animate={{ x: formData.ativo ? 24 : 4 }}
                                    className="w-6 h-6 bg-white rounded-full shadow"
                                />
                            </button>
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
                        <h1 className="text-xl font-bold text-gray-800">Micro-Aulas</h1>
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

            {/* Lessons List */}
            <main className="max-w-4xl mx-auto px-4 py-6 space-y-4">
                {lessons.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="text-6xl mb-4">📚</div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2">Nenhuma aula criada</h3>
                        <p className="text-gray-500 mb-6">Comece criando sua primeira micro-aula!</p>
                        <button
                            onClick={handleStartCreate}
                            className="bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-600 transition-colors"
                        >
                            Criar Primeira Aula
                        </button>
                    </div>
                ) : (
                    lessons.map(lesson => {
                        const theme = getGuardianTheme(lesson.guardian?.area)
                        return (
                            <motion.div
                                key={lesson.id}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-2xl shadow-sm overflow-hidden"
                            >
                                <div className="p-4">
                                    <div className="flex items-start gap-4">
                                        {/* Guardian indicator */}
                                        <div className={`w-12 h-12 rounded-xl ${theme.light} flex items-center justify-center shrink-0`}>
                                            <span className={`text-lg font-bold ${theme.text}`}>{lesson.ordem}</span>
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-gray-800 truncate">{lesson.titulo}</h3>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {lesson.guardian?.nome} • Unidade {lesson.unidade || 1}
                                            </p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${lesson.ativo
                                                    ? 'bg-green-100 text-green-600'
                                                    : 'bg-gray-100 text-gray-500'
                                                    }`}>
                                                    {lesson.ativo ? 'Ativa' : 'Inativa'}
                                                </span>
                                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                                                    {lesson.grupo_serie === 'todos' ? 'Todas séries' : `${lesson.grupo_serie}º ano`}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                                        <button
                                            onClick={() => handleEdit(lesson)}
                                            className="flex-1 py-3 px-4 bg-indigo-50 text-indigo-600 rounded-xl font-bold hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                            </svg>
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => handleDelete(lesson.id)}
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
