// ════════════════════════════════════════════════════════
// WELCOME SCREEN
// ════════════════════════════════════════════════════════
let _welcomeBuddyCleanup = null;

function initWelcome() {
  // Cleanup previous
  if (_welcomeBuddyCleanup) { _welcomeBuddyCleanup(); _welcomeBuddyCleanup = null; }

  const container = document.getElementById('hero-buddy-3d');
  if (!container) return;
  container.innerHTML = '';

  // Will use createBuddy3D() once Task 5 is complete
  // For now, show a static placeholder or leave empty
  if (typeof createBuddy3D === 'function') {
    const buddy = createBuddy3D(container, {
      color: '#E8634A', mood: 'happy', accessories: [], size: 1
    });
    if (buddy) _welcomeBuddyCleanup = buddy.cleanup;
  }
}
