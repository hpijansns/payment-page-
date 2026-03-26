tailwind.config = {
    darkMode: 'media',
    theme: {
        extend: {
            animation: { 
                'qr-reveal': 'qrReveal 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards', 
                'radar-spin': 'radarSpin 2s linear infinite' 
            },
            keyframes: {
                qrReveal: { 
                    '0%': { transform: 'scale(0.85)', opacity: '0', filter: 'blur(5px)' }, 
                    '100%': { transform: 'scale(1)', opacity: '1', filter: 'blur(0)' } 
                },
                radarSpin: { 
                    '0%': { transform: 'rotate(0deg)' }, 
                    '100%': { transform: 'rotate(360deg)' } 
                }
            }
        }
    }
}
