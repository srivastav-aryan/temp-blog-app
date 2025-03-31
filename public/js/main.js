// Helper function for displaying alert messages
function showAlert(message, type = "success") {
   const alertContainer = document.createElement("div");
   alertContainer.className = `alert alert-${type} alert-dismissible fade show`;
   alertContainer.setAttribute("role", "alert");

   alertContainer.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

   // Insert at the top of the content container
   document.querySelector(".container").prepend(alertContainer);

   // Auto dismiss after 5 seconds
   setTimeout(() => {
      if (typeof bootstrap !== "undefined") {
         const alert = new bootstrap.Alert(alertContainer);
         alert.close();
      } else {
         alertContainer.remove();
      }
   }, 5000);
}

// Initialize Bootstrap tooltips
document.addEventListener("DOMContentLoaded", function () {
   // Initialize all tooltips if Bootstrap is available
   if (typeof bootstrap !== "undefined") {
      const tooltipTriggerList = document.querySelectorAll(
         '[data-bs-toggle="tooltip"]'
      );
      const tooltipList = [...tooltipTriggerList].map(
         (tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl)
      );
   }

   // Add confirm prompts to any element with data-confirm attribute
   document.querySelectorAll("[data-confirm]").forEach((element) => {
      element.addEventListener("click", function (e) {
         if (!confirm(this.dataset.confirm)) {
            e.preventDefault();
            return false;
         }
      });
   });
});
