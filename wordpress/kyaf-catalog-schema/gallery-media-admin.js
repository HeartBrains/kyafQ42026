(function () {
	'use strict';

	const labels = window.kyafCatalogGalleryMedia || {};

	function makeButton(text, accessibleName, onClick, disabled) {
		const button = document.createElement('button');
		button.type = 'button';
		button.className = 'button button-small';
		button.textContent = text;
		button.setAttribute('aria-label', accessibleName);
		button.disabled = Boolean(disabled);
		button.addEventListener('click', onClick);
		return button;
	}

	function initGalleryControl(root) {
		const idsField = root.querySelector('[data-gallery-ids]');
		const preview = root.querySelector('[data-gallery-preview]');
		const emptyMessage = root.querySelector('[data-gallery-empty]');
		const addButton = root.querySelector('[data-gallery-add]');
		const valuesFromField = (idsField.value || '').split(/\s*,\s*/).filter(Boolean);
		let galleryItems = Array.from(new Set(valuesFromField.filter((value) => {
			return (/^\d+$/.test(value) && Number(value) > 0) || /^https?:\/\//i.test(value);
		})));
		let mediaFrame;
		emptyMessage.textContent = labels.noImages || 'No gallery images selected.';

		function isAttachmentId(value) {
			return /^\d+$/.test(value) && Number(value) > 0;
		}

		function persist() {
			idsField.value = galleryItems.join(',');
		}

		function moveAttachment(index, direction) {
			const targetIndex = index + direction;
			if (targetIndex < 0 || targetIndex >= galleryItems.length) return;
			[galleryItems[index], galleryItems[targetIndex]] = [galleryItems[targetIndex], galleryItems[index]];
			renderPreview();
		}

		function renderPreview() {
			preview.replaceChildren();
			emptyMessage.hidden = galleryItems.length > 0;

			galleryItems.forEach((galleryItem, index) => {
				const item = document.createElement('li');
				item.className = 'kyaf-catalog-gallery-item';

				const thumbnail = document.createElement('img');
				thumbnail.alt = '';
				thumbnail.className = 'kyaf-catalog-gallery-thumbnail';
				thumbnail.hidden = true;
				item.appendChild(thumbnail);

				const details = document.createElement('div');
				details.className = 'kyaf-catalog-gallery-details';
				const caption = document.createElement('span');
				caption.className = 'kyaf-catalog-gallery-caption';
				caption.textContent = (labels.imageLabel || 'Image') + ' ' + (index + 1);
				details.appendChild(caption);

				const actions = document.createElement('div');
				actions.className = 'kyaf-catalog-gallery-actions';
				actions.appendChild(makeButton('↑', (labels.moveUp || 'Move up') + ' ' + caption.textContent, function () {
					moveAttachment(index, -1);
				}, index === 0));
				actions.appendChild(makeButton('↓', (labels.moveDown || 'Move down') + ' ' + caption.textContent, function () {
					moveAttachment(index, 1);
				}, index === galleryItems.length - 1));
				actions.appendChild(makeButton('×', (labels.remove || 'Remove image') + ' ' + caption.textContent, function () {
					galleryItems = galleryItems.filter((value, valueIndex) => valueIndex !== index);
					renderPreview();
				}));
				details.appendChild(actions);
				item.appendChild(details);
				preview.appendChild(item);

				if (!isAttachmentId(galleryItem)) {
					thumbnail.src = galleryItem;
					thumbnail.hidden = false;
				} else if (window.wp && window.wp.media) {
					const attachment = window.wp.media.attachment(Number(galleryItem));
					attachment.fetch().done(function () {
						const data = attachment.toJSON();
						const imageUrl = data.sizes && data.sizes.thumbnail ? data.sizes.thumbnail.url : data.url;
						if (imageUrl) {
							thumbnail.src = imageUrl;
							thumbnail.alt = data.alt || '';
							thumbnail.hidden = false;
						}
					});
				}
			});

			persist();
		}

		function openMediaLibrary() {
			if (!window.wp || !window.wp.media) return;

			if (!mediaFrame) {
				mediaFrame = window.wp.media({
					title: labels.title || 'Select gallery images',
					button: { text: labels.buttonText || 'Use selected images' },
					library: { type: 'image' },
					multiple: true,
				});

				mediaFrame.on('open', function () {
					const selection = mediaFrame.state().get('selection');
					selection.reset();
					galleryItems.filter(isAttachmentId).forEach((id) => selection.add(window.wp.media.attachment(Number(id))));
				});

				mediaFrame.on('select', function () {
					const selection = mediaFrame.state().get('selection');
					const selectedIds = selection.map((attachment) => Number(attachment.get('id')))
						.filter((id) => Number.isInteger(id) && id > 0);
					const selectedSet = new Set(selectedIds.map(String));
					const orderedIds = galleryItems.filter((value) => !isAttachmentId(value) || selectedSet.has(value));
					selectedIds.forEach((id) => {
						const value = String(id);
						if (!orderedIds.includes(value)) orderedIds.push(value);
					});
					galleryItems = orderedIds;
					renderPreview();
				});
			}

			mediaFrame.open();
		}

		addButton.addEventListener('click', openMediaLibrary);
		renderPreview();
	}

	document.querySelectorAll('[data-kyaf-gallery-control]').forEach(initGalleryControl);
})();
