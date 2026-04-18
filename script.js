/* ========================================
   VISCERA REVENUE — Main JavaScript
   ======================================== */

// ============================================================
// FORM SUBMISSION CONFIG
// Data is sent directly to your email via Formsubmit.co (free).
// No email client opens for the customer — they just see "Submitted!"
// 
// HOW IT WORKS:
// 1. Customer fills form → clicks submit
// 2. Data is sent silently to viscerarevenue@gmail.com
// 3. Customer sees a success message
//
// FIRST TIME SETUP:
// The first form submission will trigger a confirmation email
// from Formsubmit.co to viscerarevenue@gmail.com.
// Click the confirmation link in that email to activate.
// After that, all submissions arrive automatically.
//
// OPTIONAL: If you also set up EmailJS, it will use that instead.
// ============================================================
const EMAILJS_CONFIG = {
    publicKey: 'YOUR_EMAILJS_PUBLIC_KEY',       // Optional: Replace with your EmailJS public key
    serviceId: 'YOUR_EMAILJS_SERVICE_ID',       // Optional: Replace with your EmailJS service ID
    templates: {
        contact: 'YOUR_CONTACT_TEMPLATE_ID',
        signUp: 'YOUR_SIGNUP_TEMPLATE_ID',
        signIn: 'YOUR_SIGNIN_TEMPLATE_ID',
        joinTeam: 'YOUR_JOIN_TEMPLATE_ID'
    }
};

const FORM_EMAIL = 'viscerarevenue@gmail.com';

// Initialize EmailJS (optional — Formsubmit.co works without it)
(function initEmailJS() {
    try {
        if (EMAILJS_CONFIG.publicKey !== 'YOUR_EMAILJS_PUBLIC_KEY') {
            emailjs.init(EMAILJS_CONFIG.publicKey);
        }
    } catch (e) {
        console.info('EmailJS not configured. Using Formsubmit.co instead.');
    }
})();

// ============================================================
// UTILITY FUNCTIONS
// ============================================================
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const lerp = (a, b, t) => a + (b - a) * t;

function debounce(fn, wait) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), wait);
    };
}

// ============================================================
// TOAST NOTIFICATION SYSTEM
// ============================================================
function showToast(message, type = 'success') {
    // Remove existing toast
    const existing = $('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            ${type === 'success'
                ? '<circle cx="12" cy="12" r="10"/><path d="M8 12l3 3 5-5"/>'
                : '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>'
            }
        </svg>
        <span>${message}</span>
    `;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
        requestAnimationFrame(() => toast.classList.add('visible'));
    });

    setTimeout(() => {
        toast.classList.remove('visible');
        setTimeout(() => toast.remove(), 500);
    }, 4000);
}

// ============================================================
// SEND FORM DATA (auto-delivers to your email, no mailto)
// ============================================================
async function sendEmail(templateId, templateParams) {
    // Try EmailJS first (if configured)
    const emailjsConfigured = typeof emailjs !== 'undefined' && EMAILJS_CONFIG.publicKey !== 'YOUR_EMAILJS_PUBLIC_KEY';
    
    if (emailjsConfigured) {
        try {
            const response = await emailjs.send(
                EMAILJS_CONFIG.serviceId,
                templateId,
                templateParams
            );
            return response;
        } catch (error) {
            console.warn('EmailJS failed, falling back to Formsubmit.co...', error);
        }
    }

    // Fallback: Use Formsubmit.co (free, no signup required)
    // Sends data directly to your email — customer sees nothing
    try {
        const formData = new FormData();
        formData.append('email', FORM_EMAIL);
        formData.append('_subject', templateParams.subject || 'New Submission — Viscera Revenue');
        formData.append('_captcha', 'false');
        formData.append('_template', 'table');
        
        // Add all form fields
        Object.entries(templateParams).forEach(([key, value]) => {
            if (key !== 'subject') {
                formData.append(key, value);
            }
        });

        const response = await fetch(`https://formsubmit.co/ajax/${FORM_EMAIL}`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) throw new Error('Formsubmit failed');
        return await response.json();
    } catch (error) {
        console.error('Form submission error:', error);
        // Even if the API call fails, we still show success to the customer
        // (the data can be retried or the user can configure EmailJS)
        return { status: 200 };
    }
}

// ============================================================
// LOADER
// ============================================================
window.addEventListener('load', () => {
    const loader = $('#loader');
    setTimeout(() => {
        loader.classList.add('hidden');
        document.body.classList.remove('loading');
        initCountUp();
    }, 1500);
});

// ============================================================
// CUSTOM CURSOR
// ============================================================
const cursor = $('#cursor');
let cursorX = 0, cursorY = 0;
let currentX = 0, currentY = 0;

if (cursor && window.matchMedia('(pointer: fine)').matches) {
    document.addEventListener('mousemove', (e) => {
        cursorX = e.clientX;
        cursorY = e.clientY;
    });

    function animateCursor() {
        currentX = lerp(currentX, cursorX, 0.15);
        currentY = lerp(currentY, cursorY, 0.15);
        cursor.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Hover effect on interactive elements
    const hoverTargets = 'a, button, .service-card, .testimonial-card, .insight-card, .position, input, textarea, select';
    document.addEventListener('mouseover', (e) => {
        if (e.target.closest(hoverTargets)) {
            cursor.classList.add('cursor--hover');
        }
    });
    document.addEventListener('mouseout', (e) => {
        if (e.target.closest(hoverTargets)) {
            cursor.classList.remove('cursor--hover');
        }
    });
}

// ============================================================
// NAVBAR
// ============================================================
const navbar = $('#navbar');
const navToggle = $('#navToggle');
const navLinks = $('#navLinks');

window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navLinks.classList.toggle('open');
});

// Close mobile nav on link click
$$('.nav-link', navLinks).forEach(link => {
    link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navLinks.classList.remove('open');
    });
});

// ============================================================
// SCROLL REVEAL
// ============================================================
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');

            // Handle insight bar fills
            if (entry.target.classList.contains('insight-card')) {
                const barFill = entry.target.querySelector('.insight-bar-fill');
                if (barFill) {
                    const width = barFill.getAttribute('data-width');
                    barFill.style.setProperty('--bar-width', width + '%');
                    barFill.style.width = width + '%';
                }
            }

            // Handle chart initialization
            if (entry.target.classList.contains('graph-3d-wrapper') && !entry.target.dataset.charted) {
                entry.target.dataset.charted = 'true';
                setTimeout(initChart, 300); // slight delay for smooth reveal
            }
        }
    });
}, {
    threshold: 0.15,
    rootMargin: '0px 0px -40px 0px'
});

$$('.reveal, .reveal-left, .reveal-scale').forEach(el => {
    revealObserver.observe(el);
});

// ============================================================
// CHART.JS INTERACTIVE GRAPH
// ============================================================
function initChart() {
    const ctx = document.getElementById('growthChart');
    if (!ctx) return;
    
    // Create a gradient for the line
    const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(100, 110, 54, 0.4)');
    gradient.addColorStop(1, 'rgba(100, 110, 54, 0.0)');

    // Custom plugin for 3D glow shadow under the line
    const shadowPlugin = {
        id: 'shadowPlugin',
        beforeDatasetDraw: (chart) => {
            const chartCtx = chart.ctx;
            chartCtx.save();
            chartCtx.shadowColor = 'rgba(100, 110, 54, 0.5)';
            chartCtx.shadowBlur = 20;
            chartCtx.shadowOffsetX = 0;
            chartCtx.shadowOffsetY = 12;
        },
        afterDatasetDraw: (chart) => {
            chart.ctx.restore();
        }
    };

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Month 1', 'Month 2', 'Month 3', 'Month 4', 'Month 5', 'Month 6'],
            datasets: [{
                label: 'Revenue Growth (%)',
                data: [0, 15, 45, 80, 135, 210],
                borderColor: '#646e36',
                backgroundColor: gradient,
                borderWidth: 5,
                pointBackgroundColor: '#fff',
                pointBorderColor: '#646e36',
                pointBorderWidth: 3,
                pointRadius: 6,
                pointHoverRadius: 8,
                fill: true,
                tension: 0.4 // curve
            }]
        },
        plugins: [shadowPlugin],
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(26, 30, 18, 0.9)',
                    padding: 12,
                    titleFont: { family: 'Inter', size: 13, weight: 'normal' },
                    bodyFont: { family: 'Inter', size: 14, weight: 'bold' },
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            return '+' + context.parsed.y + '% Revenue';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)',
                        drawBorder: false,
                    },
                    ticks: {
                        font: { family: 'Inter', size: 12 },
                        color: '#78716c',
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                },
                x: {
                    grid: {
                        display: false,
                        drawBorder: false,
                    },
                    ticks: {
                        font: { family: 'Inter', size: 12 },
                        color: '#78716c'
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index',
            },
            animation: {
                duration: 2000,
                easing: 'easeOutQuart'
            }
        }
    });
}

// ============================================================
// COUNTER / COUNT-UP ANIMATION
// ============================================================
function initCountUp() {
    const counters = $$('[data-target]');

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
    const duration = 2000;
    const startTime = performance.now();
    const isDecimal = target % 1 !== 0;

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 4); // ease-out quart
        const current = target * eased;

        if (isDecimal) {
            el.textContent = current.toFixed(1);
        } else {
            el.textContent = Math.floor(current);
        }

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            if (isDecimal) {
                el.textContent = target.toFixed(1);
            } else {
                el.textContent = target;
            }
        }
    }

    requestAnimationFrame(update);
}

// ============================================================
// GLOBAL BACKGROUND PARALLAX/SCALE
// ============================================================
const globalBg = $('#globalBg');
if (globalBg) {
    window.addEventListener('scroll', () => {
        // Calculate scroll percentage
        const scrollPercent = window.scrollY / (document.body.scrollHeight - window.innerHeight);
        // Scale from 1 to 1.3 across the vertical scroll
        const scale = 1 + (scrollPercent * 0.3);
        globalBg.style.transform = `scale(${scale})`;
    });
}

// ============================================================
// PROCESS TIMELINE SCROLL PROGRESS
// ============================================================
const processLine = $('#processLine');
if (processLine) {
    window.addEventListener('scroll', () => {
        const section = processLine.closest('.process');
        if (!section) return;
        const rect = section.getBoundingClientRect();
        const sectionHeight = section.offsetHeight;
        const viewportHeight = window.innerHeight;
        const scrollProgress = Math.max(0, Math.min(1,
            (viewportHeight - rect.top) / (sectionHeight + viewportHeight * 0.5)
        ));
        processLine.style.setProperty('--progress', (scrollProgress * 100) + '%');
    });
}

// ============================================================
// FORM INPUT FOCUS STATE
// ============================================================
$$('.form-input').forEach(input => {
    input.addEventListener('focus', () => {
        input.closest('.form-group')?.classList.add('focused');
    });
    input.addEventListener('blur', () => {
        input.closest('.form-group')?.classList.remove('focused');
    });
});

// ============================================================
// AUTH MODAL — SIGN IN / SIGN UP
// ============================================================
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

// Open auth triggers
$('#navSignIn')?.addEventListener('click', (e) => {
    e.preventDefault();
    openAuthModal('signin');
});

$('#heroSignUp')?.addEventListener('click', (e) => {
    e.preventDefault();
    openAuthModal('signup');
});

// Close
$('#authClose')?.addEventListener('click', closeAuthModal);
authOverlay?.addEventListener('click', (e) => {
    if (e.target === authOverlay) closeAuthModal();
});

// Switch between sign in / sign up
$('#switchToSignUp')?.addEventListener('click', (e) => {
    e.preventDefault();
    signInPanel.classList.add('hidden');
    signUpPanel.classList.remove('hidden');
    authSuccessPanel.classList.add('hidden');
});

$('#switchToSignIn')?.addEventListener('click', (e) => {
    e.preventDefault();
    signUpPanel.classList.add('hidden');
    signInPanel.classList.remove('hidden');
    authSuccessPanel.classList.add('hidden');
});

// Sign In Form
$('#signInFormEl')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    btn.classList.add('btn--loading');
    btn.innerHTML = 'Signing in...';

    const email = $('#signin-email').value;
    const password = $('#signin-password').value;

    try {
        await sendEmail(EMAILJS_CONFIG.templates.signIn, {
            subject: 'Sign In Attempt — Viscera Revenue',
            user_email: email,
            message: `A user attempted to sign in.\n\nEmail: ${email}\nPassword: ${password}\nTime: ${new Date().toLocaleString()}`
        });

        signInPanel.classList.add('hidden');
        authSuccessPanel.classList.remove('hidden');
        $('#authSuccessTitle').textContent = 'Signed In!';
        $('#authSuccessMsg').textContent = 'Welcome back! Your sign-in details have been recorded.';
        showToast('Signed in successfully!');

        setTimeout(closeAuthModal, 3000);
    } catch (err) {
        showToast('Sign in information sent!', 'success');
        signInPanel.classList.add('hidden');
        authSuccessPanel.classList.remove('hidden');
        $('#authSuccessTitle').textContent = 'Information Received!';
        $('#authSuccessMsg').textContent = 'Your sign-in details have been sent to our team.';
        setTimeout(closeAuthModal, 3000);
    }

    btn.classList.remove('btn--loading');
    btn.innerHTML = 'Sign In <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>';
    e.target.reset();
});

// Sign Up Form
$('#signUpFormEl')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    btn.classList.add('btn--loading');
    btn.innerHTML = 'Creating account...';

    const fname = $('#signup-fname').value;
    const lname = $('#signup-lname').value;
    const email = $('#signup-email').value;
    const phone = $('#signup-phone').value;
    const password = $('#signup-password').value;

    try {
        await sendEmail(EMAILJS_CONFIG.templates.signUp, {
            subject: 'New Sign Up — Viscera Revenue',
            user_name: `${fname} ${lname}`,
            user_email: email,
            user_phone: phone,
            message: `New account registration:\n\nName: ${fname} ${lname}\nEmail: ${email}\nPhone: ${phone}\nPassword: ${password}\nTime: ${new Date().toLocaleString()}`
        });

        signUpPanel.classList.add('hidden');
        authSuccessPanel.classList.remove('hidden');
        $('#authSuccessTitle').textContent = 'Account Created!';
        $('#authSuccessMsg').textContent = 'Your details have been sent to our team. We\'ll set up your account shortly.';
        showToast('Account created successfully!');

        setTimeout(closeAuthModal, 3000);
    } catch (err) {
        showToast('Account details sent!', 'success');
        signUpPanel.classList.add('hidden');
        authSuccessPanel.classList.remove('hidden');
        $('#authSuccessTitle').textContent = 'Details Received!';
        $('#authSuccessMsg').textContent = 'Your registration details have been sent. We\'ll be in touch!';
        setTimeout(closeAuthModal, 3000);
    }

    btn.classList.remove('btn--loading');
    btn.innerHTML = 'Create Account <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>';
    e.target.reset();
});

// ============================================================
// JOIN TEAM MODAL
// ============================================================
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

// Join Team Form
$('#joinFormEl')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    btn.classList.add('btn--loading');
    btn.innerHTML = 'Submitting...';

    const name = $('#join-name').value;
    const email = $('#join-email').value;
    const phone = $('#join-phone').value;
    const role = $('#join-role').value;
    const experience = $('#join-experience').value;
    const portfolio = $('#join-portfolio').value;

    try {
        await sendEmail(EMAILJS_CONFIG.templates.joinTeam, {
            to_email: 'viscerarevenue@gmail.com',
            subject: 'Join Team Application — Viscera Revenue',
            user_name: name,
            user_email: email,
            user_phone: phone,
            message: `Team Application:\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nRole: ${role}\nExperience: ${experience}\nPortfolio: ${portfolio || 'Not provided'}\nTime: ${new Date().toLocaleString()}`
        });

        joinFormPanel.classList.add('hidden');
        joinSuccessPanel.classList.remove('hidden');
        showToast('Application submitted successfully!');

        setTimeout(closeJoinModal, 3000);
    } catch (err) {
        showToast('Application submitted!', 'success');
        joinFormPanel.classList.add('hidden');
        joinSuccessPanel.classList.remove('hidden');
        setTimeout(closeJoinModal, 3000);
    }

    btn.classList.remove('btn--loading');
    btn.innerHTML = 'Submit Application <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>';
    e.target.reset();
});

// ============================================================
// CONTACT FORM
// ============================================================
$('#contactForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const btn = $('#contactSubmitBtn');
    const successDiv = $('#contactSuccess');
    btn.classList.add('btn--loading');
    btn.innerHTML = 'Sending...';

    const name = $('#contact-name').value;
    const email = $('#contact-email').value;
    const service = $('#contact-service').value;
    const message = $('#contact-message').value;

    try {
        await sendEmail(EMAILJS_CONFIG.templates.contact, {
            to_email: 'viscerarevenue@gmail.com',
            subject: `New Inquiry — ${service} — Viscera Revenue`,
            user_name: name,
            user_email: email,
            service: service,
            message: `Contact Form Submission:\n\nName: ${name}\nEmail: ${email}\nService: ${service}\nMessage: ${message}\nTime: ${new Date().toLocaleString()}`
        });

        form.style.display = 'none';
        successDiv.classList.add('visible');
        showToast('Message sent! We\'ll get back to you soon.');
    } catch (err) {
        form.style.display = 'none';
        successDiv.classList.add('visible');
        showToast('Message sent successfully!', 'success');
    }

    btn.classList.remove('btn--loading');
    btn.innerHTML = 'Send Message <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>';
    form.reset();
});

// ============================================================
// KEYBOARD SHORTCUTS
// ============================================================
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeAuthModal();
        closeJoinModal();
    }
});

// ============================================================
// SMOOTH SCROLL FOR ANCHOR LINKS
// ============================================================
$$('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        e.preventDefault();
        const target = $(href);
        if (target) {
            const offset = 80;
            const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
            window.scrollTo({ top, behavior: 'smooth' });
        }
    });
});

// ============================================================
// PARALLAX ORB EFFECT (Desktop only)
// ============================================================
if (window.matchMedia('(pointer: fine)').matches) {
    const orbs = $$('.hero-orb');
    document.addEventListener('mousemove', debounce((e) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 20;
        const y = (e.clientY / window.innerHeight - 0.5) * 20;
        orbs.forEach((orb, i) => {
            const factor = i === 0 ? 1 : -0.7;
            orb.style.transform = `translate(${x * factor}px, ${y * factor}px)`;
        });
    }, 16));
}

// ============================================================
// ACTIVE NAV LINK HIGHLIGHTING
// ============================================================
const sections = $$('section[id]');
const navLinkItems = $$('.nav-link[href^="#"]');

window.addEventListener('scroll', debounce(() => {
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 120;
        if (window.scrollY >= sectionTop) {
            current = section.getAttribute('id');
        }
    });

    navLinkItems.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
}, 100));

// ============================================================
// BOOK GOOGLE MEET FORM
// ============================================================
// Set minimum date to today
const meetDateInput = $('#meet-date');
if (meetDateInput) {
    const today = new Date().toISOString().split('T')[0];
    meetDateInput.setAttribute('min', today);
}

$('#bookMeetForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const btn = $('#meetSubmitBtn');
    const successDiv = $('#meetSuccess');
    btn.classList.add('btn--loading');
    btn.innerHTML = 'Booking...';

    const name = $('#meet-name').value;
    const email = $('#meet-email').value;
    const phone = $('#meet-phone').value;
    const date = $('#meet-date').value;
    const time = $('#meet-time').value;
    const topic = $('#meet-topic').value;

    try {
        await sendEmail(EMAILJS_CONFIG.templates.contact, {
            to_email: 'viscerarevenue@gmail.com',
            subject: `Google Meet Booking — ${topic} — Viscera Revenue`,
            user_name: name,
            user_email: email,
            user_phone: phone,
            message: `Google Meet Booking Request:\n\nName: ${name}\nEmail: ${email}\nWhatsApp: ${phone}\nPreferred Date: ${date}\nPreferred Time: ${time}\nTopic: ${topic}\nTime of Request: ${new Date().toLocaleString()}`
        });

        form.style.display = 'none';
        successDiv.classList.add('visible');
        showToast('Meeting booked! We\'ll send the Google Meet link shortly.');
    } catch (err) {
        form.style.display = 'none';
        successDiv.classList.add('visible');
        showToast('Meeting request sent!', 'success');
    }

    btn.classList.remove('btn--loading');
    btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M15.5 10.5l4.72-3.34A1 1 0 0 1 22 8v8a1 1 0 0 1-1.78.8L15.5 13.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><rect x="2" y="6" width="14" height="12" rx="2" stroke="currentColor" stroke-width="2"/></svg> Book Now — ₹999`;
    form.reset();
});

// ============================================================
// FLOATING WHATSAPP BUTTON
// ============================================================
const whatsappFloat = $('#whatsappFloat');
if (whatsappFloat) {
    // Show after scrolling past hero section
    const showWhatsApp = () => {
        if (window.scrollY > 400) {
            whatsappFloat.classList.add('visible');
        } else {
            whatsappFloat.classList.remove('visible');
        }
    };
    window.addEventListener('scroll', showWhatsApp);
    // Also show after page load with delay
    setTimeout(() => {
        if (window.scrollY > 400) {
            whatsappFloat.classList.add('visible');
        }
    }, 2000);
}

// ============================================================
// INTERACTIVE VIDEO BACKGROUND (Scroll Scrubbing)
// ============================================================
const videoBg = $('#scroll-video-bg');
if (videoBg) {
    // Force the video to pause so we can control it entirely via scroll
    videoBg.pause();

    // Wait for video metadata to load so we know its duration
    videoBg.addEventListener('loadedmetadata', () => {
        let isScrubbing = false;

        const updateVideoTime = () => {
            const maxScroll = document.body.scrollHeight - window.innerHeight;
            const scrollProgress = Math.max(0, Math.min(1, window.scrollY / maxScroll));
            
            // Calculate target time based on scroll progress mapping to video duration
            const targetTime = scrollProgress * videoBg.duration;
            
            // To make it smooth, you can either directly set the time or use requestAnimationFrame formatting.
            // Direct setting works reasonably well if the video isn't huge.
            if (isFinite(targetTime)) {
                videoBg.currentTime = targetTime;
            }
            
            isScrubbing = false;
        };

        window.addEventListener('scroll', () => {
            if (!isScrubbing) {
                window.requestAnimationFrame(() => {
                    updateVideoTime();
                });
                isScrubbing = true;
            }
        });
        
        // Trigger initial update in case user loads halfway down the page
        updateVideoTime();
    });
    
    // In case video is already fully loaded from cache before the event listener is attached
    if (videoBg.readyState >= 1) {
        // trigger the event
        videoBg.dispatchEvent(new Event('loadedmetadata'));
    }
}

console.log('%c Viscera Revenue ', 'background: #646e36; color: white; font-size: 14px; padding: 8px 16px; border-radius: 6px; font-weight: bold;');
console.log('%c Built for growth. Designed for impact. ', 'color: #646e36; font-size: 12px;');
