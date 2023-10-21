function removeProtocolFromUrl(url) {
  /// This function removes protocol prefixes like `http://` from the url
  const protocolPrefixes = ["http://", "https://", "ftp://"]
  for (pp of protocolPrefixes) {
    if (url.startsWith(pp)) {
      return url.slice(pp.length)
    }
  }
  return url
}

chrome.runtime.onInstalled.addListener(() => {
  /// Set the default state to Hide when the extension is first installed.
  chrome.action.setBadgeText({
    text: "Hide",
  })
})

chrome.tabs.onUpdated.addListener((_tabId, changeInfo, tab) => {
  const current_tab_website = removeProtocolFromUrl(tab.url).split('/')[0]
  chrome.storage.sync.get(current_tab_website, async (result) => {
    /// checking if the key exist, then delete the url because the state is `Hide`
    if (result.hasOwnProperty(current_tab_website)) {
      chrome.history.deleteUrl({ url: tab.url })
      await chrome.action.setBadgeText({ tabId: tab.id, text: "Seek" })
    } else {
      await chrome.action.setBadgeText({ tabId: tab.id, text: "Hide" })
    }
  })
})

chrome.action.onClicked.addListener(async (tab) => {
  const current_tab_website = removeProtocolFromUrl(tab.url).split('/')[0]
  /// Update the state
  const prev_state = await chrome.action.getBadgeText({ tabId: tab.id })
  const next_state = prev_state === 'Hide' ? 'Seek' : 'Hide'
  await chrome.action.setBadgeText({
    tabId: tab.id,
    text: next_state,
  })
  /// If the next_state is `Seek`, then delete the current website url from history
  if (next_state === 'Seek') {
    await chrome.storage.sync.set({ [current_tab_website]: true })
    chrome.history.deleteUrl({ url: tab.url })
  } else {
    /// Add the current website url back to history
    await chrome.storage.sync.remove(current_tab_website)
    chrome.history.addUrl({ url: tab.url })
  }
})

