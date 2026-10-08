(function () {
    'use strict';

    function updatePreview(preview, url) {
        if (!preview) return;

        var image = preview.querySelector('img');
        if (!image) {
            image = document.createElement('img');
            image.alt = 'Selected page cover';
            image.style.maxWidth = '320px';
            image.style.maxHeight = '120px';
            image.style.objectFit = 'cover';
            image.style.border = '1px solid #ddd';
            image.style.borderRadius = '3px';
            preview.replaceChildren(image);
        }

        image.src = url;
    }

    document.addEventListener('click', function (event) {
        if (!(event.target instanceof Element)) return;

        var uploadButton = event.target.closest('.bkkk-upload-btn');
        if (uploadButton) {
            event.preventDefault();

            if (!window.wp || !window.wp.media) {
                console.error('The WordPress media library is unavailable on the Site Config page.');
                return;
            }

            var target = document.getElementById(uploadButton.dataset.target || '');
            var preview = document.getElementById(uploadButton.dataset.preview || '');
            if (!target) return;

            var frame = window.wp.media({
                title: 'Select a page cover image',
                button: { text: 'Use this image' },
                library: { type: 'image' },
                multiple: false
            });

            frame.on('select', function () {
                var selection = frame.state().get('selection').first();
                if (!selection) return;

                var attachment = selection.toJSON();
                if (!attachment.url) return;

                target.value = attachment.url;
                target.dispatchEvent(new Event('input', { bubbles: true }));
                target.dispatchEvent(new Event('change', { bubbles: true }));
                updatePreview(preview, attachment.url);

                var clearButton = uploadButton.parentElement.querySelector('.bkkk-clear-btn');
                if (clearButton) clearButton.style.display = '';
            });

            frame.open();
            return;
        }

        var clearButton = event.target.closest('.bkkk-clear-btn');
        if (!clearButton) return;

        event.preventDefault();
        var input = document.getElementById(clearButton.dataset.target || '');
        var imagePreview = document.getElementById(clearButton.dataset.preview || '');
        if (input) {
            input.value = '';
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
        }
        if (imagePreview) imagePreview.replaceChildren();
        clearButton.style.display = 'none';
    });
})();
