/**
 * ஸ்ரீ ஐஸ்வர்யம் யோகா கலையகம் — பாதுகாப்பான மாணவர் போர்ட்டல்
 * Student identity and profile are verified by Supabase Auth + RLS.
 */
document.addEventListener('DOMContentLoaded', initStudentPortal);

function getStudentAuthConfig() {
  const config = window.YOGA_SUPABASE_CONFIG || {};
  return { url: String(config.url || '').replace(/\/+$/, ''), anonKey: String(config.anonKey || '') };
}

async function verifyStudentSession(token, config) {
  const response = await fetch(`${config.url}/auth/v1/user`, {
    headers: { apikey: config.anonKey, Authorization: `Bearer ${token}` }
  });
  if (!response.ok) return null;
  return response.json();
}

async function loadStudentProfile(userId, token, config) {
  const url = new URL(`${config.url}/rest/v1/student_profiles`);
  url.searchParams.set('select', 'student_id,full_name,phone,course,batch,branch,status');
  url.searchParams.set('user_id', `eq.${userId}`);
  const response = await fetch(url, {
    headers: { apikey: config.anonKey, Authorization: `Bearer ${token}` }
  });
  if (!response.ok) throw new Error('மாணவர் விவரங்களைப் பெற முடியவில்லை. நிர்வாகியைத் தொடர்புகொள்ளவும்.');
  const rows = await response.json();
  return Array.isArray(rows) ? rows[0] || null : null;
}

function initStudentPortal() {
  const loginForm = document.getElementById('studentLoginForm');
  const authSection = document.getElementById('studentAuthSection');
  const portalSection = document.getElementById('studentDashboardSection');
  const logoutBtn = document.getElementById('studentLogoutBtn');
  const notice = document.getElementById('studentAuthNotice');
  const config = getStudentAuthConfig();
  const tokenKey = 'aiswaryam_student_access_token';

  const setNotice = (message, isError = false) => {
    if (!notice) return;
    notice.textContent = message;
    notice.style.background = isError ? '#FEE2E2' : '#FEF3C7';
    notice.style.color = isError ? '#991B1B' : '#92400E';
  };

  const showPortal = (visible) => {
    if (authSection) authSection.style.display = visible ? 'none' : 'flex';
    if (portalSection) portalSection.style.display = visible ? 'block' : 'none';
  };

  const openStudentPortal = async (token) => {
    const user = await verifyStudentSession(token, config);
    if (!user) throw new Error('உங்கள் session காலாவதியானது. மீண்டும் உள்நுழைக.');
    const profile = await loadStudentProfile(user.id, token, config);
    if (!profile) throw new Error('இந்தக் கணக்குடன் மாணவர் சுயவிவரம் இணைக்கப்படவில்லை. கலையக நிர்வாகியைத் தொடர்புகொள்ளவும்.');
    sessionStorage.setItem(tokenKey, token);
    populateStudentData({
      id: profile.student_id,
      name: profile.full_name,
      phone: profile.phone || '',
      course: profile.course || 'வகுப்பு விவரங்களுக்கு நிர்வாகியைத் தொடர்புகொள்ளவும்',
      batch: profile.batch || 'நேரம் உறுதிப்படுத்தப்படவில்லை',
      branch: profile.branch || 'கலையகம்',
      attendanceStreak: '—',
      status: profile.status || 'Active'
    });
    showPortal(true);
  };

  showPortal(false);

  const existingToken = sessionStorage.getItem(tokenKey);
  if (existingToken && config.url && config.anonKey) {
    openStudentPortal(existingToken).catch((error) => {
      sessionStorage.removeItem(tokenKey);
      showPortal(false);
      setNotice(error.message, true);
    });
  } else if (!config.url || !config.anonKey) {
    setNotice('மாணவர் உள்நுழைவுக்கு Supabase URL மற்றும் anon/publishable key-ஐ assets/js/supabase-config.js-ல் அமைக்கவும்.');
  }

  if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!config.url || !config.anonKey) {
        setNotice('Supabase configuration இல்லை. பாதுகாப்பிற்காக உள்நுழைவு முடக்கப்பட்டுள்ளது.', true);
        return;
      }
      const email = document.getElementById('studentEmailInput').value.trim();
      const password = document.getElementById('studentPasswordInput').value;
      const button = loginForm.querySelector('button[type="submit"]');
      if (button) button.disabled = true;
      try {
        const response = await fetch(`${config.url}/auth/v1/token?grant_type=password`, {
          method: 'POST',
          headers: { apikey: config.anonKey, 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (!response.ok || !data.access_token) throw new Error('மின்னஞ்சல் அல்லது கடவுச்சொல் சரியில்லை.');
        await openStudentPortal(data.access_token);
        setNotice('பாதுகாப்பாக உள்நுழைந்துள்ளீர்கள்.');
        if (window.AiswaryamYoga) window.AiswaryamYoga.showToast('மாணவர் போர்ட்டலுக்கு வரவேற்கிறோம்.');
      } catch (error) {
        sessionStorage.removeItem(tokenKey);
        showPortal(false);
        setNotice(error.message || 'உள்நுழைவு தோல்வியடைந்தது.', true);
      } finally {
        if (button) button.disabled = false;
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      const token = sessionStorage.getItem(tokenKey);
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

function populateStudentData(student) {
  const fields = {
    spStudentName: student.name,
    spStudentId: student.id,
    spStudentCourse: student.course,
    spStudentBatch: student.batch,
    spStudentBranch: student.branch,
    spStudentStreak: student.attendanceStreak || '—',
    spStudentStatus: student.status || 'Active'
  };
  Object.entries(fields).forEach(([id, value]) => {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  });

  const cardFields = {
    idCardName: student.name,
    idCardNumber: student.id,
    idCardBatch: student.batch,
    idCardBranch: student.branch
  };
  Object.entries(cardFields).forEach(([id, value]) => {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  });
}

window.printStudentIDCard = function() {
  window.print();
};
