const shell = require('electron').shell;

document.addEventListener('click', function (e) {

    let el = e.target as HTMLElement;

    // A element can be wrapped with inline element. Look parent elements.
    while (el.tagName !== 'A') {
        if (!el.parentNode) {
            break;
        }

        el = el.parentNode as HTMLElement;
    }

    if (!el || el.tagName !== 'A') {
        return;
    }

    if ((el.classList && el.classList.contains('markdown-external-link')) ||
        el.getAttribute('target') === '_external' ||
        el.getAttribute('target') === '_blank'
    ) {
        const href = el.getAttribute('href');
        if (href) {
            shell.openExternal(href);
            e.preventDefault();
            return;
        }
    }

});
