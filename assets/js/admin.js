/**
 * ஸ்ரீ ஐஸ்வர்யம் யோகா கலையகம் - மேம்பட்ட நிர்வாக பலகை
 * Aiswaryam Yoga Kalaiyagam - Enhanced Admin Controller
 * Features: Secure SHA-256 Hashed Auth, Cloud DB Sync, JSON Backup/Restore
 */

// Default SHA-256 hash for 'admin123'
const DEFAULT_PASS_HASH = '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9';

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
    const hasExplicitScheme = /^[a-z][a-z\\d+.-]*:/i.test(raw);
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

// 1. Secure Authentication
function initSecureAdminAuth() {
  const loginForm = document.getElementById('adminLoginForm');
  const authSection = document.getElementById('adminAuthSection');
  const dashSection = document.getElementById('adminDashboardSection');
  const logoutBtn = document.getElementById('adminLogoutBtn');

  // Check active session
  const sessionToken = sessionStorage.getItem('aiswaryam_admin_token');
  if (sessionToken && authSection && dashSection) {
    authSection.style.display = 'none';
    dashSection.style.display = 'block';
  }

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const user = document.getElementById('adminUser').value.trim();
      const pass = document.getElementById('adminPass').value.trim();

      const inputHash = await sha256(pass);
      const storedHash = localStorage.getItem('aiswaryam_admin_hash') || DEFAULT_PASS_HASH;

      if (user === 'admin' && inputHash === storedHash) {
        // Generate random session token
        const token = 'TOK_' + Math.random().toString(36).substring(2) + Date.now();
        sessionStorage.setItem('aiswaryam_admin_token', token);
        authSection.style.display = 'none';
        dashSection.style.display = 'block';
        if (window.AiswaryamYoga) window.AiswaryamYoga.showToast('✅ நிர்வாகியாக வெற்றிகரமாக உள்நுழைந்துள்ளீர்கள்');
        renderAdminAll();
      } else {
        alert('தவறான பயனர் பெயர் அல்லது கடவுச்சொல் (Invalid Credentials)! இயல்புநிலை கடவுச்சொல்: admin123');
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      sessionStorage.removeItem('aiswaryam_admin_token');
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

      if (window.cloudDB) {
        await window.cloudDB.saveEvent(newEvent);
      }
      addEventForm.reset();
      await renderEventsTable();
      updateStats();
      if (window.AiswaryamYoga) window.AiswaryamYoga.showToast('✅ புதிய நிகழ்வு கிளவுடில் சேமிக்கப்பட்டது');
    });
  }

  // Add Gallery Photo Form
  const addPhotoForm = document.getElementById('addPhotoForm');
  if (addPhotoForm) {
    addPhotoForm.addEventListener('submit', async (e) => {
      e.preventDefault();
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

      if (window.cloudDB) {
        await window.cloudDB.saveGalleryItem(newPhoto);
      }
      addPhotoForm.reset();
      await renderGalleryTable();
      updateStats();
      if (window.AiswaryamYoga) window.AiswaryamYoga.showToast('✅ புதிய புகைப்படம் சேர்க்கப்பட்டது');
    });
  }

  // Top Notice Form
  const noticeForm = document.getElementById('adminNoticeForm');
  if (noticeForm) {
    const input = document.getElementById('adminNoticeInput');
    input.value = localStorage.getItem('aiswaryam_top_notice') || '🌸 யோகா கலையகம்: புதிய பயிற்சி தொகுதி மாணவர் சேர்க்கை ஆரம்பமாகியுள்ளது!';
    noticeForm.addEventListener('submit', (e) => {
      e.preventDefault();
      localStorage.setItem('aiswaryam_top_notice', input.value);
      if (window.AiswaryamYoga) window.AiswaryamYoga.showToast('✅ மேல் அறிவிப்பு பட்டி புதுப்பிக்கப்பட்டது');
    });
  }

  // Change Password Form
  const changePassForm = document.getElementById('adminChangePassForm');
  if (changePassForm) {
    changePassForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const currPass = document.getElementById('currPass').value.trim();
      const newPass = document.getElementById('newPass').value.trim();
      const confPass = document.getElementById('confPass').value.trim();

      const currHash = await sha256(currPass);
      const storedHash = localStorage.getItem('aiswaryam_admin_hash') || DEFAULT_PASS_HASH;

      if (currHash !== storedHash) {
        alert('தற்போதைய கடவுச்சொல் தவறானது!');
        return;
      }
      if (newPass.length < 6) {
        alert('புதிய கடவுச்சொல் குறைந்தது 6 எழுத்துகள் கொண்டிருக்க வேண்டும்.');
        return;
      }
      if (newPass !== confPass) {
        alert('புதிய கடவுச்சொற்கள் பொருந்தவில்லை!');
        return;
      }

      const newHash = await sha256(newPass);
      localStorage.setItem('aiswaryam_admin_hash', newHash);
      changePassForm.reset();
      alert('கடவுச்சொல் வெற்றிகரமாக மாற்றப்பட்டது! அடுத்த முறை உள்நுழையும் போது புதிய கடவுச்சொல்லைப் பயன்படுத்தவும்.');
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
      const provider = document.getElementById('cloudProvider').value;
      const supabaseUrl = document.getElementById('supabaseUrl').value.trim();
      const supabaseKey = document.getElementById('supabaseKey').value.trim();
      const syncEnabled = document.getElementById('enableSync').checked;

      window.cloudDB.saveConfig({ provider, supabaseUrl, supabaseKey, syncEnabled });
      if (window.AiswaryamYoga) window.AiswaryamYoga.showToast('✅ கிளவுட் அமைப்புகள் சேமிக்கப்பட்டன!');
    });
  }

  // Full Database Backup & Restore buttons
  const exportBtn = document.getElementById('exportDbBtn');
  if (exportBtn && window.cloudDB) {
    exportBtn.addEventListener('click', () => {
      window.cloudDB.exportFullBackup();
      if (window.AiswaryamYoga) window.AiswaryamYoga.showToast('📥 தரவுத்தள காப்புப் பிரதி (JSON Backup) பதிவிறக்கப்பட்டது!');
    });
  }

  const importFile = document.getElementById('importDbFile');
  if (importFile && window.cloudDB) {
    importFile.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const success = window.cloudDB.importFullBackup(event.target.result);
        if (success) {
          alert('✅ தரவுத்தளம் வெற்றிகரமாக மீட்டமைக்கப்பட்டது!');
          window.location.reload();
        } else {
          alert('தவறான JSON கோப்பு.');
        }
      };
      reader.readAsText(file);
    });
  }

  // Export Bookings to CSV
  const exportBookingsBtn = document.getElementById('exportBookingsBtn');
  if (exportBookingsBtn) {
    exportBookingsBtn.addEventListener('click', exportBookingsCSV);
  }
}

async function renderAdminAll() {
  updateStats();
  await renderEventsTable();
  await renderGalleryTable();
  renderRegistrationsTable();
  renderBookingsTable();
}

function updateStats() {
  const events = JSON.parse(localStorage.getItem('aiswaryam_events') || '[]');
  const gallery = JSON.parse(localStorage.getItem('aiswaryam_gallery') || '[]');
  const members = JSON.parse(localStorage.getItem('aiswaryam_memberships') || '[]');
  const bookings = JSON.parse(localStorage.getItem('aiswaryam_bookings') || '[]');

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
      <td><span style="background:#FEF3C7; padding:2px 8px; border-radius:12px; font-size:0.75rem;">${escapeHtml(ev.category)}</span></td>
      <td>
        <button onclick="deleteEvent(${id})" style="background:#FEE2E2; border:1px solid #FCA5A5; color:#DC2626; padding:4px 8px; border-radius:4px; cursor:pointer;">நீக்குக</button>
      </td>
    </tr>
  `;
  }).join('');
}

window.deleteEvent = async function(id) {
  if (!confirm('இந்த நிகழ்வை நிச்சயமாக நீக்க விரும்புகிறீர்களா?')) return;
  if (window.cloudDB) {
    await window.cloudDB.deleteEvent(id);
    await renderEventsTable();
    updateStats();
    if (window.AiswaryamYoga) window.AiswaryamYoga.showToast('🗑️ நிகழ்வு நீக்கப்பட்டது');
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
  if (!confirm('இந்த புகைப்படத்தை நீக்கவா?')) return;
  if (window.cloudDB) {
    await window.cloudDB.deleteGalleryItem(id);
    await renderGalleryTable();
    updateStats();
    if (window.AiswaryamYoga) window.AiswaryamYoga.showToast('🗑️ படம் நீக்கப்பட்டது');
  }
};

function renderRegistrationsTable() {
  const container = document.getElementById('adminRegistrationsList');
  if (!container) return;
  const list = JSON.parse(localStorage.getItem('aiswaryam_memberships') || '[]');

  if (list.length === 0) {
    container.innerHTML = '<tr><td colspan="6" style="text-align:center; color:#9CA3AF;">பதிவுகள் எதுவும் இல்லை</td></tr>';
    return;
  }

  container.innerHTML = list.map(item => `
    <tr>
      <td><strong>${item.regId}</strong></td>
      <td>${item.fullName}</td>
      <td><a href="https://wa.me/94${item.phone.replace(/^0/, '')}" target="_blank" style="color:#059669; font-weight:700;">📱 ${item.phone}</a></td>
      <td>${item.selectedPlan}</td>
      <td>${item.batch}</td>
      <td><span style="font-size:0.8rem; color:#4B5563;">${item.health}</span></td>
    </tr>
  `).join('');
}

function renderBookingsTable() {
  const container = document.getElementById('adminBookingsList');
  if (!container) return;
  const list = JSON.parse(localStorage.getItem('aiswaryam_bookings') || '[]');

  if (list.length === 0) {
    container.innerHTML = '<tr><td colspan="6" style="text-align:center; color:#9CA3AF;">முன்பதிவுகள் எதுவும் இல்லை</td></tr>';
    return;
  }

  container.innerHTML = list.map(b => `
    <tr>
      <td><strong>${b.bookId}</strong></td>
      <td>${b.name}</td>
      <td><a href="https://wa.me/94${b.phone.replace(/^0/, '')}" target="_blank" style="color:#059669; font-weight:700;">📱 ${b.phone}</a></td>
      <td>${b.sessionType}</td>
      <td>${b.date} (${b.slot})</td>
      <td>${b.branch}</td>
    </tr>
  `).join('');
}

function exportBookingsCSV() {
  const bookings = JSON.parse(localStorage.getItem('aiswaryam_bookings') || '[]');
  if (bookings.length === 0) {
    alert('ஏற்றுமதி செய்வதற்கு முன்பதிவுகள் எதுவும் இல்லை.');
    return;
  }
  let csv = 'BookID,Name,Phone,Session,Date,Slot,Branch\n';
  bookings.forEach(b => {
    csv += `"${b.bookId}","${b.name}","${b.phone}","${b.sessionType}","${b.date}","${b.slot}","${b.branch}"\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `YogaStudio_Batticaloa_Bookings_${new Date().toISOString().slice(0,10)}.csv`;
  link.click();
}
