import { motion, AnimatePresence } from 'framer-motion'

// Importar imagens mini dos guardiões
import miniPortugues from '../../assets/dashboard/guardians-mini/portugues.png'
import miniMatematica from '../../assets/dashboard/guardians-mini/matematica.png'
import miniHumanas from '../../assets/dashboard/guardians-mini/humanas.png'
import miniNatureza from '../../assets/dashboard/guardians-mini/natureza.png'

// Mapeamento de imagens e cores por área
const GUARDIAN_THEMES = {
    'Português': {
        image: miniPortugues,
        color: 'bg-blue-500',
        light: 'bg-blue-50',
        border: 'border-blue-500',
        text: 'text-blue-600',
        gradient: 'from-blue-500 to-blue-600'
    },
    'Matemática': {
        image: miniMatematica,
        color: 'bg-red-500',
        light: 'bg-red-50',
        border: 'border-red-500',
        text: 'text-red-600',
        gradient: 'from-red-500 to-red-600'
    },
    'Humanas': {
        image: miniHumanas,
        color: 'bg-orange-500',
        light: 'bg-orange-50',
        border: 'border-orange-500',
        text: 'text-orange-600',
        gradient: 'from-orange-500 to-orange-600'
    },
    'Natureza': {
        image: miniNatureza,
        color: 'bg-green-500',
        light: 'bg-green-50',
        border: 'border-green-500',
        text: 'text-green-600',
        gradient: 'from-green-500 to-green-600'
    },
}

export function getGuardianTheme(area) {
    const key = Object.keys(GUARDIAN_THEMES).find(k => area?.includes(k))
    return GUARDIAN_THEMES[key] || GUARDIAN_THEMES['Português']
}

// Componente de seleção de Guardião
export function GuardianSelector({ guardians, selectedId, onSelect }) {
    return (
        <div className="grid grid-cols-2 gap-4">
            {guardians.map(guardian => {
                const theme = getGuardianTheme(guardian.area)
                const isSelected = selectedId === guardian.id

                return (
                    <motion.button
                        key={guardian.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onSelect(guardian.id)}
                        className={`relative p-4 rounded-2xl border-2 transition-all ${isSelected
                                ? `${theme.border} ${theme.light} shadow-lg`
                                : 'border-gray-200 bg-white hover:border-gray-300'
                            }`}
                    >
                        {/* Indicador de seleção */}
                        {isSelected && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className={`absolute top-2 right-2 w-6 h-6 rounded-full ${theme.color} flex items-center justify-center`}
                            >
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            </motion.div>
                        )}

                        {/* Imagem */}
                        <div className={`w-16 h-16 mx-auto rounded-xl ${theme.light} p-2 mb-3`}>
                            <img
                                src={theme.image}
                                alt={guardian.nome}
                                className="w-full h-full object-contain"
                            />
                        </div>

                        {/* Nome e Área */}
                        <h4 className={`font-bold text-sm ${isSelected ? theme.text : 'text-gray-700'}`}>
                            {guardian.nome}
                        </h4>
                        <p className="text-xs text-gray-400 mt-1">{guardian.area}</p>
                    </motion.button>
                )
            })}
        </div>
    )
}

// Componente de layout do Wizard
export function WizardLayout({
    title,
    steps,
    currentStep,
    onBack,
    onNext,
    onCancel,
    canProceed = true,
    isLastStep = false,
    isSubmitting = false,
    children
}) {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-white shadow-sm">
                <div className="max-w-2xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between mb-4">
                        <button
                            onClick={onCancel}
                            className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <h1 className="text-lg font-bold text-gray-800">{title}</h1>
                        <div className="w-10" /> {/* Spacer */}
                    </div>

                    {/* Progress Steps */}
                    <div className="flex items-center justify-center gap-2">
                        {steps.map((step, index) => (
                            <div key={index} className="flex items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${index < currentStep
                                        ? 'bg-green-500 text-white'
                                        : index === currentStep
                                            ? 'bg-indigo-500 text-white'
                                            : 'bg-gray-200 text-gray-400'
                                    }`}>
                                    {index < currentStep ? (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : (
                                        index + 1
                                    )}
                                </div>
                                {index < steps.length - 1 && (
                                    <div className={`w-8 h-1 mx-1 rounded ${index < currentStep ? 'bg-green-500' : 'bg-gray-200'
                                        }`} />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Step Label */}
                    <p className="text-center text-sm text-gray-500 mt-2">{steps[currentStep]}</p>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-2xl mx-auto px-4 py-6">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                    >
                        {children}
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* Footer Navigation */}
            <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4">
                <div className="max-w-2xl mx-auto flex gap-3">
                    {currentStep > 0 && (
                        <button
                            onClick={onBack}
                            className="flex-1 py-4 px-6 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                        >
                            ← Voltar
                        </button>
                    )}
                    <button
                        onClick={onNext}
                        disabled={!canProceed || isSubmitting}
                        className={`flex-1 py-4 px-6 rounded-xl font-bold transition-all ${canProceed && !isSubmitting
                                ? 'bg-indigo-500 text-white hover:bg-indigo-600 shadow-lg'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        {isSubmitting ? (
                            <span className="flex items-center justify-center gap-2">
                                <motion.span
                                    animate={{ rotate: 360 }}
                                    transition={{ repeat: Infinity, duration: 1 }}
                                >
                                    ⏳
                                </motion.span>
                                Salvando...
                            </span>
                        ) : isLastStep ? (
                            '✓ Salvar'
                        ) : (
                            'Próximo →'
                        )}
                    </button>
                </div>
            </footer>
        </div>
    )
}

// Seletor de Séries
export function SeriesSelector({ selected, onSelect, multiple = true }) {
    const series = [
        { value: '6', label: '6º Ano' },
        { value: '7', label: '7º Ano' },
        { value: '8', label: '8º Ano' },
        { value: '9', label: '9º Ano' },
        { value: 'todos', label: 'Todas as Séries' },
    ]

    const handleToggle = (value) => {
        if (value === 'todos') {
            onSelect('todos')
            return
        }

        if (selected === 'todos') {
            onSelect(value)
            return
        }

        if (multiple) {
            const current = selected.split(',').filter(s => s && s !== 'todos')
            if (current.includes(value)) {
                const newValue = current.filter(s => s !== value).join(',') || 'todos'
                onSelect(newValue)
            } else {
                onSelect([...current, value].join(','))
            }
        } else {
            onSelect(value)
        }
    }

    const isSelected = (value) => {
        if (value === 'todos') return selected === 'todos'
        return selected?.includes(value)
    }

    return (
        <div className="grid grid-cols-2 gap-3">
            {series.map(serie => (
                <motion.button
                    key={serie.value}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleToggle(serie.value)}
                    className={`p-4 rounded-2xl border-2 font-bold transition-all ${isSelected(serie.value)
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-600'
                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                        } ${serie.value === 'todos' ? 'col-span-2' : ''}`}
                >
                    {isSelected(serie.value) && (
                        <span className="mr-2">✓</span>
                    )}
                    {serie.label}
                </motion.button>
            ))}
        </div>
    )
}

// Seletor de Unidade
export function UnitSelector({ selected, onSelect }) {
    const units = [1, 2, 3, 4]

    return (
        <div className="grid grid-cols-4 gap-3">
            {units.map(unit => (
                <motion.button
                    key={unit}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onSelect(unit)}
                    className={`aspect-square rounded-2xl border-2 font-bold text-xl transition-all ${selected === unit
                            ? 'border-indigo-500 bg-indigo-500 text-white shadow-lg'
                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                        }`}
                >
                    {unit}
                </motion.button>
            ))}
        </div>
    )
}

// Seletor de Posição/Ordem
export function PositionSelector({ value, onChange, existingPositions = [] }) {
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => onChange(Math.max(1, value - 1))}
                    className="w-14 h-14 rounded-xl bg-gray-100 text-gray-600 font-bold text-xl hover:bg-gray-200 transition-colors"
                >
                    −
                </button>
                <div className="flex-1 text-center">
                    <input
                        type="number"
                        min="1"
                        value={value}
                        onChange={(e) => onChange(parseInt(e.target.value) || 1)}
                        className="w-20 text-center text-3xl font-bold text-indigo-600 bg-transparent border-none outline-none"
                    />
                    <p className="text-sm text-gray-400">Posição na lista</p>
                </div>
                <button
                    onClick={() => onChange(value + 1)}
                    className="w-14 h-14 rounded-xl bg-gray-100 text-gray-600 font-bold text-xl hover:bg-gray-200 transition-colors"
                >
                    +
                </button>
            </div>

            {existingPositions.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-2">Posições existentes:</p>
                    <div className="flex flex-wrap gap-2">
                        {existingPositions.map(pos => (
                            <span
                                key={pos}
                                className={`px-3 py-1 rounded-full text-sm font-medium ${pos === value
                                        ? 'bg-indigo-100 text-indigo-600'
                                        : 'bg-gray-200 text-gray-600'
                                    }`}
                            >
                                {pos}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

// Seletor de Tipo de Atividade
export function ActivityTypeSelector({ selected, onSelect }) {
    const types = [
        {
            value: 'quiz',
            label: 'Quiz',
            emoji: '🎯',
            description: 'Escolha única entre opções'
        },
        {
            value: 'checkbox',
            label: 'Múltipla Escolha',
            emoji: '☑️',
            description: 'Selecionar várias opções'
        },
        {
            value: 'fill_blank',
            label: 'Preencher',
            emoji: '✏️',
            description: 'Completar espaço em branco'
        },
    ]

    return (
        <div className="space-y-3">
            {types.map(type => (
                <motion.button
                    key={type.value}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onSelect(type.value)}
                    className={`w-full p-4 rounded-2xl border-2 text-left transition-all flex items-center gap-4 ${selected === type.value
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                >
                    <span className="text-3xl">{type.emoji}</span>
                    <div>
                        <h4 className={`font-bold ${selected === type.value ? 'text-indigo-600' : 'text-gray-700'}`}>
                            {type.label}
                        </h4>
                        <p className="text-sm text-gray-400">{type.description}</p>
                    </div>
                    {selected === type.value && (
                        <div className="ml-auto w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                    )}
                </motion.button>
            ))}
        </div>
    )
}

// Seletor de Aula
export function LessonSelector({ lessons, selectedId, onSelect, guardianId }) {
    const filteredLessons = guardianId
        ? lessons.filter(l => l.guardian_id === guardianId)
        : lessons

    if (filteredLessons.length === 0) {
        return (
            <div className="text-center py-8 text-gray-400">
                <p className="text-4xl mb-2">📭</p>
                <p>Nenhuma aula encontrada para este guardião.</p>
            </div>
        )
    }

    return (
        <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredLessons.map(lesson => (
                <motion.button
                    key={lesson.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onSelect(lesson.id)}
                    className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${selectedId === lesson.id
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className={`font-bold ${selectedId === lesson.id ? 'text-indigo-600' : 'text-gray-700'}`}>
                                {lesson.titulo}
                            </h4>
                            <p className="text-xs text-gray-400 mt-1">
                                Unidade {lesson.unidade || 1} • Ordem {lesson.ordem}
                            </p>
                        </div>
                        {selectedId === lesson.id && (
                            <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        )}
                    </div>
                </motion.button>
            ))}
        </div>
    )
}
