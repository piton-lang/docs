/*
 * On-this-page tracking: tail distribution + click intent.
 *
 * Starlight marks the current heading with an IntersectionObserver whose band
 * is a ~53px strip below the header. That is correct for any heading with a
 * viewport of content beneath it, and impossible for the ones at the end of a
 * page: their activation point lies past the maximum scroll offset, so they can
 * never enter the strip. On a page ending in several short sections, the last
 * few are simply unreachable.
 *
 * Two behaviours are added here.
 *
 * 1. TAIL DISTRIBUTION. Work out each heading's activation offset — the scroll
 *    position at which it would sit in the strip. Any offset beyond the maximum
 *    scroll is unreachable. Take the scroll range that remains after the last
 *    reachable heading, divide it evenly between the headings that share it,
 *    and select by band. Scrolling the final stretch then steps through the
 *    remaining sections instead of stalling on the last reachable one.
 *
 * 2. CLICK INTENT. Clicking a link activates it immediately and holds it there.
 *    Position alone cannot express this: clicking any unreachable heading lands
 *    at the same maximum scroll offset, so geometry would pick the same entry
 *    every time. The lock is released by the next user-initiated scroll, so
 *    intent wins until the reader takes over again.
 *
 * Runs alongside Starlight's own observer and re-asserts each frame, so it
 * needs no access to the component's internals.
 */
(() => {
	const toc = document.querySelector('starlight-toc');
	if (!toc) return;

	const links = Array.from(toc.querySelectorAll('a'));
	if (links.length < 2) return;

	const targets = links.map((a) => {
		const id = decodeURIComponent(a.hash.replace('#', ''));
		return document.getElementById(id);
	});

	const setCurrent = (link) => {
		if (!link) return;
		const prev = toc.querySelector('a[aria-current="true"]');
		if (prev === link) return;
		if (prev) prev.removeAttribute('aria-current');
		link.setAttribute('aria-current', 'true');
	};

	/* Same geometry Starlight uses: header height plus its 32px allowance. */
	const stripTop = () => {
		const header = document.querySelector('header');
		return (header ? header.getBoundingClientRect().height : 0) + 32;
	};

	let locked = null;

	toc.addEventListener('click', (event) => {
		const link = event.target.closest('a');
		if (!link) return;
		locked = link;
		setCurrent(link);
	});

	/* Only a user-initiated scroll releases the lock — not the programmatic
	   scroll the click itself causes. */
	for (const type of ['wheel', 'touchstart', 'keydown']) {
		window.addEventListener(type, () => { locked = null; }, { passive: true });
	}

	let queued = false;

	const update = () => {
		queued = false;
		/*
		 * Re-assert, do not merely abstain. Starlight's observer keeps firing
		 * during the scroll the click causes, so a lock that simply skipped its
		 * own update would be overwritten a frame later.
		 */
		if (locked) {
			setCurrent(locked);
			return;
		}

		const doc = document.documentElement;
		const max = Math.max(0, doc.scrollHeight - window.innerHeight);
		const y = window.scrollY;
		const top = stripTop();

		/* Scroll offset at which each heading would sit in the strip. */
		const activations = targets.map((el) =>
			el ? el.getBoundingClientRect().top + y - top : Number.POSITIVE_INFINITY
		);

		/* The last heading that can be reached by scrolling normally. */
		let lastReachable = 0;
		for (let i = 0; i < activations.length; i += 1) {
			if (activations[i] <= max) lastReachable = i;
		}

		const tailStart = Math.max(0, activations[lastReachable]);
		const unreachable = activations.length - 1 - lastReachable;

		if (unreachable > 0 && y >= tailStart) {
			/* Share the remaining scroll range between the headings left. */
			const share = unreachable + 1;
			const span = Math.max(1, max - tailStart);
			const progress = (y - tailStart) / span;
			const step = Math.min(share - 1, Math.floor(progress * share));
			setCurrent(links[lastReachable + step]);
			return;
		}

		/* Otherwise: the last heading whose activation point we have passed. */
		let current = 0;
		for (let i = 0; i < activations.length; i += 1) {
			if (y >= activations[i] - 1) current = i;
		}
		setCurrent(links[current]);
	};

	const schedule = () => {
		if (queued) return;
		queued = true;
		requestAnimationFrame(update);
	};

	/*
	 * The observer can also set aria-current between frames. While a click is
	 * held, put it back. setCurrent is a no-op when the value already matches,
	 * so this cannot recurse.
	 */
	new MutationObserver(() => {
		if (locked) setCurrent(locked);
	}).observe(toc, {
		subtree: true,
		attributes: true,
		attributeFilter: ['aria-current'],
	});

	window.addEventListener('scroll', schedule, { passive: true });
	window.addEventListener('resize', schedule, { passive: true });
	window.addEventListener('load', schedule);
	schedule();
})();
