export const effects = {
    typewriter: {
        name: 'Typewriter',
        render: (ctx, char, x, y, charProgress, fontSize, width, height, charIndex) => {
            ctx.globalAlpha = charProgress > 0 ? 1 : 0;
            ctx.fillText(char, x, y);
        }
    },
    fade: {
        name: 'Fade In',
        render: (ctx, char, x, y, charProgress, fontSize, width, height, charIndex) => {
            ctx.globalAlpha = charProgress;
            ctx.fillText(char, x, y);
        }
    },
    slideUp: {
        name: 'Slide Up',
        render: (ctx, char, x, y, charProgress, fontSize, width, height, charIndex) => {
            const ease = 1 - Math.pow(1 - charProgress, 3);
            ctx.globalAlpha = charProgress;
            ctx.fillText(char, x, y + (1 - ease) * (fontSize * 0.8));
        }
    },
    popIn: {
        name: 'Pop In',
        render: (ctx, char, x, y, charProgress, fontSize, width, height, charIndex) => {
            const c1 = 1.70158;
            const c3 = c1 + 1;
            const ease = charProgress === 1 ? 1 : 1 + c3 * Math.pow(charProgress - 1, 3) + c1 * Math.pow(charProgress - 1, 2);
            ctx.globalAlpha = charProgress;
            ctx.translate(x, y);
            ctx.scale(Math.max(0, ease), Math.max(0, ease));
            ctx.fillText(char, 0, 0);
        }
    },
    blur: {
        name: 'Blur Reveal',
        render: (ctx, char, x, y, charProgress, fontSize, width, height, charIndex) => {
            const blurAmount = (1 - charProgress) * (fontSize * 0.2);
            ctx.filter = `blur(${blurAmount}px)`;
            ctx.globalAlpha = charProgress;
            ctx.fillText(char, x, y);
        }
    },
    glitch: {
        name: 'Cyber Glitch',
        render: (ctx, char, x, y, charProgress, fontSize, width, height, charIndex, textColor) => {
            if (charProgress < 1) {
                const noise = Math.random();
                const shiftX = (Math.random() - 0.5) * fontSize * 0.3;
                const shiftY = (Math.random() - 0.5) * fontSize * 0.1;

                if (noise > 0.7) {
                    ctx.fillStyle = '#ff003c';
                    ctx.fillText(char, x + shiftX + 4, y + shiftY);
                    ctx.fillStyle = '#00f0ff';
                    ctx.fillText(char, x + shiftX - 4, y + shiftY);
                }
                ctx.fillStyle = textColor;
                ctx.globalAlpha = Math.random() * 0.5 + 0.5;
                ctx.fillText(char, x + shiftX, y + shiftY);
            } else {
                ctx.fillText(char, x, y);
            }
        }
    },
    elasticDrop: {
        name: 'Elastic Drop',
        render: (ctx, char, x, y, charProgress, fontSize, width, height, charIndex) => {
            const p = charProgress;
            const c4 = (2 * Math.PI) / 3;
            const ease = p === 0 ? 0 : p === 1 ? 1 : Math.pow(2, -10 * p) * Math.sin((p * 10 - 0.75) * c4) + 1;
            ctx.globalAlpha = Math.min(1, p * 3);
            ctx.fillText(char, x, y - (height / 2) * (1 - ease));
        }
    },
    trackingIn: {
        name: 'Cinematic Tracking',
        render: (ctx, char, x, y, charProgress, fontSize, width, height, charIndex) => {
            const ease = 1 - Math.pow(1 - charProgress, 4);
            const centerX = width / 2;
            const distFromCenter = x - centerX;
            const currentX = centerX + distFromCenter * (1 + (1 - ease) * 3);
            ctx.globalAlpha = charProgress;
            ctx.filter = `blur(${(1-ease)*8}px)`;
            ctx.fillText(char, currentX, y);
        }
    },
    focusBlur: {
        name: 'Focus Pull',
        render: (ctx, char, x, y, charProgress, fontSize, width, height, charIndex) => {
            const ease = 1 - Math.pow(1 - charProgress, 3);
            const blur = (1 - ease) * 20;
            ctx.globalAlpha = charProgress;
            ctx.filter = `blur(${blur}px)`;
            ctx.translate(x, y);
            ctx.scale(1 + (1-ease)*2, 1 + (1-ease)*2);
            ctx.fillText(char, 0, 0);
        }
    },
    wave: {
        name: 'Sine Wave',
        render: (ctx, char, x, y, charProgress, fontSize, width, height, charIndex, textColor, progress) => {
            const ease = 1 - Math.pow(1 - charProgress, 3);
            ctx.globalAlpha = charProgress;
            const waveY = Math.sin(charIndex * 0.5 + progress * Math.PI * 10) * (fontSize * 0.5) * (1 - ease);
            ctx.fillText(char, x, y + waveY);
        }
    },
    shatterIn: {
        name: 'Shatter In',
        render: (ctx, char, x, y, charProgress, fontSize, width, height, charIndex) => {
            const ease = 1 - Math.pow(1 - charProgress, 3);
            const randX = Math.abs(Math.sin(charIndex * 12.9898) * 43758.5453) % 1;
            const randY = Math.abs(Math.cos(charIndex * 78.233) * 43758.5453) % 1;
            const randRot = Math.abs(Math.sin(charIndex * 45.123) * 43758.5453) % 1;
            const startOffsetX = (randX - 0.5) * width;
            const startOffsetY = (randY - 0.5) * height;
            const startRot = (randRot - 0.5) * Math.PI * 4;
            ctx.globalAlpha = charProgress;
            ctx.translate(x + startOffsetX * (1 - ease), y + startOffsetY * (1 - ease));
            ctx.rotate(startRot * (1 - ease));
            ctx.fillText(char, 0, 0);
        }
    },
    neonFlicker: {
        name: 'Neon Flicker',
        render: (ctx, char, x, y, charProgress, fontSize, width, height, charIndex, textColor) => {
            if (charProgress < 1) {
                const flicker = Math.random() > 0.5 ? 1 : 0.2;
                ctx.globalAlpha = flicker * charProgress;
                ctx.shadowColor = textColor;
                ctx.shadowBlur = flicker === 1 ? 20 : 0;
            } else {
                ctx.globalAlpha = 1;
                ctx.shadowColor = textColor;
                ctx.shadowBlur = 10;
            }
            ctx.fillText(char, x, y);
        }
    },
    stretchSnap: {
        name: 'Stretch & Snap',
        render: (ctx, char, x, y, charProgress, fontSize, width, height, charIndex) => {
            const ease = 1 - Math.pow(1 - charProgress, 4);
            ctx.globalAlpha = charProgress;
            ctx.translate(x, y);
            const scaleY = 1 + (1 - ease) * 4;
            const scaleX = 1 - (1 - ease) * 0.5;
            ctx.scale(scaleX, scaleY);
            ctx.fillText(char, 0, 0);
        }
    },
    increaseTracking: {
        name: 'Increase Tracking',
        render: (ctx, char, x, y, charProgress, fontSize, width, height, charIndex, textColor, progress, charInLine, lineLength) => {
            const fadePhase = Math.min(1, charProgress / 0.9);
            const trackingPhase = Math.max(0, Math.min(1, progress));
            const easeTracking = 1 - Math.pow(1 - trackingPhase, 3);
            const centerIndex = (lineLength - 1) / 2;
            const distFromCenter = charInLine - centerIndex;
            const maxTrackingPerStep = fontSize * 0.14;
            const xOffset = distFromCenter * maxTrackingPerStep * easeTracking;

            ctx.globalAlpha = fadePhase;
            ctx.fillText(char, x + xOffset, y);
        }
    }
};
