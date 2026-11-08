/* Celebration & Fireworks Engine for Dunyo Restaurant */

class CelebrationManager {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.particles = [];
        this.fireworks = [];
        this.balloons = [];
        this.animId = null;
        this.active = false;
        this.initCanvas();
    }

    initCanvas() {
        if (document.getElementById('celebrationCanvas')) return;
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'celebrationCanvas';
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100vw';
        this.canvas.style.height = '100vh';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '99999';
        this.canvas.style.display = 'none';
        document.body.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        if (!this.canvas) return;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    playChime() {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
            notes.forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.12);
                gain.gain.setValueAtTime(0.3, ctx.currentTime + i * 0.12);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.6);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(ctx.currentTime + i * 0.12);
                osc.stop(ctx.currentTime + i * 0.12 + 0.65);
            });
        } catch (e) {}
    }

    startCelebration(durationMs = 7000) {
        this.active = true;
        this.canvas.style.display = 'block';
        this.particles = [];
        this.fireworks = [];
        this.balloons = [];
        this.playChime();

        // Sharlar yaratish
        const colors = ['#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6'];
        for (let i = 0; i < 22; i++) {
            this.balloons.push({
                x: Math.random() * this.canvas.width,
                y: this.canvas.height + Math.random() * 200,
                radius: 18 + Math.random() * 14,
                speedY: 2.2 + Math.random() * 2.5,
                color: colors[Math.floor(Math.random() * colors.length)],
                sway: Math.random() * 2,
                swaySpeed: 0.03 + Math.random() * 0.03,
                popped: false
            });
        }

        // Salyut otilishi intervallari
        let timer = setInterval(() => {
            if (!this.active) return clearInterval(timer);
            this.launchFirework();
        }, 400);

        // Confetti yog'dirish
        for (let i = 0; i < 90; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: -20 - Math.random() * 100,
                w: 8 + Math.random() * 6,
                h: 12 + Math.random() * 8,
                color: colors[Math.floor(Math.random() * colors.length)],
                speedY: 2 + Math.random() * 4,
                speedX: (Math.random() - 0.5) * 3,
                rotation: Math.random() * 360,
                rotSpeed: (Math.random() - 0.5) * 8
            });
        }

        const loop = () => {
            if (!this.active) return;
            this.update();
            this.draw();
            this.animId = requestAnimationFrame(loop);
        };
        loop();

        setTimeout(() => {
            this.stopCelebration();
            clearInterval(timer);
        }, durationMs);
    }

    launchFirework() {
        const x = 100 + Math.random() * (this.canvas.width - 200);
        const targetY = 80 + Math.random() * (this.canvas.height * 0.45);
        this.fireworks.push({
            x,
            y: this.canvas.height,
            targetY,
            speedY: -9 - Math.random() * 4,
            color: '#fff'
        });
    }

    explodeFirework(x, y) {
        const colors = ['#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#ec4899', '#fde047', '#fff'];
        const count = 45;
        const color = colors[Math.floor(Math.random() * colors.length)];
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i + Math.random() * 0.2;
            const speed = 2.5 + Math.random() * 5.5;
            this.particles.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                alpha: 1,
                decay: 0.015 + Math.random() * 0.02,
                color,
                size: 2.5 + Math.random() * 2.5,
                isSpark: true
            });
        }
    }

    update() {
        // Fireworks rockets
        for (let i = this.fireworks.length - 1; i >= 0; i--) {
            const fw = this.fireworks[i];
            fw.y += fw.speedY;
            if (fw.y <= fw.targetY) {
                this.explodeFirework(fw.x, fw.y);
                this.fireworks.splice(i, 1);
            }
        }

        // Particles & Confetti
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            if (p.isSpark) {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.08; // gravity
                p.alpha -= p.decay;
                if (p.alpha <= 0) this.particles.splice(i, 1);
            } else {
                p.y += p.speedY;
                p.x += p.speedX;
                p.rotation += p.rotSpeed;
                if (p.y > this.canvas.height + 40) {
                    p.y = -20;
                    p.x = Math.random() * this.canvas.width;
                }
            }
        }

        // Balloons
        for (let i = this.balloons.length - 1; i >= 0; i--) {
            const b = this.balloons[i];
            b.y -= b.speedY;
            b.x += Math.sin(b.sway) * 0.8;
            b.sway += b.swaySpeed;
            if (b.y < -80) {
                b.y = this.canvas.height + 50;
                b.x = Math.random() * this.canvas.width;
            }
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw Fireworks
        for (const fw of this.fireworks) {
            this.ctx.beginPath();
            this.ctx.arc(fw.x, fw.y, 3, 0, Math.PI * 2);
            this.ctx.fillStyle = '#fde047';
            this.ctx.shadowBlur = 8;
            this.ctx.shadowColor = '#f59e0b';
            this.ctx.fill();
        }
        this.ctx.shadowBlur = 0;

        // Draw Particles (Fireworks sparks & Confetti)
        for (const p of this.particles) {
            if (p.isSpark) {
                this.ctx.save();
                this.ctx.globalAlpha = p.alpha;
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                this.ctx.fillStyle = p.color;
                this.ctx.fill();
                this.ctx.restore();
            } else {
                this.ctx.save();
                this.ctx.translate(p.x, p.y);
                this.ctx.rotate((p.rotation * Math.PI) / 180);
                this.ctx.fillStyle = p.color;
                this.ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
                this.ctx.restore();
            }
        }

        // Draw Balloons
        for (const b of this.balloons) {
            this.ctx.save();
            this.ctx.beginPath();
            // Oval balloon
            this.ctx.ellipse(b.x, b.y, b.radius * 0.82, b.radius, 0, 0, Math.PI * 2);
            this.ctx.fillStyle = b.color;
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = 'rgba(0,0,0,0.25)';
            this.ctx.fill();

            // Highlight shine
            this.ctx.beginPath();
            this.ctx.ellipse(b.x - b.radius * 0.3, b.y - b.radius * 0.35, b.radius * 0.18, b.radius * 0.28, Math.PI / 4, 0, Math.PI * 2);
            this.ctx.fillStyle = 'rgba(255,255,255,0.45)';
            this.ctx.fill();

            // String
            this.ctx.beginPath();
            this.ctx.moveTo(b.x, b.y + b.radius);
            this.ctx.quadraticCurveTo(b.x + 6, b.y + b.radius + 15, b.x - 2, b.y + b.radius + 32);
            this.ctx.strokeStyle = '#cbd5e1';
            this.ctx.lineWidth = 1.2;
            this.ctx.stroke();

            this.ctx.restore();
        }
    }

    stopCelebration() {
        this.active = false;
        if (this.animId) cancelAnimationFrame(this.animId);
        if (this.ctx && this.canvas) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.canvas.style.display = 'none';
        }
    }
}

window.celebrationManager = new CelebrationManager();

