/**
 * ஸ்ரீ ஐஸ்வர்யம் யோகா கலையகம் - PWA மேலாண்மை
 * Yoga Studio Batticaloa - PWA Registration & Install Banner
 */

let deferredPrompt = null;

document.addEventListener('DOMContentLoaded', () => {
  initServiceWorker();
  initInstallPrompt();
  initNetworkStatus();
});

// 1. Service Worker Registration
function initServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then((reg) => {
          console.log('[PWA] Service Worker registered with scope:', reg.scope);
          reg.update().catch(() => {});
        })
        .catch((err) => {
          console.warn('[PWA] Service Worker registration failed:', err);
        });
    });

    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });
  }
}

// 2. Mobile / Desktop Install Prompt
function initInstallPrompt() {
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    deferredPrompt = e;

    // Show custom install banner if not dismissed before
    if (!sessionStorage.getItem('pwa_install_dismissed')) {
      showInstallBanner();
    }
  });

  window.addEventListener('appinstalled', () => {
    console.log('[PWA] App successfully installed on device!');
    deferredPrompt = null;
    hideInstallBanner();
    if (window.AiswaryamYoga && window.AiswaryamYoga.showToast) {
      window.AiswaryamYoga.showToast('🎉 யோகா கலையகம் செயலி உங்கள் மொபைலில் நிறுவப்பட்டது!');
    }
  });
}

function showInstallBanner() {
  let banner = document.getElementById('pwaInstallBanner');
  if (!banner) {
    banner = document.createElement('div');
    banner.id = 'pwaInstallBanner';
    banner.className = 'pwa-install-banner';
    banner.innerHTML = `
      <div style="display:flex; align-items:center; gap:0.75rem;">
        <img src="assets/images/icons/icon-192.png" width="40" height="40" style="border-radius:10px; border: 1px solid #E6DFD5;">
        <div>
          <strong style="display:block; font-size:0.88rem; color: #172A22;">யோகா கலையகம் செயலியை நிறுவவும்</strong>
          <small style="color: #234A3B; font-size:0.75rem;">மொபைல் திரையில் உடனே சேர்க்க (Install App)</small>
        </div>
      </div>
      <div style="display:flex; align-items:center; gap:0.5rem;">
        <button id="pwaInstallBtn" class="btn-primary" style="padding:0.4rem 0.95rem; font-size:0.8rem;">நிறுவுக (Install)</button>
        <button id="pwaCloseBtn" style="background:none; border:none; color:#6B7280; font-size:1.1rem; cursor:pointer; padding:0.2rem;">✕</button>
      </div>
    `;
    document.body.appendChild(banner);

    document.getElementById('pwaInstallBtn').addEventListener('click', triggerInstallPrompt);
    document.getElementById('pwaCloseBtn').addEventListener('click', () => {
      sessionStorage.setItem('pwa_install_dismissed', 'true');
      hideInstallBanner();
    });
  }

  setTimeout(() => {
    banner.classList.add('show');
  }, 1200);
}

function hideInstallBanner() {
  const banner = document.getElementById('pwaInstallBanner');
  if (banner) {
    banner.classList.remove('show');
  }
}

function triggerInstallPrompt() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('[PWA] User accepted the install prompt');
      } else {
        console.log('[PWA] User dismissed the install prompt');
      }
      deferredPrompt = null;
      hideInstallBanner();
    });
  }
}

// 3. Offline / Online Network Detection
function initNetworkStatus() {
  window.addEventListener('offline', () => {
    if (window.AiswaryamYoga && window.AiswaryamYoga.showToast) {
      window.AiswaryamYoga.showToast('📶 நீங்கள் ஆஃப்லைனில் உள்ளீர்கள். சேமிக்கப்பட்ட பயிற்சிகள் தொடர்ந்து இயங்கும்.');
    }
  });

  window.addEventListener('online', () => {
    if (window.AiswaryamYoga && window.AiswaryamYoga.showToast) {
      window.AiswaryamYoga.showToast('✅ இணைய இணைப்பு மீண்டும் செயல்படுகிறது.');
    }
  });
}
