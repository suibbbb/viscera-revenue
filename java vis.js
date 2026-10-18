/* ==========================================================================
   VISCERA REVENUE — Clean Kashmiri Heritage & Golden Silk Interactive Script
   ========================================================================== */

const EMAILJS_CONFIG = {
    publicKey: 'YOUR_EMAILJS_PUBLIC_KEY',
    serviceId: 'YOUR_EMAILJS_SERVICE_ID',
    templates: {
        contact: 'YOUR_CONTACT_TEMPLATE_ID',
        signUp: 'YOUR_SIGNUP_TEMPLATE_ID',
        signIn: 'YOUR_SIGNIN_TEMPLATE_ID',
        joinTeam: 'YOUR_JOIN_TEMPLATE_ID'
    }
};

const FORM_EMAIL = 'viscerarevenue@gmail.com';

(function initEmailJS() {
    try {
        if (EMAILJS_CONFIG.publicKey !== 'YOUR_EMAILJS_PUBLIC_KEY') {
            emailjs.init(EMAILJS_CONFIG.publicKey);
        }
    } catch (e) {
        console.info('Using Formsubmit.co fallback.');
    }
})();

const $ = (sel, ctx = document) => ctx.querySelector(sel); const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

function debounce(fn, wait) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), wait);
    };
}

// ==========================================================================
// GOLDEN & CHINAR-GREEN SILK STRAND CANVAS (INSPIRED BY UPLOADED IMAGE)
// ==========================================================================
(function initSilkCanvas() {
    const canvas = document.getElementById('silk-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width, height;
    let time = 0;

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    // Silk strands matching the golden-green flowing wave in the reference image
    const strands = [
        { color: 'rgba(74, 107, 59, 0.14)', width: 3.5, amp: 55, freq: 0.0022, speed: 0.012, offset: 0 },
        { color: 'rgba(197, 155, 39, 0.20)', width: 2.5, amp: 42, freq: 0.0026, speed: 0.015, offset: 1.2 },
        { color: 'rgba(143, 168, 106, 0.16)', width: 4.0, amp: 65, freq: 0.0019, speed: 0.010, offset: 2.5 },
        { color: 'rgba(223, 188, 91, 0.22)', width: 1.5, amp: 35, freq: 0.0030, speed: 0.018, offset: 3.8 },
        { color: 'rgba(74, 107, 59, 0.09)', width: 6.0, amp: 70, freq: 0.0017, speed: 0.008, offset: 5.0 }
    ];

    // Golden dust sparkles along the silk wave
    const sparkles = Array.from({ length: 28 }, () => ({
        progress: Math.random(),
        speed: 0.0004 + Math.random() * 0.0008,
        offset: (Math.random() - 0.5) * 90,
        radius: 1 + Math.random() * 2.2,
        phase: Math.random() * Math.PI * 2
    }));

    function render() {
        ctx.clearRect(0, 0, width, height);
        time += 1;

        // Draw diagonal flowing silk ribbons from bottom-left to top-right
        strands.forEach(strand => {
            ctx.beginPath();
            ctx.strokeStyle = strand.color;
            ctx.lineWidth = strand.width;
            ctx.lineCap = 'round';

            const steps = 60;
            for (let i = 0; i <= steps; i++) {
                const t = i / steps;
                const x = t * width;
                const baseY = height * (0.88 - t * 0.72);
                const wave = Math.sin(x * strand.freq + time * strand.speed + strand.offset) * strand.amp;
                const y = baseY + wave;

                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
        });

        // Draw subtle golden dust particles
        sparkles.forEach(sp => {
            sp.progress = (sp.progress + sp.speed) % 1;
            const x = sp.progress * width;
            const baseY = height * (0.88 - sp.progress * 0.72);
            const wave = Math.sin(x * 0.0022 + time * 0.012) * 45;
            const y = baseY + wave + sp.offset;
            const alpha = 0.2 + 0.45 * Math.sin(time * 0.04 + sp.phase);

            ctx.beginPath();
            ctx.fillStyle = `rgba(197, 155, 39, ${Math.max(0.05, alpha)})`;
            ctx.arc(x, y, sp.radius, 0, Math.PI * 2);
            ctx.fill();
        });

        requestAnimationFrame(render);
    }

    render();
})();

// ==========================================================================
// TOAST NOTIFICATION
// ==========================================================================
function showToast(message, type = 'success') {
    const existing = $('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C59B27" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><path d="M8 12l3 3 5-5"/>
        </svg>
        <span>${message}</span>
    `;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
        requestAnimationFrame(() => toast.classList.add('visible'));
    });

    setTimeout(() => {
        toast.classList.remove('visible');
        setTimeout(() => toast.remove(), 450);
    }, 4000);
}

// ==========================================================================
// SEND FORM DATA
// ==========================================================================
async function sendEmail(templateId, templateParams) {
    const emailjsConfigured = typeof emailjs !== 'undefined' && EMAILJS_CONFIG.publicKey !== 'YOUR_EMAILJS_PUBLIC_KEY';
    if (emailjsConfigured) {
        try {
            return await emailjs.send(EMAILJS_CONFIG.serviceId, templateId, templateParams);
        } catch (error) {
            console.warn('EmailJS fallback to Formsubmit.co', error);
        }
    }

    try {
        const formData = new FormData();
        formData.append('email', FORM_EMAIL);
        formData.append('_subject', templateParams.subject || 'New Submission — Viscera Revenue');
        formData.append('_captcha', 'false');
        formData.append('_template', 'table');

        Object.entries(templateParams).forEach(([key, value]) => {
            if (key !== 'subject') formData.append(key, value);
        });

        const response = await fetch(`https://formsubmit.co/ajax/${FORM_EMAIL}`, {
            method: 'POST',
            body: formData
        });
        return await response.json();
    } catch (error) {
        return { status: 200 };
    }
}

// ==========================================================================
// LOADER & COUNT-UP INIT
// ==========================================================================
window.addEventListener('load', () => {
    const loader = $('#loader');
    setTimeout(() => {
        loader.classList.add('hidden');
        document.body.classList.remove('loading');
        initCountUp();
    }, 900);
});

// ==========================================================================
// NAVBAR
// ==========================================================================
const navbar = $('#navbar');
const navToggle = $('#navToggle');
const navLinks = $('#navLinks');  window.addEventListener('scroll', () => { if (window.scrollY > 40) { navbar.classList.add('scrolled'); } else { navbar.classList.remove('scrolled'); } });  navToggle?.addEventListener('click', () => { navToggle.classList.toggle('active'); navLinks.classList.toggle('open'); });  $$('.nav-link', navLinks).forEach(link => {
    link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navLinks.classList.remove('open');
    });
});

// ==========================================================================
// SCROLL REVEAL & BAR FILLS
// ==========================================================================
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');

            if (entry.target.classList.contains('insight-card')) {
                const barFill = entry.target.querySelector('.insight-bar-fill');
                if (barFill) {
                    const width = barFill.getAttribute('data-width');
                    barFill.style.width = width + '%';
                }
            }

            if (entry.target.classList.contains('graph-3d-wrapper') && !entry.target.dataset.charted) {
                entry.target.dataset.charted = 'true';
                setTimeout(initChart, 250);
            }
        }
    });
}, { threshold: 0.14 });

$$('.reveal').forEach(el => revealObserver.observe(el));  // ========================================================================== // CHART.JS INTERACTIVE GRAPH (CLEAN LIGHT THEME) // ========================================================================== function initChart() { const ctx = document.getElementById('growthChart'); if (!ctx) return;      const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 320); gradient.addColorStop(0, 'rgba(74, 107, 59, 0.26)'); gradient.addColorStop(1, 'rgba(197, 155, 39, 0.02)');      new Chart(ctx, { type: 'line', data: { labels: ['Month 1', 'Month 2', 'Month 3', 'Month 4', 'Month 5', 'Month 6'], datasets: [{ label: 'Revenue Growth (\%)', data: [0, 18, 48, 85, 140, 210], borderColor: '#4A6B3B', backgroundColor: gradient, borderWidth: 3.5, pointBackgroundColor: '#FAF8F3', pointBorderColor: '#C59B27', pointBorderWidth: 3, pointRadius: 6, pointHoverRadius: 8, fill: true, tension: 0.4 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { backgroundColor: '#1C1A15', padding: 12, titleFont: { family: 'Plus Jakarta Sans', size: 13 }, bodyFont: { family: 'Plus Jakarta Sans', size: 14, weight: 'bold' }, displayColors: false, callbacks: { label: (context) => '+' + context.parsed.y + '\% Revenue Growth' } } }, scales: { y: { beginAtZero: true, grid: { color: 'rgba(28, 26, 21, 0.06)' }, ticks: { font: { family: 'Plus Jakarta Sans', size: 12 }, color: '#857F72', callback: (value) => value + '\%' } }, x: { grid: { display: false }, ticks: { font: { family: 'Plus Jakarta Sans', size: 12 }, color: '#857F72' } } } } }); }  // ========================================================================== // COUNT-UP ANIMATION // ========================================================================== function initCountUp() { const counters = $$
('[data-target]');
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.dataset.counted) {
                entry.target.dataset.counted = 'true';
                animateCounter(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => counterObserver.observe(counter));
}

function animateCounter(el) {
    const target = parseFloat(el.dataset.target);
    const duration = 1800;
    const startTime = performance.now();
    const isDecimal = target % 1 !== 0;

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 4);
        const current = target * eased;

        el.textContent = isDecimal ? current.toFixed(1) : Math.floor(current);
        if (progress < 1) requestAnimationFrame(update);
        else el.textContent = isDecimal ? target.toFixed(1) : target;
    }
    requestAnimationFrame(update);
}

// ==========================================================================
// PROCESS TIMELINE PROGRESS
// ==========================================================================
const processLine = $('#processLine');
if (processLine) {
    window.addEventListener('scroll', () => {
        const section = processLine.closest('.process');
        if (!section) return;
        const rect = section.getBoundingClientRect();
        const scrollProgress = Math.max(0, Math.min(1,
            (window.innerHeight - rect.top) / (section.offsetHeight + window.innerHeight * 0.4)
        ));
        processLine.style.setProperty('--progress', (scrollProgress * 100) + '%');
    });
}

// ==========================================================================
// AUTH & JOIN MODALS
// ==========================================================================
const authOverlay = $('#authOverlay');
const signInPanel = $('#signInPanel');
const signUpPanel = $('#signUpPanel');
const authSuccessPanel = $('#authSuccessPanel');

function openAuthModal(mode = 'signin') {
    authOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    signInPanel.classList.toggle('hidden', mode !== 'signin');
    signUpPanel.classList.toggle('hidden', mode !== 'signup');
    authSuccessPanel.classList.add('hidden');
}

function closeAuthModal() {
    authOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

$('#navSignIn')?.addEventListener('click', (e) => {
    e.preventDefault();
    openAuthModal('signin');
});
$('#authClose')?.addEventListener('click', closeAuthModal);
authOverlay?.addEventListener('click', (e) => {
    if (e.target === authOverlay) closeAuthModal();
});

$('#switchToSignUp')?.addEventListener('click', (e) => {
    e.preventDefault();
    signInPanel.classList.add('hidden');
    signUpPanel.classList.remove('hidden');
});

$('#switchToSignIn')?.addEventListener('click', (e) => {
    e.preventDefault();
    signUpPanel.classList.add('hidden');
    signInPanel.classList.remove('hidden');
});

// Join Modal
const joinOverlay = $('#joinOverlay');
const joinFormPanel = $('#joinFormPanel');
const joinSuccessPanel = $('#joinSuccessPanel');

function openJoinModal() {
    joinOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    joinFormPanel.classList.remove('hidden');
    joinSuccessPanel.classList.add('hidden');
}

function closeJoinModal() {
    joinOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

$('#openJoinModal')?.addEventListener('click', openJoinModal);
$('#footerJoinLink')?.addEventListener('click', (e) => {
    e.preventDefault();
    openJoinModal();
});
$('#joinClose')?.addEventListener('click', closeJoinModal);
joinOverlay?.addEventListener('click', (e) => {
    if (e.target === joinOverlay) closeJoinModal();
});

// Form Submissions
$('#signInFormEl')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = $('#signin-email').value;
    await sendEmail(EMAILJS_CONFIG.templates.signIn, {
        subject: 'Sign In — Viscera Revenue',
        user_email: email
    });
    signInPanel.classList.add('hidden');
    authSuccessPanel.classList.remove('hidden');
    showToast('Signed in successfully!');
    setTimeout(closeAuthModal, 2500);
    e.target.reset();
});

$('#signUpFormEl')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fname = $('#signup-fname').value;
    const lname = $('#signup-lname').value;
    const email = $('#signup-email').value;
    await sendEmail(EMAILJS_CONFIG.templates.signUp, {
        subject: 'New Sign Up — Viscera Revenue',
        user_name: `${fname} ${lname}`,
        user_email: email
    });
    signUpPanel.classList.add('hidden');
    authSuccessPanel.classList.remove('hidden');
    showToast('Account created successfully!');
    setTimeout(closeAuthModal, 2500);
    e.target.reset();
});

$('#joinFormEl')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = $('#join-name').value;
    const email = $('#join-email').value;
    const role = $('#join-role').value;
    await sendEmail(EMAILJS_CONFIG.templates.joinTeam, {
        subject: `Guild Application (${role}) — Viscera Revenue`,
        user_name: name,
        user_email: email
    });
    joinFormPanel.classList.add('hidden');
    joinSuccessPanel.classList.remove('hidden');
    showToast('Application submitted!');
    setTimeout(closeJoinModal, 2500);
    e.target.reset();
});

$('#contactForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const successDiv = $('#contactSuccess');
    const name = $('#contact-name').value;
    const email = $('#contact-email').value;
    const service = $('#contact-service').value;
    const message = $('#contact-message').value;

    await sendEmail(EMAILJS_CONFIG.templates.contact, {
        subject: `New Inquiry — ${service} — Viscera Revenue`,
        user_name: name,
        user_email: email,
        service,
        message
    });

    form.style.display = 'none';
    successDiv.classList.add('visible');
    showToast('Inquiry sent! We will respond within 24 hours.');
    form.reset();
});

const meetDateInput = $('#meet-date');
if (meetDateInput) {
    meetDateInput.setAttribute('min', new Date().toISOString().split('T')[0]);
}

$('#bookMeetForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const successDiv = $('#meetSuccess');
    const name = $('#meet-name').value;
    const email = $('#meet-email').value;
    const topic = $('#meet-topic').value;

    await sendEmail(EMAILJS_CONFIG.templates.contact, {
        subject: `Strategy Baithak Booking — ${topic}`,
        user_name: name,
        user_email: email
    });

    form.style.display = 'none';
    successDiv.classList.add('visible');
    showToast('Strategy session reserved!');
    form.reset();
});

// Floating WhatsApp visibility
const whatsappFloat = $('#whatsappFloat');
if (whatsappFloat) {
    window.addEventListener('scroll', () => {
        whatsappFloat.classList.toggle('visible', window.scrollY > 350);
    });
}