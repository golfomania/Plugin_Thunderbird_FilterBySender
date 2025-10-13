// Sender Statistics JavaScript for Filter by sender extension

let senderStats = [];
let currentOffset = 0;
let isLoading = false;
let pendingDelete = null;
let autoRefreshInterval = null;
let lastUpdateTime = null;
let openAccordion = null; // Track which accordion is currently open
let skipConfirmation = false; // Track if confirmation should be skipped for this session

// Initialize the page
document.addEventListener("DOMContentLoaded", function () {
  loadSenderStats();
  startAutoRefresh();

  // Add event listeners for buttons
  document.getElementById("refresh-btn").addEventListener("click", resetStats);
  document
    .getElementById("load-more-btn")
    .addEventListener("click", loadMoreSenders);
  document
    .getElementById("cancel-delete-btn")
    .addEventListener("click", cancelDelete);
  document
    .getElementById("confirm-delete-btn")
    .addEventListener("click", confirmDelete);

  // Add keyboard shortcut for confirmation dialog
  document.addEventListener("keydown", function (e) {
    if (
      !document.getElementById("confirm-dialog").classList.contains("hidden")
    ) {
      if (e.key === "Enter") {
        e.preventDefault();
        confirmDelete();
      } else if (e.key === "Escape") {
        e.preventDefault();
        cancelDelete();
      }
    }
  });

  // Stop auto-refresh when page is hidden/unloaded
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      stopAutoRefresh();
    } else {
      startAutoRefresh();
    }
  });

  window.addEventListener("beforeunload", function () {
    stopAutoRefresh();
  });
});

// Load sender statistics
async function loadSenderStats() {
  if (isLoading) return;

  console.log("loadSenderStats called, currentOffset:", currentOffset);
  isLoading = true;
  updateStatsText("Loading sender statistics...");
  disableRefreshButton(true);

  try {
    const response = await browser.runtime.sendMessage({
      action: "getSenderStats",
      offset: currentOffset,
      limit: 50,
    });

    console.log("Response received:", response);

    if (response.success) {
      if (currentOffset === 0) {
        senderStats = response.senders;
      } else {
        senderStats = senderStats.concat(response.senders);
      }

      renderTable();
      updateStatsText(
        `Showing ${senderStats.length} of ${response.total} senders (${response.totalEmails} emails analyzed)`
      );

      // Show/hide load more button with correct count
      const loadMoreContainer = document.getElementById("load-more-container");
      const loadMoreBtn = document.getElementById("load-more-btn");

      if (senderStats.length < response.total) {
        loadMoreContainer.classList.remove("hidden");
        const remaining = response.total - senderStats.length;
        const loadCount = Math.min(remaining, 50);
        loadMoreBtn.textContent = `Load ${loadCount} more`;
        loadMoreBtn.disabled = false;
      } else {
        loadMoreContainer.classList.add("hidden");
      }

      currentOffset += 50;
    } else {
      updateStatsText("Error loading sender statistics");
      showError(
        "Failed to load sender statistics: " +
          (response.error || "Unknown error")
      );
    }
  } catch (error) {
    console.error("Error loading sender stats:", error);
    updateStatsText("Error loading sender statistics");
    showError("Failed to load sender statistics: " + error.message);
  } finally {
    isLoading = false;
    disableRefreshButton(false);
  }
}

// Start auto-refresh
function startAutoRefresh() {
  if (autoRefreshInterval) {
    clearInterval(autoRefreshInterval);
  }

  autoRefreshInterval = setInterval(async () => {
    // Only refresh if not currently loading, no dialog is open, and no accordion is open
    if (
      !isLoading &&
      document.getElementById("confirm-dialog").classList.contains("hidden") &&
      !openAccordion
    ) {
      console.log("Auto-refreshing sender stats...");
      await refreshStats();
    }
  }, 5000); // 5 seconds

  console.log("Auto-refresh started (5s interval)");
}

// Stop auto-refresh
function stopAutoRefresh() {
  if (autoRefreshInterval) {
    clearInterval(autoRefreshInterval);
    autoRefreshInterval = null;
    console.log("Auto-refresh stopped");
  }
}

// Refresh statistics (preserves current view)
async function refreshStats() {
  lastUpdateTime = new Date();

  // If we have loaded data, refresh all of it
  if (senderStats.length > 0) {
    await refreshAllLoadedData();
  } else {
    // If no data loaded yet, do normal load
    await loadSenderStats();
  }
}

// Refresh all currently loaded data
async function refreshAllLoadedData() {
  if (isLoading) return;

  isLoading = true;
  updateStatsText("Refreshing sender statistics...");
  disableRefreshButton(true);

  try {
    // Get all data up to current offset
    const response = await browser.runtime.sendMessage({
      action: "getSenderStats",
      offset: 0,
      limit: senderStats.length, // Get all currently loaded data
    });

    console.log("Refresh response received:", response);

    if (response.success) {
      // Replace all current data with fresh data
      senderStats = response.senders;

      renderTable();
      updateStatsText(
        `Showing ${senderStats.length} of ${response.total} senders (${response.totalEmails} emails analyzed)`
      );

      // Show/hide load more button with correct count
      const loadMoreContainer = document.getElementById("load-more-container");
      const loadMoreBtn = document.getElementById("load-more-btn");

      if (senderStats.length < response.total) {
        loadMoreContainer.classList.remove("hidden");
        const remaining = response.total - senderStats.length;
        const loadCount = Math.min(remaining, 50);
        loadMoreBtn.textContent = `Load ${loadCount} more`;
        loadMoreBtn.disabled = false;
      } else {
        loadMoreContainer.classList.add("hidden");
      }
    } else {
      updateStatsText("Error refreshing sender statistics");
      showError(
        "Failed to refresh sender statistics: " +
          (response.error || "Unknown error")
      );
    }
  } catch (error) {
    console.error("Error refreshing sender stats:", error);
    updateStatsText("Error refreshing sender statistics");
    showError("Failed to refresh sender statistics: " + error.message);
  } finally {
    isLoading = false;
    disableRefreshButton(false);
  }
}

// Reset statistics (clears view)
async function resetStats() {
  currentOffset = 0;
  senderStats = [];
  lastUpdateTime = new Date();
  await loadSenderStats();
}

// Load more senders
async function loadMoreSenders() {
  console.log("loadMoreSenders called");
  const loadMoreBtn = document.getElementById("load-more-btn");
  loadMoreBtn.disabled = true;
  loadMoreBtn.textContent = "Loading...";

  await loadSenderStats();
}

// Render the table
function renderTable() {
  const tbody = document.getElementById("table-body");

  // Store current accordion state before re-rendering
  const wasAccordionOpen = openAccordion;

  if (senderStats.length === 0) {
    tbody.innerHTML = `
            <tr>
                <td colspan="3" class="loading">
                    <div>No senders found</div>
                </td>
            </tr>
        `;
    return;
  }

  tbody.innerHTML = senderStats
    .map(
      (sender, index) => `
        <tr class="row-clickable" data-email="${escapeHtml(sender.email)}">
            <td>
                <div class="sender-info">
                    <div class="sender-name">${escapeHtml(
                      sender.name || "Unknown"
                    )}</div>
                    <div class="sender-email">${escapeHtml(sender.email)}</div>
                </div>
            </td>
            <td>
                <span class="count-badge">${sender.count}</span>
            </td>
            <td class="actions-cell">
                <button class="action-btn delete-btn" data-email="${escapeHtml(
                  sender.email
                )}" data-name="${escapeHtml(
        sender.name || "Unknown"
      )}" data-count="${
        sender.count
      }" title="Delete all emails from this sender">
                    🗑️ Delete All
                </button>
                <button class="accordion-btn" data-email="${escapeHtml(
                  sender.email
                )}" title="Show email previews">
                    📧 Preview
                </button>
            </td>
        </tr>
        <tr class="accordion-row" data-email="${escapeHtml(
          sender.email
        )}" style="display: none;">
            <td colspan="3">
                <div class="accordion-content">
                    <div class="loading">Loading email previews...</div>
                </div>
            </td>
        </tr>
    `
    )
    .join("");

  // Add click event listeners to table rows
  tbody.querySelectorAll(".row-clickable").forEach((row) => {
    row.addEventListener("click", (e) => {
      console.log("Row clicked, target:", e.target);
      console.log("Row dataset:", row.dataset);

      // Don't trigger if clicking on the delete button or accordion button
      if (
        e.target.closest(".action-btn") ||
        e.target.closest(".accordion-btn")
      ) {
        console.log("Click on action button, ignoring row click");
        return;
      }

      const email = row.dataset.email;
      console.log("Email from row:", email);
      if (email) {
        console.log("Calling filterBySender with:", email);
        filterBySender(email);
      } else {
        console.log("No email found in row dataset");
      }
    });
  });

  // Add click event listeners to delete buttons
  tbody.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const email = btn.dataset.email;
      const name = btn.dataset.name;
      const count = parseInt(btn.dataset.count);
      deleteAllEmails(email, name, count);
    });
  });

  // Add click event listeners to accordion buttons
  tbody.querySelectorAll(".accordion-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const email = btn.dataset.email;
      toggleAccordion(email);
    });
  });

  // Restore accordion state if it was open before re-rendering
  if (wasAccordionOpen) {
    // Small delay to ensure DOM is ready
    setTimeout(() => {
      restoreAccordionState(wasAccordionOpen);
    }, 100);
  }
}

// Restore accordion state after re-rendering
async function restoreAccordionState(email) {
  console.log("Restoring accordion state for:", email);

  // Check if the sender still exists in the current data
  const senderExists = senderStats.some((sender) => sender.email === email);
  if (!senderExists) {
    console.log("Sender no longer exists, clearing accordion state");
    openAccordion = null;
    return;
  }

  // Restore the accordion
  openAccordion = email;
  const accordionRow = document.querySelector(
    `tr.accordion-row[data-email="${escapeHtml(email)}"]`
  );
  const accordionContent = accordionRow?.querySelector(".accordion-content");

  if (accordionRow && accordionContent) {
    accordionRow.style.display = "table-row";

    // Load email previews
    try {
      accordionContent.innerHTML =
        '<div class="loading">Loading email previews...</div>';

      const response = await browser.runtime.sendMessage({
        action: "getEmailPreviews",
        email: email,
        limit: 10,
      });

      console.log("Email previews response:", response);

      if (response.success) {
        console.log("Rendering previews:", response.previews);
        renderEmailPreviews(accordionContent, response.previews);
      } else {
        console.error("Failed to get email previews:", response.error);
        accordionContent.innerHTML =
          '<div class="loading">Error loading previews</div>';
      }
    } catch (error) {
      console.error("Error loading email previews:", error);
      accordionContent.innerHTML =
        '<div class="loading">Error loading previews</div>';
    }
  }
}

// Filter by sender (reuse existing functionality)
async function filterBySender(email) {
  console.log("filterBySender called with email:", email);
  try {
    console.log("Sending message to background script...");
    const response = await browser.runtime.sendMessage({
      action: "filterBySenderFromStats",
      email: email,
    });

    console.log("Response from background:", response);

    if (response.success) {
      // Don't close the stats tab - just switch to main Thunderbird window
      // The tab should remain open for easy navigation back
      console.log(`Filtered by ${email} - stats tab remains open`);
    } else {
      console.error("Filter failed:", response.error);
      showError(
        "Failed to filter by sender: " + (response.error || "Unknown error")
      );
    }
  } catch (error) {
    console.error("Error filtering by sender:", error);
    showError("Failed to filter by sender: " + error.message);
  }
}

// Delete all emails from a sender
function deleteAllEmails(email, name, count) {
  console.log("deleteAllEmails called with:", email, name, count);
  pendingDelete = { email, name, count };

  // Check if confirmation should be skipped
  if (skipConfirmation) {
    console.log("Skipping confirmation dialog");
    confirmDelete();
    return;
  }

  const confirmText = document.getElementById("confirm-text");
  confirmText.textContent = `Are you sure you want to delete all ${count} emails from "${name}" (${email})? This action cannot be undone.`;

  // Reset checkbox to unchecked
  const checkbox = document.getElementById("dont-show-again-checkbox");
  checkbox.checked = false;

  const dialog = document.getElementById("confirm-dialog");
  console.log("Dialog element:", dialog);
  dialog.classList.remove("hidden");
  console.log("Dialog should now be visible");
}

// Cancel delete operation
function cancelDelete() {
  document.getElementById("confirm-dialog").classList.add("hidden");
  pendingDelete = null;
}

// Confirm delete operation
async function confirmDelete() {
  if (!pendingDelete) return;

  const { email, name } = pendingDelete;

  // Check if "don't show again" is checked
  const checkbox = document.getElementById("dont-show-again-checkbox");
  if (checkbox.checked) {
    skipConfirmation = true;
    console.log("Confirmation disabled for this session");
  }

  // Hide dialog
  document.getElementById("confirm-dialog").classList.add("hidden");

  // Disable all delete buttons
  const deleteButtons = document.querySelectorAll(".action-btn");
  deleteButtons.forEach((btn) => (btn.disabled = true));

  updateStatsText(`Deleting emails from ${name}...`);

  try {
    const response = await browser.runtime.sendMessage({
      action: "deleteAllEmailsFromSender",
      email: email,
    });

    if (response.success) {
      // Refresh the statistics
      await resetStats();
      updateStatsText(`Deleted ${response.deletedCount} emails from ${name}`);
    } else {
      showError(
        "Failed to delete emails: " + (response.error || "Unknown error")
      );
      updateStatsText("Error deleting emails");
    }
  } catch (error) {
    console.error("Error deleting emails:", error);
    showError("Failed to delete emails: " + error.message);
    updateStatsText("Error deleting emails");
  } finally {
    // Re-enable delete buttons
    deleteButtons.forEach((btn) => (btn.disabled = false));
    pendingDelete = null;
  }
}

// Update stats text
function updateStatsText(text) {
  const statsTextElement = document.getElementById("stats-text");
  let displayText = text;

  if (lastUpdateTime) {
    const timeString = lastUpdateTime.toLocaleTimeString("en-GB", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    displayText += ` • Last updated: ${timeString}`;
  }

  statsTextElement.textContent = displayText;
}

// Disable/enable refresh button
function disableRefreshButton(disabled) {
  document.getElementById("refresh-btn").disabled = disabled;
}

// Show error message
function showError(message) {
  // Simple error display - could be enhanced with a toast notification
  alert("Error: " + message);
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Toggle accordion for email previews
async function toggleAccordion(email) {
  console.log("toggleAccordion called with email:", email);

  // Close currently open accordion if different
  if (openAccordion && openAccordion !== email) {
    closeAccordion(openAccordion);
  }

  // If clicking the same accordion, close it
  if (openAccordion === email) {
    closeAccordion(email);
    return;
  }

  // Open the new accordion
  openAccordion = email;
  const accordionRow = document.querySelector(
    `tr.accordion-row[data-email="${escapeHtml(email)}"]`
  );
  const accordionContent = accordionRow.querySelector(".accordion-content");

  if (accordionRow && accordionContent) {
    accordionRow.style.display = "table-row";

    // Load email previews
    try {
      accordionContent.innerHTML =
        '<div class="loading">Loading email previews...</div>';

      const response = await browser.runtime.sendMessage({
        action: "getEmailPreviews",
        email: email,
        limit: 10,
      });

      if (response.success) {
        renderEmailPreviews(accordionContent, response.previews);
      } else {
        accordionContent.innerHTML =
          '<div class="loading">Error loading previews</div>';
      }
    } catch (error) {
      console.error("Error loading email previews:", error);
      accordionContent.innerHTML =
        '<div class="loading">Error loading previews</div>';
    }
  }
}

// Close accordion
function closeAccordion(email) {
  const accordionRow = document.querySelector(
    `tr.accordion-row[data-email="${escapeHtml(email)}"]`
  );
  if (accordionRow) {
    accordionRow.style.display = "none";
  }
  openAccordion = null;
}

// Render email previews
function renderEmailPreviews(container, previews) {
  console.log("renderEmailPreviews called with:", previews);

  if (previews.length === 0) {
    container.innerHTML = '<div class="loading">No emails found</div>';
    return;
  }

  const html = previews
    .map(
      (preview) => `
    <div class="email-preview">
      <div class="email-subject">${escapeHtml(preview.subject)}</div>
      <div class="email-preview-text">${escapeHtml(preview.previewText)}</div>
      <div class="email-date">${new Date(preview.date).toLocaleString()}</div>
    </div>
  `
    )
    .join("");

  console.log("Generated HTML:", html);
  container.innerHTML = html;
}

// Handle messages from background script
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "updateStats") {
    refreshStats();
  }
});
