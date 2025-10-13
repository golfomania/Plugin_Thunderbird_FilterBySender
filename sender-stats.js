// Sender Statistics JavaScript for Filter by sender extension

let senderStats = [];
let currentOffset = 0;
let isLoading = false;
let pendingDelete = null;

// Initialize the page
document.addEventListener("DOMContentLoaded", function () {
  loadSenderStats();

  // Add event listeners for buttons
  document
    .getElementById("refresh-btn")
    .addEventListener("click", refreshStats);
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

// Refresh statistics
async function refreshStats() {
  currentOffset = 0;
  senderStats = [];
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
            <td>
                <button class="action-btn delete-btn" data-email="${escapeHtml(
                  sender.email
                )}" data-name="${escapeHtml(
        sender.name || "Unknown"
      )}" data-count="${
        sender.count
      }" title="Delete all emails from this sender">
                    🗑️ Delete All
                </button>
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

      // Don't trigger if clicking on the delete button
      if (e.target.closest(".action-btn")) {
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

  const confirmText = document.getElementById("confirm-text");
  confirmText.textContent = `Are you sure you want to delete all ${count} emails from "${name}" (${email})? This action cannot be undone.`;

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
      await refreshStats();
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
  document.getElementById("stats-text").textContent = text;
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

// Handle messages from background script
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "updateStats") {
    refreshStats();
  }
});
