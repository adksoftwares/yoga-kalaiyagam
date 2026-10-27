/**
 * ஸ்ரீ ஐஸ்வர்யம் யோகா கலையகம் - கிளவுட் டேட்டாபேஸ் இணைப்பு
 * Aiswaryam Yoga Kalaiyagam - Cloud Sync & Local-First Database Engine
 * Supports Supabase / Firebase / REST API with offline resilience
 */

const CLOUD_CONFIG_KEY = 'aiswaryam_cloud_config';

// Default Master Data (No fake events; real events published by admin)
const DEFAULT_EVENTS = [];

const DEFAULT_GALLERY = [
  { 
    id: 1, 
    title: 'ஸ்ரீ ஐஸ்வர்யம் யோகா கலையகம் - பிரதான பதாகை & ஆசான்கள்', 
    meta: 'மட்டக்களப்பு | தலைமை யோகா கலையகம்', 
    img: 'assets/images/banner.jpg', 
    category: 'events' 
  },
  { 
    id: 2, 
    title: 'யோகா குரு S. ஸ்ரீதரன் (B.Sc Psych, Yoga Guru)', 
    meta: 'உளவியல் & தியான ஆசான் | பிரதான பயிற்றுவிப்பாளர்', 
    img: 'assets/images/sritharan.jpg', 
    category: 'camps' 
  },
  { 
    id: 3, 
    title: 'யோகா தெரபிஸ்ட் A. ஜெயஹரன் (B.Ed, Yoga Therapist)', 
    meta: 'மருத்துவ யோகா சிகிச்சையாளர் | உடற்பிணி நிவாரணம்', 
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

class YogaCloudDB {
  constructor() {
    this.config = this.loadConfig();
  }

  loadConfig() {
    try {
      const cfg = localStorage.getItem(CLOUD_CONFIG_KEY);
      const publicConfig = window.YOGA_SUPABASE_CONFIG || {};
      const defaults = {
        provider: publicConfig.url && publicConfig.anonKey ? 'supabase' : 'local',
        supabaseUrl: publicConfig.url || '',
        supabaseKey: publicConfig.anonKey || '',
        syncEnabled: Boolean(publicConfig.url && publicConfig.anonKey)
      };
      if (!cfg) return defaults;
      const saved = JSON.parse(cfg);
      return {
        ...defaults,
        ...saved,
        supabaseUrl: publicConfig.url || saved.supabaseUrl || '',
        supabaseKey: publicConfig.anonKey || saved.supabaseKey || '',
        provider: publicConfig.url && publicConfig.anonKey ? 'supabase' : (saved.provider || 'local'),
        syncEnabled: publicConfig.url && publicConfig.anonKey ? true : Boolean(saved.syncEnabled)
      };
    } catch (e) {
      const publicConfig = window.YOGA_SUPABASE_CONFIG || {};
      return {
        provider: publicConfig.url && publicConfig.anonKey ? 'supabase' : 'local',
        supabaseUrl: publicConfig.url || '',
        supabaseKey: publicConfig.anonKey || '',
        syncEnabled: Boolean(publicConfig.url && publicConfig.anonKey)
      };
    }
  }

  saveConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    localStorage.setItem(CLOUD_CONFIG_KEY, JSON.stringify(this.config));
  }

  getAccessToken() {
    try {
      return sessionStorage.getItem('aiswaryam_admin_access_token') ||
        sessionStorage.getItem('aiswaryam_student_access_token') ||
        this.config.supabaseKey;
    } catch {
      return this.config.supabaseKey;
    }
  }

  getAuthHeaders(extra = {}) {
    return {
      apikey: this.config.supabaseKey,
      Authorization: `Bearer ${this.getAccessToken()}`,
      ...extra
    };
  }

  async ensureOk(response, action) {
    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      throw new Error(`${action} failed (${response.status}): ${detail.slice(0, 180)}`);
    }
    return response;
  }

  isCloudConfigured() {
    return Boolean(this.config.syncEnabled && this.config.provider === 'supabase' &&
      this.config.supabaseUrl && this.config.supabaseKey);
  }

  async fetchAdminRecords(table) {
    const allowedTables = new Set(['memberships', 'bookings']);
    if (!allowedTables.has(table)) throw new Error('Unsupported table');
    if (!this.isCloudConfigured()) return [];
    const response = await fetch(`${this.config.supabaseUrl}/rest/v1/${table}?select=*&order=created_at.desc`, {
      headers: this.getAuthHeaders()
    });
    await this.ensureOk(response, `Load ${table}`);
    const rows = await response.json();
    return Array.isArray(rows) ? rows : [];
  }

  async submitMembership(record) {
    if (!this.isCloudConfigured()) return { persisted: false };
    const payload = {
      reg_id: record.regId,
      full_name: record.fullName,
      phone: record.phone,
      email: record.email || null,
      age: /^\\d+$/.test(String(record.age)) ? Number(record.age) : null,
      gender: record.gender || null,
      batch: record.batch,
      branch: record.branch || null,
      selected_plan: record.selectedPlan,
      health: record.health || null,
      address: record.address || null
    };
    const response = await fetch(`${this.config.supabaseUrl}/rest/v1/memberships`, {
      method: 'POST',
      headers: {
        apikey: this.config.supabaseKey,
        Authorization: `Bearer ${this.config.supabaseKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal'
      },
      body: JSON.stringify(payload)
    });
    await this.ensureOk(response, 'Submit membership request');
    return { persisted: true };
  }

  async submitBooking(record) {
    if (!this.isCloudConfigured()) return { persisted: false };
    const payload = {
      booking_id: record.bookId,
      full_name: record.name,
      phone: record.phone,
      session_type: record.sessionType,
      booking_date: record.date,
      slot: record.slot,
      branch: record.branch,
      notes: record.notes || null
    };
    const response = await fetch(`${this.config.supabaseUrl}/rest/v1/bookings`, {
      method: 'POST',
      headers: {
        apikey: this.config.supabaseKey,
        Authorization: `Bearer ${this.config.supabaseKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal'
      },
      body: JSON.stringify(payload)
    });
    await this.ensureOk(response, 'Submit booking request');
    return { persisted: true };
  }

  // 1. EVENTS MANAGEMENT (Cloud + Local First)
  async fetchEvents() {
    if (this.config.syncEnabled && this.config.provider === 'supabase' && this.config.supabaseUrl) {
      try {
        const res = await fetch(`${this.config.supabaseUrl}/rest/v1/events?select=*&order=date.desc`, {
          headers: {
            'apikey': this.config.supabaseKey,
            'Authorization': `Bearer ${this.getAccessToken()}`
          }
        });
        if (res.ok) {
          const cloudData = await res.json();
          if (Array.isArray(cloudData)) {
            localStorage.setItem('aiswaryam_events', JSON.stringify(cloudData));
            return cloudData;
          }
        }
      } catch (err) {
        console.warn('[CloudDB] Fallback to local cache for events:', err);
      }
    }

    // LocalStorage fallback with automatic purge of old fake mock events
    const local = localStorage.getItem('aiswaryam_events');
    if (!local) return DEFAULT_EVENTS;
    try {
      const parsed = JSON.parse(local);
      // Purge fake mock events (e.g. 2026-06-21, 2026-07-15, 2026-08-10, or dummy IDs 1, 2, 3)
      const sanitized = Array.isArray(parsed) ? parsed.filter(ev => {
        const title = (ev.titleTa || ev.title || '').toLowerCase();
        const date = ev.date || '';
        const isMock = date === '2026-06-21' || date === '2026-07-15' || date === '2026-08-10' ||
                       title.includes('கல்லடி கடற்கரை சூரிய நமஸ்கார') ||
                       title.includes('international yoga day celebration') ||
                       (ev.id <= 3 && title.includes('சர்வதேச யோகா தினப் பெருவிழா'));
        return !isMock;
      }) : [];
      if (sanitized.length !== parsed.length) {
        localStorage.setItem('aiswaryam_events', JSON.stringify(sanitized));
      }
      return sanitized;
    } catch (e) {
      return DEFAULT_EVENTS;
    }
  }

  async saveEvent(eventObj) {
    if (this.config.syncEnabled && this.config.provider === 'supabase' && this.config.supabaseUrl) {
      const response = await fetch(`${this.config.supabaseUrl}/rest/v1/events`, {
        method: 'POST',
        headers: this.getAuthHeaders({ 'Content-Type': 'application/json', Prefer: 'return=minimal' }),
        body: JSON.stringify(eventObj)
      });
      await this.ensureOk(response, 'Save event');
      return this.fetchEvents();
    }

    const current = await this.fetchEvents();
    current.unshift(eventObj);
    localStorage.setItem('aiswaryam_events', JSON.stringify(current));
    return current;
  }

  async deleteEvent(id) {
    if (this.config.syncEnabled && this.config.provider === 'supabase' && this.config.supabaseUrl) {
      const response = await fetch(`${this.config.supabaseUrl}/rest/v1/events?id=eq.${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });
      await this.ensureOk(response, 'Delete event');
      return this.fetchEvents();
    }
    const current = (await this.fetchEvents()).filter(event => event.id !== id);
    localStorage.setItem('aiswaryam_events', JSON.stringify(current));
    return current;
  }

  // 2. GALLERY MANAGEMENT (Cloud + Local First)
  async fetchGallery() {
    if (this.config.syncEnabled && this.config.provider === 'supabase' && this.config.supabaseUrl) {
      try {
        const res = await fetch(`${this.config.supabaseUrl}/rest/v1/gallery?select=*&order=id.desc`, {
          headers: {
            'apikey': this.config.supabaseKey,
            'Authorization': `Bearer ${this.getAccessToken()}`
          }
        });
        if (res.ok) {
          const cloudData = await res.json();
          if (Array.isArray(cloudData)) {
            localStorage.setItem('aiswaryam_gallery', JSON.stringify(cloudData));
            return cloudData;
          }
        }
      } catch (err) {
        console.warn('[CloudDB] Fallback to local gallery:', err);
      }
    }

    const local = localStorage.getItem('aiswaryam_gallery');
    if (!local) return DEFAULT_GALLERY;
    try {
      const parsed = JSON.parse(local);
      // If legacy gallery has dummy SVG items, replace with authentic studio assets
      const hasOldSvgs = Array.isArray(parsed) && parsed.some(item => item.img && item.img.includes('event') && item.img.endsWith('.svg'));
      if (hasOldSvgs || !parsed.length) {
        localStorage.setItem('aiswaryam_gallery', JSON.stringify(DEFAULT_GALLERY));
        return DEFAULT_GALLERY;
      }
      return parsed;
    } catch (e) {
      return DEFAULT_GALLERY;
    }
  }

  async saveGalleryItem(photoObj) {
    if (this.config.syncEnabled && this.config.provider === 'supabase' && this.config.supabaseUrl) {
      const response = await fetch(`${this.config.supabaseUrl}/rest/v1/gallery`, {
        method: 'POST',
        headers: this.getAuthHeaders({ 'Content-Type': 'application/json', Prefer: 'return=minimal' }),
        body: JSON.stringify(photoObj)
      });
      await this.ensureOk(response, 'Save gallery item');
      return this.fetchGallery();
    }
    const current = await this.fetchGallery();
    current.unshift(photoObj);
    localStorage.setItem('aiswaryam_gallery', JSON.stringify(current));
    return current;
  }

  async deleteGalleryItem(id) {
    if (this.config.syncEnabled && this.config.provider === 'supabase' && this.config.supabaseUrl) {
      const response = await fetch(`${this.config.supabaseUrl}/rest/v1/gallery?id=eq.${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });
      await this.ensureOk(response, 'Delete gallery item');
      return this.fetchGallery();
    }
    const current = (await this.fetchGallery()).filter(item => item.id !== id);
    localStorage.setItem('aiswaryam_gallery', JSON.stringify(current));
    return current;
  }

  // 3. COMPLETE DATABASE EXPORT & BACKUP
  exportFullBackup() {
    const backup = {
      exportDate: new Date().toISOString(),
      centre: 'Yoga Studio Batticaloa',
      events: JSON.parse(localStorage.getItem('aiswaryam_events') || '[]'),
      gallery: JSON.parse(localStorage.getItem('aiswaryam_gallery') || '[]'),
      memberships: JSON.parse(localStorage.getItem('aiswaryam_memberships') || '[]'),
      bookings: JSON.parse(localStorage.getItem('aiswaryam_bookings') || '[]'),
      notice: localStorage.getItem('aiswaryam_top_notice') || ''
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backup, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `YogaStudio_Batticaloa_Backup_${new Date().toISOString().slice(0,10)}.json`);
    dlAnchorElem.click();
  }

  // 4. RESTORE DATABASE FROM JSON BACKUP
  importFullBackup(jsonContent) {
    try {
      const data = JSON.parse(jsonContent);
      if (data.events) localStorage.setItem('aiswaryam_events', JSON.stringify(data.events));
      if (data.gallery) localStorage.setItem('aiswaryam_gallery', JSON.stringify(data.gallery));
      if (data.memberships) localStorage.setItem('aiswaryam_memberships', JSON.stringify(data.memberships));
      if (data.bookings) localStorage.setItem('aiswaryam_bookings', JSON.stringify(data.bookings));
      if (data.notice) localStorage.setItem('aiswaryam_top_notice', data.notice);
      return true;
    } catch (e) {
      console.error('Invalid backup file', e);
      return false;
    }
  }
}

// Global Singleton Instance
window.cloudDB = new YogaCloudDB();
