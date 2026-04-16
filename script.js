/**
 * 💕 我们的专属网站 - JavaScript
 * 所有可自定义内容已提取到 config.js
 * 本文件负责网站的所有交互逻辑
 */

(function () {
    'use strict';

    // 从配置文件读取（config.js 必须在本文件之前加载）
    const C = (typeof SITE_CONFIG !== 'undefined') ? SITE_CONFIG : {};
    const loveWords = C.LOVE_WORDS || [];
    const sweetTexts = C.SWEET_TEXTS || [];
    const milestones = C.MILESTONES || [];

    // ========================================
    // ⚙️ 配置
    // ========================================
    const CONFIG = {
        TOGETHER_DATE: C.TOGETHER_DATE || '2024-01-01',
        FALLING_ELEMENTS: C.FALLING_ELEMENTS || ['🌸', '💕', '💗', '🌷', '✨', '❤️', '💎', '🎀'],
        FALLING_COUNT: C.FALLING_COUNT || 20,
        FALLING_MIN_DURATION: C.FALLING_MIN_DURATION || 6,
        FALLING_MAX_DURATION: C.FALLING_MAX_DURATION || 14,
        PARTICLE_COUNT: C.PARTICLE_COUNT || 50,
        LOVE_WORD_INTERVAL: C.LOVE_WORD_INTERVAL || 6000,
    };

    // ========================================
    // 🌸 DOM 元素引用
    // ========================================
    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => document.querySelectorAll(sel);

    const envelopeOverlay = $('#envelope-overlay');
    const envelope = $('#envelope');
    const letterOverlay = $('#letter-overlay');
    const enterBtn = $('#enter-btn');
    const mainPage = $('#main-page');
    const bgm = $('#bgm');
    const musicBtn = $('#music-btn');
    const dateInput = $('#together-date');
    const heroDate = $('#hero-date');

    // ========================================
    // 📝 页面初始化：从 config.js 填充内容
    // ========================================
    function initPageContent() {
        // 导航栏名称
        if (C.SITE_NAME) {
            $('#nav-logo').textContent = C.SITE_NAME;
            document.title = C.SITE_NAME;
        }

        // 底部文字
        if (C.FOOTER_TEXT) $('#footer-text').textContent = C.FOOTER_TEXT;
        if (C.FOOTER_COPY) $('#footer-copy').textContent = 'Made with ❤️ by ' + C.FOOTER_COPY;

        // 情书内容
        initLetter();

        // 时间线
        initTimeline();

        // 记忆卡片
        initMemoryCardsHTML();
    }

    // ========================================
    // 💌 填充情书内容
    // ========================================
    function initLetter() {
        const letter = C.LETTER;
        if (!letter) return;

        // 标题
        if (letter.title) {
            $('#letter-title').textContent = letter.title;
        }

        // 段落
        const container = $('#letter-content');
        container.innerHTML = '';
        const paragraphs = Array.isArray(letter.paragraphs) ? letter.paragraphs : [];

        paragraphs.forEach((text, i) => {
            const p = document.createElement('p');
            p.textContent = text;

            // 如果是最后一段且有署名，作为签名样式
            if (letter.signature && i === paragraphs.length - 1) {
                // 倒数第二段是正文最后一句
                container.appendChild(p);
                const sig = document.createElement('p');
                sig.className = 'letter-signature';
                sig.textContent = letter.signature;
                sig.style.animationDelay = ((i + 1) * 0.3) + 's';
                container.appendChild(sig);
            } else {
                p.style.animationDelay = (i * 0.3) + 's';
                container.appendChild(p);
            }
        });

        // 如果没有段落但有署名
        if (paragraphs.length === 0 && letter.signature) {
            const sig = document.createElement('p');
            sig.className = 'letter-signature';
            sig.textContent = letter.signature;
            container.appendChild(sig);
        }
    }

    // ========================================
    // ⭐ 填充时间线
    // ========================================
    function initTimeline() {
        const container = $('#timeline');
        if (!container || !C.TIMELINE) return;

        container.innerHTML = '';
        C.TIMELINE.forEach(item => {
            const div = document.createElement('div');
            div.className = 'timeline-item ' + (item.side || 'left');
            div.innerHTML = `
                <div class="timeline-content">
                    <h3>${escapeHtml(item.icon || '')} ${escapeHtml(item.title || '')}</h3>
                    <p>${escapeHtml(item.description || '')}</p>
                    <span class="timeline-date">${escapeHtml(item.date || '')}</span>
                </div>
            `;
            container.appendChild(div);
        });
    }

    // ========================================
    // 🎀 填充记忆卡片
    // ========================================
    function initMemoryCardsHTML() {
        const container = $('#memory-cards');
        if (!container || !C.MEMORY_CARDS) return;

        container.innerHTML = '';
        C.MEMORY_CARDS.forEach(card => {
            const div = document.createElement('div');
            div.className = 'memory-card';
            div.setAttribute('data-flip', '');
            div.innerHTML = `
                <div class="memory-card-inner">
                    <div class="memory-card-front">
                        <span class="memory-icon">${card.icon || '💖'}</span>
                        <h3>${escapeHtml(card.title || '')}</h3>
                    </div>
                    <div class="memory-card-back">
                        <p class="memory-detail">${escapeHtml(card.detail || '')}</p>
                    </div>
                </div>
            `;
            container.appendChild(div);
        });
    }

    // ========================================
    // 💌 信封开场动画
    // ========================================
    function initEnvelope() {
        const loadingScreen = $('#loading-screen');
        setTimeout(() => {
            loadingScreen.classList.add('hidden');
        }, 2500);

        const hasVisited = localStorage.getItem('love_site_visited');
        if (hasVisited) {
            loadingScreen.classList.add('hidden');
            envelopeOverlay.classList.add('hidden');
            letterOverlay.classList.add('hidden');
            mainPage.classList.remove('hidden');
            initAllFeatures();
            return;
        }

        envelope.addEventListener('click', () => {
            envelope.classList.add('opening');
            setTimeout(() => {
                envelopeOverlay.classList.add('hidden');
                letterOverlay.classList.remove('hidden');
            }, 800);
        });

        enterBtn.addEventListener('click', () => {
            letterOverlay.classList.add('hidden');
            mainPage.classList.remove('hidden');
            localStorage.setItem('love_site_visited', 'true');
            initAllFeatures();
            playBGM();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ========================================
    // 🎵 BGM 音乐控制
    // ========================================
    let isPlaying = false;
    let isMuted = false;

    // ========================================
    // 🔄 重置按钮
    // ========================================
    function initResetBtn() {
        const resetBtn = $('#reset-btn');
        if (!resetBtn) return;

        resetBtn.style.display = 'flex';

        let confirmPending = false;
        let confirmTimer = null;

        resetBtn.addEventListener('click', () => {
            if (!confirmPending) {
                confirmPending = true;
                resetBtn.classList.add('confirming');
                resetBtn.title = '再次点击确认重置';
                confirmTimer = setTimeout(() => {
                    confirmPending = false;
                    resetBtn.classList.remove('confirming');
                    resetBtn.title = '重新观看信封动画';
                }, 3000);
            } else {
                clearTimeout(confirmTimer);
                confirmPending = false;
                resetBtn.classList.remove('confirming');
                resetBtn.title = '重新观看信封动画';
                localStorage.removeItem('love_site_visited');
                if (bgm && isPlaying) {
                    bgm.pause();
                    isPlaying = false;
                    musicBtn.classList.remove('playing');
                }
                window.location.reload();
            }
        });
    }

    function playBGM() {
        if (bgm && !isPlaying) {
            bgm.muted = isMuted;
            bgm.play().then(() => {
                isPlaying = true;
                musicBtn.classList.add('playing');
            }).catch(() => {
                console.log('音频播放被浏览器阻止，请手动点击音乐按钮');
            });
        }
    }

    function toggleMusic() {
        if (!bgm) return;
        if (isPlaying) {
            bgm.pause();
            isPlaying = false;
            musicBtn.classList.remove('playing');
            musicBtn.classList.remove('muted');
        } else {
            bgm.muted = isMuted;
            bgm.play().then(() => {
                isPlaying = true;
                musicBtn.classList.add('playing');
                musicBtn.classList.toggle('muted', isMuted);
            }).catch(() => {
                showToast('🎵 请把音乐文件放到网站目录中');
            });
        }
    }

    function toggleMute() {
        if (!bgm) return;
        isMuted = !isMuted;
        bgm.muted = isMuted;
        musicBtn.classList.toggle('muted', isMuted);
        showToast(isMuted ? '🔇 已静音' : '🔊 已取消静音');
    }

    // ========================================
    // ⏰ 恋爱计时器
    // ========================================
    let togetherDate = null;

    function initTimer() {
        const savedDate = localStorage.getItem('together_date') || CONFIG.TOGETHER_DATE;
        dateInput.value = savedDate;
        togetherDate = new Date(savedDate);
        updateHeroDate();

        dateInput.addEventListener('change', (e) => {
            const newDate = e.target.value;
            if (newDate) {
                togetherDate = new Date(newDate);
                localStorage.setItem('together_date', newDate);
                updateHeroDate();
                updateMilestones();
                showToast('💕 纪念日已更新');
            }
        });

        updateTimer();
        setInterval(updateTimer, 1000);
        updateMilestones();
    }

    function updateHeroDate() {
        if (togetherDate) {
            const y = togetherDate.getFullYear();
            const m = togetherDate.getMonth() + 1;
            const d = togetherDate.getDate();
            heroDate.textContent = `${y}年${m}月${d}日`;
        }
    }

    function updateTimer() {
        if (!togetherDate) return;

        const now = new Date();
        const diff = now - togetherDate;

        if (diff < 0) {
            $('#timer-days').textContent = '0';
            $('#timer-hours').textContent = '0';
            $('#timer-minutes').textContent = '0';
            $('#timer-seconds').textContent = '0';
            return;
        }

        const totalSeconds = Math.floor(diff / 1000);
        const days = Math.floor(totalSeconds / 86400);
        const hours = Math.floor((totalSeconds % 86400) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        animateNumber($('#timer-days'), days);
        animateNumber($('#timer-hours'), hours);
        animateNumber($('#timer-minutes'), minutes);
        animateNumber($('#timer-seconds'), seconds);

        if (seconds === 0) {
            const randomIdx = Math.floor(Math.random() * sweetTexts.length);
            $('#timer-text').textContent = sweetTexts[randomIdx] || '';
        }
    }

    function animateNumber(el, newVal) {
        const currentVal = parseInt(el.textContent) || 0;
        if (currentVal !== newVal) {
            el.textContent = newVal;
            el.style.transform = 'scale(1.15)';
            setTimeout(() => {
                el.style.transform = 'scale(1)';
            }, 200);
            el.style.transition = 'transform 0.2s ease';
        }
    }

    function updateMilestones() {
        if (!togetherDate) return;

        const now = new Date();
        const diffDays = Math.floor((now - togetherDate) / (1000 * 60 * 60 * 24));

        const container = $('#milestones');
        container.innerHTML = '';

        milestones.forEach(m => {
            const badge = document.createElement('span');
            badge.className = 'milestone-badge' + (diffDays >= m.days ? ' achieved' : '');
            badge.textContent = diffDays >= m.days ? `✅ ${m.label}` : `🔒 ${m.label}`;
            container.appendChild(badge);
        });
    }

    // ========================================
    // 💬 情话轮播
    // ========================================
    let currentWordIndex = 0;
    let autoPlayTimer = null;

    function initLoveWords() {
        if (loveWords.length === 0) return;

        shuffleArray(loveWords);
        currentWordIndex = 0;

        renderDots();
        showLoveWord(0);
        startAutoPlay();

        $('#prev-word').addEventListener('click', () => {
            currentWordIndex = (currentWordIndex - 1 + loveWords.length) % loveWords.length;
            showLoveWord(currentWordIndex);
            restartAutoPlay();
        });

        $('#next-word').addEventListener('click', () => {
            currentWordIndex = (currentWordIndex + 1) % loveWords.length;
            showLoveWord(currentWordIndex);
            restartAutoPlay();
        });

        $('#random-love').addEventListener('click', () => {
            const randomIdx = Math.floor(Math.random() * loveWords.length);
            currentWordIndex = randomIdx;
            showLoveWord(randomIdx);
            restartAutoPlay();
        });

        // 触控滑动
        const card = $('#love-word-card');
        let touchStartX = 0;

        card.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        card.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].screenX;
            const diff = touchStartX - touchEndX;
            if (Math.abs(diff) > 50) {
                if (diff > 0) {
                    currentWordIndex = (currentWordIndex + 1) % loveWords.length;
                } else {
                    currentWordIndex = (currentWordIndex - 1 + loveWords.length) % loveWords.length;
                }
                showLoveWord(currentWordIndex);
                restartAutoPlay();
            }
        }, { passive: true });
    }

    function showLoveWord(index) {
        const textEl = $('#love-word-text');
        textEl.style.opacity = '0';
        textEl.style.transform = 'translateY(10px)';

        setTimeout(() => {
            textEl.textContent = loveWords[index];
            textEl.style.opacity = '1';
            textEl.style.transform = 'translateY(0)';
        }, 300);

        $$('.dot').forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
    }

    function renderDots() {
        const dotsContainer = $('#love-words-dots');
        dotsContainer.innerHTML = '';
        loveWords.forEach((_, i) => {
            const dot = document.createElement('span');
            dot.className = 'dot' + (i === 0 ? ' active' : '');
            dot.addEventListener('click', () => {
                currentWordIndex = i;
                showLoveWord(i);
                restartAutoPlay();
            });
            dotsContainer.appendChild(dot);
        });
    }

    function startAutoPlay() {
        autoPlayTimer = setInterval(() => {
            currentWordIndex = (currentWordIndex + 1) % loveWords.length;
            showLoveWord(currentWordIndex);
        }, CONFIG.LOVE_WORD_INTERVAL);
    }

    function restartAutoPlay() {
        clearInterval(autoPlayTimer);
        startAutoPlay();
    }

    // ========================================
    // 📸 照片墙
    // ========================================
    function initGallery() {
        const grid = $('#gallery-grid');
        const photoFiles = [
            'photos/1.jpg', 'photos/2.jpg', 'photos/3.jpg',
            'photos/4.jpg', 'photos/5.jpg', 'photos/6.jpg',
        ];

        const loadPromises = photoFiles.map(src => {
            return new Promise(resolve => {
                const img = new Image();
                img.onload = () => resolve({ src, exists: true });
                img.onerror = () => resolve({ src, exists: false });
                img.src = src;
            });
        });

        Promise.all(loadPromises).then(results => {
            const existingPhotos = results.filter(r => r.exists);

            if (existingPhotos.length === 0) {
                const hint = document.createElement('div');
                hint.className = 'gallery-item placeholder-item';
                hint.innerHTML = `
                    <div class="placeholder-heart">💑</div>
                    <p>把你们的合照放到<br><code>photos/</code> 文件夹中</p>
                    <p style="font-size:12px;margin-top:8px;color:var(--color-text-lighter)">
                        支持 1.jpg ~ 6.jpg
                    </p>
                `;
                grid.appendChild(hint);
                return;
            }

            existingPhotos.forEach((photo, index) => {
                const item = document.createElement('div');
                item.className = 'gallery-item';
                item.innerHTML = `
                    <img src="${photo.src}" alt="我们的合照 ${index + 1}" loading="lazy">
                    <div class="photo-overlay">💕 我们的第${index + 1}张合照</div>
                `;
                item.addEventListener('click', () => openLightbox(photo.src));
                grid.appendChild(item);
            });
        });
    }

    // ========================================
    // 🔍 照片灯箱
    // ========================================
    function initLightbox() {
        const lightbox = document.createElement('div');
        lightbox.className = 'lightbox';
        lightbox.innerHTML = `
            <button class="lightbox-close">✕</button>
            <img src="" alt="照片大图">
        `;
        document.body.appendChild(lightbox);

        lightbox.querySelector('.lightbox-close').addEventListener('click', () => {
            lightbox.classList.remove('active');
        });

        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                lightbox.classList.remove('active');
            }
        });
    }

    function openLightbox(src) {
        const lightbox = document.querySelector('.lightbox');
        lightbox.querySelector('img').src = src;
        lightbox.classList.add('active');
    }

    // ========================================
    // ✨ 飘落花瓣/爱心
    // ========================================
    function initFallingElements() {
        const container = $('#falling-elements');
        const elements = CONFIG.FALLING_ELEMENTS;
        const isMobile = window.innerWidth < 768;
        const maxCount = isMobile ? 10 : CONFIG.FALLING_COUNT;

        function createElement() {
            const el = document.createElement('div');
            el.className = 'falling-element';
            el.textContent = elements[Math.floor(Math.random() * elements.length)];

            const left = Math.random() * 100;
            const duration = CONFIG.FALLING_MIN_DURATION + Math.random() * (CONFIG.FALLING_MAX_DURATION - CONFIG.FALLING_MIN_DURATION);
            const size = 14 + Math.random() * 20;
            const delay = Math.random() * 5;

            el.style.left = left + '%';
            el.style.fontSize = size + 'px';
            el.style.animationDuration = duration + 's';
            el.style.animationDelay = delay + 's';

            container.appendChild(el);

            setTimeout(() => {
                el.remove();
                createElement();
            }, (duration + delay) * 1000);
        }

        for (let i = 0; i < maxCount; i++) {
            createElement();
        }
    }

    // ========================================
    // 🌟 粒子背景
    // ========================================
    function initParticles() {
        const canvas = $('#particles-canvas');
        const ctx = canvas.getContext('2d');
        const isMobile = window.innerWidth < 768;
        const particleCount = isMobile ? 20 : CONFIG.PARTICLE_COUNT;
        const connectDist = isMobile ? 80 : 120;

        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        resize();
        window.addEventListener('resize', resize);

        const particles = [];

        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                radius: Math.max(1, Math.random() * 3),
                opacity: 0.1 + Math.random() * 0.4,
                color: [
                    'rgba(236, 72, 153,',
                    'rgba(244, 63, 94,',
                    'rgba(168, 85, 247,',
                    'rgba(249, 168, 212,',
                ][Math.floor(Math.random() * 4)],
            });
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = p.color + p.opacity + ')';
                ctx.fill();
            });

            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < connectDist) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(236, 72, 153, ${0.1 * (1 - dist / connectDist)})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }

            requestAnimationFrame(animate);
        }

        animate();
    }

    // ========================================
    // 🖱️ 点击/触控爱心效果
    // ========================================
    function initClickHearts() {
        const hearts = ['❤️', '💕', '💖', '💗', '💓', '💘', '💝', '🌹', '✨', '🌸'];
        let lastTouchTime = 0;

        function createHeart(x, y) {
            const heart = document.createElement('div');
            heart.className = 'click-heart';
            heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
            heart.style.left = (x - 10) + 'px';
            heart.style.top = (y - 10) + 'px';
            document.body.appendChild(heart);
            setTimeout(() => heart.remove(), 1000);
        }

        document.addEventListener('click', (e) => {
            const now = Date.now();
            if (now - lastTouchTime < 300) return;
            createHeart(e.clientX, e.clientY);
        });

        document.addEventListener('touchstart', (e) => {
            lastTouchTime = Date.now();
            const touch = e.touches[0];
            if (touch) {
                createHeart(touch.clientX, touch.clientY);
            }
        }, { passive: true });
    }

    // ========================================
    // 📜 滚动动画
    // ========================================
    function initScrollAnimations() {
        window.addEventListener('scroll', () => {
            const navbar = $('.navbar');
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }

            const sections = ['home', 'timer', 'love-words', 'about-you', 'gallery', 'moments', 'wishes', 'love-diary', 'messages'];
            let current = '';
            sections.forEach(id => {
                const section = document.getElementById(id);
                if (section) {
                    const rect = section.getBoundingClientRect();
                    if (rect.top <= 200) {
                        current = id;
                    }
                }
            });

            $$('.nav-link').forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === '#' + current) {
                    link.classList.add('active');
                }
            });

            $$('.timeline-item').forEach(item => {
                const rect = item.getBoundingClientRect();
                if (rect.top < window.innerHeight * 0.8) {
                    item.classList.add('visible');
                }
            });
        });

        $$('.section-content').forEach(el => {
            el.classList.add('fade-in-up');
        });

        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                }
            });
        }, { threshold: 0.15 });

        $$('.section').forEach(el => sectionObserver.observe(el));

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.1 });

        $$('.fade-in-up').forEach(el => observer.observe(el));
    }

    // ========================================
    // 📱 移动端导航菜单
    // ========================================
    function initMobileNav() {
        const navLinks = $('.nav-links');

        const toggle = document.createElement('button');
        toggle.className = 'nav-toggle';
        toggle.innerHTML = '<span></span><span></span><span></span>';
        toggle.setAttribute('aria-label', '切换菜单');

        $('.navbar').insertBefore(toggle, navLinks);

        toggle.addEventListener('click', () => {
            navLinks.classList.toggle('mobile-open');
        });

        $$('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('mobile-open');
            });
        });
    }

    // ========================================
    // 💝 爱心进度条动画
    // ========================================
    function initLoveMeter() {
        const percentEl = $('#love-percent');
        let count = 0;
        const target = 100;

        function countUp() {
            if (count < target) {
                count++;
                percentEl.textContent = count;
                setTimeout(countUp, 30);
            }
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    countUp();
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        const meter = $('#love-meter');
        if (meter) {
            observer.observe(meter.parentElement);
        }
    }

    // ========================================
    // 🔔 Toast 消息
    // ========================================
    function showToast(message) {
        const existing = $('.toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);

        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400);
        }, 2500);
    }

    // ========================================
    // 🔧 工具函数
    // ========================================
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // ========================================
    // 🎀 关于你 / 记忆卡片翻转
    // ========================================
    function initMemoryCards() {
        $$('.memory-card[data-flip]').forEach(card => {
            card.addEventListener('click', () => {
                card.classList.toggle('flipped');
            });
            card.addEventListener('touchend', (e) => {
                e.preventDefault();
                card.classList.toggle('flipped');
            });
        });
    }

    // ========================================
    // 🌟 星空许愿墙
    // ========================================
    let wishTooltip = null;

    function initWishes() {
        const wishInput = $('#wish-input');
        const wishSubmit = $('#wish-submit');
        const wishesList = $('#wishes-list');
        const wishesSky = $('#wishes-sky');

        const wishes = JSON.parse(localStorage.getItem('love_wishes') || '[]');
        renderWishes(wishes);

        createDecoStars(wishesSky, 15);
        renderWishStars(wishesSky, wishes);

        // 创建弹窗元素
        wishTooltip = document.createElement('div');
        wishTooltip.className = 'wish-tooltip';
        wishTooltip.innerHTML = '<div class="wish-tooltip-text"></div><div class="wish-tooltip-time"></div>';
        wishesSky.appendChild(wishTooltip);

        wishSubmit.addEventListener('click', () => {
            const text = wishInput.value.trim();
            if (!text) {
                showToast('🌟 请先写下你的愿望');
                return;
            }

            const wish = {
                text: text,
                time: new Date().toLocaleString('zh-CN'),
                id: Date.now()
            };

            wishes.unshift(wish);
            localStorage.setItem('love_wishes', JSON.stringify(wishes));
            wishInput.value = '';
            renderWishes(wishes);
            createWishStar(wishesSky, wish);
            showToast('✨ 愿望已挂上星空，点击星星可查看哦');
        });

        wishesSky.addEventListener('click', (e) => {
            if (!e.target.classList.contains('wish-star-anim')) {
                hideWishTooltip();
            }
        });
    }

    function renderWishStars(container, wishes) {
        wishes.forEach(wish => {
            createWishStar(container, wish, false);
        });
    }

    function createWishStar(container, wish, animate = true) {
        const star = document.createElement('div');
        star.className = 'wish-star-anim';
        star.textContent = '⭐';

        const left = 5 + Math.random() * 85;
        const top = 3 + Math.random() * 60;
        star.style.left = left + '%';
        star.style.top = top + '%';
        star.style.fontSize = (18 + Math.random() * 10) + 'px';

        if (!animate) {
            star.style.animation = `wishStarTwinkle ${2 + Math.random() * 2}s ease-in-out infinite`;
            star.style.animationDelay = Math.random() * 2 + 's';
        } else {
            star.addEventListener('animationend', () => {
                star.style.animation = `wishStarTwinkle ${2 + Math.random() * 2}s ease-in-out infinite`;
                star.style.animationDelay = '0s';
            }, { once: true });
        }

        star.addEventListener('click', (e) => {
            e.stopPropagation();
            showWishTooltip(star, wish);
        });

        star.addEventListener('touchend', (e) => {
            e.preventDefault();
            e.stopPropagation();
            showWishTooltip(star, wish);
        });

        container.appendChild(star);
    }

    function showWishTooltip(starEl, wish) {
        if (!wishTooltip) return;

        const textEl = wishTooltip.querySelector('.wish-tooltip-text');
        const timeEl = wishTooltip.querySelector('.wish-tooltip-time');
        textEl.textContent = wish.text;
        timeEl.textContent = wish.time;

        const skyRect = $('#wishes-sky').getBoundingClientRect();
        const starRect = starEl.getBoundingClientRect();

        // 定位：默认在星星上方
        let tooltipLeft = starRect.left - skyRect.left + starRect.width / 2;
        let tooltipTop = starRect.top - skyRect.top - 10;
        let showBelow = false;

        // 如果上方空间不足（星星在容器顶部附近），改到下方显示
        if (starRect.top < skyRect.top + 80) {
            showBelow = true;
            tooltipTop = starRect.top - skyRect.top + starRect.height + 10;
            wishTooltip.classList.add('tooltip-below');
            wishTooltip.classList.remove('tooltip-above');
        } else {
            wishTooltip.classList.add('tooltip-above');
            wishTooltip.classList.remove('tooltip-below');
        }

        // 确保不超出左右边界
        const tooltipWidth = 200;
        const skyWidth = skyRect.width;
        if (tooltipLeft < tooltipWidth / 2 + 10) {
            tooltipLeft = tooltipWidth / 2 + 10;
        } else if (tooltipLeft > skyWidth - tooltipWidth / 2 - 10) {
            tooltipLeft = skyWidth - tooltipWidth / 2 - 10;
        }

        wishTooltip.style.left = tooltipLeft + 'px';
        wishTooltip.style.top = tooltipTop + 'px';

        if (showBelow) {
            wishTooltip.style.transform = 'translate(-50%, 0)';
        } else {
            wishTooltip.style.transform = 'translate(-50%, -100%)';
        }

        wishTooltip.classList.add('visible');

        clearTimeout(wishTooltip._hideTimer);
        wishTooltip._hideTimer = setTimeout(hideWishTooltip, 3000);
    }

    function hideWishTooltip() {
        if (wishTooltip) {
            wishTooltip.classList.remove('visible');
        }
    }

    function renderWishes(wishes) {
        const list = $('#wishes-list');
        list.innerHTML = '';
        wishes.forEach((wish, index) => {
            const item = document.createElement('div');
            item.className = 'wish-item';
            item.style.animationDelay = (index * 0.05) + 's';
            item.innerHTML = `
                <span class="wish-item-star">⭐</span>
                <span class="wish-item-text">${escapeHtml(wish.text)}</span>
                <span style="font-size:10px;color:rgba(255,255,255,0.4)">${wish.time}</span>
                <button class="wish-item-delete" data-id="${wish.id}">✕</button>
            `;
            item.querySelector('.wish-item-delete').addEventListener('click', () => {
                const idx = wishes.findIndex(w => w.id === wish.id);
                if (idx > -1) {
                    wishes.splice(idx, 1);
                    localStorage.setItem('love_wishes', JSON.stringify(wishes));
                    renderWishes(wishes);
                    $$('#wishes-sky .wish-star-anim').forEach(s => s.remove());
                    renderWishStars($('#wishes-sky'), wishes);
                }
            });
            list.appendChild(item);
        });
    }

    function createDecoStars(container, count) {
        for (let i = 0; i < count; i++) {
            const star = document.createElement('div');
            star.className = 'wish-star';
            star.textContent = ['✨', '🌟', '💫'][Math.floor(Math.random() * 3)];
            star.style.left = (5 + Math.random() * 90) + '%';
            star.style.top = (5 + Math.random() * 70) + '%';
            star.style.fontSize = (10 + Math.random() * 14) + 'px';
            star.style.opacity = 0.3 + Math.random() * 0.5;
            star.style.animation = `wishStarTwinkle ${2 + Math.random() * 3}s ease-in-out infinite`;
            star.style.animationDelay = Math.random() * 2 + 's';
            container.appendChild(star);
        }
    }

    // ========================================
    // 📅 爱心日历
    // ========================================
    let calYear, calMonth;

    function initCalendar() {
        const now = new Date();
        calYear = now.getFullYear();
        calMonth = now.getMonth();

        $('#cal-prev').addEventListener('click', () => {
            calMonth--;
            if (calMonth < 0) { calMonth = 11; calYear--; }
            renderCalendar();
        });

        $('#cal-next').addEventListener('click', () => {
            calMonth++;
            if (calMonth > 11) { calMonth = 0; calYear++; }
            renderCalendar();
        });

        renderCalendar();
    }

    function renderCalendar() {
        const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
        $('#cal-month').textContent = `${calYear}年 ${monthNames[calMonth]}`;

        const body = $('#cal-body');
        body.innerHTML = '';

        const today = new Date();
        const firstDay = new Date(calYear, calMonth, 1).getDay();
        const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
        const checkedDays = JSON.parse(localStorage.getItem('love_checked_days') || '{}');

        for (let i = 0; i < firstDay; i++) {
            const empty = document.createElement('div');
            empty.className = 'cal-day empty';
            body.appendChild(empty);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dayEl = document.createElement('div');
            dayEl.className = 'cal-day';
            dayEl.textContent = day;

            const dateKey = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isToday = (calYear === today.getFullYear() && calMonth === today.getMonth() && day === today.getDate());
            const isPast = new Date(calYear, calMonth, day) <= today;

            if (isToday) {
                dayEl.classList.add('today');
            } else if (isPast) {
                dayEl.classList.add('past');
            }

            if (checkedDays[dateKey]) {
                dayEl.classList.add('checked');
                if (!isToday) dayEl.classList.remove('past');
            }

            if (isPast || isToday) {
                dayEl.addEventListener('click', () => {
                    toggleCheckDay(dateKey, dayEl);
                });
            }

            body.appendChild(dayEl);
        }

        updateCalStats(checkedDays);
    }

    function toggleCheckDay(dateKey, dayEl) {
        const checkedDays = JSON.parse(localStorage.getItem('love_checked_days') || '{}');
        if (checkedDays[dateKey]) {
            delete checkedDays[dateKey];
            dayEl.classList.remove('checked');
            if (!dayEl.classList.contains('today')) {
                dayEl.classList.add('past');
            }
        } else {
            checkedDays[dateKey] = true;
            dayEl.classList.remove('past');
            dayEl.classList.add('checked');
        }
        localStorage.setItem('love_checked_days', JSON.stringify(checkedDays));
        updateCalStats(checkedDays);
    }

    function updateCalStats(checkedDays) {
        const total = Object.keys(checkedDays).length;
        const statsEl = $('#cal-stats');
        if (total > 0) {
            statsEl.textContent = `💗 已经向你表达爱意 ${total} 天，继续加油呀~`;
        } else {
            statsEl.textContent = '点击过去的日期，记录每一天的爱 💕';
        }
    }

    // ========================================
    // 💌 留言板
    // ========================================
    function initMessages() {
        const messages = JSON.parse(localStorage.getItem('love_messages') || '[]');
        renderMessages(messages);

        $('#msg-submit').addEventListener('click', () => {
            const author = $('#msg-author').value.trim() || '匿名';
            const content = $('#msg-content').value.trim();

            if (!content) {
                showToast('💌 请写点什么再提交');
                return;
            }

            const msg = {
                author: escapeHtml(author),
                content: escapeHtml(content),
                time: new Date().toLocaleString('zh-CN'),
                id: Date.now()
            };

            messages.unshift(msg);
            localStorage.setItem('love_messages', JSON.stringify(messages));
            $('#msg-content').value = '';
            renderMessages(messages);
            showToast('💕 心意已传达');
        });
    }

    function renderMessages(messages) {
        const list = $('#messages-list');
        list.innerHTML = '';

        if (messages.length === 0) {
            list.innerHTML = '<p style="font-family:var(--font-serif);font-size:14px;color:var(--color-text-lighter);text-align:center;padding:20px">还没有留言，写下第一条吧 💌</p>';
            return;
        }

        messages.forEach((msg, index) => {
            const card = document.createElement('div');
            card.className = 'message-card';
            card.style.animationDelay = (index * 0.05) + 's';
            card.innerHTML = `
                <div class="message-card-header">
                    <span class="message-author">${msg.author}</span>
                    <span class="message-time">${msg.time}</span>
                </div>
                <div class="message-body">${msg.content}</div>
            `;
            list.appendChild(card);
        });
    }

    // ========================================
    // 🚀 初始化所有功能
    // ========================================
    function initAllFeatures() {
        initTimer();
        initLoveWords();
        initGallery();
        initFallingElements();
        initParticles();
        initClickHearts();
        initScrollAnimations();
        initMobileNav();
        initLoveMeter();
        initMemoryCards();
        initWishes();
        initCalendar();
        initMessages();

        musicBtn.addEventListener('click', toggleMusic);

        let musicPressTimer = null;
        musicBtn.addEventListener('mousedown', () => {
            musicPressTimer = setTimeout(() => {
                toggleMute();
                musicPressTimer = null;
            }, 600);
        });
        musicBtn.addEventListener('mouseup', () => {
            if (musicPressTimer) clearTimeout(musicPressTimer);
        });
        musicBtn.addEventListener('mouseleave', () => {
            if (musicPressTimer) clearTimeout(musicPressTimer);
        });
        musicBtn.addEventListener('touchstart', (e) => {
            musicPressTimer = setTimeout(() => {
                e.preventDefault();
                toggleMute();
                musicPressTimer = null;
            }, 600);
        }, { passive: false });
        musicBtn.addEventListener('touchend', () => {
            if (musicPressTimer) clearTimeout(musicPressTimer);
        });

        initResetBtn();
    }

    // ========================================
    // 🌟 页面启动
    // ========================================
    document.addEventListener('DOMContentLoaded', () => {
        // 先填充页面内容（从 config.js）
        initPageContent();
        // 然后初始化交互逻辑
        initLightbox();
        initEnvelope();
    });

})();
