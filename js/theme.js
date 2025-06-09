document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const rootElement = document.documentElement; // ใช้ <html> element

    // Function to apply the theme
    const applyTheme = (theme) => {
        if (theme === 'dark') {
            rootElement.setAttribute('data-theme', 'dark');
            themeToggle.checked = true;
        } else {
            rootElement.removeAttribute('data-theme');
            themeToggle.checked = false;
        }
    };

    // Check for saved theme in localStorage and apply it on page load
    const savedTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    applyTheme(savedTheme);

    // Event listener for the theme toggle switch
    themeToggle.addEventListener('change', () => {
        if (themeToggle.checked) {
            applyTheme('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            applyTheme('light');
            localStorage.setItem('theme', 'light');
        }
    });
});