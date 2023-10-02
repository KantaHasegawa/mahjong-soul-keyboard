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

// DOM
document.addEventListener("DOMContentLoaded", function() {
    const button = document.getElementById('capture')
    button.textContent = "START";
    button.addEventListener('click', () => {
        chrome.runtime.sendMessage({action: "capture"}).then((response) => {
            console.log(response)
        })
    })
})
