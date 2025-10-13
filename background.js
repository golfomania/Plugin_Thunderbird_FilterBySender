// Background script for Filter by sender extension

// Create context menu when extension loads
browser.runtime.onStartup.addListener(() => {
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
});

browser.runtime.onInstalled.addListener(() => {
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
    await filterBySenderFromEmail(emailAddress);
  } catch (error) {
    console.error("Error in filterBySender:", error);
    console.log(
      `Failed to filter. Please manually search for: ${emailAddress}`
    );
  }
}

// Function to filter messages by email address
async function filterBySenderFromEmail(emailAddress) {
  console.log("filterBySenderFromEmail called with:", emailAddress);
  try {
    // Get the current mail tab
    console.log("Getting current mail tab...");
    const mailTab = await browser.mailTabs.getCurrent();
    console.log("Current mail tab:", mailTab);

    if (mailTab) {
      // Set quick filter to filter by sender
      try {
        console.log("Setting quick filter for:", emailAddress);
        await browser.mailTabs.setQuickFilter({
          text: {
            text: emailAddress,
            author: true, // Filter by author/sender
          },
        });
        console.log(`Quick filter set for: ${emailAddress}`);
      } catch (quickFilterError) {
        console.error("Quick filter error:", quickFilterError);
        console.log("Quick filter not supported, trying alternative method");
      }
    } else {
      console.log("No mail tab found - user needs to be in a mail tab");
      // Try to find and switch to a mail tab
      const allTabs = await browser.tabs.query({});
      console.log("All tabs:", allTabs);

      // Look for Thunderbird main window (usually the first non-extension tab)
      console.log("Looking for main Thunderbird tab...");
      console.log(
        "Tab URLs:",
        allTabs.map((tab) => ({ id: tab.id, url: tab.url, title: tab.title }))
      );

      // Try multiple approaches to find the Thunderbird tab
      let mainTab = allTabs.find(
        (tab) =>
          tab.url &&
          !tab.url.includes("moz-extension") &&
          !tab.url.includes("about:") &&
          !tab.url.includes("chrome://") &&
          tab.url !== "undefined" &&
          tab.url !== ""
      );

      // If not found, try to find by title or other properties
      if (!mainTab) {
        console.log("No tab found by URL, trying by title...");
        mainTab = allTabs.find(
          (tab) =>
            tab.title &&
            (tab.title.includes("Thunderbird") ||
              tab.title.includes("Inbox") ||
              tab.title.includes("Mail"))
        );
      }

      // If still not found, use the first non-extension tab
      if (!mainTab) {
        console.log("No tab found by title, using first non-extension tab...");
        mainTab = allTabs.find(
          (tab) => tab.url && !tab.url.includes("moz-extension")
        );
      }

      if (mainTab) {
        console.log("Found main Thunderbird tab:", mainTab);
        await browser.tabs.update(mainTab.id, { active: true });
        console.log("Switched to main Thunderbird tab");

        // Wait a moment for the tab to become active
        await new Promise((resolve) => setTimeout(resolve, 200));

        // Try again to get the current mail tab
        const newMailTab = await browser.mailTabs.getCurrent();
        console.log("Current mail tab after switch:", newMailTab);

        if (newMailTab) {
          try {
            console.log("Setting quick filter for:", emailAddress);
            await browser.mailTabs.setQuickFilter({
              text: {
                text: emailAddress,
                author: true, // Filter by author/sender
              },
            });
            console.log(`Quick filter set for: ${emailAddress}`);
          } catch (quickFilterError) {
            console.error("Quick filter error after switch:", quickFilterError);
          }
        }
      } else {
        console.log("No main Thunderbird tab found - this should not happen");
        console.log(
          "Available tabs:",
          allTabs.map((tab) => ({
            id: tab.id,
            url: tab.url,
            title: tab.title,
            active: tab.active,
          }))
        );

        // As a last resort, try to use the first tab that's not the stats tab
        const nonStatsTab = allTabs.find(
          (tab) => tab.url && !tab.url.includes("sender-stats.html")
        );

        if (nonStatsTab) {
          console.log("Using non-stats tab:", nonStatsTab);
          await browser.tabs.update(nonStatsTab.id, { active: true });
          console.log("Switched to non-stats tab");

          // Wait a moment for the tab to become active
          await new Promise((resolve) => setTimeout(resolve, 200));

          // Try again to get the current mail tab
          const newMailTab = await browser.mailTabs.getCurrent();
          console.log("Current mail tab after switch:", newMailTab);

          if (newMailTab) {
            try {
              console.log("Setting quick filter for:", emailAddress);
              await browser.mailTabs.setQuickFilter({
                text: {
                  text: emailAddress,
                  author: true, // Filter by author/sender
                },
              });
              console.log(`Quick filter set for: ${emailAddress}`);
            } catch (quickFilterError) {
              console.error(
                "Quick filter error after switch:",
                quickFilterError
              );
            }
          }
        } else {
          console.log("No suitable tab found to switch to");
        }
      }
    }

    console.log(`Filtering emails from: ${emailAddress}`);
  } catch (error) {
    console.error("Error in filterBySenderFromEmail:", error);
    console.log(
      `Failed to filter. Please manually search for: ${emailAddress}`
    );
    throw error; // Re-throw to be caught by caller
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
    console.log("Received filterBySenderFromStats message:", message);
    try {
      // For stats page, we already have just the email address
      console.log("Calling filterBySenderFromEmail with:", message.email);
      await filterBySenderFromEmail(message.email);
      console.log("Filter applied successfully");
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

  if (message.action === "getEmailPreviews") {
    try {
      const previews = await getEmailPreviews(message.email, message.limit);
      return { success: true, previews };
    } catch (error) {
      console.error("Error getting email previews:", error);
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
      const inboxFolder = account.folders.find(
        (folder) => folder.type === "inbox"
      );

      if (inboxFolder) {
        // Get all messages from inbox with pagination
        let messageList = await browser.messages.list(inboxFolder.id);
        let allMessages = [...messageList.messages];

        // Handle pagination if there are more messages
        let currentId = messageList.id;
        while (currentId) {
          try {
            const nextList = await browser.messages.continueList(currentId);
            allMessages = allMessages.concat(nextList.messages);
            currentId = nextList.id;
          } catch (error) {
            // No more messages or error
            break;
          }
        }

        console.log(
          `Processing ${allMessages.length} messages from account ${account.id}`
        );

        for (const message of allMessages) {
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

    // Calculate total emails analyzed
    const totalEmails = senders.reduce((sum, sender) => sum + sender.count, 0);

    // Apply pagination
    const total = senders.length;
    const paginatedSenders = senders.slice(offset, offset + limit);

    return {
      senders: paginatedSenders,
      total: total,
      totalEmails: totalEmails,
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
      const inboxFolder = account.folders.find(
        (folder) => folder.type === "inbox"
      );

      if (inboxFolder) {
        // Get all messages from inbox with pagination
        let messageList = await browser.messages.list(inboxFolder.id);
        let allMessages = [...messageList.messages];

        // Handle pagination if there are more messages
        let currentId = messageList.id;
        while (currentId) {
          try {
            const nextList = await browser.messages.continueList(currentId);
            allMessages = allMessages.concat(nextList.messages);
            currentId = nextList.id;
          } catch (error) {
            // No more messages or error
            break;
          }
        }

        // Filter messages from the specific sender
        const messagesToDelete = allMessages.filter((message) => {
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

// Get email previews for a specific sender
async function getEmailPreviews(emailAddress, limit = 10) {
  try {
    const previews = [];

    // Get all accounts
    const accounts = await browser.accounts.list();

    for (const account of accounts) {
      // Get inbox folder for each account
      const inboxFolder = account.folders.find(
        (folder) => folder.type === "inbox"
      );

      if (inboxFolder) {
        // Get all messages from inbox with pagination
        let messageList = await browser.messages.list(inboxFolder.id);
        let allMessages = [...messageList.messages];

        // Handle pagination if there are more messages
        let currentId = messageList.id;
        while (currentId) {
          try {
            const nextList = await browser.messages.continueList(currentId);
            allMessages = allMessages.concat(nextList.messages);
            currentId = nextList.id;
          } catch (error) {
            // No more messages or error
            break;
          }
        }

        // Filter messages from the specific sender
        const messagesFromSender = allMessages.filter((message) => {
          if (!message.author) return false;
          const emailMatch = message.author.match(/<([^>]+)>/) || [
            null,
            message.author,
          ];
          const authorEmail = emailMatch[1] || message.author;
          return authorEmail === emailAddress;
        });

        // Get previews for each message
        for (const message of messagesFromSender.slice(0, limit)) {
          try {
            // Get full message details
            const fullMessage = await browser.messages.get(message.id);

            previews.push({
              id: message.id,
              subject: fullMessage.subject || "No Subject",
              previewText: fullMessage.previewText || "",
              date: fullMessage.date,
              read: fullMessage.read,
            });
          } catch (error) {
            console.error("Error getting message details:", error);
            // Fallback to basic info
            previews.push({
              id: message.id,
              subject: message.subject || "No Subject",
              previewText: "",
              date: message.date,
              read: message.read,
            });
          }
        }

        // Stop if we have enough previews
        if (previews.length >= limit) {
          break;
        }
      }
    }

    // Sort by date (newest first)
    previews.sort((a, b) => new Date(b.date) - new Date(a.date));

    return previews.slice(0, limit);
  } catch (error) {
    console.error("Error getting email previews:", error);
    throw error;
  }
}
