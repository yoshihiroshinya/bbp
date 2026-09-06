// =============================================================================
//  bbpStorage.js — BrowserStorage (C#) から呼ばれる localStorage のラッパ
//
//  Blazor WebAssembly の wwwroot/index.html で読み込む:
//      <script src="bbpStorage.js"></script>
//
//  IJsInterop.InvokeAsync("bbpStorage.get" / "bbpStorage.set", ...) から呼ばれる。
//  どちらも文字列または null を返す（C# 側は Task<string> で受ける）。
//
//  容量が足りなくなったら（localStorage はオリジンあたり約5MB）
//  この2関数を IndexedDB 実装へ差し替える。C# 側は変更不要。
// =============================================================================
window.bbpStorage = {
    // 無ければ localStorage.getItem が null を返す。C# 側はそれを「未保存」として扱う。
    get: function (key) {
        try {
            return window.localStorage.getItem(key);
        } catch (e) {
            // プライベートブラウジング等で localStorage が使えない場合。
            // null を返すと初回シードが毎回走る（動作はするが永続化されない）。
            console.error("bbpStorage.get failed:", key, e);
            return null;
        }
    },

    set: function (key, value) {
        try {
            window.localStorage.setItem(key, value);
            return null;
        } catch (e) {
            // QuotaExceededError を含む。呼び出し側で握り潰さず C# 例外にしたいので
            // 再スローする（DataManager.SaveJsonAsync が「保存失敗」として拾う）。
            console.error("bbpStorage.set failed:", key, e);
            throw e;
        }
    },

    // 開発時にストレージを空にして初回シードを再確認するための補助。
    // C# からは呼んでいない。ブラウザのコンソールで bbpStorage.clear() と打つ。
    clear: function () {
        var keys = [];
        for (var i = 0; i < window.localStorage.length; i++) {
            var k = window.localStorage.key(i);
            if (k && k.indexOf("bbp:") === 0) keys.push(k);
        }
        keys.forEach(function (k) { window.localStorage.removeItem(k); });
        return String(keys.length);
    }
};
