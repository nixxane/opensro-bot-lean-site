// Apply a saved theme before the page paints. Storage may be unavailable.
(() => {
  const key = 'opensro-lean-site-theme';
  const system = matchMedia('(prefers-color-scheme: dark)');
  let choice;
  try { choice = localStorage.getItem(key); } catch {}
  if (choice !== 'dark' && choice !== 'light') choice = null;
  const apply = () => {
    const dark = choice ? choice === 'dark' : system.matches;
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    const button = document.getElementById('theme-toggle');
    if (button) button.textContent = dark ? 'Light mode' : 'Dark mode';
  };
  apply();
  system.addEventListener('change', apply);
  document.addEventListener('DOMContentLoaded', () => {
    const button = document.getElementById('theme-toggle');
    button.hidden = false;
    button.addEventListener('click', () => {
      choice = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem(key, choice); } catch {}
      apply();
    });
    apply();
  });
})();

// Read the release label from the bot repository; installation always uses its canonical URL.
document.addEventListener('DOMContentLoaded', async () => {
  const label = document.getElementById('release');
  try {
    const response = await fetch('https://raw.githubusercontent.com/nixxane/opensro-bot-lean/main/bot.lean.meta.js', { signal: AbortSignal.timeout(5000) });
    if (!response.ok) return;
    const version = (await response.text()).match(/^\/\/\s*@version\s+(\d+\.\d+\.\d+)\s*$/m)?.[1];
    if (version) label.textContent = `Current version ${version}`;
  } catch {
    // Keep the working GitHub link when offline or when metadata cannot be read.
  }
});
