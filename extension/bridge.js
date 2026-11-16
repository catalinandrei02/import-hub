// Runs only on the Import Hub site. Passes "read this listing" requests from the page to the extension and the
// answers back. The page and the extension talk only through window messages tagged with these source names.
document.documentElement.dataset.importHub = "1";
document.documentElement.dataset.importHubV = chrome.runtime.getManifest().version;
window.addEventListener("message", e => {
  const m = e.data;
  if (e.source !== window || !m || m.source !== "import-hub" || (m.type !== "read" && m.type !== "search") || typeof m.url !== "string") return;
  chrome.runtime.sendMessage({ type: m.type, url: m.url }, res => {
    const err = chrome.runtime.lastError ? chrome.runtime.lastError.message : res && res.error;
    window.postMessage({ source: "import-hub-ext", type: "result", id: m.id, data: res && res.data, error: err || null }, location.origin);
  });
});
window.postMessage({ source: "import-hub-ext", type: "ready", v: chrome.runtime.getManifest().version }, location.origin);
