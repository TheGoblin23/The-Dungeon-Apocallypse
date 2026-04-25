// Sistema de sonido basado en Web Audio API
const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;

// Inicializa el contexto de audio tras la primera interacción del usuario
function initAudio() {
    if (!audioCtx) {
        audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

export const Sonidos = {
    estaMuteado: () => localStorage.getItem("muted") === "true",

    toggleMute: () => {
        const estadoActual = Sonidos.estaMuteado();
        localStorage.setItem("muted", !estadoActual);
        return !estadoActual;
    },

    reproducir: (generadorSonido) => {
        if (Sonidos.estaMuteado()) return;
        initAudio();
        if (audioCtx) {
            generadorSonido(audioCtx);
        }
    },

    dados: () => {
        Sonidos.reproducir((ctx) => {
            const duration = 0.3;
            const osc = ctx.createOscillator();
            const gainNode = ctx.createGain();
            
            osc.type = 'square';
            osc.frequency.setValueAtTime(100, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + duration);
            
            gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
            
            osc.connect(gainNode);
            gainNode.connect(ctx.destination);
            
            osc.start();
            osc.stop(ctx.currentTime + duration);
        });
    },

    carta: () => {
        Sonidos.reproducir((ctx) => {
            const osc = ctx.createOscillator();
            const gainNode = ctx.createGain();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(400, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
            
            osc.connect(gainNode);
            gainNode.connect(ctx.destination);
            
            osc.start();
            osc.stop(ctx.currentTime + 0.1);
        });
    },

    golpe: () => {
        Sonidos.reproducir((ctx) => {
            const osc = ctx.createOscillator();
            const gainNode = ctx.createGain();
            
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(150, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.2);
            
            gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
            
            osc.connect(gainNode);
            gainNode.connect(ctx.destination);
            
            osc.start();
            osc.stop(ctx.currentTime + 0.2);
        });
    },

    curar: () => {
        Sonidos.reproducir((ctx) => {
            const osc = ctx.createOscillator();
            const gainNode = ctx.createGain();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(300, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.4);
            
            gainNode.gain.setValueAtTime(0, ctx.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.2);
            gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
            
            osc.connect(gainNode);
            gainNode.connect(ctx.destination);
            
            osc.start();
            osc.stop(ctx.currentTime + 0.4);
        });
    },

    victoria: () => {
        Sonidos.reproducir((ctx) => {
            const osc = ctx.createOscillator();
            const gainNode = ctx.createGain();
            
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(400, ctx.currentTime);
            osc.frequency.setValueAtTime(500, ctx.currentTime + 0.2);
            osc.frequency.setValueAtTime(600, ctx.currentTime + 0.4);
            
            gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
            gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6);
            
            osc.connect(gainNode);
            gainNode.connect(ctx.destination);
            
            osc.start();
            osc.stop(ctx.currentTime + 0.6);
        });
    },

    derrota: () => {
        Sonidos.reproducir((ctx) => {
            const osc = ctx.createOscillator();
            const gainNode = ctx.createGain();
            
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(300, ctx.currentTime);
            osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.8);
            
            gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
            gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8);
            
            osc.connect(gainNode);
            gainNode.connect(ctx.destination);
            
            osc.start();
            osc.stop(ctx.currentTime + 0.8);
        });
    },

    habilidad: () => {
        Sonidos.reproducir((ctx) => {
            const osc = ctx.createOscillator();
            const gainNode = ctx.createGain();
            
            osc.type = 'square';
            osc.frequency.setValueAtTime(600, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.3);
            
            gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
            
            osc.connect(gainNode);
            gainNode.connect(ctx.destination);
            
            osc.start();
            osc.stop(ctx.currentTime + 0.3);
        });
    }
};
