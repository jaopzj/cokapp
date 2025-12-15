import { motion, useMotionValue, useSpring } from 'framer-motion'
import { useEffect, useState } from 'react'

// Bolhas baseadas no design original
const bubbles = [
    // Amarelo creme GRANDE - canto inferior esquerdo
    { color: '#F5E6A3', size: 140, x: '-8%', y: '70%', delay: 0 },
    // Amarelo creme pequeno - canto superior esquerdo
    { color: '#F5E6A3', size: 45, x: '5%', y: '3%', delay: 0.5 },
    // Amarelo creme médio - canto inferior direito
    { color: '#F5E6A3', size: 60, x: '88%', y: '82%', delay: 1.2 },
    // Rosa claro GRANDE - canto direito superior
    { color: '#F4C4D4', size: 80, x: '92%', y: '18%', delay: 0.3 },
    // Azul claro pequeno - esquerda meio-baixo
    { color: '#A8D4E6', size: 35, x: '3%', y: '55%', delay: 0.8 },
    // Rosa/lilás pequeno - direita meio
    { color: '#E8D4F0', size: 28, x: '94%', y: '52%', delay: 2 },
]

export function FloatingBubbles() {
    const [permissionGranted, setPermissionGranted] = useState(false)

    // Motion values para o giroscópio
    const gyroX = useMotionValue(0)
    const gyroY = useMotionValue(0)

    // Suavizar o movimento com springs
    const springX = useSpring(gyroX, { stiffness: 50, damping: 20 })
    const springY = useSpring(gyroY, { stiffness: 50, damping: 20 })

    // Solicitar permissão no iOS ao primeiro toque na tela
    useEffect(() => {
        const requestPermission = async () => {
            if (typeof DeviceOrientationEvent !== 'undefined' &&
                typeof DeviceOrientationEvent.requestPermission === 'function') {
                try {
                    const permission = await DeviceOrientationEvent.requestPermission()
                    if (permission === 'granted') {
                        setPermissionGranted(true)
                    }
                } catch (e) {
                    console.log('Erro ao solicitar permissão de giroscópio', e)
                }
            } else {
                // Não é iOS 13+ ou não suporta giroscópio
                setPermissionGranted(true)
            }
        }

        // No iOS, precisa de interação do usuário para solicitar permissão
        const handleFirstInteraction = () => {
            requestPermission()
            // Remover listener após primeira interação
            document.removeEventListener('touchstart', handleFirstInteraction)
            document.removeEventListener('click', handleFirstInteraction)
        }

        // Verificar se já temos permissão ou não precisa
        if (typeof DeviceOrientationEvent !== 'undefined') {
            if (typeof DeviceOrientationEvent.requestPermission === 'function') {
                // iOS 13+ - precisa de interação
                document.addEventListener('touchstart', handleFirstInteraction, { once: true })
                document.addEventListener('click', handleFirstInteraction, { once: true })
            } else {
                // Outros dispositivos
                setPermissionGranted(true)
            }
        }

        return () => {
            document.removeEventListener('touchstart', handleFirstInteraction)
            document.removeEventListener('click', handleFirstInteraction)
        }
    }, [])

    // Configurar listener do giroscópio após permissão
    useEffect(() => {
        if (!permissionGranted) return

        const handleOrientation = (event) => {
            if (event.gamma !== null && event.beta !== null) {
                // Limitar o deslocamento a no máximo 15px
                const maxOffset = 15
                const x = Math.max(-maxOffset, Math.min(maxOffset, event.gamma * 0.5))
                const y = Math.max(-maxOffset, Math.min(maxOffset, (event.beta - 45) * 0.3))

                gyroX.set(x)
                gyroY.set(y)
            }
        }

        window.addEventListener('deviceorientation', handleOrientation, true)

        return () => {
            window.removeEventListener('deviceorientation', handleOrientation, true)
        }
    }, [permissionGranted, gyroX, gyroY])

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {bubbles.map((bubble, index) => (
                <motion.div
                    key={index}
                    className="absolute rounded-full"
                    style={{
                        width: bubble.size,
                        height: bubble.size,
                        left: bubble.x,
                        top: bubble.y,
                        background: bubble.color,
                        boxShadow: `0 0 ${bubble.size * 0.6}px ${bubble.size * 0.3}px ${bubble.color}40`,
                        x: springX,
                        y: springY,
                    }}
                    animate={{
                        y: [0, -12, 0],
                        x: [0, 5, 0],
                    }}
                    transition={{
                        duration: 6 + index * 0.5,
                        delay: bubble.delay,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                />
            ))}
        </div>
    )
}
