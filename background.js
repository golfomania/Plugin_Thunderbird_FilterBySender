// Background script for Filter by sender extension

// Create context menu when extension loads
browser.menus.create({
  id: "filter-by-sender",
  title: "Find all emails from this sender",
  contexts: ["message_list"],
});

browser.menus.create({
  id: "open-sender-stats",
  title: "Open sender statistics table",
  contexts: ["message_list"],
});

// Add menu click listener
browser.menus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "filter-by-sender") {
    await handleContextMenuClick(info, tab);
  } else if (info.menuItemId === "open-sender-stats") {
    try {
      // Open sender statistics tab
      await browser.tabs.create({
        url: browser.runtime.getURL("sender-stats.html"),
        active: true,
      });
    } catch (error) {
      console.error("Error opening sender stats from context menu:", error);
    }
  }
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

// Handle keyboard shortcut command
browser.commands.onCommand.addListener(async (command) => {
  if (command === "filter-by-sender") {
    console.log("Keyboard shortcut triggered for filter-by-sender");

    try {
      // Get the currently displayed message
      const tabs = await browser.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (tabs && tabs.length > 0) {
        const currentTab = tabs[0];

        // Check if we're viewing a message
        const messageHeader = await browser.messageDisplay.getDisplayedMessage(
          currentTab.id
        );

        if (messageHeader && messageHeader.author) {
          await filterBySender(messageHeader.author);
        } else {
          // If no message is displayed, try to get selected messages from the list
          const messageList = await browser.mailTabs.getSelectedMessages();
          if (
            messageList &&
            messageList.messages &&
            messageList.messages.length > 0
          ) {
            const message = messageList.messages[0];
            await filterBySender(message.author);
          } else {
            console.log("No message selected to filter by sender");
          }
        }
      }
    } catch (error) {
      console.error("Error handling keyboard shortcut:", error);
    }
  } else if (command === "sender-stats") {
    console.log("Keyboard shortcut triggered for sender-stats");

    try {
      // Open sender statistics tab
      await browser.tabs.create({
        url: browser.runtime.getURL("sender-stats.html"),
        active: true,
      });
    } catch (error) {
      console.error("Error opening sender stats:", error);
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
      // Set quick filter to filter by sender
      // Note: This is the primary method for filtering in Thunderbird WebExtensions
      try {
        await browser.mailTabs.setQuickFilter({
          text: {
            text: emailAddress,
            author: true, // Filter by author/sender
          },
        });
        console.log(`Quick filter set for: ${emailAddress}`);
      } catch (quickFilterError) {
        console.log("Quick filter not supported, trying alternative method");
        // Alternative: Create a search folder or use saved search
        // This requires different permissions and is more complex
      }
    }

    console.log(`Filtering emails from: ${emailAddress}`);
  } catch (error) {
    console.error("Error in filterBySender:", error);
    // Show notification to user about the error
    console.log(
      `Failed to filter. Please manually search for: ${emailAddress}`
    );
  }
}

// Handle messages from sender stats page
browser.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.action === "getSenderStats") {
    try {
      const { offset = 0, limit = 50 } = message;
      const stats = await getSenderStatistics(offset, limit);
      return { success: true, ...stats };
    } catch (error) {
      console.error("Error getting sender stats:", error);
      return { success: false, error: error.message };
    }
  }

  if (message.action === "filterBySenderFromStats") {
    try {
      await filterBySender(message.email);
      return { success: true };
    } catch (error) {
      console.error("Error filtering by sender from stats:", error);
      return { success: false, error: error.message };
    }
  }

  if (message.action === "deleteAllEmailsFromSender") {
    try {
      const deletedCount = await deleteAllEmailsFromSender(message.email);
      return { success: true, deletedCount };
    } catch (error) {
      console.error("Error deleting emails from sender:", error);
      return { success: false, error: error.message };
    }
  }
});

// Get sender statistics
async function getSenderStatistics(offset = 0, limit = 50) {
  try {
    // Get all accounts
    const accounts = await browser.accounts.list();
    const senderMap = new Map();

    for (const account of accounts) {
      // Get inbox folder for each account
      const folders = await browser.folders.list(account.id);
      const inboxFolder = folders.find((folder) => folder.type === "inbox");

      if (inboxFolder) {
        // Get all messages from inbox
        const messages = await browser.messages.list(inboxFolder.id);

        for (const message of messages) {
          const author = message.author;
          if (author) {
            // Extract email and name
            const emailMatch = author.match(/<([^>]+)>/) || [null, author];
            const emailAddress = emailMatch[1] || author;
            const nameMatch = author.match(/^([^<]+)</);
            const senderName = nameMatch ? nameMatch[1].trim() : null;

            if (senderMap.has(emailAddress)) {
              senderMap.get(emailAddress).count++;
            } else {
              senderMap.set(emailAddress, {
                email: emailAddress,
                name: senderName,
                count: 1,
              });
            }
          }
        }
      }
    }

    // Convert to array and sort by count
    const senders = Array.from(senderMap.values()).sort(
      (a, b) => b.count - a.count
    );

    // Apply pagination
    const total = senders.length;
    const paginatedSenders = senders.slice(offset, offset + limit);

    return {
      senders: paginatedSenders,
      total: total,
      offset: offset,
      limit: limit,
    };
  } catch (error) {
    console.error("Error getting sender statistics:", error);
    throw error;
  }
}

// Delete all emails from a specific sender
async function deleteAllEmailsFromSender(emailAddress) {
  try {
    let totalDeleted = 0;

    // Get all accounts
    const accounts = await browser.accounts.list();

    for (const account of accounts) {
      // Get inbox folder for each account
      const folders = await browser.folders.list(account.id);
      const inboxFolder = folders.find((folder) => folder.type === "inbox");

      if (inboxFolder) {
        // Get all messages from inbox
        const messages = await browser.messages.list(inboxFolder.id);

        // Filter messages from the specific sender
        const messagesToDelete = messages.filter((message) => {
          if (!message.author) return false;
          const emailMatch = message.author.match(/<([^>]+)>/) || [
            null,
            message.author,
          ];
          const authorEmail = emailMatch[1] || message.author;
          return authorEmail === emailAddress;
        });

        // Delete messages
        if (messagesToDelete.length > 0) {
          const messageIds = messagesToDelete.map((msg) => msg.id);
          await browser.messages.delete(messageIds);
          totalDeleted += messageIds.length;
        }
      }
    }

    console.log(`Deleted ${totalDeleted} emails from ${emailAddress}`);
    return totalDeleted;
  } catch (error) {
    console.error("Error deleting emails from sender:", error);
    throw error;
  }
}
