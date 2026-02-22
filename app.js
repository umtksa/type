import { effects, effectNames } from './effects.js';

// Initialize Lucide icons
lucide.createIcons();

// State
let state = {
    text: 'HELLO\nWORLD',
    effect: 'fade',
    duration: 2,
    fps: 30,
    fontSize: 160,
    textColor: '#ffffff',
    bgColor: '#09090b',
    isTransparentBg: true,
    textAlign: 'left',
    progress: 0,
    isPlaying: true,
    isExporting: false,
    exportProgress: 0
};

// DOM Elements
const els = {
    canvas: document.getElementById('canvas'),
    text: document.getElementById('textInput'),
    effect: document.getElementById('effectInput'),
    duration: document.getElementById('durationInput'),
    durationVal: document.getElementById('durationVal'),
    fontSize: document.getElementById('fontSizeInput'),
    fontSizeVal: document.getElementById('fontSizeVal'),
    playBtn: document.getElementById('playBtn'),
    playIcon: document.getElementById('playIcon'),
    pauseIcon: document.getElementById('pauseIcon'),
    resetBtn: document.getElementById('resetBtn'),
    progress: document.getElementById('progressInput'),
    timeVal: document.getElementById('timeVal'),
    exportBtn: document.getElementById('exportBtn'),
    exportBtnText: document.getElementById('exportBtnText'),
    exportOverlay: document.getElementById('exportOverlay'),
    exportProgressText: document.getElementById('exportProgressText'),
    exportProgressBar: document.getElementById('exportProgressBar'),
    exportFramesText: document.getElementById('exportFramesText'),
    alignBtns: document.querySelectorAll('.align-btn')
};

// Build a map of exact character x positions using an offscreen canvas
// so kerning is 100% handled by the browser's text engine.
function buildCharPositions(ctx, line) {
    const positions = [];
    for (let i = 0; i < line.length; i++) {
        const xStart = ctx.measureText(line.substring(0, i)).width;
        const xEnd   = ctx.measureText(line.substring(0, i + 1)).width;
        positions.push({ xStart, xEnd, width: xEnd - xStart });
    }
    return positions;
}

// renderFrame function
const renderFrame = (ctx, progress, text, width, height, effect, fontSize, textColor, bgColor, isTransparentBg, textAlign) => {
    if (isTransparentBg) {
        ctx.clearRect(0, 0, width, height);
    } else {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, width, height);
    }

    ctx.font = `bold ${fontSize}px "Inter", sans-serif`;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center'; // effects receive center x of each char

    const lines = text.split('\n');
    const lineHeight = fontSize * 1.2;
    const totalHeight = lines.length * lineHeight;
    let startY = (height - totalHeight) / 2 + lineHeight / 2;

    let totalChars = 0;
    for (const line of lines) totalChars += line.length;

    let charIndex = 0;
    const edgePadding = fontSize;

    for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
        const line = lines[lineIdx];
        const lineWidth = ctx.measureText(line).width;

        let lineStartX;
        if (textAlign === 'left') {
            lineStartX = edgePadding;
        } else if (textAlign === 'right') {
            lineStartX = width - lineWidth - edgePadding;
        } else {
            lineStartX = (width - lineWidth) / 2;
        }

        // Get kerning-correct positions for every character in this line
        const charPositions = buildCharPositions(ctx, line);

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            const { xStart, width: charWidth } = charPositions[i];
            // Center point of this character in canvas space
            const x = lineStartX + xStart + charWidth / 2;
            const y = startY;

            let charProgress = 1;
            if (totalChars > 1) {
                const staggerDuration = 0.5;
                const charDuration = 1.0 - staggerDuration;
                const delay = (charIndex / (totalChars - 1)) * staggerDuration;
                charProgress = (progress - delay) / charDuration;
                charProgress = Math.max(0, Math.min(1, charProgress));
            } else {
                charProgress = progress;
            }

            if (charProgress > 0) {
                ctx.save();
                ctx.fillStyle = textColor;

                if (effects[effect]) {
                    effects[effect](ctx, char, x, y, charProgress, fontSize, width, height, charIndex, textColor, progress);
                } else {
                    effects.fade(ctx, char, x, y, charProgress, fontSize, width, height, charIndex, textColor, progress);
                }
                ctx.restore();
            }

            charIndex++;
        }
        startY += lineHeight;
    }
};

// Animation Loop
let lastTime = performance.now();
let animationFrameId;

function animate(time) {
    if (state.isPlaying && !state.isExporting) {
        const deltaTime = (time - lastTime) / 1000;
        state.progress += deltaTime / state.duration;
        if (state.progress >= 1) state.progress = 0;
        updateUI();
        draw();
    }
    lastTime = time;
    animationFrameId = requestAnimationFrame(animate);
}

function draw() {
    const ctx = els.canvas.getContext('2d');
    renderFrame(ctx, state.progress, state.text, els.canvas.width, els.canvas.height, state.effect, state.fontSize, state.textColor, state.bgColor, state.isTransparentBg, state.textAlign);
}

function updateUI() {
    els.progress.value = state.progress;
    els.timeVal.textContent = (state.progress * state.duration).toFixed(1) + 's';

    if (state.isPlaying) {
        els.playIcon.classList.add('hidden');
        els.pauseIcon.classList.remove('hidden');
    } else {
        els.playIcon.classList.remove('hidden');
        els.pauseIcon.classList.add('hidden');
    }
}

// Event Listeners
els.text.addEventListener('input', e => { state.text = e.target.value; draw(); });
els.effect.addEventListener('change', e => { state.effect = e.target.value; draw(); });
els.duration.addEventListener('input', e => { state.duration = Number(e.target.value); els.durationVal.textContent = state.duration + 's'; updateUI(); });
els.fontSize.addEventListener('input', e => { state.fontSize = Number(e.target.value); els.fontSizeVal.textContent = state.fontSize + 'px'; draw(); });

els.alignBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        els.alignBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.textAlign = btn.dataset.align;
        draw();
    });
});

els.playBtn.addEventListener('click', () => { state.isPlaying = !state.isPlaying; updateUI(); });
els.resetBtn.addEventListener('click', () => { state.progress = 0; state.isPlaying = true; updateUI(); draw(); });
els.progress.addEventListener('input', e => { state.progress = Number(e.target.value); state.isPlaying = false; updateUI(); draw(); });

els.exportBtn.addEventListener('click', async () => {
    state.isExporting = true;
    state.isPlaying = false;
    state.exportProgress = 0;
    updateUI();

    els.exportBtn.disabled = true;
    els.exportBtnText.textContent = 'Exporting...';
    els.exportOverlay.classList.add('visible');
    els.exportFramesText.textContent = `Generating ${Math.floor(state.duration * state.fps)} frames...`;

    const zip = new JSZip();
    const totalFrames = Math.floor(state.duration * state.fps);
    const ctx = els.canvas.getContext('2d');
    const baseName = state.text.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();

    for (let i = 0; i <= totalFrames; i++) {
        const t = i / totalFrames;
        renderFrame(ctx, t, state.text, els.canvas.width, els.canvas.height, state.effect, state.fontSize, state.textColor, state.bgColor, state.isTransparentBg, state.textAlign);
        const dataUrl = els.canvas.toDataURL('image/png');
        const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");
        zip.file(`${baseName} ${String(i).padStart(4, '0')}.png`, base64Data, {base64: true});

        if (i % 5 === 0) {
            state.exportProgress = Math.round((i / totalFrames) * 100);
            els.exportProgressText.textContent = state.exportProgress + '%';
            els.exportProgressBar.style.width = state.exportProgress + '%';
            await new Promise(resolve => setTimeout(resolve, 0));
        }
    }

    state.exportProgress = 100;
    els.exportProgressText.textContent = '100%';
    els.exportProgressBar.style.width = '100%';

    const content = await zip.generateAsync({type: "blob"});
    saveAs(content, `${baseName}.zip`);

    state.isExporting = false;
    els.exportBtn.disabled = false;
    els.exportBtnText.textContent = 'Export';
    els.exportOverlay.classList.remove('visible');
});

// Init
Object.keys(effects).forEach(effectKey => {
    const option = document.createElement('option');
    option.value = effectKey;
    option.textContent = effectNames[effectKey] || effectKey;
    els.effect.appendChild(option);
});

els.text.value = state.text;
els.effect.value = state.effect;
els.duration.value = state.duration;
els.fontSize.value = state.fontSize;
els.canvas.classList.add('transparent-bg');
els.canvas.style.backgroundColor = '';
updateUI();
draw();
animationFrameId = requestAnimationFrame(animate);
