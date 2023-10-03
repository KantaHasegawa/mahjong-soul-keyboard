// Difine class
class Fetcher {
    constructor() {
        this.baseURL = 'http://localhost:8090';
    }
    getPaiCount = async (payload) => {
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
        this.currentPaiType = "DEFAULT"
    }
    static paiType = {
        DEFAULT: 13,
        CALL_1: 10,
        CALL_2: 7,
        CALL_3: 4,
        CALL_4: 1,
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

    getCurrentPaiType = () => {
        return this.currentPaiType
    }

    updateField = (paiCount) => {
        let minDiff = 100000
        let result = "DEFAULT"
        for (let key in Pai.paiType) {
            const diff = Math.abs(paiCount - Pai.paiType[key])
            if (minDiff > diff) {
                minDiff = diff
                result = key
            }
        }
        this.currentPaiType = result
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
            chrome.runtime.sendMessage({ action: "currentPaiCount", currentPaiCount: "?" });
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
                        const paiCount = await fetcher.getPaiCount(payload);
                        pai.updateField(paiCount);
                        chrome.runtime.sendMessage({ action: "currentPaiCount", currentPaiCount: Pai.paiType[pai.getCurrentPaiType()] });
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
        points = Pai.points[pai.getCurrentPaiType()]
        // 一番左に戻る
        if (pai.currentIndex >= points.length) {
            pai.currentIndex = 0
        }
        sendResponse({ x: points[pai.currentIndex][0], y: points[pai.currentIndex][1] });
    }
    // 左に移動
    if (message.action === "moveLeft") {
        pai.currentIndex -= 1
        points = Pai.points[pai.getCurrentPaiType()]
        // 一番右に戻る
        if (pai.currentIndex < 0) {
            pai.currentIndex = points.length - 1
        }
        sendResponse({ x: points[pai.currentIndex][0], y: points[pai.currentIndex][1] });
    }
    // 現在の位置で牌を決定する
    if (message.action === "submit") {
        points = Pai.points[pai.getCurrentPaiType()]
        sendResponse({ x: points[pai.currentIndex][0], y: points[pai.currentIndex][1] });
    }
    // キャプチャが開始されているかどうかを返す
    if (message.action === "isCapturing") {
        sendResponse({ isCapturing: intervalId !== null });
    }
});
