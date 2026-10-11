// Read the release label from the bot repository; installation always uses its canonical URL.
(async () => {
  const label = document.getElementById('release');
  try {
    const response = await fetch('https://raw.githubusercontent.com/nixxane/opensro-bot-lean/main/bot.lean.meta.js', { signal: AbortSignal.timeout(5000) });
    if (!response.ok) return;
    const version = (await response.text()).match(/^\/\/\s*@version\s+(\d+\.\d+\.\d+)\s*$/m)?.[1];
    if (version) label.textContent = `Current version ${version}`;
  } catch {
    // Keep the working GitHub link when offline or when metadata cannot be read.
  }
})();
