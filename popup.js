// Event
chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "currentPaiCount") {
        const element = document.getElementById("current-pai-count");
        element.textContent = message.currentPaiCount;
    }
});


setTimeout(async () => {
    console.log('setup ok')
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
}, 5000);

setTimeout(async() => {
    const captureButton = document.getElementById('capture');
    captureButton.addEventListener('click', () => {
        chrome.runtime.sendMessage({action: "capture"}).then((response) => {
            console.log(response)
        }
    )
    }
)
}, 5000)
    

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