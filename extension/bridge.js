// Runs only on the Import Hub site. Passes "read this listing" requests from the page to the extension and the
// answers back. The page and the extension talk only through window messages tagged with these source names.
document.documentElement.dataset.importHub = "1";
window.addEventListener("message", e => {
  const m = e.data;
  if (e.source !== window || !m || m.source !== "import-hub" || m.type !== "read" || typeof m.url !== "string") return;
  chrome.runtime.sendMessage({ type: "read", url: m.url }, res => {
    const err = chrome.runtime.lastError ? chrome.runtime.lastError.message : res && res.error;
    window.postMessage({ source: "import-hub-ext", type: "result", id: m.id, data: res && res.data, error: err || null }, location.origin);
  });
});
window.postMessage({ source: "import-hub-ext", type: "ready" }, location.origin);
