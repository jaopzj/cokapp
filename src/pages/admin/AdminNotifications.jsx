import { useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../../lib/supabase'

export function AdminNotifications() {
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        icon: '📢',
        color: '#3B82F6',
        filterSerie: 'todas'
    })
    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState(null)

    const ICONS = ['📢', '⚠️', '🎉', '🏆', '📅', '💡', '🔥', '🚀']
    const COLORS = [
        { name: 'Azul', value: '#3B82F6' },
        { name: 'Vermelho', value: '#EF4444' },
        { name: 'Verde', value: '#22C55E' },
        { name: 'Laranja', value: '#F97316' },
        { name: 'Roxo', value: '#A855F7' }
    ]

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setStatus(null)

        try {
            // Converter filtro para o formato esperado pela função SQL
            const serieParam = formData.filterSerie === 'todas' ? null : formData.filterSerie

            const { error } = await supabase.rpc('send_admin_notification', {
                p_title: formData.title,
                p_message: formData.message,
                p_icon: formData.icon,
                p_color: formData.color,
                p_filter_serie: serieParam
            })

            if (error) throw error

            setStatus({ type: 'success', msg: 'Notificações enviadas com sucesso! 🚀' })
            setFormData(prev => ({ ...prev, title: '', message: '' }))
        } catch (error) {
            console.error(error)
            setStatus({ type: 'error', msg: 'Erro ao enviar: ' + error.message })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-3xl font-bold text-gray-800">Enviar Notificações</h1>
                <p className="text-gray-600">Dispare alertas para todos os alunos ou grupos específicos.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Formulário */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
                >
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                            <input
                                required
                                type="text"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                placeholder="Ex: Manutenção no Sistema"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mensagem</label>
                            <textarea
                                required
                                rows={3}
                                value={formData.message}
                                onChange={e => setFormData({ ...formData, message: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                                placeholder="Ex: O sistema ficará instável hoje às 14h..."
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Ícone</label>
                                <div className="flex flex-wrap gap-2">
                                    {ICONS.map(icon => (
                                        <button
                                            key={icon}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, icon })}
                                            className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all ${formData.icon === icon ? 'bg-blue-100 border-2 border-blue-500' : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'}`}
                                        >
                                            {icon}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Cor</label>
                                <div className="flex flex-wrap gap-2">
                                    {COLORS.map(color => (
                                        <button
                                            key={color.value}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, color: color.value })}
                                            className={`w-10 h-10 rounded-full transition-all ${formData.color === color.value ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' : 'hover:scale-105'}`}
                                            style={{ backgroundColor: color.value }}
                                            title={color.name}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Destinatários</label>
                            <select
                                value={formData.filterSerie}
                                onChange={e => setFormData({ ...formData, filterSerie: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="todas">Todos os Alunos</option>
                                <option value="6">Apenas 6º Ano</option>
                                <option value="7">Apenas 7º Ano</option>
                                <option value="8">Apenas 8º Ano</option>
                                <option value="9">Apenas 9º Ano</option>
                            </select>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Enviando...' : 'Enviar Notificação 🚀'}
                        </button>

                        {status && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`p-4 rounded-lg text-center ${status.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                            >
                                {status.msg}
                            </motion.div>
                        )}
                    </form>
                </motion.div>

                {/* Preview em Tempo Real */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4"
                >
                    <h3 className="text-lg font-semibold text-gray-700">Preview (Como o aluno verá)</h3>

                    {/* Mock do Header */}
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                        <div className="flex gap-4 items-start">
                            <div
                                className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-sm"
                                style={{ backgroundColor: formData.color }}
                            >
                                <span className="text-2xl">{formData.icon}</span>
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-800">{formData.title || 'Título da Notificação'}</h4>
                                <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                                    {formData.message || 'O corpo da mensagem aparecerá aqui...'}
                                </p>
                                <span className="text-xs text-gray-400 mt-2 block">Agora</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-sm text-blue-700">
                        <p>ℹ️ <strong>Nota:</strong> Esta notificação será enviada via Trigger do Banco de Dados para <strong>{formData.filterSerie === 'todas' ? 'todos os alunos' : `alunos do ${formData.filterSerie}º ano`}</strong>.</p>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
