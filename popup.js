// Event
chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "buttonText") {
        const element = document.getElementById("capture");
        element.textContent = message.text;
    }
    if (message.action === "currentCallType") {
        const element = document.getElementById("current-call-type");
        let text = ""
        switch (message.currentCallType) {
            case "CALL_1":
                text = "1鳴き"
                break
            case "CALL_2":
                text = "2鳴き"
                break
            case "CALL_3":
                text = "3鳴き"
                break
            case "CALL_4":
                text = "4鳴き"
                break
            default:
                text = "鳴きなし"
                break
        }
        element.textContent = text;
    }
    if (message.action === "error") {
        button = document.getElementById("capture")
        callTypeText = document.getElementById("current-call-type")
        button.textContent = "START"
        callTypeText.textContent = "?"
        console.error(message.error)
        alert("エラーが発生しました")
    }
});

// DOM
document.addEventListener("DOMContentLoaded", function() {
    const button = document.getElementById('capture')
    chrome.runtime.sendMessage({action: "isCapturing"}).then((response) => {
        if(response.isCapturing){
            button.textContent = "STOP"
        } else {
            button.textContent = "START"
        }
    })
    button.addEventListener('click', () => {
        chrome.runtime.sendMessage({action: "capture"}).then((response) => {
            console.log(response)
        })
    })
})
