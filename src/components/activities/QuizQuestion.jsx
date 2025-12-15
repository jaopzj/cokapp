import { useState } from 'react'

export function QuizQuestion({ activity, index, value, onChange, showResult, result }) {
    const opcoes = activity.dados?.opcoes || []

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
            <p style={{ fontWeight: 'bold', marginBottom: '15px' }}>
                {index + 1}. {activity.pergunta}
            </p>

            <div style={{ display: 'grid', gap: '10px' }}>
                {opcoes.map((opcao, i) => {
                    const isSelected = value === i
                    const isCorrect = result?.correctAnswer?.indice === i

                    let bg = '#f5f5f5'
                    let border = '2px solid transparent'

                    if (showResult) {
                        if (isCorrect) {
                            bg = '#d4edda'
                            border = '2px solid #28a745'
                        } else if (isSelected && !isCorrect) {
                            bg = '#f8d7da'
                            border = '2px solid #dc3545'
                        }
                    } else if (isSelected) {
                        bg = '#e3f2fd'
                        border = '2px solid #1976d2'
                    }

                    return (
                        <label
                            key={i}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                padding: '12px 15px',
                                background: bg,
                                border: border,
                                borderRadius: '8px',
                                cursor: showResult ? 'default' : 'pointer'
                            }}
                        >
                            <input
                                type="radio"
                                name={`quiz-${activity.id}`}
                                checked={isSelected}
                                onChange={() => !showResult && onChange(i)}
                                disabled={showResult}
                            />
                            <span>{opcao}</span>
                            {showResult && isCorrect && <span style={{ marginLeft: 'auto' }}>✓</span>}
                        </label>
                    )
                })}
            </div>
        </div>
    )
}
