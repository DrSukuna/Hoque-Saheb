AI on GitHub Pages (3 steps)
1. Upload index.html to your GitHub repo and turn on GitHub Pages. Your site opens at https://YOURNAME.github.io/REPO/
2. Make a free Cloudflare account, create a Worker, paste worker.js into it, then in Settings > Variables add:
   ANTHROPIC_API_KEY (as a Secret, from console.anthropic.com)
   ALLOWED_ORIGIN = https://YOURNAME.github.io   (no trailing slash, no repo name)
3. Copy the Worker URL and paste it in index.html: window.SAHEB_AI_ENDPOINT='https://your-worker.workers.dev';
Until step 3 is done, the assistant still works in basic mode (answers about Saheb from built-in facts).
Never put the API key inside index.html: anyone could copy it from the page.
