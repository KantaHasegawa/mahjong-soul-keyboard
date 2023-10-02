// Event
chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "buttonText") {
        const element = document.getElementById("capture");
        element.textContent = message.text;
    }
    if (message.action === "currentPaiCount") {
        const element = document.getElementById("current-pai-count");
        element.textContent = message.currentPaiCount;
    }
    if (message.action === "error") {
        button = document.getElementById("capture")
        paiCountText = document.getElementById("current-pai-count")
        button.textContent = "START"
        paiCountText.textContent = "?"
        console.error(message.error)
        alert("エラーが発生しました")
    }
});

document.addEventListener("DOMContentLoaded", function() {
    const button = document.getElementById('capture')
    button.textContent = "START";
    button.addEventListener('click', () => {
        chrome.runtime.sendMessage({action: "capture"}).then((response) => {
            console.log(response)
        })
    })

    document.getElementById('clickAtCoordinates').addEventListener('click', function() {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            const currentTab = tabs[0];
            chrome.scripting.executeScript({
                target: {tabId: currentTab.id},
                func: simulateClickOnCanvas,
                args: [500, 900]
            });
        });
    });
})

function simulateClickOnCanvas(x, y) {
    const canvas = document.querySelector('canvas');  // 最初のcanvas要素を取得します。

    if (!canvas) {
        console.error('No canvas element found');
        return;
    }

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