function executeScript(tab, scriptSnippet) {
  return new Promise((resolve) => {
    chrome.tabs.executeScript(tab.id, {
      code: scriptSnippet,
    }, resolve);
  });
}

function createTab(url) {
  return new Promise((resolve) => {
    chrome.tabs.create({
      url,
      active: false,
    }, resolve);
  });
}

function getCurrentTab() {
  return new Promise((resolve) => {
    chrome.tabs.query({
      active: true,
      currentWindow: true,
    }, (tabs) => {
      resolve(tabs[0]);
    });
  });
}

chrome.browserAction.onClicked.addListener(async () => {
  const currentTab = await getCurrentTab();
  const tab = await createTab('chrome://net-internals#dns');
  const codeSnippet = `
    const script = document.createElement('script');
    script.appendChild(document.createTextNode(\`
      g_browser.send('closeIdleSockets');
      g_browser.sendFlushSocketPools();
      g_browser.sendClearHostResolverCache.bind(g_browser)();
      window.close();
    \`));
    document.body.appendChild(script);
  `;
  await executeScript(tab, codeSnippet);
  chrome.tabs.sendMessage(currentTab.id, { action: 'flush' });
});