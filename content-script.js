// Content script for Same Address Filter extension
// This runs in the context of the message display

let buttonAdded = false;

// Function to create and inject the filter button
function injectFilterButton() {
  if (buttonAdded) return;

  // Wait for the page to load
  setTimeout(() => {
    // Try multiple selectors for different Thunderbird versions
    const selectors = [
      ".message-header-author", // Author header area
      ".header-row.header-row-author", // Alternative author row
      ".messageHeadersToolbar", // Message header toolbar
      "#msgHeaderView", // Message header view
      ".msg-header-author", // Another possible author class
      'span[aria-label*="From"]', // From field by aria-label
      ".email-address", // Email address element
      ".header-value", // Header value field
    ];

    let targetElement = null;

    // Find the first available element
    for (const selector of selectors) {
      targetElement = document.querySelector(selector);
      if (targetElement) {
        console.log(`Found element with selector: ${selector}`);
        break;
      }
    }

    // Fallback: Find element containing the email address pattern
    if (!targetElement) {
      const allElements = document.querySelectorAll("*");
      for (const element of allElements) {
        if (
          element.textContent &&
          element.textContent.match(/[\w.-]+@[\w.-]+\.\w+/) &&
          element.textContent.length < 200
        ) {
          // Avoid large text blocks
          if (element.tagName !== "BODY" && element.tagName !== "HTML") {
            targetElement = element;
            console.log(
              `Found element by email pattern in: ${element.tagName}.${element.className}`
            );
            break;
          }
        }
      }
    }

    if (targetElement) {
      // Create the filter button
      const filterButton = document.createElement("button");
      filterButton.id = "same-address-filter-btn";
      filterButton.className = "same-address-filter-button";
      filterButton.title = "Filter all emails from this sender";
      filterButton.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M1 2a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v2a1 1 0 0 1-.293.707L10 9.414V14a1 1 0 0 1-.293.707l-2 2A1 1 0 0 1 6 16v-6.586L1.293 4.707A1 1 0 0 1 1 4V2z"/>
        </svg>
        <span>Filter Sender</span>
      `;

      // Add click handler
      filterButton.addEventListener("click", handleFilterClick);

      // Try to insert the button near the email address
      if (targetElement.parentElement) {
        // Insert after the target element
        targetElement.parentElement.insertBefore(
          filterButton,
          targetElement.nextSibling
        );
      } else {
        // Append to the target element
        targetElement.appendChild(filterButton);
      }

      buttonAdded = true;
      console.log("Filter button added successfully");
    } else {
      console.log("Could not find suitable element for button injection");
      // Retry after a delay
      if (!buttonAdded) {
        setTimeout(injectFilterButton, 1000);
      }
    }
  }, 500);
}

// Alternative approach: Add button to the toolbar if header injection fails
function injectToolbarButton() {
  const toolbar = document.querySelector(
    ".messageHeadersToolbar, #header-view-toolbar, .toolbar-box"
  );

  if (toolbar && !document.getElementById("same-address-filter-toolbar-btn")) {
    const toolbarButton = document.createElement("button");
    toolbarButton.id = "same-address-filter-toolbar-btn";
    toolbarButton.className =
      "same-address-filter-toolbar-button toolbarbutton-1";
    toolbarButton.title = "Filter all emails from this sender";
    toolbarButton.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <path d="M1 2a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v2a1 1 0 0 1-.293.707L10 9.414V14a1 1 0 0 1-.293.707l-2 2A1 1 0 0 1 6 16v-6.586L1.293 4.707A1 1 0 0 1 1 4V2z"/>
      </svg>
    `;

    toolbarButton.addEventListener("click", handleFilterClick);
    toolbar.appendChild(toolbarButton);
    console.log("Toolbar button added as fallback");
  }
}

// Handle filter button click
async function handleFilterClick(event) {
  event.preventDefault();
  event.stopPropagation();

  console.log("Filter button clicked");

  try {
    // Send message to background script
    const response = await browser.runtime.sendMessage({
      action: "filterBySender",
    });

    if (response && response.success) {
      // Visual feedback
      const button = event.currentTarget;
      button.style.backgroundColor = "#4CAF50";
      setTimeout(() => {
        button.style.backgroundColor = "";
      }, 1000);
    }
  } catch (error) {
    console.error("Error sending message to background:", error);
  }
}

// Add right-click context menu handler for email addresses
function addContextMenuHandler() {
  document.addEventListener("contextmenu", async (event) => {
    const target = event.target;

    // Check if right-clicked on an email address
    const emailPattern = /[\w.-]+@[\w.-]+\.\w+/;
    const text = target.textContent || "";

    if (emailPattern.test(text)) {
      // Store the email address for the background script
      browser.storage.local.set({
        contextEmail: text.match(emailPattern)[0],
      });
    }
  });
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    injectFilterButton();
    injectToolbarButton();
    addContextMenuHandler();
  });
} else {
  injectFilterButton();
  injectToolbarButton();
  addContextMenuHandler();
}

// Also try to inject when the message changes
const observer = new MutationObserver((mutations) => {
  // Check if the message header has changed
  const headerChanged = mutations.some((mutation) => {
    return (
      mutation.target.id === "msgHeaderView" ||
      mutation.target.className?.includes("header") ||
      mutation.addedNodes.length > 0
    );
  });

  if (headerChanged && !buttonAdded) {
    buttonAdded = false; // Reset flag
    injectFilterButton();
    injectToolbarButton();
  }
});

// Start observing
observer.observe(document.body, {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ["class", "id"],
});

console.log("Same Address Filter content script loaded");
