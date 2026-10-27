/**
 * ஸ்ரீ ஐஸ்வர்யம் யோகா கலையகம் - புகைப்படத் தொகுப்பு மற்றும் நிகழ்வுகள்
 * Aiswaryam Yoga - Dynamic Photo Gallery & Events Engine
 */

document.addEventListener('DOMContentLoaded', () => {
  renderDynamicEvents();
  renderDynamicGallery();
  initGalleryFilterAndLightbox();
});

const DEFAULT_GALLERY_ITEMS = [
  { 
    id: 1, 
    title: 'ஸ்ரீ ஐஸ்வர்யம் யோகா கலையகம் - பிரதான அரங்கம் & ஆசான்கள்', 
    meta: 'மட்டக்களப்பு | தலைமை யோகா கலையகம்', 
    img: 'assets/images/banner.jpg', 
    category: 'events' 
  },
  { 
    id: 2, 
    title: 'யோகா குரு S. ஸ்ரீதரன் (B.Sc Psych, Yoga Guru)', 
    meta: 'உளவியல் ஆலோசகர் & யோகா குரு', 
    img: 'assets/images/sritharan.jpg', 
    category: 'camps' 
  },
  { 
    id: 3, 
    title: 'யோகா தெரபிஸ்ட் A. ஜெயஹரன் (B.Ed, Yoga Therapist)', 
    meta: 'மருத்துவ யோகா சிகிச்சையாளர்', 
    img: 'assets/images/jayaharan.jpg', 
    category: 'camps' 
  },
  { 
    id: 4, 
    title: 'ஸ்ரீ ஐஸ்வர்யம் யோகா கலையகம் - உத்தியோகபூர்வ இலச்சினை', 
    meta: 'மட்டக்களப்பு | பதிவு பெற்ற யோகா மையம்', 
    img: 'assets/images/logo_kalaiyagam.png', 
    category: 'convocation' 
  },
  { 
    id: 5, 
    title: 'International Union Yoga Federation (IUYF) அங்கீகாரம்', 
    meta: 'சர்வதேச யோகா கூட்டமைப்பு சான்றிதழ் அங்கீகாரம்', 
    img: 'assets/images/iuyf_logo.png', 
    category: 'convocation' 
  },
  { 
    id: 6, 
    title: 'ஸ்ரீ ஐஸ்வர்யம் யோகா நிறுவனம்', 
    meta: 'பாரம்பரிய யோகா கல்வி மற்றும் சிகிச்சை மையம்', 
    img: 'assets/images/logo_institution.png', 
    category: 'events' 
  }
];

// Encode untrusted database/local-storage values before rendering HTML.
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

// 1. DYNAMIC EVENTS RENDERER (Clean real events or friendly announcement)
async function renderDynamicEvents() {
  const container = document.getElementById('dynamicEventsContainer');
  if (!container) return;

  let events = [];
  if (window.cloudDB) {
    events = await window.cloudDB.fetchEvents();
  } else {
    try {
      const stored = localStorage.getItem('aiswaryam_events');
      events = stored ? JSON.parse(stored) : [];
    } catch (e) {
      events = [];
    }
  }

  // Active language
  const curLang = localStorage.getItem('aiswaryam_lang') || 'ta';

  if (!events || events.length === 0) {
    container.innerHTML = `
      <div style="background: #FFFDF8; border: 1.5px dashed #D97706; border-radius: var(--radius-md); padding: 2.5rem 1.5rem; text-align: center; max-width: 680px; margin: 0 auto; box-shadow: 0 4px 15px rgba(217,119,6,0.06);">
        <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🗓️</div>
        <h3 style="color: #78350F; font-size: 1.35rem; margin-bottom: 0.5rem;"
            data-ta="விரைவில் புதிய யோகா நிகழ்வுகள் அறிவிக்கப்படும்"
            data-en="Upcoming Yoga Events Will Be Announced Soon"
            data-si="ඉදිරි යෝග සිදුවීම් ළඟදීම ප්‍රකාශයට පත් කෙරේ">
          விரைவில் புதிய யோகா நிகழ்வுகள் அறிவிக்கப்படும்
        </h3>
        <p style="color: #4B5563; font-size: 0.95rem; line-height: 1.6; margin-bottom: 1.5rem; max-width: 540px; margin-left: auto; margin-right: auto;"
           data-ta="தற்போது புதிய சிறப்பு முகாம்களுக்கான ஏற்பாடுகள் நடைபெற்று வருகின்றன. புதிய பயிற்சி முகாம்கள் பற்றிய விபரங்கள் இங்கு உடனுக்குடன் வெளியிடப்படும்."
           data-en="Preparations for upcoming special yoga workshops and camps are underway. Dates will be announced here."
           data-si="විශේෂ යෝග වැඩමුළු සහ කඳවුරු සඳහා සූදානම් වෙමින් පවතී. විස්තර ඉක්මනින් මෙහි පළ කෙරේ.">
          தற்போது புதிய சிறப்பு முகாம்களுக்கான ஏற்பாடுகள் நடைபெற்று வருகின்றன. புதிய பயிற்சி முகாம்கள் பற்றிய விபரங்கள் இங்கு உடனுக்குடன் வெளியிடப்படும்.
        </p>
        <div style="display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap;">
          <a href="https://wa.me/94776064846?text=வணக்கம்,%20அடுத்த%20யோகா%20நிகழ்வு%20அல்லது%20முகாம்%20பற்றிய%20விபரங்களை%20அறிய%20விரும்புகிறேன்." target="_blank" class="btn-whatsapp" style="padding: 0.65rem 1.4rem; font-size: 0.9rem; border-radius: 999px;">
            💬 வாட்ஸ்அப்பில் நிகழ்வு விபரம் கேட்க
          </a>
          <a href="booking.html" class="btn-primary" style="padding: 0.65rem 1.4rem; font-size: 0.9rem; border-radius: 999px;">
            வழக்கமான வகுப்புகளுக்கு முன்பதிவு →
          </a>
        </div>
      </div>
    `;
    return;
  }

  // If real events are added by Admin
  container.innerHTML = `
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.5rem;">
      ${events.map(ev => {
        let title = ev.titleTa || ev.title;
        if (curLang === 'en' && ev.titleEn) title = ev.titleEn;
        if (curLang === 'si' && ev.titleSi) title = ev.titleSi;
        const msg = encodeURIComponent(`வணக்கம், நான் யோகா கலையகத்தின் "${title}" நிகழ்வில் பங்குபெற முன்பதிவு செய்ய விரும்புகிறேன்.`);
        return `
          <div style="background: #FFFFFF; border-radius: var(--radius-md); box-shadow: 0 4px 15px rgba(0,0,0,0.06); overflow: hidden; border-top: 4px solid #D97706; display: flex; flex-direction: column;">
            <div style="padding: 1.5rem; flex: 1;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                <span style="background: #FEF3C7; color: #92400E; font-size: 0.8rem; font-weight: 700; padding: 0.25rem 0.65rem; border-radius: 999px;">
                  📅 ${escapeHtml(ev.date)} ${ev.time ? '• ' + escapeHtml(ev.time) : ''}
                </span>
                <span style="font-size: 0.75rem; color: #047857; font-weight: 600;">
                  📍 ${escapeHtml(ev.location)}
                </span>
              </div>
              <h3 style="font-size: 1.25rem; color: #78350F; margin-bottom: 0.65rem;">${escapeHtml(title)}</h3>
              <p style="font-size: 0.9rem; color: #4B5563; line-height: 1.5; margin-bottom: 1.25rem;">
                ${escapeHtml(ev.desc || '')}
              </p>
            </div>
            <div style="padding: 1rem 1.5rem; background: #FDFBF7; border-top: 1px solid #F3F4F6; display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 0.85rem; color: #047857; font-weight: 700;">உறுதிப்படுத்தப்பட்ட நிகழ்வு</span>
              <a href="https://wa.me/94776064846?text=${msg}" target="_blank" class="btn-whatsapp" style="padding: 0.45rem 1rem; font-size: 0.85rem; border-radius: 999px;">
                வாட்ஸ்அப் பதிவு →
              </a>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

// 2. DYNAMIC GALLERY RENDERER
async function renderDynamicGallery() {
  const container = document.getElementById('dynamicGalleryGrid');
  if (!container) return;

  let items = DEFAULT_GALLERY_ITEMS;
  if (window.cloudDB) {
    items = await window.cloudDB.fetchGallery();
  } else {
    try {
      const stored = localStorage.getItem('aiswaryam_gallery');
      items = stored ? JSON.parse(stored) : DEFAULT_GALLERY_ITEMS;
    } catch (e) {
      items = DEFAULT_GALLERY_ITEMS;
    }
  }

  container.innerHTML = items.map(item => `
    <div class="gallery-card" data-category="${escapeHtml(item.category)}">
      <img src="${escapeHtml(safeImageUrl(item.img))}" alt="${escapeHtml(item.title)}" class="gallery-thumb" loading="lazy" onerror="this.onerror=null;this.src='assets/images/banner.jpg'">
      <div class="gallery-info">
        <h4 class="gallery-title">${escapeHtml(item.title)}</h4>
        <p class="gallery-meta">📍 ${escapeHtml(item.meta)}</p>
      </div>
    </div>
  `).join('');
}

function initGalleryFilterAndLightbox() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const lightbox = document.getElementById('galleryLightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxTitle = document.getElementById('lightboxTitle');
  const lightboxMeta = document.getElementById('lightboxMeta');
  const lightboxClose = document.getElementById('lightboxClose');

  // Filter Buttons
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');
      const cards = document.querySelectorAll('.gallery-card');

      cards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.style.display = 'block';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 50);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(20px)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 250);
        }
      });
    });
  });

  // Lightbox click delegation
  document.addEventListener('click', (e) => {
    const card = e.target.closest('.gallery-card');
    if (card && lightbox && lightboxImg) {
      const img = card.querySelector('img');
      const title = card.querySelector('.gallery-title');
      const meta = card.querySelector('.gallery-meta');

      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      if (lightboxTitle && title) lightboxTitle.textContent = title.textContent;
      if (lightboxMeta && meta) lightboxMeta.textContent = meta.textContent;

      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  });

  function closeLightbox() {
    if (lightbox) {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });
}
