var Webflow = Webflow || [];
Webflow.push(function () {

  // Helper to simulate Webflow dropdown click
  function triggerDropdown(toggle) {
    if (!toggle) return;
    toggle.dispatchEvent(new Event('mousedown'));
    toggle.dispatchEvent(new Event('mouseup'));
    $(toggle).trigger('tap');
  }

  // Track user interaction and remember last opened dropdown in each section
  document.addEventListener('click', (e) => {
    const toggle = e.target.closest('[fc-dropdown-toggle]');
    if (!toggle) return;

    const section = toggle.closest('[fc-section]');
    if (!section) return;

    const sectionId = section.getAttribute('fc-section');
    const toggleId = toggle.getAttribute('fc-dropdown-toggle');
    if (!sectionId || !toggleId) return;

    sessionStorage.setItem(`fc-section-${sectionId}`, toggleId);
  });

  // Observe all sections
  const sections = document.querySelectorAll('[fc-section]');
  if (!sections.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const section = entry.target;
      const sectionId = section.getAttribute('fc-section');
      if (!sectionId) return;

      // Check if user already interacted in this section
      const savedToggleId = sessionStorage.getItem(`fc-section-${sectionId}`);

      // If no interaction yet → open default dropdown
      if (!savedToggleId) {
        const defaultToggle = section.querySelector('[fc-dropdown="default"] .w-dropdown-toggle');
        if (defaultToggle && !defaultToggle.classList.contains('w--open')) {
          setTimeout(() => triggerDropdown(defaultToggle), 150);
        }
        return;
      }

      // If user interacted before → reopen that dropdown
      const savedToggle = section.querySelector(`[fc-dropdown-toggle="${savedToggleId}"]`);
      if (savedToggle && !savedToggle.classList.contains('w--open')) {
        setTimeout(() => triggerDropdown(savedToggle), 150);
      }
    });
  }, { threshold: 0.25 });

  sections.forEach(section => observer.observe(section));
});
