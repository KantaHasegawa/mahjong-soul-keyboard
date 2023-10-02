// キーの入力間隔を制限する
let lastKeyPressedTime = 0;
const delay = 100;

window.addEventListener("keydown", function(event) {
    let currentTime = new Date().getTime();

    if (event.ctrlKey && event.key === "f" && currentTime - lastKeyPressedTime > delay) {
        chrome.runtime.sendMessage({action: "moveRight"}, function(response) {
            clickByPoints(response.x, response.y)
            lastKeyPressedTime = currentTime;
        });
    }
    if (event.ctrlKey && event.key === "b" && currentTime - lastKeyPressedTime > delay) {
        chrome.runtime.sendMessage({action: "moveLeft"}, function(response) {
            clickByPoints(response.x, response.y)
            lastKeyPressedTime = currentTime;
        });
    }
    if (event.key === "Enter" && currentTime - lastKeyPressedTime > delay) {
        chrome.runtime.sendMessage({action: "submit"}, function(response) {
            clickByPoints(response.x, response.y)
            lastKeyPressedTime = currentTime;
        });
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