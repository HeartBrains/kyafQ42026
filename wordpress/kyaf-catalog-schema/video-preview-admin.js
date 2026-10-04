(function () {
	'use strict';

	document.addEventListener('DOMContentLoaded', function () {
		var control = document.querySelector('[data-kyaf-video-preview]');
		if (!control || !window.wp || !window.wp.media) return;

		var input = control.querySelector('[data-video-preview-id]');
		var status = control.querySelector('[data-video-preview-status]');
		var display = control.querySelector('[data-video-preview-display]');
		var selectButton = control.querySelector('[data-video-preview-select]');
		var removeButton = control.querySelector('[data-video-preview-remove]');
		var frame;
		var allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm'];

		function showAttachment(attachment) {
			var mime = attachment.mime || '';
			if (allowedMimeTypes.indexOf(mime) === -1) {
				window.alert('Choose a JPEG, PNG, WebP, or GIF image, or an MP4 or WebM video.');
				return;
			}

			input.value = String(attachment.id);
			status.textContent = 'Selected: ' + (attachment.filename || attachment.title || 'preview media');
			display.replaceChildren();
			display.hidden = false;
			var preview;
			if (mime.indexOf('image/') === 0) {
				preview = document.createElement('img');
				preview.alt = '';
			} else {
				preview = document.createElement('video');
				preview.muted = true;
				preview.playsInline = true;
				preview.controls = true;
				preview.preload = 'metadata';
			}
			preview.src = attachment.url;
			preview.style.cssText = 'display:block;max-width:240px;max-height:140px;margin:8px 0;object-fit:contain';
			display.appendChild(preview);
			selectButton.textContent = 'Change preview';
			removeButton.hidden = false;
		}

		selectButton.addEventListener('click', function (event) {
			event.preventDefault();
			if (!frame) {
				frame = window.wp.media({
					title: 'Choose video preview media',
					button: { text: 'Use as video preview' },
					multiple: false,
					library: { type: ['image', 'video'] }
				});
				frame.on('select', function () {
					var selection = frame.state().get('selection').first();
					if (selection) showAttachment(selection.toJSON());
				});
			}
			frame.open();
		});

		removeButton.addEventListener('click', function (event) {
			event.preventDefault();
			input.value = '';
			status.textContent = 'No preview selected.';
			display.replaceChildren();
			display.hidden = true;
			removeButton.hidden = true;
			selectButton.textContent = 'Select or upload preview';
		});
	});
})();
