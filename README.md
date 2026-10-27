# ஸ்ரீ ஐஸ்வர்யம் யோகா கலையகம் (Yoga Studio Batticaloa) — இணையதளம்

**ஸ்ரீ ஐஸ்வர்யம் யோகா கலையகம் / யோகா ஸ்டுடியோ (Aishwaryam Yoga Kalaiyagam & Institution)**  
மட்டக்களப்பு, இலங்கை (Batticaloa, Sri Lanka)  
**IUYF அங்கீகாரம் பெற்றது (Affiliated with International Union Yoga Federation)**  

**தலைமை ஆசான்கள்:**
- **எஸ். ஸ்ரீதரன் (S. Sritharan, B.Sc)** — உளவியல் & உளசிகிச்சை, யோகா குரு (077 6047 081)
- **ஏ. ஜெயஹரன் (A. Jayaharan, B.Ed)** — யோகா சிகிச்சை நிபுணர் (077 6064 846)

---

## 🌟 சிறப்பம்சங்கள் (Key Features)

1. **🌐 மும்மொழி வசதி (Trilingual Support: Tamil + English + Sinhala):**
   - தமிழ் (Tamil), English, மற்றும் සිංහල (Sinhala) ஆகிய மூன்று மொழிகளிலும் ஒரே கிளிக்கில் மாறும் வசதி.

2. **🧘 அசல் யோகா கலையகம் பிராண்டிங் & ஆசான்கள்:**
   - யோகா கலையகத்தின் அதிகாரப்பூர்வ பதாகை (`banner.jpg`) மற்றும் ஆசான்களின் அசல் திருவுருவப் படங்கள் (`sritharan.jpg`, `jayaharan.jpg`).
   - சர்வதேச யோகா கூட்டமைப்பு (IUYF) மற்றும் நிறுவன முத்திரைகள்.

3. **💬 நேரடி வாட்ஸ்அப் சேர்க்கை (WhatsApp Direct Enrollment):**
   - மாணவர் சேர்க்கை மற்றும் ஆலோசனைகள் நேரடியாக மட்டக்களப்பு யோகா மையத்தின் எண்களுக்கு (**077 6064 846 / 077 6047 081**) வாட்ஸ்அப் வழியாக செல்லும் வசதி.

4. **📱 Progressive Web App (PWA) & ஆஃப்லைன் ஆதரவு:**
   - Android, iPhone, Windows, Mac கணினிகளில் ஒரு ஆப் போல Install செய்துகொள்ளலாம்.
   - இணைய இணைப்பு இல்லாமலும் (Offline) வேலை செய்யும் Service Worker கட்டமைப்பு (`sw.js`).

5. **🔔 புனித திபெத்திய மணி நாதம் (Web Audio Tibetan Singing Bowl):**
   - வெளிப்புற ஆடியோ பைல்கள் ஏதுமின்றி 100% தூய கணித அலைவரிசை மூலம் இயங்கும் தியான மணி நாதம் (432Hz Sacred Resonance).

6. **⏳ வரவிருக்கும் சேவைகள் (Coming Soon):**
   - பயிற்சிகள் (`courses.html`), நேரலை முன்பதிவு (`booking.html`), மற்றும் உறுப்பினர் சேர்க்கை (`membership.html`) ஆகியவை எளிய "Coming Soon" அட்டையுடன், நேரடி வாட்ஸ்அப் விசாரணை வசதியுடன் இணைக்கப்பட்டுள்ளன.

7. **⚙️ நிர்வாக பலகை (Admin Dashboard - `admin.html`):**
   - கடவுச்சொல் பாதுகாக்கப்பட்ட நிர்வாகப் பக்கம் (Default: `admin` / `admin123`).
   - உண்மையான புதிய நிகழ்வுகள் மற்றும் புகைப்படங்களை உடனுக்குடன் சேர்க்கும், நிர்வகிக்கும் வசதி.
   - SHA-256 பாதுகாப்பு & Cloud Database (Supabase) இணைப்பு வசதி.

8. **மட்டக்களப்பு கிளைகள் & தொடர்புகள்:**
   - **முதன்மை கூடம்:** No: 16, Loyds Avenue Road, Batticaloa.
   - **கிளை 1:** 130D, Boundary Road North, Batticaloa.
   - **கிளை 2:** No. 5 Sinnaiyah Vithanayar Road, Thimilathivu, Batticaloa.
   - **தொலைபேசி எண்கள்:** 077 6064 846 / 077 6047 081

---

## 📁 திட்டத்தின் கோப்பு அமைப்பு (File Structure)

```
Yoga/
├── index.html                  # பிரதான முகப்பு போர்ட்டல்
├── about.html                  # எங்களைப் பற்றி, குருமார்கள் & IUYF அங்கீகாரம்
├── courses.html                # யோகா வகுப்புகள் (Coming Soon)
├── booking.html                # நேரலை முன்பதிவு (Coming Soon)
├── membership.html             # உறுப்பினர் சேர்க்கை (Coming Soon)
├── events.html                 # நிகழ்வுகள் & புகைப்பட ஆல்பம்
├── contact.html                # மட்டக்களப்பு கிளை முகவரிகள் & தொடர்பு
├── student-portal.html         # மாணவர் போர்ட்டல் & அடையாள அட்டை
├── admin.html                  # நிர்வாக பலகை (Cloud DB Sync)
├── manifest.json               # PWA App Manifest
├── sw.js                       # Service Worker (ஆஃப்லைன் கேச்)
├── Aiswaryam_Yoga_Website.zip  # முழுமையான ஜிப் தொகுப்பு
└── assets/
    ├── css/
    │   ├── style.css           # முதன்மை வடிவமைப்பு
    │   └── animations.css      # பிராணாயாம அனிமேஷன்
    ├── js/
    │   ├── main.js             # மும்மொழி & ஆடியோ என்ஜின்
    │   ├── cloud-db.js         # கிளவுட் டேட்டாபேஸ்
    │   ├── pranayama.js        # மூச்சுப் பயிற்சி கடிகாரம்
    │   ├── gallery.js          # புகைப்பட ஆல்பம்
    │   └── admin.js            # நிர்வாக பலகை ஸ்கிரிப்ட்
    └── images/                 # அசல் புகைப்படங்கள் & இலச்சினைகள்
```

---

## 🚀 இயக்குவது எப்படி (How to Run)

எந்தவொரு நவீன இணைய உலாவியிலும் (Chrome, Edge, Firefox, Safari) `index.html` கோப்பை நேரடியாகத் திறக்கலாம். அல்லது உள்ளூர் சர்வரில் இயக்க:

```bash
python -m http.server 8080
```
பின்னர் பிரவுசரில் `http://localhost:8080/` திறந்து பார்க்கலாம்.
