// =============================================================================
//  bbpFile.js — ブラウザでファイルを保存させる（xlsx の書き出し用）
//
//  Blazor WebAssembly の wwwroot/index.html で読み込む:
//      <script src="bbpFile.js"></script>
//
//  【なぜ JS が要るか】ブラウザにはファイルパスが無い。C# 側が作った xlsx の
//    バイト列を「ダウンロード」として渡すには、Blob と <a download> を作って
//    クリックする以外の手段が無い。
//
//  【読み込み側は JS 不要】<input type="file"> は Blazor の InputFile が
//    そのまま扱えるので、こちらには置かない。
// =============================================================================
window.bbpFile = {
    // base64 で受けるのは、C# の byte[] を JS へ渡す一番素直な経路だから
    // （IJSRuntime は byte[] も渡せるが、この1箇所のために型を増やさない）。
    download: function (fileName, base64, mime) {
        try {
            const bin = window.atob(base64);
            const buf = new Uint8Array(bin.length);
            for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);

            const blob = new Blob([buf], { type: mime || "application/octet-stream" });
            const url = window.URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            // すぐ revoke するとダウンロードが始まらない環境があるので少し待つ。
            window.setTimeout(function () { window.URL.revokeObjectURL(url); }, 10000);
            return null;
        } catch (e) {
            console.error("bbpFile.download failed:", fileName, e);
            return String(e);
        }
    }
};
