/* =====================================================
   script.js — Portfolio interactivity
   ===================================================== */

document.addEventListener('DOMContentLoaded', () => {

    /* ---------- Header scroll effect ---------- */
    const header = document.getElementById('header');
    window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.scrollY > 40);
    });

    /* ---------- Mobile navigation toggle ---------- */
    const mobileToggle = document.getElementById('mobile-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            mobileToggle.classList.toggle('open');
        });
        // Close menu on link click
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                mobileToggle.classList.remove('open');
            });
        });
    }

    /* ---------- Smooth scroll for anchor links ---------- */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    /* ---------- Scroll-reveal animations ---------- */
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -60px 0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe cards and sections
    document.querySelectorAll(
        '.skill-card, .project-card, .about-card, .skills-category, .contact-item, .projects-hero'
    ).forEach(el => {
        el.classList.add('reveal-on-scroll');
        observer.observe(el);
    });

    /* ---------- Hero canvas — animated dot grid / wave ---------- */
    const canvas = document.getElementById('hero-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width, height, dots = [], mouse = { x: -1000, y: -1000 };

        function resize() {
            width = canvas.width = canvas.offsetWidth;
            height = canvas.height = canvas.offsetHeight;
            createDots();
        }

        function createDots() {
            dots = [];
            const spacing = 40;
            const cols = Math.ceil(width / spacing);
            const rows = Math.ceil(height / spacing);
            for (let i = 0; i < cols; i++) {
                for (let j = 0; j < rows; j++) {
                    dots.push({
                        x: i * spacing + spacing / 2,
                        y: j * spacing + spacing / 2,
                        baseX: i * spacing + spacing / 2,
                        baseY: j * spacing + spacing / 2,
                        radius: 1.2,
                        phase: Math.random() * Math.PI * 2
                    });
                }
            }
        }

        function draw(time) {
            ctx.clearRect(0, 0, width, height);
            dots.forEach(dot => {
                // Gentle wave animation
                const wave = Math.sin(time * 0.001 + dot.phase + dot.baseX * 0.005) * 3;
                const dy = dot.baseY + wave;

                // Mouse repulsion
                const dx2 = dot.baseX - mouse.x;
                const dy2 = dy - mouse.y;
                const dist = Math.sqrt(dx2 * dx2 + dy2 * dy2);
                const maxDist = 120;
                let fx = dot.baseX, fy = dy;
                if (dist < maxDist) {
                    const force = (1 - dist / maxDist) * 18;
                    fx += (dx2 / dist) * force;
                    fy += (dy2 / dist) * force;
                }

                const alpha = 0.15 + Math.sin(time * 0.0008 + dot.phase) * 0.08;
                ctx.beginPath();
                ctx.arc(fx, fy, dot.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(77, 124, 254, ${alpha})`;
                ctx.fill();
            });
            requestAnimationFrame(draw);
        }

        canvas.parentElement.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        });
        canvas.parentElement.addEventListener('mouseleave', () => {
            mouse.x = -1000;
            mouse.y = -1000;
        });

        window.addEventListener('resize', resize);
        resize();
        requestAnimationFrame(draw);
    }

    /* ---------- Skill card tilt effect ---------- */
    document.querySelectorAll('.skill-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -4;
            const rotateY = ((x - centerX) / centerX) * 4;
            card.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });

    /* ---------- Project modal ---------- */
    const modalOverlay = document.getElementById('project-modal-overlay');
    const modal = document.getElementById('project-modal');
    const modalClose = document.getElementById('modal-close');
    const modalImg = document.getElementById('modal-img');
    const modalTitle = document.getElementById('modal-title');
    const modalDesc = document.getElementById('modal-desc');
    const modalTags = document.getElementById('modal-tags');

    function openModal(card) {
        const title = card.dataset.projectTitle;
        const img = card.dataset.projectImg;
        const desc = card.dataset.projectDesc;
        const tags = card.dataset.projectTags;

        if (!title) return;

        modalTitle.textContent = title;
        modalDesc.textContent = desc;
        modalImg.src = img;
        modalImg.alt = title + ' Screenshot';

        // Build tags
        modalTags.innerHTML = '';
        if (tags) {
            tags.split(',').forEach(tag => {
                const span = document.createElement('span');
                span.className = 'tag';
                span.textContent = tag.trim();
                modalTags.appendChild(span);
            });
        }

        modalOverlay.classList.add('active');
        document.body.classList.add('modal-open');
    }

    function closeModal() {
        modalOverlay.classList.remove('active');
        document.body.classList.remove('modal-open');
    }

    // Open on card click
    document.querySelectorAll('.project-card').forEach(card => {
        card.addEventListener('click', () => openModal(card));
    });

    // Close on X button
    if (modalClose) {
        modalClose.addEventListener('click', (e) => {
            e.stopPropagation();
            closeModal();
        });
    }

    // Close on overlay click (outside modal)
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                closeModal();
            }
        });
    }

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
            closeModal();
        }
    });
});
