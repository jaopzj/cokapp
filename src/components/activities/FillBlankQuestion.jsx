import { useState } from 'react'

export function FillBlankQuestion({ activity, index, value = '', onChange, showResult, result }) {
    const opcoes = activity.dados?.opcoes || []
    const [useOptions, setUseOptions] = useState(true)

    // Renderiza a pergunta com destaque no blank
    const renderPergunta = () => {
        const parts = activity.pergunta.split('___')
        if (parts.length < 2) {
            return <span>{activity.pergunta}</span>
        }

        return (
            <>
                {parts[0]}
                <span style={{
                    padding: '3px 10px',
                    background: showResult
                        ? (result?.isCorrect ? '#d4edda' : '#f8d7da')
                        : (value ? '#e3f2fd' : '#fff3cd'),
                    borderRadius: '4px',
                    fontWeight: 'bold',
                    border: '1px dashed #999'
                }}>
                    {value || '______'}
                </span>
                {parts[1]}
            </>
        )
    }

    return (
        <div style={{
            padding: '20px',
            background: showResult
                ? (result?.isCorrect ? '#d4edda' : '#f8d7da')
                : '#fff',
            border: '1px solid #e0e0e0',
            borderRadius: '12px',
            marginBottom: '15px'
        }}>
            <p style={{ fontWeight: 'bold', marginBottom: '15px', lineHeight: '1.8' }}>
                {index + 1}. {renderPergunta()}
            </p>

            {showResult && !result?.isCorrect && (
                <p style={{ color: '#721c24', fontSize: '14px', marginBottom: '15px' }}>
                    Resposta correta: <strong>{result?.correctAnswer?.valor}</strong>
                </p>
            )}

            {!showResult && (
                <>
                    {/* Opções para selecionar */}
                    {opcoes.length > 0 && (
                        <div style={{ marginBottom: '15px' }}>
                            <p style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
                                Selecione uma opção:
                            </p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                {opcoes.map((opcao, i) => (
                                    <button
                                        key={i}
                                        type="button"
                                        onClick={() => onChange(opcao)}
                                        style={{
                                            padding: '10px 20px',
                                            background: value === opcao ? '#1976d2' : '#f5f5f5',
                                            color: value === opcao ? 'white' : '#333',
                                            border: 'none',
                                            borderRadius: '8px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {opcao}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Campo para digitar */}
                    <div>
                        <p style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
                            Ou digite sua resposta:
                        </p>
                        <input
                            type="text"
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            placeholder="Digite aqui..."
                            style={{
                                width: '100%',
                                padding: '12px',
                                border: '1px solid #ccc',
                                borderRadius: '8px',
                                fontSize: '16px'
                            }}
                        />
                    </div>
                </>
            )}
        </div>
    )
}
