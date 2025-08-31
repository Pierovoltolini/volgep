// JavaScript source code
/* VOLGEP – Interacciones de UI */

(function () {
    // Helper: selección segura
    const $ = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

    // 1) Inyectar botón hamburguesa en mobile y manejar apertura del menú
    const headerInner = $('.header__inner');
    const nav = $('.nav');

    if (headerInner && nav) {
        const btn = document.createElement('button');
        btn.className = 'header__burger';
        btn.setAttribute('aria-label', 'Abrir menú');
        btn.setAttribute('aria-expanded', 'false');
        btn.innerHTML = `
      <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M3 6h18v2H3V6Zm0 5h18v2H3v-2Zm0 5h18v2H3v-2Z"/>
      </svg>
    `;
        // Insertar antes del nav (lado derecho)
        headerInner.insertBefore(btn, nav);

        const toggleMenu = () => {
            const open = nav.classList.toggle('nav--open');
            btn.setAttribute('aria-expanded', String(open));
        };

        btn.addEventListener('click', toggleMenu);

        // Cerrar al hacer click en un enlace del menú
        nav.addEventListener('click', (e) => {
            const a = e.target.closest('a');
            if (a && nav.classList.contains('nav--open')) {
                nav.classList.remove('nav--open');
                btn.setAttribute('aria-expanded', 'false');
            }
        });

        // Cerrar al hacer scroll
        window.addEventListener('scroll', () => {
            if (nav.classList.contains('nav--open')) {
                nav.classList.remove('nav--open');
                btn.setAttribute('aria-expanded', 'false');
            }
        }, { passive: true });
    }

    // 2) Header compacto al hacer scroll
    const header = $('.header');
    let lastY = window.scrollY;
    window.addEventListener('scroll', () => {
        const y = window.scrollY;
        if (!header) return;
        header.style.borderBottomColor = y > 8 ? '#253148' : '#1d2433';
        lastY = y;
    }, { passive: true });

    // 3) Scroll interno suave + offset para header sticky
    const internalLinks = $$('a[href^="#"]');
    internalLinks.forEach(a => {
        a.addEventListener('click', (e) => {
            const id = a.getAttribute('href');
            if (!id || id.length < 2) return;
            const el = $(id);
            if (!el) return;
            e.preventDefault();
            const y = el.getBoundingClientRect().top + window.scrollY - 72;
            window.scrollTo({ top: y, behavior: 'smooth' });
            el.setAttribute('tabindex', '-1');
            el.focus({ preventScroll: true });
            setTimeout(() => el.removeAttribute('tabindex'), 600);
        });
    });

    // 4) Revelado en scroll
    const toReveal = $$('.card, .feature, .testimonial, .cta-strip, .hero__media, .hero__copy, details');
    toReveal.forEach(el => el.classList.add('reveal'));
    const io = new IntersectionObserver((entries) => {
        entries.forEach(ent => {
            if (ent.isIntersecting) {
                ent.target.classList.add('is-in');
                io.unobserve(ent.target);
            }
        });
    }, { threshold: .2 });
    toReveal.forEach(el => io.observe(el));

    // 5) Protección básica de formulario (honeypot) y feedback
    const form = $('.form[action]');
    if (form) {
        // Honeypot
        const honeypot = document.createElement('input');
        honeypot.type = 'text';
        honeypot.name = 'empresa';
        honeypot.autocomplete = 'off';
        honeypot.tabIndex = -1;
        honeypot.style.position = 'absolute';
        honeypot.style.left = '-9999px';
        form.appendChild(honeypot);

        form.addEventListener('submit', function (e) {
            // Si el honeypot tiene contenido, es bot
            if (honeypot.value.trim() !== '') {
                e.preventDefault();
                alert('Error al enviar. Por favor, intentá nuevamente.');
                return;
            }
        });
    }

    // 6) Mejoras performance imágenes (agregar loading=lazy si faltara)
    $$('img:not([loading])').forEach(img => img.setAttribute('loading', 'lazy'));
})();



/* ========== VOLGEP — Lógica FAB WhatsApp ========== */
(function () {
    const fab = document.getElementById('whatsappFab');
    const btn = document.getElementById('whToggle');
    const panel = document.getElementById('whPanel');
    if (!fab || !btn || !panel) return;

    const open = () => {
        fab.classList.add('whatsapp-fab--open');
        btn.setAttribute('aria-expanded', 'true');
        // sacar animación de atención para que no siga
        btn.classList.remove('attn');
    };
    const close = () => {
        fab.classList.remove('whatsapp-fab--open');
        btn.setAttribute('aria-expanded', 'false');
    };
    const toggle = () => fab.classList.contains('whatsapp-fab--open') ? close() : open();

    btn.addEventListener('click', toggle);

    // Cerrar con click afuera
    document.addEventListener('click', (e) => {
        if (!fab.contains(e.target) && fab.classList.contains('whatsapp-fab--open')) close();
    });

    // Cerrar con Esc
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && fab.classList.contains('whatsapp-fab--open')) close();
    });

    // Accesibilidad: si se abre, enfocar primer link
    panel.addEventListener('transitionend', () => {
        if (fab.classList.contains('whatsapp-fab--open')) {
            const first = panel.querySelector('a');
            first && first.focus({ preventScroll: false });
        }
    }, { passive: true });

    // Tip: mostrar la animación de atención solo una vez a los 3s
    setTimeout(() => {
        if (!fab.classList.contains('whatsapp-fab--open')) btn.classList.add('attn');
    }, 3000);
})();

/* Submenú "Productos" en mobile */
(function () {
    const nav = document.querySelector('.nav');
    if (!nav) return;
    const parent = nav.querySelector('.nav__item--haschild > a');
    const holder = parent ? parent.parentElement : null;
    if (!parent || !holder) return;

    // Evitar que en mobile se navegue directo al hacer tap;
    // primero abre el submenú, segundo tap navega.
    let tappedOnce = false;
    parent.addEventListener('click', (e) => {
        if (window.matchMedia('(max-width: 980px)').matches) {
            if (!holder.classList.contains('nav--open-sub')) {
                e.preventDefault();
                holder.classList.add('nav--open-sub');
                tappedOnce = true;
                setTimeout(() => tappedOnce = false, 800);
            } else if (!tappedOnce) {
                // segundo tap dentro de 800ms navega
                tappedOnce = true; setTimeout(() => tappedOnce = false, 800);
            }
        }
    });
})();
document.addEventListener("DOMContentLoaded", () => {
    const reveals = document.querySelectorAll(".reveal-up");

    const onScroll = () => {
        for (const el of reveals) {
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight - 100) {
                el.classList.add("active");
            }
        }
    };

    window.addEventListener("scroll", onScroll);
    onScroll(); // ejecuta al cargar
});

(function () {
    const all = document.querySelectorAll('details.more-info');

    function setHeight(d, open) {
        const box = d.querySelector('.more-info__content');
        if (!box) return;
        if (open) {
            box.style.maxHeight = '0px';
            box.offsetHeight;                // reflow
            box.style.maxHeight = box.scrollHeight + 'px';
        } else {
            box.style.maxHeight = box.scrollHeight + 'px';
            box.offsetHeight;                // reflow
            box.style.maxHeight = '0px';
        }
    }

    // Solo un acordeón abierto a la vez (opcional)
    function closeOthers(curr) {
        all.forEach(d => {
            if (d !== curr && d.open) {
                d.open = false;
                setHeight(d, false);
            }
        });
    }

    all.forEach(d => {
        if (d.open) setHeight(d, true);
        d.addEventListener('toggle', () => {
            setHeight(d, d.open);
            if (d.open) {
                closeOthers(d);
                setTimeout(() => d.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
            }
        });

        const box = d.querySelector('.more-info__content');
        if (box) new ResizeObserver(() => { if (d.open) box.style.maxHeight = box.scrollHeight + 'px'; }).observe(box);
    });
})();





// ===== Navegación: dropdown accesible en táctiles =====
document.addEventListener('DOMContentLoaded', () => {
    const parent = document.querySelector('.nav__item--haschild > .nav__parent');
    const container = document.querySelector('.nav__item--haschild');
    if (parent && container) {
        parent.addEventListener('click', (e) => {
            // Evita navegar a "#", solo abre/cierra
            e.preventDefault();
            const expanded = parent.getAttribute('aria-expanded') === 'true';
            parent.setAttribute('aria-expanded', String(!expanded));
            container.toggleAttribute('aria-expanded'); // para el CSS
        });
        // Cierra al hacer click fuera
        document.addEventListener('click', (e) => {
            if (!container.contains(e.target)) {
                parent.setAttribute('aria-expanded', 'false');
                container.removeAttribute('aria-expanded');
            }
        });
    }

    // ===== Detalles: apertura suave =====
    const details = document.querySelectorAll('details.more-info');
    details.forEach(d => {
        d.addEventListener('toggle', () => {
            const content = d.querySelector('.specs');
            if (!content) return;
            // simple animación: scroll a la tarjeta al abrir
            if (d.open) {
                const card = d.closest('.procard, .port-card');
                card && card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        });
    });
});


// Abrir "Productos" desde el botón "Ver líneas"
document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('openProductos');
    const liProd = document.getElementById('navProductos');
    const nav = document.querySelector('.nav');
    if (!btn || !liProd || !nav) return;

    const linkProd = liProd.querySelector('a');

    btn.addEventListener('click', (e) => {
        e.preventDefault();
        const isMobile = window.matchMedia('(max-width: 980px)').matches;

        if (isMobile) {
            // abre menú hamburguesa y luego el submenú
            nav.classList.add('nav--open');
            liProd.classList.add('nav--open-sub');
            linkProd.setAttribute('aria-expanded', 'true');
            linkProd.focus();
        } else {
            // desktop: abrir dropdown como si fuera hover
            liProd.classList.add('force-open');
            linkProd.setAttribute('aria-expanded', 'true');
            linkProd.focus();

            // cerrar al hacer click afuera
            const close = (ev) => {
                if (!liProd.contains(ev.target) && ev.target !== btn) {
                    liProd.classList.remove('force-open');
                    linkProd.setAttribute('aria-expanded', 'false');
                    document.removeEventListener('click', close);
                }
            };
            // pequeño delay para no cerrarlo por el mismo click
            setTimeout(() => document.addEventListener('click', close), 0);
        }
    });
});


// Abrir/cerrar submenú "Productos" también con click
document.addEventListener('DOMContentLoaded', () => {
    const item = document.querySelector('.nav__item--haschild');
    if (!item) return;
    const trigger = item.querySelector('a');

    trigger.addEventListener('click', (e) => {
        // si tiene href="#" evitamos navegar
        if (trigger.getAttribute('href') === '#') e.preventDefault();
        item.classList.toggle('open');
    });

    // cerrar si clickeás afuera
    document.addEventListener('click', (e) => {
        if (!item.contains(e.target)) {
            item.classList.remove('open');
        }
    });
});
document.addEventListener('DOMContentLoaded', () => {
    const videos = document.querySelectorAll('.video-el');

    videos.forEach((v) => {
        // 1) Fade-in cuando el video ya puede mostrar un frame
        const onReady = () => v.classList.add('is-ready');
        v.addEventListener('loadeddata', onReady, { once: true });
        v.addEventListener('loadedmetadata', onReady, { once: true });

        // 2) Si el poster no está (o falló), generamos uno desde el primer frame
        const tryMakePoster = () => {
            // Si ya hay poster, no hacemos nada
            const p = v.getAttribute('poster');
            if (p) return;

            try {
                const canvas = document.createElement('canvas');
                const w = v.videoWidth || 1280;
                const h = v.videoHeight || 720;
                canvas.width = w; canvas.height = h;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(v, 0, 0, w, h);
                const dataURL = canvas.toDataURL('image/jpeg', 0.82);
                // Hack: establecer como background del contenedor para simular poster
                const wrap = v.closest('.video-framewrap');
                if (wrap) {
                    wrap.style.backgroundImage = `url(${dataURL})`;
                    wrap.style.backgroundSize = 'cover';
                    wrap.style.backgroundPosition = 'center';
                }
            } catch (err) {
                // Si no se puede (CORS o sin frame), no pasa nada
            }
        };

        // Intentamos crear poster en cuanto haya datos visibles
        v.addEventListener('loadeddata', tryMakePoster, { once: true });
        // Fallback si no llegó a loadeddata
        setTimeout(tryMakePoster, 1500);
    });
});



document.addEventListener('DOMContentLoaded', () => {
    const liProd = document.querySelector('.nav__item--haschild');
    const linkProd = liProd.querySelector('a');

    linkProd.addEventListener('click', (e) => {
        if (window.innerWidth > 980) { // solo desktop
            e.preventDefault();
            liProd.classList.toggle('force-open');
        }
    });

    // cerrar al clickear afuera
    document.addEventListener('click', (e) => {
        if (!liProd.contains(e.target)) {
            liProd.classList.remove('force-open');
        }
    });
});



/* ======= MOBILE: Drawer IZQUIERDO + submenú accesible ======= */


/* ======= DESKTOP: permitir fijar el dropdown con click (usabilidad) ======= */
(function () {
    const item = document.querySelector('.nav__item--haschild');
    if (!item) return;
    const trigger = item.querySelector(':scope > a');

    trigger.addEventListener('click', (e) => {
        if (window.innerWidth > 980) { // solo desktop
            e.preventDefault();
            item.classList.toggle('force-open');
        }
    });
    document.addEventListener('click', (e) => {
        if (window.innerWidth > 980 && !item.contains(e.target)) {
            item.classList.remove('force-open');
        }
    });
})();
















/* ======= MOBILE Drawer IZQUIERDO – FIX ======= */
(function () {
    const nav = document.querySelector('.nav');
    const headerInner = document.querySelector('.header__inner');
    if (!nav || !headerInner) return;

    // Burger
    let burger = document.querySelector('.header__burger');
    if (!burger) {
        burger = document.createElement('button');
        burger.className = 'header__burger';
        burger.setAttribute('aria-label', 'Abrir menú');
        burger.setAttribute('aria-expanded', 'false');
        burger.innerHTML = `
      <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M3 6h18v2H3V6Zm0 5h18v2H3v-2Zm0 5h18v2H3v-2Z"/>
      </svg>`;
        headerInner.insertBefore(burger, nav);
    }

    // Scrim (fondo) – depende del body.nav--drawer-open
    let scrim = document.querySelector('.nav__scrim');
    if (!scrim) {
        scrim = document.createElement('div');
        scrim.className = 'nav__scrim';
        document.body.appendChild(scrim);
    }

    const isMobile = () => window.innerWidth <= 980;

    const openDrawer = () => {
        if (!isMobile()) return;
        nav.classList.add('nav--open');
        document.body.classList.add('nav--drawer-open');
        burger.setAttribute('aria-expanded', 'true');
        const first = nav.querySelector('a'); first && first.focus();
    };
    const closeDrawer = () => {
        nav.classList.remove('nav--open');
        document.body.classList.remove('nav--drawer-open');
        burger.setAttribute('aria-expanded', 'false');
        nav.querySelectorAll('.nav__item--haschild.nav--open-sub')
            .forEach(li => li.classList.remove('nav--open-sub'));
    };
    const toggleDrawer = () => (nav.classList.contains('nav--open') ? closeDrawer() : openDrawer());

    burger.addEventListener('click', toggleDrawer);
    scrim.addEventListener('click', closeDrawer);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDrawer(); });
    window.addEventListener('resize', () => { if (!isMobile()) closeDrawer(); }, { passive: true });

    // Submenú "Productos" en mobile: abre/cierra con tap (los hijos navegan)
    const parentItem = nav.querySelector('.nav__item--haschild');
    if (parentItem) {
        const parentLink = parentItem.querySelector(':scope > a');
        parentLink.addEventListener('click', (e) => {
            if (isMobile()) { e.preventDefault(); parentItem.classList.toggle('nav--open-sub'); }
        });
    }

    // Cerrar al tocar cualquier link con href real
    nav.addEventListener('click', (e) => {
        const a = e.target.closest('a');
        if (!a || !isMobile()) return;
        const href = a.getAttribute('href');
        if (href && href !== '#') closeDrawer();
    });
})();

/* ======= DESKTOP: permitir fijar dropdown de Productos con click ======= */
(function () {
    const item = document.querySelector('.nav__item--haschild');
    if (!item) return;
    const trigger = item.querySelector(':scope > a');

    trigger.addEventListener('click', (e) => {
        if (window.innerWidth > 980) { e.preventDefault(); item.classList.toggle('force-open'); }
    });
    document.addEventListener('click', (e) => {
        if (window.innerWidth > 980 && !item.contains(e.target)) item.classList.remove('force-open');
    });
})();

document.addEventListener('DOMContentLoaded', () => {
    // Toggle del submenú con la flechita (mobile)
    document.querySelectorAll('.submenu-toggle').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const li = btn.closest('.nav__item--haschild');
            const expanded = li.classList.toggle('nav--open-sub');
            btn.setAttribute('aria-expanded', String(expanded));
            const parentLink = li.querySelector('.nav__parent');
            parentLink && parentLink.setAttribute('aria-expanded', String(expanded));
        });
    });
});
/* ====== NAV: comportamiento de "Productos" ====== */
document.addEventListener('DOMContentLoaded', () => {
    const isMobile = () => window.matchMedia('(max-width: 980px)').matches;

    // <li class="nav__item--haschild"> … <a>Productos</a> <ul class="nav__dropdown">…</ul>
    const prodItem = document.querySelector('.nav__item--haschild');
    if (!prodItem) return;

    const trigger = prodItem.querySelector(':scope > a');     // el <a> de "Productos"
    const dropdown = prodItem.querySelector(':scope > .nav__dropdown');

    // --- CELULAR: primer tap = abre; segundo tap = navega al href del trigger
    let tappedOnce = false;
    const resetTap = () => (tappedOnce = false);

    trigger.addEventListener('click', (e) => {
        if (!isMobile()) return;                 // en desktop no prevenimos el click
        const isOpen = prodItem.classList.contains('nav--open-sub');

        // Si el submenú no está abierto, lo abrimos y evitamos navegación.
        if (!isOpen) {
            e.preventDefault();
            prodItem.classList.add('nav--open-sub');
            trigger.setAttribute('aria-expanded', 'true');
            tappedOnce = true;
            setTimeout(resetTap, 900);
            return;
        }

        // Si ya está abierto: segundo tap dentro de ~900ms navega a productos.html
        if (tappedOnce) {
            // dejamos que navegue al href del trigger (productos.html)
            return; // sin preventDefault
        } else {
            // si pasó el tiempo, tratamos este tap como “primer tap” otra vez
            e.preventDefault();
            tappedOnce = true;
            setTimeout(resetTap, 900);
        }
    });

    // Cerrar el submenú cuando se toca fuera del bloque en móvil
    document.addEventListener('click', (ev) => {
        if (!isMobile()) return;
        if (!prodItem.contains(ev.target)) {
            prodItem.classList.remove('nav--open-sub');
            trigger.setAttribute('aria-expanded', 'false');
            resetTap();
        }
    });

    // Permitir que los enlaces del dropdown naveguen siempre
    dropdown?.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
            // si usás drawer móvil con class en <body>, acá lo podés cerrar:
            document.body.classList.remove('nav--drawer-open');
            const burger = document.querySelector('.header__burger');
            burger && burger.setAttribute('aria-expanded', 'false');
        });
    });

    // --- ESCRITORIO: leve “pegado” para que no se cierre al cruzar al dropdown
    let leaveTimer = null;
    prodItem.addEventListener('mouseenter', () => {
        prodItem.classList.add('force-open');
        if (leaveTimer) { clearTimeout(leaveTimer); leaveTimer = null; }
    });
    prodItem.addEventListener('mouseleave', () => {
        leaveTimer = setTimeout(() => {
            prodItem.classList.remove('force-open');
        }, 250); // margen para cruzar sin que se cierre
    });
});



// ---- Mobile: abrir/cerrar submenú "Productos" con un tap (sin romper desktop)
(() => {
    const nav = document.querySelector('.nav');
    const prodItem = nav?.querySelector('.nav__item--haschild');
    const trigger = prodItem?.querySelector(':scope > a');
    if (!nav || !prodItem || !trigger) return;

    const isMobile = () => window.matchMedia('(max-width: 980px)').matches;

    trigger.addEventListener('click', (e) => {
        if (!isMobile()) return;            // en desktop no tocamos nada
        e.preventDefault();                 // evitamos navegar a productos.html en el 1er tap
        prodItem.classList.toggle('nav--open-sub');
        trigger.setAttribute('aria-expanded',
            String(prodItem.classList.contains('nav--open-sub')));
    });

    // si tocan un enlace real dentro del dropdown, que cierre el drawer
    nav.addEventListener('click', (ev) => {
        if (!isMobile()) return;
        const a = ev.target.closest('a');
        if (a && a.getAttribute('href') && a.getAttribute('href') !== '#') {
            // cierra el drawer si lo estás usando
            nav.classList.remove('nav--open');
            document.body.classList.remove('nav--drawer-open');
        }
    });

    // tap fuera → cierra submenú
    document.addEventListener('click', (ev) => {
        if (!isMobile()) return;
        if (!prodItem.contains(ev.target)) {
            prodItem.classList.remove('nav--open-sub');
            trigger.setAttribute('aria-expanded', 'false');
        }
    });
})();

























































/* ===== SUBMENÚS MÓVIL (limpio y único) ===== */
(() => {
    const nav = document.querySelector('.nav');
    if (!nav) return;

    const isMobile = () => window.matchMedia('(max-width: 980px)').matches;

    // 1) El hamburguesa NO se cierra si toco el PADRE del submenú
    nav.addEventListener('click', (e) => {
        const a = e.target.closest('a');
        if (!a) return;

        const li = a.closest('.nav__item--haschild');
        const isParent = li && a === li.querySelector(':scope > a');

        if (isMobile() && isParent) {
            // Este click lo maneja el toggle de abajo; no cierres el drawer
            e.preventDefault();
            // abrir/cerrar el submenú
            const isOpen = li.classList.toggle('nav--open-sub');
            a.setAttribute('aria-expanded', String(isOpen));
            // cerrar otros submenús abiertos
            if (isOpen) {
                nav.querySelectorAll('.nav__item--haschild.nav--open-sub')
                    .forEach(other => { if (other !== li) other.classList.remove('nav--open-sub'); });
                nav.querySelectorAll('.nav__item--haschild > a[aria-expanded="true"]')
                    .forEach(x => { if (x !== a) x.setAttribute('aria-expanded', 'false'); });
            }
            return;
        }

        // Si es un enlace final con href real, cerrá el drawer
        if (isMobile()) {
            const href = a.getAttribute('href');
            if (href && href !== '#') {
                nav.classList.remove('nav--open');
                const burger = document.querySelector('.header__burger');
                burger && burger.setAttribute('aria-expanded', 'false');
            }
        }
    });

    // 2) Al abrir el hamburguesa, reseteá submenús “enganchados”
    const headerInner = document.querySelector('.header__inner');
    let burger = document.querySelector('.header__burger');
    if (headerInner && nav) {
        if (!burger) {
            burger = document.createElement('button');
            burger.className = 'header__burger';
            burger.setAttribute('aria-label', 'Abrir menú');
            burger.setAttribute('aria-expanded', 'false');
            burger.innerHTML = `
        <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="currentColor" d="M3 6h18v2H3V6Zm0 5h18v2H3v-2Zm0 5h18v2H3v-2Z"/>
        </svg>`;
            headerInner.insertBefore(burger, nav);
        }

        const toggleDrawer = () => {
            const open = nav.classList.toggle('nav--open');
            burger.setAttribute('aria-expanded', String(open));
            if (open) {
                nav.querySelectorAll('.nav__item--haschild.nav--open-sub')
                    .forEach(li => li.classList.remove('nav--open-sub'));
                nav.querySelectorAll('.nav__item--haschild > a[aria-expanded="true"]')
                    .forEach(a => a.setAttribute('aria-expanded', 'false'));
            }
        };

        burger.addEventListener('click', toggleDrawer);
    }

    // 3) Tap fuera del nav en móvil → cerrar submenús
    document.addEventListener('click', (ev) => {
        if (!isMobile()) return;
        if (!nav.contains(ev.target)) {
            nav.querySelectorAll('.nav__item--haschild.nav--open-sub')
                .forEach(li => li.classList.remove('nav--open-sub'));
            nav.querySelectorAll('.nav__item--haschild > a[aria-expanded="true"]')
                .forEach(a => a.setAttribute('aria-expanded', 'false'));
        }
    }, { passive: true });
})();





/* ==== FIX ÚNICO: submenús en mobile que NO cierran el drawer ==== */
(() => {
    const MOBILE_MAX = 980;
    const isMobile = () => window.matchMedia(`(max-width: ${MOBILE_MAX}px)`).matches;
    const nav = document.querySelector('.nav');
    if (!nav) return;

    // 1) Interceptar taps en los PADRES del submenú en fase de captura
    //    para que no lleguen a otros listeners que cierran el menú.
    nav.querySelectorAll('.nav__item--haschild > a').forEach(parentLink => {
        parentLink.addEventListener('click', (e) => {
            if (!isMobile()) return; // en desktop no tocamos nada

            // Bloqueamos cualquier handler “genérico” que cierra el drawer por ser <a href="…">
            e.preventDefault();
            e.stopPropagation();
            // En algunos navegadores conviene además:
            if (typeof e.stopImmediatePropagation === 'function') e.stopImmediatePropagation();

            const li = parentLink.parentElement;
            const isOpen = li.classList.toggle('nav--open-sub');
            parentLink.setAttribute('aria-expanded', String(isOpen));

            // Cerrar otros submenús abiertos (opcional, queda más limpio)
            if (isOpen) {
                nav.querySelectorAll('.nav__item--haschild.nav--open-sub').forEach(other => {
                    if (other !== li) other.classList.remove('nav--open-sub');
                });
                nav.querySelectorAll('.nav__item--haschild > a[aria-expanded="true"]').forEach(a => {
                    if (a !== parentLink) a.setAttribute('aria-expanded', 'false');
                });
            }
            // Importante: NO cerramos el drawer aquí. Queda abierto.
        }, { capture: true }); // <— captura para ganarle a otros listeners
    });

    // 2) Los hijos del submenú siguen navegando y pueden cerrar el drawer
    //    (dejamos que tus handlers existentes hagan eso).
})();
document.addEventListener('DOMContentLoaded', () => {
    const openBtn = document.getElementById('openProductos');
    if (!openBtn) return;

    // 1) Localizar el <li> de "Maquinarias"
    function getLiMaquinarias() {
        // Si ya le pusiste id="navMaquinarias", usamos ese:
        let li = document.getElementById('navMaquinarias');
        if (li) return li;

        // Fallback: buscar el <a> cuyo texto sea "Maquinarias" o enlace a "maquinaria"
        const trigger = Array.from(document.querySelectorAll('.nav .nav__item--haschild > a'))
            .find(a => /maquinari/i.test(a.textContent) || /maquinaria\.html/i.test(a.getAttribute('href') || ''));
        return trigger ? trigger.closest('.nav__item--haschild') : null;
    }

    // 2) Intentar abrir el contenedor del nav en móvil (si existe)
    function openNavContainerIfCollapsed() {
        // a) Si hay botón con aria-controls (muy común)
        const btn = document.querySelector('button[aria-controls], [data-nav-toggle], .nav-toggle, .menu-toggle, .hamburger');
        if (btn && btn.getAttribute('aria-controls')) {
            const targetId = btn.getAttribute('aria-controls');
            const panel = document.getElementById(targetId);
            if (panel && getComputedStyle(panel).display === 'none') {
                btn.setAttribute('aria-expanded', 'true');
                // si tu script maneja display vía clases, agregar pista:
                btn.classList.add('is-open');
                panel.classList.add('is-open');
            }
        }

        // b) Fallback genérico: algunas implementaciones abren con .is-open en .nav o en <body>
        const navEl = document.querySelector('.nav');
        navEl && navEl.classList.add('is-open');
        document.body.classList.add('nav-open');
    }

    // 3) Abrir el submenú de Maquinarias
    function openSubmenuMaquinarias() {
        const liMach = getLiMaquinarias();
        if (!liMach) return;

        liMach.classList.add('is-open');

        const trigger = liMach.querySelector('a[aria-haspopup="true"]') || liMach.querySelector('a');
        if (trigger) {
            trigger.setAttribute('aria-expanded', 'true');
            // Evitar navegación inmediata si el <a> tiene href a maquinaria.html
            trigger.addEventListener('click', (ev) => {
                // si ya está abierto por nuestro botón, no navegamos en el primer click
                if (trigger.dataset.openedBy === 'openProductos') {
                    ev.preventDefault();
                    // Quitamos la marca para que un segundo click sí navegue
                    delete trigger.dataset.openedBy;
                }
            }, { once: true });

            trigger.dataset.openedBy = 'openProductos';
            trigger.focus({ preventScroll: true });
        }

        liMach.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // 4) Click de “Ver líneas”
    openBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openNavContainerIfCollapsed();
        openSubmenuMaquinarias();
    });
});
