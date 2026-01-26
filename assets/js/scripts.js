/*
File: assets/js/scripts.js
Purpose: Legacy include/loader used in the original static version (kept for reference; not required by Jekyll layout).
Related files:
  - _layouts/default.html
  - _includes/*.html
Safe edits:
  - OK: You may delete after confirming nothing references it
  - Careful: If any page still loads it directly, removal will break that page
Notes:
  - Current Jekyll version uses _includes and _layouts instead of runtime HTML loaders.
*/

﻿document.addEventListener("DOMContentLoaded", function() {
    const menuToggle = document.querySelector(".menu-toggle");
    const navLinks = document.querySelector(".nav-links");

    menuToggle.addEventListener("click", function() {
        navLinks.classList.toggle("active");
        const isExpanded = navLinks.classList.contains("active");
        menuToggle.setAttribute("aria-expanded", isExpanded);
    });
});