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
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      dateInput.value = tomorrow.toISOString().split('T')[0];
      dateInput.min = new Date().toISOString().split('T')[0];
    }

    form.addEventListener('submit', (e) => {
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

      const bookId = 'BKG-' + Math.floor(1000 + Math.random() * 9000);
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

      // Store in LocalStorage
      const bookings = JSON.parse(localStorage.getItem('aiswaryam_bookings') || '[]');
      bookings.push(bookingData);
      localStorage.setItem('aiswaryam_bookings', JSON.stringify(bookings));

      // Populate Pass Modal
      showBookingPass(bookingData);

      if (window.AiswaryamYoga && window.AiswaryamYoga.showToast) {
        window.AiswaryamYoga.showToast('✅ முன்பதிவு உறுதி செய்யப்பட்டது!');
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
