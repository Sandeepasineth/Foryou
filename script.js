window.onload = () => {
    // DOM Elements
    const loader = document.getElementById("loader");
    const bar = document.getElementById("loader-bar-fill");
    const percentText = document.getElementById("loader-percent");
    const subtitle = document.getElementById("loader-subtitle");

    const tapScreen = document.getElementById("tap-screen");
    const bgMusic = document.getElementById("bg-music");
    const musicBtn = document.getElementById("music-btn");
    const musicIconOn = document.getElementById("music-icon-on");
    const musicIconOff = document.getElementById("music-icon-off");

    const elephantContainer = document.getElementById("elephant-container");
    const loveMessage = document.getElementById("love-message");
    const messageBtn = document.getElementById("message-btn");

    const messageOverlay = document.getElementById("message-overlay");
    const messageClose = document.getElementById("message-close");
    const rippleContainer = document.getElementById("ripple-container");
    const flowersContainer = document.getElementById("flowers-container");

    // Loader configuration
    const duration = 1500; // slightly longer for cinematic feel
    const messages = [
        { at: 0, text: "gathering every petal..." },
        { at: 30, text: "planting something sweet..." },
        { at: 60, text: "almost ready to bloom..." },
        { at: 90, text: "a magical surprise awaits..." }
    ];

    let start = null;
    let shownIndex = 0;
    let isMusicPlaying = false;
    let experienceStarted = false;

    // --- 1. LOADER LOGIC ---
    function fillBar(timestamp) {
        if (!start) start = timestamp;
        const elapsed = timestamp - start;
        const percent = Math.min((elapsed / duration) * 100, 100);

        bar.style.width = percent + "%";
        percentText.textContent = Math.floor(percent) + "%";

        if (shownIndex < messages.length - 1 && percent >= messages[shownIndex + 1].at) {
            shownIndex++;
            subtitle.textContent = messages[shownIndex].text;
        }

        if (percent < 100) {
            requestAnimationFrame(fillBar);
        } else {
            setTimeout(finishLoading, 500); // small pause at 100%
        }
    }

    function finishLoading() {
        loader.classList.add("hide");
        // Show tap to start screen
        setTimeout(() => {
            tapScreen.classList.add("visible");
            initFirefliesCanvas(); // Init canvas early but don't show yet
        }, 800);
    }

    requestAnimationFrame(fillBar);

    // --- 2. TAP TO START LOGIC ---
    tapScreen.addEventListener("click", startExperience);
    tapScreen.addEventListener("touchstart", (e) => {
        e.preventDefault();
        startExperience(e.touches[0]);
    }, { passive: false });

    function startExperience(event) {
        if (experienceStarted) return;
        experienceStarted = true;

        // Try to play music
        bgMusic.volume = 0.5;
        bgMusic.play().then(() => {
            isMusicPlaying = true;
        }).catch(err => {
            console.log("Audio autoplay prevented", err);
            isMusicPlaying = false;
            musicIconOn.style.display = "none";
            musicIconOff.style.display = "block";
        });

        // Hide tap screen
        tapScreen.classList.remove("visible");
        tapScreen.classList.add("fade-out");

        // Start garden animations
        setTimeout(() => {
            document.body.classList.remove("container"); // Starts original flower CSS animations
            document.getElementById("fireflies-canvas").classList.add("visible");

            // Timeline for elements appearing
            setTimeout(() => {
                loveMessage.classList.add("visible");
                messageBtn.classList.add("visible");
                musicBtn.classList.add("visible");
            }, 1500);

            setTimeout(() => {
                createButterflies(4);
            }, 3000);

            setTimeout(() => {
                elephantContainer.classList.add("visible");
            }, 6000);

        }, 1000);
    }

    // --- 3. MUSIC CONTROLS ---
    musicBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (isMusicPlaying) {
            bgMusic.pause();
            musicIconOn.style.display = "none";
            musicIconOff.style.display = "block";
        } else {
            bgMusic.play();
            musicIconOn.style.display = "block";
            musicIconOff.style.display = "none";
        }
        isMusicPlaying = !isMusicPlaying;
    });

    musicBtn.addEventListener("touchstart", (e) => {
        e.stopPropagation();
    }, { passive: true });

    // --- 4. MESSAGE POPUP LOGIC ---
    const typewriterElement = document.getElementById("typewriter-text");
    const fullMessage = typewriterElement ? typewriterElement.innerHTML.trim() : "YOUR_MESSAGE_HERE";
    let hasTyped = false;

    if (typewriterElement) {
        typewriterElement.innerHTML = "";
    }

    function typeWriter(text, index, elem) {
        if (index < text.length) {
            elem.innerHTML += text.charAt(index);
            setTimeout(() => typeWriter(text, index + 1, elem), 50);
        }
    }

    messageBtn.addEventListener("click", () => {
        messageOverlay.classList.add("visible");
        document.body.classList.add("popup-open");

        if (!hasTyped && typewriterElement) {
            typewriterElement.innerHTML = "";
            setTimeout(() => {
                typeWriter(fullMessage, 0, typewriterElement);
                hasTyped = true;
            }, 600); // Wait for popup animation
        }
    });

    messageClose.addEventListener("click", () => {
        messageOverlay.classList.remove("visible");
        document.body.classList.remove("popup-open");
    });

    // Close when clicking outside the card
    messageOverlay.addEventListener("click", (e) => {
        if (e.target === messageOverlay) {
            messageOverlay.classList.remove("visible");
            document.body.classList.remove("popup-open");
        }
    });

    // --- 5. INTERACTIVE RIPPLES & FLOWER REACTIONS ---
    function createRipple(x, y) {
        const ripple = document.createElement("div");
        ripple.className = "ripple-effect";
        ripple.style.left = x - 10 + "px"; // center the ripple (20px width)
        ripple.style.top = y - 10 + "px";
        rippleContainer.appendChild(ripple);

        // Make nearby flowers sway slightly
        const flowers = document.querySelectorAll('.flower');
        flowers.forEach(flower => {
            const rect = flower.getBoundingClientRect();
            const flowerX = rect.left + rect.width / 2;
            const dist = Math.abs(flowerX - x);
            if (dist < 150) { // If click is near flower
                flower.style.transform = `rotate(${flowerX > x ? '5deg' : '-5deg'})`;
                setTimeout(() => {
                    flower.style.transform = '';
                }, 400);
            }
        });

        setTimeout(() => {
            ripple.remove();
        }, 1000);
    }

    document.addEventListener("click", (e) => {
        if (experienceStarted) {
            createRipple(e.clientX, e.clientY);
            if (!isMusicPlaying) {
                bgMusic.play().then(() => {
                    isMusicPlaying = true;
                    musicIconOn.style.display = "block";
                    musicIconOff.style.display = "none";
                }).catch(e => console.log("Audio play failed:", e));
            }
        }
    });

    document.addEventListener("touchstart", (e) => {
        if (experienceStarted) {
            createRipple(e.touches[0].clientX, e.touches[0].clientY);
            if (!isMusicPlaying) {
                bgMusic.play().then(() => {
                    isMusicPlaying = true;
                    musicIconOn.style.display = "block";
                    musicIconOff.style.display = "none";
                }).catch(e => console.log("Audio play failed:", e));
            }
        }
    }, { passive: true });

    // Parallax effect on mouse move
    document.addEventListener("mousemove", (e) => {
        if (!experienceStarted || document.body.classList.contains("popup-open")) return;
        const x = (e.clientX / window.innerWidth - 0.5) * 10;
        const y = (e.clientY / window.innerHeight - 0.5) * 10;

        flowersContainer.style.transform = `scale(0.9) translate(${x}px, ${y}px)`;
        elephantContainer.style.transform = `translate(${x * 0.5}px, ${y * 0.5}px)`;
    });

    // --- 6. FIREFLIES CANVAS ---
    function initFirefliesCanvas() {
        const canvas = document.getElementById("fireflies-canvas");
        const ctx = canvas.getContext("2d");

        let width, height;
        let particles = [];

        function resize() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        }

        window.addEventListener("resize", resize);
        resize();

        class Firefly {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.size = Math.random() * 2 + 0.5;
                this.speedX = Math.random() * 1 - 0.5;
                this.speedY = Math.random() * 1 - 0.5;
                this.color = `rgba(255, ${Math.floor(Math.random() * 50 + 200)}, 150, ${Math.random() * 0.5 + 0.3})`;
                this.glow = Math.random() * 0.02;
                this.glowSign = Math.random() > 0.5 ? 1 : -1;
                this.opacity = Math.random();
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;

                // Wander
                if (Math.random() < 0.05) this.speedX += (Math.random() - 0.5) * 0.2;
                if (Math.random() < 0.05) this.speedY += (Math.random() - 0.5) * 0.2;

                // Clamp speed
                this.speedX = Math.max(Math.min(this.speedX, 1.5), -1.5);
                this.speedY = Math.max(Math.min(this.speedY, 1.5), -1.5);

                // Wrap around
                if (this.x < 0) this.x = width;
                if (this.x > width) this.x = 0;
                if (this.y < 0) this.y = height;
                if (this.y > height) this.y = 0;

                // Twinkle
                this.opacity += this.glow * this.glowSign;
                if (this.opacity >= 1) {
                    this.opacity = 1;
                    this.glowSign = -1;
                } else if (this.opacity <= 0.1) {
                    this.opacity = 0.1;
                    this.glowSign = 1;
                }
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = this.color.replace(/[\d.]+\)$/g, `${this.opacity})`);
                ctx.shadowBlur = 10;
                ctx.shadowColor = this.color;
                ctx.fill();
            }
        }

        const particleCount = window.innerWidth < 768 ? 30 : 60; // Less on mobile
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Firefly());
        }

        function animate() {
            ctx.clearRect(0, 0, width, height);
            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();
            }
            requestAnimationFrame(animate);
        }

        animate();
    }

    // --- 7. BUTTERFLIES ---
    function createButterflies(count) {
        const container = document.getElementById("butterflies-container");

        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                const butterfly = document.createElement("div");
                butterfly.className = "butterfly";

                butterfly.innerHTML = `
                    <div class="butterfly__body"></div>
                    <div class="butterfly__wing butterfly__wing--left"></div>
                    <div class="butterfly__wing butterfly__wing--right"></div>
                `;

                container.appendChild(butterfly);

                // Initial position
                let x = Math.random() * window.innerWidth;
                let y = window.innerHeight + 50; // Start below screen

                butterfly.style.left = x + "px";
                butterfly.style.top = y + "px";

                // Show it
                setTimeout(() => butterfly.classList.add("visible"), 100);

                // Movement logic
                let targetX = Math.random() * window.innerWidth;
                let targetY = Math.random() * window.innerHeight * 0.7; // Keep mostly in upper 70%

                function moveButterfly() {
                    const dx = targetX - x;
                    const dy = targetY - y;

                    x += dx * 0.01;
                    y += dy * 0.01;

                    // Add some flutter wobble
                    const flutterX = Math.sin(Date.now() * 0.003 + i) * 2;
                    const flutterY = Math.cos(Date.now() * 0.005 + i) * 1.5;

                    // Calculate rotation based on direction
                    let angle = Math.atan2(dy, dx) * 180 / Math.PI;
                    // Adjust angle so it faces forward (pointing up by default)
                    angle += 90;

                    butterfly.style.transform = `translate(${x + flutterX}px, ${y + flutterY}px) rotate(${angle}deg) scale(0.6)`;

                    // Pick new target occasionally
                    if (Math.random() < 0.01 || (Math.abs(dx) < 20 && Math.abs(dy) < 20)) {
                        targetX = Math.random() * window.innerWidth;
                        targetY = Math.random() * window.innerHeight * 0.7;
                    }

                    requestAnimationFrame(moveButterfly);
                }

                moveButterfly();
            }, i * 2000); // Stagger appearances
        }
    }
};
