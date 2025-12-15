import { motion } from 'framer-motion'

// Importar imagens dos personagens
import cienciasImg from '../assets/guardians/ciencias.png'
import matematicaImg from '../assets/guardians/matematica.png'
import historiaImg from '../assets/guardians/historia.png'

export function GuardiansDisplay() {
    return (
        <div className="relative w-72 h-64 md:w-80 md:h-72 mx-auto">
            {/* Guardião esquerdo - Ciências (Einstein) - Círculo AZUL CLARO */}
            <div className="absolute left-0 top-[8%]">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                >
                    <motion.div
                        className="relative"
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                    >
                        {/* Badge - acima à esquerda */}
                        <div className="absolute -top-3 left-2 glass-badge px-4 py-1.5 rounded-full text-white text-sm font-medium z-10">
                            Ciências
                        </div>
                        {/* Círculo do avatar - AZUL CLARO - MAIOR */}
                        <div className="w-36 h-36 md:w-44 md:h-44 rounded-full bg-[#A8D8EA] border-4 border-white/30 flex items-center justify-center overflow-hidden shadow-lg shadow-[#A8D8EA]/30">
                            <img
                                src={cienciasImg}
                                alt="Guardião de Ciências"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </motion.div>
                </motion.div>
            </div>

            {/* Guardião direito - Matemática (Pitágoras) - Círculo ROSA */}
            <div className="absolute right-0 top-0">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <motion.div
                        className="relative"
                        animate={{ y: [0, -12, 0] }}
                        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                    >
                        {/* Badge - acima à direita */}
                        <div className="absolute -top-3 right-2 glass-badge px-4 py-1.5 rounded-full text-white text-sm font-medium z-10">
                            Matemática
                        </div>
                        {/* Círculo do avatar - ROSA - MAIOR */}
                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-[#F4C4D4] border-4 border-white/30 flex items-center justify-center overflow-hidden shadow-lg shadow-[#F4C4D4]/30">
                            <img
                                src={matematicaImg}
                                alt="Guardião de Matemática"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </motion.div>
                </motion.div>
            </div>

            {/* Badge "História" - centro com efeito vidro */}
            <motion.div
                className="absolute left-1/2 -translate-x-1/2 top-[42%] z-20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
            >
                <div className="glass-badge px-5 py-2 rounded-full">
                    <span className="text-white text-lg md:text-xl font-bold">História</span>
                </div>
            </motion.div>

            {/* Guardião centro-baixo - História (César) - Círculo AMARELO */}
            <div className="absolute left-1/2 -translate-x-1/2 bottom-0">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                >
                    <motion.div
                        className="relative"
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                    >
                        {/* Círculo do avatar - AMARELO - MAIOR */}
                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-[#F5E6A3] border-4 border-white/30 flex items-center justify-center overflow-hidden shadow-lg shadow-[#F5E6A3]/30">
                            <img
                                src={historiaImg}
                                alt="Guardião de História"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    )
}

