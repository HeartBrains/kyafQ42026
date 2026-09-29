(function () {
	'use strict';

	const config = window.kyafCatalogRelatedContent || {};
	const messages = config.messages || {};

	function createButton(label, className, onClick, disabled, accessibleName) {
		const button = document.createElement('button');
		button.type = 'button';
		button.className = className || 'button';
		button.textContent = label;
		button.disabled = Boolean(disabled);
		if (accessibleName) button.setAttribute('aria-label', accessibleName);
		button.addEventListener('click', onClick);
		return button;
	}

	function init(root) {
		const search = root.querySelector('input[type="search"]');
		const results = root.querySelector('[data-related-results]');
		const selectedList = root.querySelector('[data-related-selected]');
		const hiddenIds = root.querySelector('[data-related-ids]');
		const status = root.querySelector('[data-related-status]');
		const max = Number(config.max) || 3;
		let selected = [];
		let debounce = 0;
		let requestSequence = 0;

		try {
			selected = JSON.parse(root.dataset.initialItems || '[]');
		} catch (error) {
			selected = [];
		}

		function syncIds() {
			hiddenIds.value = JSON.stringify(selected.map((item) => Number(item.id)).filter(Boolean));
		}

		function renderSelected() {
			selectedList.replaceChildren();
			selected.forEach((item, index) => {
				const row = document.createElement('li');
				row.style.display = 'flex';
				row.style.alignItems = 'center';
				row.style.gap = '8px';
				row.style.margin = '8px 0';

				const title = document.createElement('span');
				title.style.flex = '1';
				title.textContent = (item.title && (item.title.en || item.title.th)) || item.slug || String(item.id);
				row.appendChild(title);

				row.appendChild(createButton('↑', 'button', function () {
					if (index === 0) return;
					[selected[index - 1], selected[index]] = [selected[index], selected[index - 1]];
					renderSelected();
				}, index === 0, messages.moveUp || 'Move up'));
				row.appendChild(createButton('↓', 'button', function () {
					if (index >= selected.length - 1) return;
					[selected[index + 1], selected[index]] = [selected[index], selected[index + 1]];
					renderSelected();
				}, index >= selected.length - 1, messages.moveDown || 'Move down'));
				row.appendChild(createButton(messages.remove || 'Remove', 'button', function () {
					selected = selected.filter((_, selectedIndex) => selectedIndex !== index);
					renderSelected();
				}, false, messages.remove || 'Remove'));
				selectedList.appendChild(row);
			});
			syncIds();
		}

		function renderResults(items) {
			results.replaceChildren();
			if (!items.length) {
				status.textContent = messages.empty || 'No matching records found on this site.';
				return;
			}
			status.textContent = '';
			items.forEach((item) => {
				const alreadySelected = selected.some((entry) => String(entry.id) === String(item.id));
				const title = item.title && (item.title.en || item.title.th);
				const label = (title || item.slug) + (item.category ? ' — ' + item.category : '');
				const option = createButton(label, 'button', function () {
					if (selected.length >= max) {
						status.textContent = messages.limit || 'You can select up to 3 related records.';
						return;
					}
					if (!selected.some((entry) => String(entry.id) === String(item.id))) {
						selected = selected.concat(item);
						renderSelected();
						renderResults(items);
					}
				}, alreadySelected || selected.length >= max);
				option.style.display = 'block';
				option.style.width = '100%';
				option.style.marginTop = '4px';
				option.style.textAlign = 'left';
				results.appendChild(option);
			});
		}

		search.addEventListener('input', function () {
			window.clearTimeout(debounce);
			const sequence = ++requestSequence;
			const query = search.value.trim();
			results.replaceChildren();
			if (query.length < 2) {
				status.textContent = 'Enter at least 2 characters to search this site.';
				return;
			}
			status.textContent = messages.loading || 'Searching…';
			debounce = window.setTimeout(function () {
				const body = new FormData();
				body.append('action', 'kyaf_catalog_search_related_posts');
				body.append('nonce', config.nonce || '');
				body.append('post_id', root.dataset.postId || '');
				body.append('query', query);
				fetch(config.ajaxUrl, { method: 'POST', credentials: 'same-origin', body: body })
					.then((response) => response.json())
					.then((payload) => {
						if (sequence !== requestSequence) return;
						if (!payload || !payload.success || !Array.isArray(payload.data)) {
							throw new Error('Related record search failed');
						}
						renderResults(payload.data);
					})
					.catch(function () {
						if (sequence !== requestSequence) return;
						results.replaceChildren();
						status.textContent = messages.failed || 'Search failed. Please try again.';
					});
			}, 250);
		});

		renderSelected();
	}

	document.querySelectorAll('[data-kyaf-related-control]').forEach(init);
})();
