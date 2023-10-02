window.addEventListener("keydown", function(event) {
    if (event.ctrlKey && event.key === "f") {
        clickByPoints(500, 900)
    }
    if (event.ctrlKey && event.key === "b") {
        clickByPoints(500, 900)
    }
});

function clickByPoints(x, y) {
    const canvas = document.querySelector('canvas');  // 最初のcanvas要素を取得します。
    const rect = canvas.getBoundingClientRect();
    const createMouseEvent = (type) => {
        return new MouseEvent(type, {
            bubbles: true,
            cancelable: true,
            view: window,
            clientX: rect.left + x,
            clientY: rect.top + y
        });
    };

    ['mousedown', 'mouseup', 'click'].forEach(type => {
        canvas.dispatchEvent(createMouseEvent(type));
    });
}