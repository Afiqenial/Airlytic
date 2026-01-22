// Shared Bubble Particle System
(function () {
    function initParticles() {
        const canvas = document.getElementById('particleCanvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let width, height;
        let particles = [];

        // Check if a specific container should define the height (e.g., hero section)
        // Otherwise default to window height or canvas parent height
        const containerSelector = canvas.getAttribute('data-container');
        const container = containerSelector ? document.querySelector(containerSelector) : null;

        function resize() {
            width = canvas.width = window.innerWidth;
            // If container is specified, use its height, else window height
            height = canvas.height = container ? container.offsetHeight : (canvas.parentElement ? canvas.parentElement.offsetHeight : window.innerHeight);
        }

        class Bubble {
            constructor() {
                this.init();
            }

            init() {
                this.x = Math.random() * width;
                this.y = height + Math.random() * 100; // Start below screen
                this.radius = Math.random() * 5 + 2; // Size 2-7
                this.speed = Math.random() * 1 + 0.5;
                this.wobble = Math.random() * Math.PI * 2;
                this.wobbleSpeed = Math.random() * 0.05;
                this.opacity = Math.random() * 0.5 + 0.1;
            }

            update() {
                this.y -= this.speed;
                this.x += Math.sin(this.wobble) * 0.5;
                this.wobble += this.wobbleSpeed;

                // Reset if above screen (with some buffer)
                if (this.y < -50) {
                    this.init();
                }
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
                ctx.fill();

                // Simple shine effect
                ctx.beginPath();
                ctx.arc(this.x - this.radius * 0.3, this.y - this.radius * 0.3, this.radius * 0.2, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity + 0.3})`;
                ctx.fill();
            }
        }

        function initBubbles() {
            particles = [];
            for (let i = 0; i < 50; i++) {
                particles.push(new Bubble());
            }
            // Pre-warm the system so bubbles are already on screen
            for (let i = 0; i < 1000; i++) {
                particles.forEach(p => p.update());
            }
        }

        function animate() {
            ctx.clearRect(0, 0, width, height);
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            requestAnimationFrame(animate);
        }

        window.addEventListener('resize', () => {
            resize();
            initBubbles();
        });

        resize();
        initBubbles();
        animate();
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initParticles);
    } else {
        initParticles();
    }
})();
