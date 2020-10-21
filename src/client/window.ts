// Global drag&drop

const handleDragOver = (e: DragEvent) => {
    if (!(e.target && e.dataTransfer)) {
        return;
    }

    e.preventDefault();
    e.dataTransfer.effectAllowed = 'none';
    e.dataTransfer.dropEffect = 'none';
}

document.addEventListener("DOMContentLoaded", function () {
    document.body.addEventListener('dragover', handleDragOver);
});
