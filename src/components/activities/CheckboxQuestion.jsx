export function CheckboxQuestion({ activity, index, value = [], onChange, showResult, result }) {
    const opcoes = activity.dados?.opcoes || []

    const handleToggle = (i) => {
        if (showResult) return

        const newValue = value.includes(i)
            ? value.filter(v => v !== i)
            : [...value, i]

        onChange(newValue)
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
            <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                {index + 1}. {activity.pergunta}
            </p>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
                (Selecione todas as opções corretas)
            </p>

            <div style={{ display: 'grid', gap: '10px' }}>
                {opcoes.map((opcao, i) => {
                    const isSelected = value.includes(i)
                    const isCorrect = result?.correctAnswer?.indices?.includes(i)

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
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleToggle(i)}
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
