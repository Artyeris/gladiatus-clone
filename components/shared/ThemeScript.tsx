// Sets the active UI theme on <html> before React hydrates so the
// page doesn't flash the default skin while the client JS warms up.
// Themes: 'default' | 'dark' | 'light'. Persisted in localStorage.
const ThemeScript = () => {
  const code = `
(function(){
  try {
    var t = localStorage.getItem('gladiatus.theme') || 'default';
    if (t === 'dark' || t === 'light') document.documentElement.setAttribute('data-theme', t);
    else document.documentElement.removeAttribute('data-theme');
  } catch (e) {}
})();
  `.trim();
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
};

export default ThemeScript;
