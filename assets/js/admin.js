/**
 * ஸ்ரீ ஐஸ்வர்யம் யோகா கலையகம் - மேம்பட்ட நிர்வாக பலகை
 * Aiswaryam Yoga Kalaiyagam - Enhanced Admin Controller
 * Features: Secure SHA-256 Hashed Auth, Cloud DB Sync, JSON Backup/Restore
 */

let adminAuthenticated = false;
let adminAccessToken = '';

function getSupabaseAuthConfig() {
  const config = window.YOGA_SUPABASE_CONFIG || {};
  return {
    url: String(config.url || '').replace(/\/+$/, ''),
    anonKey: String(config.anonKey || '')
  };
}

function requireAdminSession() {
  if (adminAuthenticated && adminAccessToken) return true;
  alert('பாதுகாப்பான நிர்வாக உள்நுழைவு தேவை. தயவுசெய்து மீண்டும் உள்நுழைக.');
  return false;
}

// Encode untrusted values before inserting them into HTML templates.
function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);
}

function safeImageUrl(value) {
  const raw = String(value ?? '').trim();
  if (!raw) return 'assets/images/banner.jpg';
  try {
    const parsed = new URL(raw, window.location.href);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return 'assets/images/banner.jpg';
    }
    const hasExplicitScheme = /^[a-z][a-z\d+.-]*:/i.test(raw);
    if (hasExplicitScheme && parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return 'assets/images/banner.jpg';
    }
    return raw;
  } catch {
    return 'assets/images/banner.jpg';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initSecureAdminAuth();
  initAdminDashboard();
});

// SHA-256 Hashing Helper using Web Crypto API
async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// 1. Server-verified authentication via Supabase Auth.
// Browser storage alone is never treated as proof of an admin session.
async function initSecureAdminAuth() {
  const loginForm = document.getElementById('adminLoginForm');
  const authSection = document.getElementById('adminAuthSection');
  const dashSection = document.getElementById('adminDashboardSection');
  const logoutBtn = document.getElementById('adminLogoutBtn');
  const notice = document.getElementById('adminAuthNotice');
  const config = getSupabaseAuthConfig();
  const tokenKey = 'aiswaryam_admin_access_token';

  const setNotice = (message, isError = false) => {
    if (!notice) return;
    notice.textContent = message;
    notice.style.background = isError ? '#FEE2E2' : '#FEF3C7';
    notice.style.color = isError ? '#991B1B' : '#92400E';
  };

  const showDashboard = (allowed) => {
    adminAuthenticated = Boolean(allowed);
    if (authSection) authSection.style.display = allowed ? 'none' : 'flex';
    if (dashSection) dashSection.style.display = allowed ? 'block' : 'none';
    if (allowed) renderAdminAll();
  };

  const verifyAdminToken = async (token) => {
    if (!config.url || !config.anonKey || !token) return false;
    const response = await fetch(`${config.url}/auth/v1/user`, {
      headers: { apikey: config.anonKey, Authorization: `Bearer ${token}` }
    });
    if (!response.ok) return false;
    const user = await response.json();
    return user && user.app_metadata && user.app_metadata.role === 'admin';
  };

  const existingToken = sessionStorage.getItem(tokenKey);
  if (existingToken && config.url && config.anonKey) {
    try {
      const verified = await verifyAdminToken(existingToken);
      if (verified) {
        adminAccessToken = existingToken;
        showDashboard(true);
      } else {
        sessionStorage.removeItem(tokenKey);
        setNotice('உங்கள் session காலாவதியானது அல்லது admin அனுமதி இல்லை. மீண்டும் உள்நுழைக.', true);
        showDashboard(false);
      }
    } catch (error) {
      setNotice('Authentication சேவையை அணுக முடியவில்லை. இணைய இணைப்பு மற்றும் Supabase அமைப்பைச் சரிபார்க்கவும்.', true);
      showDashboard(false);
    }
  } else {
    showDashboard(false);
    if (!config.url || !config.anonKey) {
      setNotice('உள்நுழைவு இயக்க Supabase URL மற்றும் anon/publishable key-ஐ assets/js/supabase-config.js-ல் அமைக்கவும்.');
      if (loginForm) loginForm.querySelector('button[type="submit"]').disabled = true;
    }
  }

  if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!config.url || !config.anonKey) {
        setNotice('Supabase configuration இல்லை. பாதுகாப்பிற்காக உள்நுழைவு முடக்கப்பட்டுள்ளது.', true);
        return;
      }
      const user = document.getElementById('adminUser').value.trim();
      const pass = document.getElementById('adminPass').value;
      const button = loginForm.querySelector('button[type="submit"]');
      if (button) button.disabled = true;
      try {
        const response = await fetch(`${config.url}/auth/v1/token?grant_type=password`, {
          method: 'POST',
          headers: { apikey: config.anonKey, 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user, password: pass })
        });
        const data = await response.json();
        if (!response.ok || !data.access_token) {
          throw new Error('Login விவரங்கள் சரிபார்க்கப்படவில்லை.');
        }
        const allowed = await verifyAdminToken(data.access_token);
        if (!allowed) {
          await fetch(`${config.url}/auth/v1/logout`, {
            method: 'POST',
            headers: { apikey: config.anonKey, Authorization: `Bearer ${data.access_token}` }
          }).catch(() => {});
          throw new Error('இந்தக் கணக்கிற்கு நிர்வாக அனுமதி இல்லை.');
        }
        adminAccessToken = data.access_token;
        sessionStorage.setItem(tokenKey, adminAccessToken);
        showDashboard(true);
        if (window.AiswaryamYoga) window.AiswaryamYoga.showToast('நிர்வாகியாக உள்நுழைந்துள்ளீர்கள்.');
      } catch (error) {
        adminAccessToken = '';
        adminAuthenticated = false;
        setNotice(error.message || 'உள்நுழைவு தோல்வியடைந்தது.', true);
        showDashboard(false);
      } finally {
        if (button && config.url && config.anonKey) button.disabled = false;
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      const token = adminAccessToken;
      adminAuthenticated = false;
      adminAccessToken = '';
      sessionStorage.removeItem(tokenKey);
      if (token && config.url && config.anonKey) {
        await fetch(`${config.url}/auth/v1/logout`, {
          method: 'POST',
          headers: { apikey: config.anonKey, Authorization: `Bearer ${token}` }
        }).catch(() => {});
      }
      window.location.reload();
    });
  }
}

// 2. Admin Dashboard Core Controller
function initAdminDashboard() {
  renderAdminAll();

  // Tab switching
  const tabBtns = document.querySelectorAll('.sidebar-menu-btn[data-target]');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const target = btn.getAttribute('data-target');

      document.querySelectorAll('.admin-tab-pane').forEach(pane => {
        pane.style.display = pane.id === target ? 'block' : 'none';
      });
    });
  });

  // Add Event Form (Connected to CloudDB)
  const addEventForm = document.getElementById('addEventForm');
  if (addEventForm) {
    addEventForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!requireAdminSession()) return;
      const titleTa = document.getElementById('eventTitleTa').value;
      const titleEn = document.getElementById('eventTitleEn').value || titleTa;
      const titleSi = document.getElementById('eventTitleSi').value || titleTa;
      const date = document.getElementById('eventDate').value;
      const time = document.getElementById('eventTime').value;
      const location = document.getElementById('eventLocation').value;
      const category = document.getElementById('eventCategory').value;
      const desc = document.getElementById('eventDesc').value;
      let img = document.getElementById('eventImgUrl').value || 'assets/images/banner.jpg';

      const newEvent = {
        id: Date.now(),
        titleTa,
        titleEn,
        titleSi,
        date,
        time,
        location,
        category,
        img,
        desc
      };

      try {
        if (!window.cloudDB || !window.cloudDB.isCloudConfigured()) throw new Error('Supabase configuration is required.');
        await window.cloudDB.saveEvent(newEvent);
        addEventForm.reset();
        await renderEventsTable();
        updateStats();
        if (window.AiswaryamYoga) window.AiswaryamYoga.showToast('புதிய நிகழ்வு சேமிக்கப்பட்டது.');
      } catch (error) {
        alert('நிகழ்வைச் சேமிக்க முடியவில்லை. Supabase configuration மற்றும் admin RLS அனுமதியைச் சரிபார்க்கவும்.');
        console.error('[Admin] Event save failed:', error);
      }
    });
  }

  // Add Gallery Photo Form
  const addPhotoForm = document.getElementById('addPhotoForm');
  if (addPhotoForm) {
    addPhotoForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!requireAdminSession()) return;
      const title = document.getElementById('photoTitle').value;
      const meta = document.getElementById('photoMeta').value;
      const category = document.getElementById('photoCategory').value;
      let img = document.getElementById('photoUrl').value || 'assets/images/banner.jpg';

      const newPhoto = {
        id: Date.now(),
        title,
        meta,
        category,
        img
      };

      try {
        if (!window.cloudDB || !window.cloudDB.isCloudConfigured()) throw new Error('Supabase configuration is required.');
        await window.cloudDB.saveGalleryItem(newPhoto);
        addPhotoForm.reset();
        await renderGalleryTable();
        updateStats();
        if (window.AiswaryamYoga) window.AiswaryamYoga.showToast('புதிய புகைப்படம் சேர்க்கப்பட்டது.');
      } catch (error) {
        alert('புகைப்படத்தைச் சேமிக்க முடியவில்லை. Supabase configuration மற்றும் admin RLS அனுமதியைச் சரிபார்க்கவும்.');
        console.error('[Admin] Gallery save failed:', error);
      }
    });
  }

  // Top Notice Form
  const noticeForm = document.getElementById('adminNoticeForm');
  if (noticeForm) {
    const input = document.getElementById('adminNoticeInput');
    input.value = localStorage.getItem('aiswaryam_top_notice') || '🌸 யோகா கலையகம்: புதிய பயிற்சி தொகுதி மாணவர் சேர்க்கை ஆரம்பமாகியுள்ளது!';
    noticeForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!requireAdminSession()) return;
      try {
        if (!window.cloudDB || !window.cloudDB.isCloudConfigured()) throw new Error('Supabase configuration is required.');
        await window.cloudDB.saveNotice(input.value);
        localStorage.setItem('aiswaryam_top_notice', input.value);
        if (window.AiswaryamYoga) window.AiswaryamYoga.showToast('மேல் அறிவிப்பு புதுப்பிக்கப்பட்டது.');
      } catch (error) {
        alert('அறிவிப்பைச் சேமிக்க முடியவில்லை. Supabase configuration மற்றும் admin RLS அனுமதியைச் சரிபார்க்கவும்.');
        console.error('[Admin] Notice save failed:', error);
      }
    });
  }

  // Passwords are managed by Supabase Auth; never store password hashes in browser storage.
  const changePassForm = document.getElementById('adminChangePassForm');
  if (changePassForm) {
    changePassForm.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!requireAdminSession()) return;
      alert('கடவுச்சொல்லை பாதுகாப்பாக மாற்ற Supabase Authentication dashboard-ஐ பயன்படுத்தவும்.');
      changePassForm.reset();
    });
  }

  // Cloud DB Settings Form (Supabase / REST)
  const cloudForm = document.getElementById('cloudConfigForm');
  if (cloudForm && window.cloudDB) {
    const cfg = window.cloudDB.config;
    document.getElementById('cloudProvider').value = cfg.provider || 'local';
    document.getElementById('supabaseUrl').value = cfg.supabaseUrl || '';
    document.getElementById('supabaseKey').value = cfg.supabaseKey || '';
    document.getElementById('enableSync').checked = !!cfg.syncEnabled;

    cloudForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!requireAdminSession()) return;
      const provider = document.getElementById('cloudProvider').value;
      const supabaseUrl = document.getElementById('supabaseUrl').value.trim();
      const supabaseKey = document.getElementById('supabaseKey').value.trim();
      const syncEnabled = document.getElementById('enableSync').checked;

      window.cloudDB.saveConfig({ provider, supabaseUrl, supabaseKey, syncEnabled });
      if (window.AiswaryamYoga) window.AiswaryamYoga.showToast('கிளவுட் தரவு அமைப்புகள் சேமிக்கப்பட்டன. Supabase Auth key தனியாக assets/js/supabase-config.js-ல் அமைக்கப்பட வேண்டும்.');
    });
  }

  // Full Database Backup & Restore buttons
  const exportBtn = document.getElementById('exportDbBtn');
  if (exportBtn && window.cloudDB) {
    exportBtn.addEventListener('click', async () => {
      if (!requireAdminSession()) return;
      try {
        await window.cloudDB.exportFullBackup();
        if (window.AiswaryamYoga) window.AiswaryamYoga.showToast('காப்புப் பிரதி பதிவிறக்கப்பட்டது.');
      } catch (error) {
        alert('காப்புப் பிரதி உருவாக்க முடியவில்லை. Supabase அனுமதிகள் மற்றும் இணைப்பைச் சரிபார்க்கவும்.');
        console.error('[Admin] Backup export failed:', error);
      }
    });
  }

  const importFile = document.getElementById('importDbFile');
  if (importFile && window.cloudDB) {
    importFile.addEventListener('change', (e) => {
      if (!requireAdminSession()) { e.target.value = ''; return; }
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (event) => {
        const success = await window.cloudDB.importFullBackup(event.target.result);
        if (success) {
          alert('காப்புப் பிரதி merge செய்யப்பட்டது. ஏற்கனவே உள்ள பதிவுகள் நீக்கப்படவில்லை.');
          window.location.reload();
        } else {
          alert('காப்புப் பிரதி இறக்குமதி செய்ய முடியவில்லை. கோப்பு வடிவம் மற்றும் Supabase அனுமதிகளைச் சரிபார்க்கவும்.');
        }
      };
      reader.readAsText(file);
    });
  }

  // Export Bookings to CSV
  const exportBookingsBtn = document.getElementById('exportBookingsBtn');
  if (exportBookingsBtn) {
    exportBookingsBtn.addEventListener('click', () => {
      if (!requireAdminSession()) return;
      exportBookingsCSV();
    });
  }
}

async function renderAdminAll() {
  await updateStats();
  await renderEventsTable();
  await renderGalleryTable();
  await renderRegistrationsTable();
  await renderBookingsTable();
}

async function updateStats() {
  let events = JSON.parse(localStorage.getItem('aiswaryam_events') || '[]');
  let gallery = JSON.parse(localStorage.getItem('aiswaryam_gallery') || '[]');
  let members = JSON.parse(localStorage.getItem('aiswaryam_memberships') || '[]');
  let bookings = JSON.parse(localStorage.getItem('aiswaryam_bookings') || '[]');

  if (adminAuthenticated && window.cloudDB && window.cloudDB.isCloudConfigured()) {
    try {
      const [cloudEvents, cloudGallery, cloudMembers, cloudBookings] = await Promise.all([
        window.cloudDB.fetchEvents(),
        window.cloudDB.fetchGallery(),
        window.cloudDB.fetchAdminRecords('memberships'),
        window.cloudDB.fetchAdminRecords('bookings')
      ]);
      events = cloudEvents;
      gallery = cloudGallery;
      members = cloudMembers;
      bookings = cloudBookings;
    } catch (error) {
      console.error('[Admin] Statistics sync failed:', error);
    }
  }

  const elEvents = document.getElementById('statTotalEvents');
  const elGallery = document.getElementById('statTotalGallery');
  const elMembers = document.getElementById('statTotalMembers');
  const elBookings = document.getElementById('statTotalBookings');

  if (elEvents) elEvents.textContent = events.length;
  if (elGallery) elGallery.textContent = gallery.length;
  if (elMembers) elMembers.textContent = members.length;
  if (elBookings) elBookings.textContent = bookings.length;
}

async function renderEventsTable() {
  const container = document.getElementById('adminEventsList');
  if (!container) return;
  const events = window.cloudDB ? await window.cloudDB.fetchEvents() : [];

  if (events.length === 0) {
    container.innerHTML = '<tr><td colspan="5" style="color:#6B7280; text-align:center; padding: 2rem;">🗓️ தற்போது எந்த நிகழ்வுகளும் இல்லை. புதிய நிகழ்வைச் சேர்க்க மேலே உள்ள படிவத்தைப் பயன்படுத்தவும்.</td></tr>';
    return;
  }

  container.innerHTML = events.map(ev => {
    const id = Number.isFinite(Number(ev.id)) ? Number(ev.id) : 0;
    return `
    <tr>
      <td><strong>${escapeHtml(ev.titleTa)}</strong><br><small style="color:#6B7280;">${escapeHtml(ev.titleEn || '')}</small></td>
      <td>${escapeHtml(ev.date)} (${escapeHtml(ev.time || '')})</td>
      <td>${escapeHtml(ev.location)}</td>
      <td><span style="background: #F8EFEA; padding:2px 8px; border-radius:12px; font-size:0.75rem;">${escapeHtml(ev.category)}</span></td>
      <td>
        <button onclick="deleteEvent(${id})" style="background:#FEE2E2; border:1px solid #FCA5A5; color:#DC2626; padding:4px 8px; border-radius:4px; cursor:pointer;">நீக்குக</button>
      </td>
    </tr>
  `;
  }).join('');
}

window.deleteEvent = async function(id) {
  if (!requireAdminSession()) return;
  if (!confirm('இந்த நிகழ்வை நிச்சயமாக நீக்க விரும்புகிறீர்களா?')) return;
  try {
    if (!window.cloudDB || !window.cloudDB.isCloudConfigured()) throw new Error('Supabase configuration is required.');
    await window.cloudDB.deleteEvent(id);
    await renderEventsTable();
    updateStats();
    if (window.AiswaryamYoga) window.AiswaryamYoga.showToast('நிகழ்வு நீக்கப்பட்டது.');
  } catch (error) {
    alert('நிகழ்வை நீக்க முடியவில்லை. Supabase configuration மற்றும் admin RLS அனுமதியைச் சரிபார்க்கவும்.');
    console.error('[Admin] Event delete failed:', error);
  }
};

async function renderGalleryTable() {
  const container = document.getElementById('adminGalleryList');
  if (!container) return;
  const gallery = window.cloudDB ? await window.cloudDB.fetchGallery() : [];

  container.innerHTML = gallery.map(item => {
    const id = Number.isFinite(Number(item.id)) ? Number(item.id) : 0;
    return `
    <tr>
      <td><img src="${escapeHtml(safeImageUrl(item.img))}" alt="" loading="lazy" style="width:50px; height:35px; object-fit:cover; border-radius:4px;"></td>
      <td><strong>${escapeHtml(item.title)}</strong></td>
      <td>${escapeHtml(item.meta)}</td>
      <td>${escapeHtml(item.category)}</td>
      <td>
        <button onclick="deleteGalleryItem(${id})" style="background:#FEE2E2; border:1px solid #FCA5A5; color:#DC2626; padding:4px 8px; border-radius:4px; cursor:pointer;">நீக்குக</button>
      </td>
    </tr>
  `;
  }).join('');
}

window.deleteGalleryItem = async function(id) {
  if (!requireAdminSession()) return;
  if (!confirm('இந்த புகைப்படத்தை நீக்கவா?')) return;
  try {
    if (!window.cloudDB || !window.cloudDB.isCloudConfigured()) throw new Error('Supabase configuration is required.');
    await window.cloudDB.deleteGalleryItem(id);
    await renderGalleryTable();
    updateStats();
    if (window.AiswaryamYoga) window.AiswaryamYoga.showToast('புகைப்படம் நீக்கப்பட்டது.');
  } catch (error) {
    alert('புகைப்படத்தை நீக்க முடியவில்லை. Supabase configuration மற்றும் admin RLS அனுமதியைச் சரிபார்க்கவும்.');
    console.error('[Admin] Gallery delete failed:', error);
  }
};

async function renderRegistrationsTable() {
  const container = document.getElementById('adminRegistrationsList');
  if (!container) return;
  let list = [];
  try {
    if (window.cloudDB && window.cloudDB.isCloudConfigured() && adminAuthenticated) {
      list = await window.cloudDB.fetchAdminRecords('memberships');
    } else {
      list = JSON.parse(localStorage.getItem('aiswaryam_memberships') || '[]');
    }
  } catch (error) {
    container.innerHTML = '<tr><td colspan="6" role="alert" style="text-align:center;color:#991B1B;">சேர்க்கை பதிவுகளை ஏற்ற முடியவில்லை. Cloud/RLS அமைப்பைச் சரிபார்க்கவும்.</td></tr>';
    console.error('[Admin] Membership records unavailable:', error);
    return;
  }

  if (!list.length) {
    container.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#9CA3AF;">பதிவுகள் எதுவும் இல்லை</td></tr>';
    return;
  }

  container.innerHTML = list.map(item => {
    const regId = item.reg_id || item.regId || '';
    const phone = item.phone || '';
    const name = item.full_name || item.fullName || '';
    const plan = item.selected_plan || item.selectedPlan || '';
    const batch = item.batch || '';
    const status = item.status || 'pending';
    const safePhone = phone.replace(/[^0-9]/g, '');
    return `
    <tr>
      <td><strong>${escapeHtml(regId)}</strong></td>
      <td>${escapeHtml(name)}</td>
      <td><a href="https://wa.me/94${escapeHtml(safePhone.replace(/^0/, ''))}" target="_blank" rel="noopener noreferrer" style="color:#059669;font-weight:700;">📱 ${escapeHtml(phone)}</a></td>
      <td>${escapeHtml(plan)}</td>
      <td>${escapeHtml(batch)}</td>
      <td><span style="font-size:0.8rem;color:#4B5563;">${escapeHtml(status)}</span></td>
    </tr>`;
  }).join('');
}

async function renderBookingsTable() {
  const container = document.getElementById('adminBookingsList');
  if (!container) return;
  let list = [];
  try {
    if (window.cloudDB && window.cloudDB.isCloudConfigured() && adminAuthenticated) {
      list = await window.cloudDB.fetchAdminRecords('bookings');
    } else {
      list = JSON.parse(localStorage.getItem('aiswaryam_bookings') || '[]');
    }
  } catch (error) {
    container.innerHTML = '<tr><td colspan="6" role="alert" style="text-align:center;color:#991B1B;">முன்பதிவுகளை ஏற்ற முடியவில்லை. Cloud/RLS அமைப்பைச் சரிபார்க்கவும்.</td></tr>';
    console.error('[Admin] Booking records unavailable:', error);
    return;
  }

  if (!list.length) {
    container.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#9CA3AF;">முன்பதிவுகள் எதுவும் இல்லை</td></tr>';
    return;
  }

  container.innerHTML = list.map(item => {
    const id = item.booking_id || item.bookId || '';
    const name = item.full_name || item.name || '';
    const phone = item.phone || '';
    const sessionType = item.session_type || item.sessionType || '';
    const date = item.booking_date || item.date || '';
    const slot = item.slot || '';
    const branch = item.branch || '';
    const safePhone = phone.replace(/[^0-9]/g, '');
    return `
    <tr>
      <td><strong>${escapeHtml(id)}</strong></td>
      <td>${escapeHtml(name)}</td>
      <td><a href="https://wa.me/94${escapeHtml(safePhone.replace(/^0/, ''))}" target="_blank" rel="noopener noreferrer" style="color:#059669;font-weight:700;">📱 ${escapeHtml(phone)}</a></td>
      <td>${escapeHtml(sessionType)}</td>
      <td>${escapeHtml(date)} (${escapeHtml(slot)})</td>
      <td>${escapeHtml(branch)}</td>
    </tr>`;
  }).join('');
}

async function exportBookingsCSV() {
  let bookings = [];
  try {
    if (window.cloudDB && window.cloudDB.isCloudConfigured() && adminAuthenticated) {
      bookings = await window.cloudDB.fetchAdminRecords('bookings');
    } else {
      bookings = JSON.parse(localStorage.getItem('aiswaryam_bookings') || '[]');
    }
  } catch (error) {
    alert('முன்பதிவுகளை ஏற்றுமதி செய்ய முடியவில்லை. Cloud/RLS அமைப்பைச் சரிபார்க்கவும்.');
    console.error('[Admin] Booking export failed:', error);
    return;
  }
  if (!bookings.length) {
    alert('ஏற்றுமதி செய்வதற்கு முன்பதிவுகள் எதுவும் இல்லை.');
    return;
  }

  const csvCell = (value) => {
    let text = String(value ?? '');
    if (/^[=+@-]/.test(text) || text.startsWith('\t') || text.startsWith('\r')) text = "'" + text;
    return '"' + text.replace(/"/g, '""') + '"';
  };
  const rows = [['BookID','Name','Phone','Session','Date','Slot','Branch']];
  bookings.forEach((item) => rows.push([
    item.booking_id || item.bookId,
    item.full_name || item.name,
    item.phone,
    item.session_type || item.sessionType,
    item.booking_date || item.date,
    item.slot,
    item.branch
  ]));
  const csv = rows.map(row => row.map(csvCell).join(',')).join('\r\n');
  const blob = new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const objectUrl = URL.createObjectURL(blob);
  link.href = objectUrl;
  link.download = `YogaStudio_Batticaloa_Bookings_${new Date().toISOString().slice(0,10)}.csv`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}