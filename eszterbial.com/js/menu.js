// ABOUTME: Reusable menu component that generates the navigation menu dynamically.
// ABOUTME: Handles menu open/close animations using GSAP and manages interactions.

(function () {
    'use strict';

    function getBasePath() {
        const path = window.location.pathname;
        if (path.includes('/projects/')) return '../';
        return '';
    }

    function createMenuHTML() {
        const basePath = getBasePath();

        return `
            <div class="menu-btn" id="menuBtn">MENU</div>
            <div class="menu-card" id="menuCard">
                <div class="menu-close-btn" id="closeBtn">
                    <svg width="60" height="20" viewBox="0 0 60 20">
                        <path d="M1 1L59 19" stroke="black"/>
                        <path d="M59 1L1 19" stroke="black"/>
                    </svg>
                </div>

                <nav class="menu-items">
                    <a href="${basePath}index.html" class="menu-link"><div class="menu-link-inner">HOME</div></a>
                    <a href="${basePath}about.html" class="menu-link"><div class="menu-link-inner">ABOUT</div></a>
                    <a href="${basePath}works.html" class="menu-link"><div class="menu-link-inner">WORK</div></a>
                    <a href="${basePath}contact.html" class="menu-link"><div class="menu-link-inner">CONTACT</div></a>
                </nav>

                <div class="menu-separator"></div>
            </div>
        `;
    }

    function initMenu() {
        const container = document.querySelector('.menu-container');
        if (!container) return;

        container.innerHTML = createMenuHTML();

        const menuBtn = document.getElementById('menuBtn');
        const menuCard = document.getElementById('menuCard');
        const closeBtn = document.getElementById('closeBtn');

        let isMenuOpen = false;
        let isAnimatingMenu = false;

        gsap.set(menuCard, {
            opacity: 0,
            visibility: 'hidden',
            scale: 0.95
        });

        function openMenu() {
            if (isAnimatingMenu || isMenuOpen) return;

            isAnimatingMenu = true;
            isMenuOpen = true;

            gsap.set(menuCard, {
                visibility: 'visible',
                opacity: 0,
                scale: 0.95
            });

            gsap.set('.menu-link-inner', { y: "150%" });

            const tl = gsap.timeline({
                onComplete: () => (isAnimatingMenu = false)
            });

            tl.to(menuCard, {
                duration: 0.5,
                opacity: 1,
                scale: 1,
                ease: "power3.out"
            })
            .to('.menu-link-inner', {
                duration: 0.8,
                y: "0%",
                stagger: 0.1,
                ease: "power4.out"
            }, "-=0.3");

            setTimeout(initMenuLetterHover, 100);
        }

        function closeMenu() {
            if (isAnimatingMenu || !isMenuOpen) return;

            isAnimatingMenu = true;
            isMenuOpen = false;

            const tl = gsap.timeline({
                onComplete: () => {
                    gsap.set(menuCard, { visibility: 'hidden' });
                    isAnimatingMenu = false;
                }
            });

            tl.to('.menu-link-inner', {
                duration: 0.4,
                y: "150%",
                stagger: 0.05,
                ease: "power2.in"
            })
            .to(menuCard, {
                duration: 0.4,
                opacity: 0,
                scale: 0.95,
                ease: "power2.inOut"
            }, "-=0.2");
        }

        // EVENT LISTENERS

        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            openMenu();
        });

        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeMenu();
        });

        document.addEventListener('click', (e) => {
            if (
                isMenuOpen &&
                !menuCard.contains(e.target) &&
                !menuBtn.contains(e.target)
            ) {
                closeMenu();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && isMenuOpen) {
                closeMenu();
            }
        });
    }

    function initMenuLetterHover() {
        const links = document.querySelectorAll('.menu-link-inner');

        links.forEach(link => {
            if (link.dataset.done) return;
            link.dataset.done = true;

            const text = link.textContent;
            link.textContent = '';

            const row1 = document.createElement('span');
            const row2 = document.createElement('span');

            row2.style.position = 'absolute';
            row2.style.top = '0';
            row2.style.left = '0';

            text.split('').forEach(char => {
                const c1 = document.createElement('span');
                const c2 = document.createElement('span');

                c1.textContent = char;
                c2.textContent = char;

                row1.appendChild(c1);
                row2.appendChild(c2);
            });

            link.appendChild(row1);
            link.appendChild(row2);

            gsap.set(row2.children, { yPercent: 120 });

            const parent = link.closest('.menu-link');

            parent.addEventListener('mouseenter', () => {
                gsap.to(row1.children, { yPercent: -120, stagger: 0.04 });
                gsap.to(row2.children, { yPercent: 0, stagger: 0.04 });
            });

            parent.addEventListener('mouseleave', () => {
                gsap.to(row1.children, { yPercent: 0, stagger: 0.04 });
                gsap.to(row2.children, { yPercent: 120, stagger: 0.04 });
            });
        });
    }

    function safeInit() {
        if (typeof gsap === 'undefined') {
            setTimeout(safeInit, 50);
            return;
        }
        initMenu();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', safeInit);
    } else {
        safeInit();
    }

    window.MenuComponent = {
        init: initMenu
    };

})();