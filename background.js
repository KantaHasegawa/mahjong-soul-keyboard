// Difine class
class Fetcher {
    constructor() {
        this.baseURL = 'http://localhost:8090';
    }
    getCallCount = async (payload) => {
        const res = await fetch(this.baseURL + "/", {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        })
        const json = await res.json()
        return json.count
    }
}

class Pai {
    constructor() {
        this.currentIndex = 0
        this.currentCallType = "DEFAULT"
    }
    static callType = {
        DEFAULT: 0,
        CALL_1: 1,
        CALL_2: 2,
        CALL_3: 3,
        CALL_4: 4,
    };
    
    static points = {
        DEFAULT: [
            [ 0.06944, 0.46296 ],
            [ 0.09403, 0.46296 ],
            [ 0.11863, 0.46296 ],
            [ 0.14322, 0.46296 ],
            [ 0.16782, 0.46296 ],
            [ 0.19241, 0.46296 ],
            [ 0.21701, 0.46296 ],
            [ 0.24160, 0.46296 ],
            [ 0.26620, 0.46296 ],
            [ 0.29079, 0.46296 ],
            [ 0.31539, 0.46296 ],
            [ 0.33998, 0.46296 ],
            [ 0.36458, 0.46296 ],
            [ 0.39785, 0.46296 ],
        ],
        CALL_1: [
            [ 0.06365, 0.46296 ],
            [ 0.08825, 0.46296 ],
            [ 0.11284, 0.46296 ],
            [ 0.13744, 0.46296 ],
            [ 0.16203, 0.46296 ],
            [ 0.18663, 0.46296 ],
            [ 0.21122, 0.46296 ],
            [ 0.23582, 0.46296 ],
            [ 0.26041, 0.46296 ],
            [ 0.28501, 0.46296 ],
            [ 0.31828, 0.46296 ]
        ],
        CALL_2: [
            [ 0.06944, 0.46296 ],
            [ 0.09403, 0.46296 ],
            [ 0.11863, 0.46296 ],
            [ 0.14322, 0.46296 ],
            [ 0.16782, 0.46296 ],
            [ 0.19241, 0.46296 ],
            [ 0.21701, 0.46296 ],
            [ 0.25028, 0.46296 ]
        ],
        CALL_3: [  
            [ 0.06944, 0.46296 ],
            [ 0.09403, 0.46296 ],
            [ 0.11863, 0.46296 ],
            [ 0.14322, 0.46296 ],
            [ 0.17650, 0.46296 ]
        ],
        CALL_4: [
            [ 0.06944, 0.46296 ],
            [ 0.10271, 0.46296 ]
        ],
    }

    getCurrentCallType = () => {
        return this.currentCallType
    }

    updateField = (count) => {
        let result = "DEFAULT"
        for (let key in Pai.callType) {
            if (count == Pai.callType[key]) {
                result = key
                break
            }
        }
        this.currentCallType = result
    }
}

// Init
const fetcher = new Fetcher()
const pai = new Pai()
let intervalId = null;

// Event
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // キャプチャー開始
    if (message.action === "capture") {
        if (intervalId) {
            chrome.runtime.sendMessage({ action: "buttonText", text: "START" });
            // 既にタイマーが動いている場合、タイマーを停止する 
            clearInterval(intervalId);
            intervalId = null;
            chrome.runtime.sendMessage({ action: "currentCallType", currentCallType: "?" });
            sendResponse({ result: "stop"});
        } else {
            // タイマーが動いていない場合、新しいタイマーをセットする
            chrome.runtime.sendMessage({ action: "buttonText", text: "STOP" });
            intervalId = setInterval(() => {
                // 画面のキャプチャを取得する
                chrome.tabs.captureVisibleTab(async (screenshotUrl) => {
                    const payload = {
                        "image": screenshotUrl
                    };
                    // サーバーに画像を送信して牌の数を取得する
                    try{
                        const callCount = await fetcher.getCallCount(payload);
                        pai.updateField(Number(callCount));
                        chrome.runtime.sendMessage({ action: "currentCallType", currentCallType: pai.getCurrentCallType()});
                    }catch(e){
                        chrome.runtime.sendMessage({ action: "error", error: e });
                        clearInterval(intervalId);
                        intervalId = null;
                    }
                });
            }, 2000); // 2秒ごとに実行
            sendResponse({ result: "start"});
        }
        return true;
    }
    // 右に移動
    if (message.action === "moveRight") {
        pai.currentIndex += 1
        points = Pai.points[pai.getCurrentCallType()]
        // 一番左に戻る
        if (pai.currentIndex >= points.length) {
            pai.currentIndex = 0
        }
        sendResponse({ x: points[pai.currentIndex][0], y: points[pai.currentIndex][1] });
    }
    // 左に移動
    if (message.action === "moveLeft") {
        pai.currentIndex -= 1
        points = Pai.points[pai.getCurrentCallType()]
        // 一番右に戻る
        if (pai.currentIndex < 0) {
            pai.currentIndex = points.length - 1
        }
        sendResponse({ x: points[pai.currentIndex][0], y: points[pai.currentIndex][1] });
    }
    // 現在の位置で牌を決定する
    if (message.action === "submit") {
        points = Pai.points[pai.getCurrentCallType()]
        sendResponse({ x: points[pai.currentIndex][0], y: points[pai.currentIndex][1] });
    }
    // キャプチャが開始されているかどうかを返す
    if (message.action === "isCapturing") {
        sendResponse({ isCapturing: intervalId !== null });
    }
});
