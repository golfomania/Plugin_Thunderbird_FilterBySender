// Background script for Same Address Filter extension

// Create context menu when extension loads
browser.runtime.onInstalled.addListener(() => {
  browser.menus.create({
    id: "filter-by-sender",
    title: "Filter all emails from this sender",
    contexts: ["message_list"],
    onclick: handleContextMenuClick,
  });
});

// Also create a context menu for the message display
browser.menus.create({
  id: "filter-by-sender-display",
  title: "Filter all emails from this sender",
  contexts: ["all"],
  documentUrlPatterns: ["about:message*"],
});

// Handle context menu clicks
async function handleContextMenuClick(info, tab) {
  try {
    // Get the selected message
    const messageList = await browser.mailTabs.getSelectedMessages();
    if (
      messageList &&
      messageList.messages &&
      messageList.messages.length > 0
    ) {
      const message = messageList.messages[0];
      await filterBySender(message.author);
    }
  } catch (error) {
    console.error("Error handling context menu click:", error);
  }
}

// Handle messages from content script
browser.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.action === "filterBySender") {
    try {
      // Get current tab info
      const tabs = await browser.tabs.query({
        active: true,
        currentWindow: true,
      });
      const currentTab = tabs[0];

      // Get the displayed message
      const messageHeader = await browser.messageDisplay.getDisplayedMessage(
        currentTab.id
      );

      if (messageHeader) {
        await filterBySender(messageHeader.author);
        return { success: true };
      }
    } catch (error) {
      console.error("Error filtering by sender:", error);
      return { success: false, error: error.message };
    }
  }

  if (message.action === "getMessageAuthor") {
    try {
      const tabs = await browser.tabs.query({
        active: true,
        currentWindow: true,
      });
      const currentTab = tabs[0];
      const messageHeader = await browser.messageDisplay.getDisplayedMessage(
        currentTab.id
      );

      if (messageHeader && messageHeader.author) {
        return { author: messageHeader.author };
      }
    } catch (error) {
      console.error("Error getting message author:", error);
      return { error: error.message };
    }
  }
});

// Function to filter messages by sender
async function filterBySender(author) {
  try {
    // Extract email address from author string (format: "Name <email@domain.com>")
    const emailMatch = author.match(/<([^>]+)>/) || [null, author];
    const emailAddress = emailMatch[1] || author;

    // Get the current mail tab
    const tabs = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });
    const currentTab = tabs[0];

    // Check if it's a mail tab
    const mailTab = await browser.mailTabs.getCurrent();

    if (mailTab) {
      // Update the query/search in the current tab
      // Note: Thunderbird's WebExtension API has limitations for directly setting the search
      // We'll use a workaround by creating a new tab with a search query
      await browser.mailTabs.query({
        author: emailAddress,
        includeSubFolders: true,
      });

      // Alternative: Set quick filter (if supported in your Thunderbird version)
      await browser.mailTabs.setQuickFilter({
        text: {
          text: emailAddress,
          sender: true,
        },
      });
    }

    console.log(`Filtering emails from: ${emailAddress}`);
  } catch (error) {
    console.error("Error in filterBySender:", error);
    // Try fallback method - copy to clipboard
    await browser.clipboard.writeText(emailAddress);
    console.log("Email address copied to clipboard for manual filtering");
  }
}

// Listen for tab changes to update context menu
browser.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const tab = await browser.tabs.get(activeInfo.tabId);
    const messageHeader = await browser.messageDisplay.getDisplayedMessage(
      activeInfo.tabId
    );

    // Update context menu visibility based on whether a message is displayed
    browser.menus.update("filter-by-sender-display", {
      visible: messageHeader !== null,
    });
  } catch (error) {
    // Tab might not be a mail tab
  }
});
