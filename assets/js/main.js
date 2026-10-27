/**
 * ஸ்ரீ ஐஸ்வர்யம் யோகா கலையகம் (Yoga Studio) - பிரதான ஜாவாஸ்கிரிப்ட்
 * Aiswaryam Yoga Kalaiyagam - Main Trilingual Script
 * Languages: Tamil (ta) | English (en) | Sinhala (si)
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initTrilingualSwitcher();
  initMeditativeChime();
  initDailyQuote();
  initScrollEffects();
  initDynamicNotice();
});

// Trilingual Dictionary
const i18n = {
  ta: {
    siteTitle: 'ஸ்ரீ ஐஸ்வர்யம் யோகா கலையகம் | Yoga Studio',
    tagline: 'ஆசனம் – பிராணாயாமம் – தியானம்',
    home: 'முகப்பு',
    about: 'எங்களைப் பற்றி',
    courses: 'பயிற்சிகள்',
    booking: 'முன்பதிவு',
    membership: 'உறுப்பினர் சேர்க்கை',
    events: 'நிகழ்வுகள் & ஆல்பம்',
    contact: 'தொடர்புக்கு',
    studentLogin: 'மாணவர் உள்நுழைவு',
    adminLogin: 'நிர்வாக பலகை',
    joinNow: 'உறுப்பினர் ஆகுக',
    exploreCourses: 'பயிற்சிகள் பார்க்க',
    heroTag: '✨ மட்டக்களப்பு • யோகா கலையகம் (IUYF அங்கீகாரம்)',
    heroHeading: 'உடலும் உள்ளமும் ஒருங்கே மலரும் <span class="highlight">யோகா கலையகம்</span>',
    heroSub: 'ஆசனம், பிராணாயாமம் மற்றும் ஆழ்நிலை தியானம் மூலம் பரிபூரண நல்வாழ்வு, அமைதி மற்றும் நோயற்ற வாழ்வு பெற்றிடுங்கள்.',
    activeStudents: 'பயிற்சி பெற்ற மாணவர்கள்',
    yearsTradition: 'ஆண்டு பாரம்பரிய சேவை',
    wellnessRate: 'ஆரோக்கிய முன்னேற்றம்',
    readMore: 'மேலும் அறிய',
    pranayamaTitle: 'பிராணாயாமம் மூச்சுப் பயிற்சி வழிகாட்டி',
    pranayamaDesc: 'உடனடி மன அமைதி, இரத்த அழுத்த சீரமைப்பு மற்றும் ஆக்ஸிஜன் அளவை அதிகரிக்க இந்த வழிகாட்டியை பின்பற்றுங்கள்.',
    onlineBookingTitle: 'நேரலை & நேரில் பயிற்சி முன்பதிவு (Online Booking)',
    onlineBookingDesc: 'உங்கள் வசதியான நேரம், பயிற்றுநர் மற்றும் அமர்வைத் தேர்ந்தெடுத்து உடனடியாக முன்பதிவு செய்யுங்கள்.'
  },
  en: {
    siteTitle: 'Sri Aishwaryam Yoga Kalaiyagam | Yoga Studio',
    tagline: 'ASANA – PRANAYAMA – DHYANA',
    home: 'Home',
    about: 'About Us',
    courses: 'Courses',
    booking: 'Online Booking',
    membership: 'Membership',
    events: 'Events & Gallery',
    contact: 'Contact Us',
    studentLogin: 'Student Portal',
    adminLogin: 'Admin Portal',
    joinNow: 'Join Now',
    exploreCourses: 'Explore Classes',
    heroTag: '✨ Batticaloa • Yoga Studio (IUYF Affiliated)',
    heroHeading: 'Harmony of Body, Mind & Soul at <span class="highlight">Yoga Studio</span>',
    heroSub: 'Empowering holistic health, longevity, and inner tranquility through traditional Asana, Pranayama, and Dhyana under expert guidance.',
    activeStudents: 'Active Students',
    yearsTradition: 'Years of Lineage',
    wellnessRate: 'Health Transformation',
    readMore: 'Learn More',
    pranayamaTitle: 'Interactive Pranayama Breathing Guide',
    pranayamaDesc: 'Follow this rhythmic breath guide for immediate stress relief, clarity, and balanced vitality.',
    onlineBookingTitle: 'Online Session & Class Slot Booking',
    onlineBookingDesc: 'Select your preferred time slot, batch, and session type for instant confirmation.'
  },
  si: {
    siteTitle: 'ශ්‍රී ඓශ්වර්යම් යෝග කලායතනය | Yoga Studio',
    tagline: 'ආසන - ප්‍රාණායාම - ධ්‍යාන',
    home: 'මුල් පිටුව',
    about: 'අප ගැන',
    courses: 'පාඨමාලා',
    booking: 'වෙන්කරවා ගැනීම',
    membership: 'සාමාජිකත්වය',
    events: 'සිදුවීම් සහ ඡායාරූප',
    contact: 'අප අමතන්න',
    studentLogin: 'ශිෂ්‍ය පිවිසුම',
    adminLogin: 'පරිපාලක පුවරුව',
    joinNow: 'ලියාපදිංචි වන්න',
    exploreCourses: 'පාඨමාලා ගවේෂණය කරන්න',
    heroTag: '✨ මඩකලපුව • යෝග කලායතනය (IUYF අනුබද්ධිතයි)',
    heroHeading: 'ශරීරය සහ මනස සුවපත් කරන <span class="highlight">යෝග කලායතනය</span>',
    heroSub: 'ආසන, ප්‍රාණායාම සහ ගැඹුරු ධ්‍යාන තුළින් පරිපූර්ණ සෞඛ්‍යය, සිතේ සාමය සහ නීරෝගී ජීවිතයක් ලබාගන්න.',
    activeStudents: 'පුහුණු වූ සිසුන්',
    yearsTradition: 'වසරක සම්ප්‍රදාය',
    wellnessRate: 'සුවය ලැබීමේ ප්‍රගතිය',
    readMore: 'වැඩිදුර කියවන්න',
    pranayamaTitle: 'ප්‍රාණායාම හුස්ම ගැනීමේ පුහුණුකරු',
    pranayamaDesc: 'ක්ෂණික මානසික සන්සුන් භාවය සහ රුධිර පීඩනය පාලනය සඳහා මෙම මාර්ගෝපදේශය අනුගමනය කරන්න.',
    onlineBookingTitle: 'ඔන්ලයින් පන්ති වෙන්කරවා ගැනීම',
    onlineBookingDesc: 'ඔබට පහසු වේලාව සහ පන්තිය තෝරා ක්ෂණිකව වෙන්කරවා ගන්න.'
  }
};

let currentLang = localStorage.getItem('aiswaryam_lang') || 'ta';

function initTrilingualSwitcher() {
  const langSelect = document.getElementById('langSelect');
  if (langSelect) {
    langSelect.value = currentLang;
    langSelect.addEventListener('change', (e) => {
      currentLang = e.target.value;
      localStorage.setItem('aiswaryam_lang', currentLang);
      applyLanguage(currentLang);
      const msg = currentLang === 'ta' 
        ? 'தமிழ் மொழிக்கு மாற்றப்பட்டது' 
        : currentLang === 'si' 
          ? 'භාෂාව සිංහලට මාරු කරන ලදී' 
          : 'Switched to English';
      showToast(msg);
    });
  }
  applyLanguage(currentLang);
}

function applyLanguage(lang) {
  document.documentElement.setAttribute('lang', lang);

  // Update elements with data-lang-key
  document.querySelectorAll('[data-lang-key]').forEach(el => {
    const key = el.getAttribute('data-lang-key');
    if (i18n[lang] && i18n[lang][key]) {
      el.innerHTML = i18n[lang][key];
    }
  });

  // Update elements with explicit language attributes
  document.querySelectorAll('[data-ta]').forEach(el => {
    if (lang === 'ta' && el.getAttribute('data-ta')) {
      el.innerHTML = el.getAttribute('data-ta');
    } else if (lang === 'si' && el.getAttribute('data-si')) {
      el.innerHTML = el.getAttribute('data-si');
    } else if (lang === 'en' && el.getAttribute('data-en')) {
      el.innerHTML = el.getAttribute('data-en');
    }
  });

  // Translate placeholders without replacing user-entered form values.
  document.querySelectorAll('[data-placeholder-ta], [data-placeholder-en], [data-placeholder-si]').forEach(el => {
    const translatedPlaceholder = el.getAttribute(`data-placeholder-${lang}`);
    if (translatedPlaceholder) el.setAttribute('placeholder', translatedPlaceholder);
  });
}

// Mobile Menu
function initMobileMenu() {
  const toggleBtn = document.querySelector('.mobile-nav-toggle');
  const navMenu = document.querySelector('.nav-menu');
  if (!toggleBtn || !navMenu) return;

  const setMenuOpen = (isOpen) => {
    navMenu.classList.toggle('active', isOpen);
    toggleBtn.setAttribute('aria-expanded', String(isOpen));
    toggleBtn.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
    toggleBtn.textContent = isOpen ? '✕' : '☰';
  };

  toggleBtn.setAttribute('aria-controls', navMenu.id || 'primary-navigation');
  if (!navMenu.id) navMenu.id = 'primary-navigation';
  setMenuOpen(false);

  toggleBtn.addEventListener('click', () => {
    setMenuOpen(!navMenu.classList.contains('active'));
  });

  navMenu.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => setMenuOpen(false));
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && navMenu.classList.contains('active')) {
      setMenuOpen(false);
      toggleBtn.focus();
    }
  });

  document.addEventListener('click', event => {
    if (!navMenu.contains(event.target) && !toggleBtn.contains(event.target)) {
      setMenuOpen(false);
    }
  });
}

// Meditative Chime (Web Audio API Synthesizer - 100% offline!)
let audioCtx = null;
function initMeditativeChime() {
  const chimeBtn = document.getElementById('meditationChimeBtn');
  if (!chimeBtn) return;

  chimeBtn.addEventListener('click', () => {
    playTibetanSingingBowl();
    const msg = currentLang === 'ta' 
      ? '🔔 புனித யோக மணி நாதம் ஒலிக்கிறது...' 
      : currentLang === 'si' 
        ? '🔔 ශාන්ත යෝග සීනු නාදය නාද වේ...' 
        : '🔔 Peaceful Bell Chime Resonating...';
    showToast(msg);
  });
}

function playTibetanSingingBowl() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!audioCtx) audioCtx = new AudioContext();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const fundamental = 261.63; // C4 note
    const harmonics = [1, 2.76, 5.4, 8.93];
    const gains = [0.4, 0.25, 0.12, 0.05];

    harmonics.forEach((ratio, index) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(fundamental * ratio, audioCtx.currentTime);

      const lfo = audioCtx.createOscillator();
      const lfoGain = audioCtx.createGain();
      lfo.frequency.setValueAtTime(2.5, audioCtx.currentTime);
      lfoGain.gain.setValueAtTime(1.5, audioCtx.currentTime);
      lfo.connect(osc.frequency);
      lfo.start();

      gain.gain.setValueAtTime(0.0001, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(gains[index], audioCtx.currentTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 5.5);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 6.0);
      lfo.stop(audioCtx.currentTime + 6.0);
    });
  } catch (err) {
    console.warn('Audio API note:', err);
  }
}

// Daily Quotes Pool (TA, EN, SI)
const quotes = [
  {
    ta: '"உடம்பார் அழியில் உயிரார் அழிவர் திடம்பட மெய்ஞ்ஞானம் சேரவும் மாட்டார்; உடம்பை வளர்க்கும் உபாயம் அறிந்தே உடம்பை வளர்த்தேன் உயிர் வளர்த்தேனே." — திருமூலர்',
    en: '"When the physical body decays, life departs. Knowing the sacred art of nurturing the body, I nurtured it and preserved my soul." — Tirumoolar',
    si: '"ශරීරය විනාශ වූ විට ජීවිතයද විනාශ වේ. එමනිසා ශරීරය නිරෝගීව තබා ගැනීමේ කලාව දැනගෙන මම ශරීරය රැකගතිමි." — තිරුමූලර්'
  },
  {
    ta: '"யோகஸ்ச சித்த விருத்தி நிரோதஹ் — மனதின் அலைபாயும் எண்ணங்களை ஒருமுகப்படுத்துவதே யோகமாகும்." — பதஞ்சலி முனிவர்',
    en: '"Yogas Chitta Vritti Nirodha — Yoga is the stilling of the fluctuations of the mind." — Sage Patanjali',
    si: '"යෝගය යනු මනසේ නොසන්සුන් සිතිවිලි සන්සුන් කර එකඟ කිරීමයි." — පතංජලී මුණි'
  },
  {
    ta: '"ஆரோக்கியமே தலையாய செல்வம், மன அமைதியே மிகப்பெரிய பாக்கியம்." — யோகா கலையகம்',
    en: '"Health is the supreme wealth, and inner serenity is the highest blessing." — Yoga Kalaiyagam',
    si: '"ආරෝග්‍යය උතුම්ම ධනයයි, මානසික සැනසීම උතුම්ම භාග්‍යයයි." — යෝග කලායතනය'
  }
];

function initDailyQuote() {
  const quoteText = document.getElementById('dailyQuoteText');
  const quoteBtn = document.getElementById('refreshQuoteBtn');
  if (!quoteText) return;

  let idx = 0;
  function setQuote(i) {
    const q = quotes[i % quotes.length];
    quoteText.innerHTML = currentLang === 'ta' ? q.ta : (currentLang === 'si' ? q.si : q.en);
  }
  setQuote(idx);

  if (quoteBtn) {
    quoteBtn.addEventListener('click', () => {
      idx = (idx + 1) % quotes.length;
      quoteText.style.opacity = 0;
      setTimeout(() => {
        setQuote(idx);
        quoteText.style.opacity = 1;
      }, 200);
    });
  }
}

// Shared announcement, with a local cache only as a fallback.
async function initDynamicNotice() {
  const noticeBox = document.getElementById('dynamicTopNotice');
  if (!noticeBox) return;

  const savedNotice = localStorage.getItem('aiswaryam_top_notice');
  if (savedNotice) noticeBox.textContent = savedNotice;

  if (window.cloudDB && window.cloudDB.isCloudConfigured()) {
    try {
      const cloudNotice = await window.cloudDB.fetchNotice();
      if (cloudNotice) {
        noticeBox.textContent = cloudNotice;
        localStorage.setItem('aiswaryam_top_notice', cloudNotice);
      }
    } catch (error) {
      // The public site can still display its last known announcement offline.
      console.warn('[Notice] Using cached announcement:', error);
    }
  }
}

// Scroll Effects
function initScrollEffects() {
  const header = document.querySelector('.main-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      header.style.boxShadow = '0 10px 25px -5px rgba(0,0,0,0.08)';
    } else {
      header.style.boxShadow = 'none';
    }
  });
}

// Toast Notification
function showToast(message) {
  let toast = document.querySelector('.toast-msg');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast-msg';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3200);
}

window.AiswaryamYoga = {
  showToast,
  playTibetanSingingBowl,
  applyLanguage,
  i18n
};
