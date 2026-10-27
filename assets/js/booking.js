/**
 * ஸ்ரீ ஐஸ்வர்யம் யோகா கலையகம் - ஆன்லைன் முன்பதிவு முறைமை
 * Aiswaryam Yoga - Online Booking & Slot System
 */

document.addEventListener('DOMContentLoaded', () => {
  initBookingSystem();
});

function initBookingSystem() {
  const form = document.getElementById('onlineBookingForm');
  const slotPills = document.querySelectorAll('.slot-pill');
  const slotInput = document.getElementById('selectedSlotInput');
  const passModal = document.getElementById('bookingPassModal');
  const closePassBtn = document.getElementById('closePassBtn');
  const defaultSlot = document.querySelector('.slot-pill[data-slot]');
  if (defaultSlot) defaultSlot.classList.add('active');

  // Slot Pill Selection
  slotPills.forEach(pill => {
    pill.addEventListener('click', () => {
      slotPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      if (slotInput) {
        slotInput.value = pill.getAttribute('data-slot');
      }
    });
  });

  if (form) {
    // Set default date to tomorrow
    const dateInput = document.getElementById('bookDate');
    if (dateInput) {
      const localDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };
      const today = new Date();
      const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
      dateInput.value = localDate(tomorrow);
      dateInput.min = localDate(today);
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = document.getElementById('bookName').value.trim();
      const phone = document.getElementById('bookPhone').value.trim();
      const sessionType = document.getElementById('bookSession').value;
      const date = document.getElementById('bookDate').value;
      const slot = slotInput ? slotInput.value : 'காலை 06:00 AM - 07:00 AM';
      const branch = document.getElementById('bookBranch').value;
      const notes = document.getElementById('bookNotes') ? document.getElementById('bookNotes').value.trim() : '';

      if (!name || !phone || !date) {
        alert('தயவுசெய்து அனைத்து கட்டாய விபரங்களையும் நிரப்பவும்.');
        return;
      }

      const bookId = 'BKG-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).slice(2, 7).toUpperCase();
      const bookingData = {
        bookId,
        name,
        phone,
        sessionType,
        date,
        slot,
        branch,
        notes: notes || 'இல்லை',
        createdDate: new Date().toLocaleDateString()
      };

      // Persist centrally when configured. A request is not a confirmed reservation.
      let persisted = false;
      try {
        if (window.cloudDB) {
          const result = await window.cloudDB.submitBooking(bookingData);
          persisted = Boolean(result && result.persisted);
        }
      } catch (error) {
        alert('முன்பதிவு கோரிக்கையைச் சேமிக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும் அல்லது WhatsApp வழியாகத் தொடர்புகொள்ளவும்.');
        console.error('[Booking] Submission failed:', error);
        return;
      }

      bookingData.status = persisted ? 'Pending confirmation' : 'Draft — send via WhatsApp';
      showBookingPass(bookingData);

      if (window.AiswaryamYoga && window.AiswaryamYoga.showToast) {
        window.AiswaryamYoga.showToast(persisted
          ? 'முன்பதிவு கோரிக்கை பெறப்பட்டது. நேரம் நிர்வாகியால் உறுதிப்படுத்தப்படும்.'
          : 'கோரிக்கை தயார். உறுதிப்படுத்த WhatsApp பொத்தானைத் தேர்ந்தெடுக்கவும்.');
      }
    });
  }

  function showBookingPass(data) {
    if (!passModal) return;

    document.getElementById('passBookId').textContent = data.bookId;
    document.getElementById('passName').textContent = data.name;
    document.getElementById('passPhone').textContent = data.phone;
    document.getElementById('passSession').textContent = data.sessionType;
    document.getElementById('passDateTime').textContent = `${data.date} | ${data.slot}`;
    document.getElementById('passBranch').textContent = data.branch;

    // Build WhatsApp direct message link
    const waText = encodeURIComponent(
      `வணக்கம் யோகா கலையகம் (Yoga Studio Batticaloa) 🙏\n\n` +
      `நான் இணையவழியாக வகுப்பிற்கு முன்பதிவு செய்துள்ளேன்.\n\n` +
      `🎟️ முன்பதிவு எண்: ${data.bookId}\n` +
      `👤 பெயர்: ${data.name}\n` +
      `📱 தொலைபேசி: ${data.phone}\n` +
      `🧘 அமர்வு: ${data.sessionType}\n` +
      `📅 தேதி & நேரம்: ${data.date} | ${data.slot}\n` +
      `📍 கிளை: ${data.branch}\n\n` +
      `தயவுசெய்து எனது வருகையை உறுதிப்படுத்தவும். நன்றி!`
    );

    const waBtn = document.getElementById('passWaBtn');
    if (waBtn) {
      // Sri Lankan WhatsApp Number
      waBtn.href = `https://wa.me/94776064846?text=${waText}`;
    }

    passModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  if (closePassBtn && passModal) {
    closePassBtn.addEventListener('click', () => {
      passModal.classList.remove('active');
      document.body.style.overflow = '';
      if (form) form.reset();
    });
  }
}
