(() => {
	'use strict';

	const header = document.querySelector('[data-header]');
	const menuToggle = document.querySelector('[data-menu-toggle]');
	const navigation = document.querySelector('[data-navigation]');
	const navigationLinks = [...document.querySelectorAll('.primary-navigation a[href^="#"]')];
	const sections = [...document.querySelectorAll('main > section[id]')];
	const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

	const closeMenu = ({ restoreFocus = false } = {}) => {
		if (!navigation || !menuToggle) return;

		navigation.classList.remove('is-open');
		menuToggle.setAttribute('aria-expanded', 'false');
		menuToggle.setAttribute('aria-label', 'Navigatsiya menyusini ochish');

		if (restoreFocus) menuToggle.focus();
	};

	const toggleMenu = () => {
		if (!navigation || !menuToggle) return;

		const isOpen = navigation.classList.toggle('is-open');
		menuToggle.setAttribute('aria-expanded', String(isOpen));
		menuToggle.setAttribute('aria-label', isOpen ? 'Navigatsiya menyusini yopish' : 'Navigatsiya menyusini ochish');

		if (isOpen) {
			navigationLinks[0]?.focus();
		} else {
			menuToggle.focus();
		}
	};

	menuToggle?.addEventListener('click', toggleMenu);

	navigationLinks.forEach((link) => {
		link.addEventListener('click', (event) => {
			const target = document.querySelector(link.getAttribute('href'));
			if (!target) return;

			event.preventDefault();
			target.scrollIntoView({ behavior: prefersReducedMotion.matches ? 'auto' : 'smooth', block: 'start' });
			closeMenu();
			history.replaceState(null, '', link.getAttribute('href'));
		});
	});

	document.addEventListener('click', (event) => {
		if (!navigation?.classList.contains('is-open')) return;
		if (!navigation.contains(event.target) && !menuToggle?.contains(event.target)) closeMenu();
	});

	document.addEventListener('keydown', (event) => {
		if (event.key === 'Escape' && navigation?.classList.contains('is-open')) closeMenu({ restoreFocus: true });
	});

	const updateHeader = () => {
		if (!header) return;

		const isScrolled = window.scrollY > 24;
		header.classList.toggle('is-scrolled', isScrolled);
		header.style.background = isScrolled ? 'rgba(11, 13, 13, 0.94)' : 'rgba(11, 13, 13, 0.68)';
		header.style.boxShadow = isScrolled ? '0 14px 35px rgba(0, 0, 0, 0.2)' : 'none';
		header.style.borderBottomColor = isScrolled ? 'rgba(244, 241, 235, 0.24)' : 'rgba(244, 241, 235, 0.14)';
	};

	updateHeader();
	window.addEventListener('scroll', updateHeader, { passive: true });

	const revealItems = [
		...document.querySelectorAll('.about__layout, .courses .section-heading, .courses__list, .learning-paths .section-heading, .learning-card, .contact-cta__inner, .site-footer__top')
	];

	if (prefersReducedMotion.matches) {
		revealItems.forEach((item) => { item.style.opacity = '1'; });
	} else {
		revealItems.forEach((item, index) => {
			item.style.opacity = '0';
			item.style.transform = 'translateY(24px)';
			item.style.transition = `opacity 700ms ${Math.min(index * 45, 260)}ms var(--ease), transform 700ms ${Math.min(index * 45, 260)}ms var(--ease)`;
		});

		const revealObserver = new IntersectionObserver((entries, observer) => {
			entries.forEach((entry) => {
				if (!entry.isIntersecting) return;

				entry.target.style.opacity = '1';
				entry.target.style.transform = 'translateY(0)';
				observer.unobserve(entry.target);
			});
		}, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

		revealItems.forEach((item) => revealObserver.observe(item));
	}

	if (sections.length) {
		const activeSectionObserver = new IntersectionObserver((entries) => {
			const visibleSection = entries
				.filter((entry) => entry.isIntersecting)
				.sort((first, second) => second.intersectionRatio - first.intersectionRatio)[0];

			if (!visibleSection) return;

			navigationLinks.forEach((link) => {
				const isCurrent = link.getAttribute('href') === `#${visibleSection.target.id}`;
				link.classList.toggle('is-active', isCurrent);
				if (isCurrent) link.setAttribute('aria-current', 'page');
				else link.removeAttribute('aria-current');
				link.style.color = isCurrent ? 'var(--accent)' : '';
			});
		}, { threshold: [0.2, 0.5, 0.8], rootMargin: '-15% 0px -55% 0px' });

		sections.forEach((section) => activeSectionObserver.observe(section));
	}

	document.querySelectorAll('.button').forEach((button) => {
		button.addEventListener('pointerdown', () => {
			if (!prefersReducedMotion.matches) button.style.transform = 'translateY(0) scale(0.98)';
		});
		button.addEventListener('pointerup', () => { button.style.transform = ''; });
		button.addEventListener('pointercancel', () => { button.style.transform = ''; });
	});
})();
