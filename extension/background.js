// Opens a listing in a minimised window of this Chrome (so the user's VPN and sign-ins apply), runs reader.js in it,
// closes it and returns what was read. Only the Import Hub site (see bridge.js matches) can ask, one listing at a time.
const ALLOWED = [/^https:\/\/catalinandrei02\.github\.io\/import-hub\//, /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//];
let chain = Promise.resolve();

chrome.runtime.onMessage.addListener((msg, sender, reply) => {
  if (!msg || msg.type !== "read" || !sender.tab || !ALLOWED.some(r => r.test(sender.url || ""))) return;
  let url;
  try { url = new URL(msg.url); } catch { reply({ error: "bad url" }); return; }
  if (url.protocol !== "https:" && url.protocol !== "http:") { reply({ error: "bad url" }); return; }
  chain = chain.then(() => read(url.href)).then(data => reply({ data }), e => reply({ error: String(e && e.message || e) }));
  return true; // answer later
});

const wait = ms => new Promise(r => setTimeout(r, ms));

function loaded(tabId, timeout) {
  return new Promise(resolve => {
    const done = () => { chrome.tabs.onUpdated.removeListener(on); clearTimeout(t); resolve(); };
    const on = (id, info) => { if (id === tabId && info.status === "complete") done(); };
    const t = setTimeout(done, timeout);
    chrome.tabs.onUpdated.addListener(on);
  });
}

async function run(tabId) {
  const [res] = await chrome.scripting.executeScript({ target: { tabId }, files: ["reader.js"] });
  return res && res.result;
}

async function read(url) {
  const win = await chrome.windows.create({ url, focused: false, state: "minimized" });
  const tabId = win.tabs[0].id;
  try {
    await loaded(tabId, 30000);
    await wait(2500); // listing sites fill the gallery with scripts after load
    let data = await run(tabId);
    if (!data || !data.i || !data.i.length) { await wait(4000); data = await run(tabId); }
    return data;
  } finally {
    chrome.windows.remove(win.id).catch(() => {});
  }
}
