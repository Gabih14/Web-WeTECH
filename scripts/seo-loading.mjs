// Inline critical styles prevent the initial HTML from flashing before the
// application's stylesheet and React are ready. No user-agent-specific output.
export const loadingHead = `
<style>
  #wetech-initial-loader{display:none}
  html.wetech-booting #wetech-initial-content{display:none}
  html.wetech-booting #wetech-initial-loader{display:flex;min-height:100vh;align-items:center;justify-content:center;flex-direction:column;gap:18px;background:#f3f4f6;color:#374151;font:14px system-ui,sans-serif}
  #wetech-initial-loader .initial-spinner{width:36px;height:36px;border:4px solid #e5e7eb;border-top-color:#ca8a04;border-radius:50%;animation:wetech-initial-spin .8s linear infinite}
  @keyframes wetech-initial-spin{to{transform:rotate(360deg)}}
  @media(prefers-reduced-motion:reduce){#wetech-initial-loader .initial-spinner{animation:none}}
  #wetech-initial-content{max-width:1152px;margin:0 auto;padding:24px;font:16px/1.6 system-ui,sans-serif;color:#1f2937;overflow-wrap:anywhere}
  #wetech-initial-content nav{padding:16px;background:#facc15;border-radius:8px}
  #wetech-initial-content a{color:inherit;text-decoration:underline}
  #wetech-initial-content h1{font-size:32px;font-weight:700;margin:24px 0 16px}
  #wetech-initial-content h2{font-size:22px;font-weight:600;margin:24px 0 12px}
  #wetech-initial-content p,#wetech-initial-content li{margin:12px 0}
  #wetech-initial-content img{max-width:100%;height:auto}
  #wetech-initial-content dt{font-weight:600}
</style>
<script>
  document.documentElement.classList.add('wetech-booting');
  window.setTimeout(function () {
    document.documentElement.classList.remove('wetech-booting');
  }, 3000);
</script>`;

export const loadingMarkup = `<div id="wetech-initial-loader" role="status" aria-live="polite">
  <span class="initial-spinner" aria-hidden="true"></span>
  <span>Cargando WeTECH…</span>
</div>`;
