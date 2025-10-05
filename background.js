// Background script for Same Address Filter extension

// Create context menu when extension loads
browser.menus.create({
  id: "filter-by-sender",
  title: "Filter all emails from this sender",
  contexts: ["message_list"],
});

// Add menu click listener
browser.menus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "filter-by-sender") {
    await handleContextMenuClick(info, tab);
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

// Add command/keyboard shortcut support (optional)
// You can define keyboard shortcuts in the manifest if needed

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
