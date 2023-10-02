// Difine class
class Fetcher {
    constructor() {
        this.baseURL = 'http://localhost:8090';
    }
    getPaiCount = async (payload) => {
        try {
            const res = await fetch(this.baseURL + "/", {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            })
            const json = await res.json()
            return json.count
        }catch (e) {
            console.error(e)
        }
    }
}

class Pai {
    constructor() {
        this.currentPaiType = "DEFAULT"
        this.currentPoints = Pai.points["DEFAULT"]
    }
    static paiType = {
        DEFAULT: 13,
        DEFAULT_TSUMO: 14,
        CALL_1: 10,
        CALL_1_TSUMO: 11,
        CALL_2: 7,
        CALL_2_TSUMO: 8,
        CALL_3: 4,
        CALL_3_TSUMO: 5,
        CALL_4: 1,
        CALL_4_TSUMO: 2
    };
    
    static points = {
        DEFAULT: [],
        DEFAULT_TSUMO: [],
        CALL_1: [],
        CALL_1_TSUMO: [],
        CALL_2: [],
        CALL_2_TSUMO: [],
        CALL_3: [],
        CALL_3_TSUMO: [],
        CALL_4: [],
        CALL_4_TSUMO: []
    }

    getCurrentPaiType = () => {
        return this.currentPaiType
    }

    getCurrentPoints = () => {
        return this.currentPoints
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
        this.currentPoints = Pai.points[result]
    }
}

// Init
const fetcher = new Fetcher()
const pai = new Pai()
let intervalId = null;

// Event
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "capture") {
        if (intervalId) {
            // 既にタイマーが動いている場合、タイマーを停止する 
            clearInterval(intervalId);
            intervalId = null;
            chrome.runtime.sendMessage({ action: "currentPaiCount", currentPaiCount: "?" });
            sendResponse({ result: "stop"});
        } else {
            // タイマーが動いていない場合、新しいタイマーをセットする
            intervalId = setInterval(() => {
                chrome.tabs.captureVisibleTab(async (screenshotUrl) => {
                    const payload = {
                        "image": screenshotUrl
                    };
                    const paiCount = await fetcher.getPaiCount(payload);
                    pai.updateField(paiCount);
                    chrome.runtime.sendMessage({ action: "currentPaiCount", currentPaiCount: Pai.paiType[pai.getCurrentPaiType()] });
                });
            }, 2000); // 2秒ごと
            sendResponse({ result: "start"});
        }
        return true;
    }
});
