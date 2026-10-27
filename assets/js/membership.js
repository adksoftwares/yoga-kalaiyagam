/**
 * ஸ்ரீ ஐஸ்வர்யம் யோகா கலையகம் - உறுப்பினர் சேர்க்கை மற்றும் முன்பதிவு
 * Aiswaryam Yoga - Membership Registration & Sri Lankan WhatsApp Booking
 */

document.addEventListener('DOMContentLoaded', () => {
  const regForm = document.getElementById('membershipForm');
  const planCards = document.querySelectorAll('.plan-card');
  const selectedPlanInput = document.getElementById('selectedPlanInput');
  const receiptModal = document.getElementById('receiptModal');
  const closeReceiptBtn = document.getElementById('closeReceiptBtn');
  const printReceiptBtn = document.getElementById('printReceiptBtn');

  // Plan Selection interaction
  planCards.forEach(card => {
    card.addEventListener('click', () => {
      planCards.forEach(c => c.classList.remove('featured'));
      card.classList.add('featured');
      const planName = card.getAttribute('data-plan');
      if (selectedPlanInput) {
        selectedPlanInput.value = planName;
      }
      if (window.AiswaryamYoga && window.AiswaryamYoga.showToast) {
        window.AiswaryamYoga.showToast(`தேர்வு: ${planName}`);
      }
    });
  });

  // Handle Form Submission
  if (regForm) {
    regForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const fullName = document.getElementById('fullName').value.trim();
      const phone = document.getElementById('phone').value.trim();
      const email = document.getElementById('email') ? document.getElementById('email').value.trim() : '';
      const age = document.getElementById('age').value.trim();
      const gender = document.getElementById('gender').value;
      const batch = document.getElementById('batch').value;
      const branch = document.getElementById('branch') ? document.getElementById('branch').value : 'No: 16, Loyds Avenue Road, Batticaloa';
      const address = document.getElementById('address') ? document.getElementById('address').value.trim() : '';
      const selectedPlan = selectedPlanInput ? selectedPlanInput.value : 'மாதாந்திர பொது யோகா';

      // Checkboxes for health conditions
      const healthConditions = [];
      document.querySelectorAll('input[name="health"]:checked').forEach(cb => {
        healthConditions.push(cb.value);
      });
      const healthText = healthConditions.length > 0 ? healthConditions.join(', ') : 'குறிப்பிடப்படவில்லை (Not shared)';

      if (!fullName || !phone || !gender || !batch) {
        alert('தயவுசெய்து அனைத்து கட்டாய விபரங்களையும் நிரப்பவும்.');
        return;
      }

      // Generate a unique Registration ID
      const regId = 'AY-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).slice(2, 7).toUpperCase();
      const regDate = new Date().toLocaleDateString('ta-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      // Prepare Registration Object
      const regData = {
        regId,
        regDate,
        fullName,
        phone,
        email: email || '',
        age: age || '-',
        gender,
        batch,
        branch,
        selectedPlan,
        health: healthText,
        address: address || '-'
      };

      // Send to the central database when configured. Never store health details in localStorage.
      let persisted = false;
      try {
        if (window.cloudDB) {
          const result = await window.cloudDB.submitMembership(regData);
          persisted = Boolean(result && result.persisted);
        }
      } catch (error) {
        alert('சேர்க்கை கோரிக்கையை சேமிக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும் அல்லது WhatsApp வழியாகத் தொடர்புகொள்ளவும்.');
        console.error('[Membership] Submission failed:', error);
        return;
      }

      // Receipt is a request summary, not proof of membership approval.
      regData.status = persisted ? 'Request received — pending approval' : 'Request draft — send via WhatsApp';
      populateReceiptModal(regData);

      if (window.AiswaryamYoga && window.AiswaryamYoga.showToast) {
        window.AiswaryamYoga.showToast(persisted
          ? 'சேர்க்கை கோரிக்கை பெறப்பட்டது; நிர்வாக உறுதிப்படுத்தல் நிலுவையில் உள்ளது.'
          : 'கோரிக்கை தயார். பதிவு அனுப்ப WhatsApp பொத்தானைத் தேர்ந்தெடுக்கவும்.');
      }

      if (window.AiswaryamYoga && window.AiswaryamYoga.playTibetanSingingBowl) {
        window.AiswaryamYoga.playTibetanSingingBowl();
      }
    });
  }

  function populateReceiptModal(data) {
    if (!receiptModal) return;

    document.getElementById('rRegId').textContent = data.regId;
    document.getElementById('rDate').textContent = data.regDate;
    document.getElementById('rName').textContent = data.fullName;
    document.getElementById('rPhone').textContent = data.phone;
    document.getElementById('rBatch').textContent = data.batch;
    document.getElementById('rPlan').textContent = data.selectedPlan;
    document.getElementById('rHealth').textContent = data.health;
    const rBranch = document.getElementById('rBranch');
    if (rBranch) rBranch.textContent = data.branch;

    // Sri Lankan WhatsApp format: +94 77 6064 846
    const cleanPhone = data.phone.replace(/[^0-9]/g, '');
    const waText = encodeURIComponent(
      `வணக்கம் யோகா கலையகம் (Yoga Studio Batticaloa) 🙏\n\n` +
      `நான் புதிய மாணவர் சேர்க்கைக்காக விண்ணப்பித்துள்ளேன்.\n\n` +
      `📋 மாணவர் பதிவு எண்: ${data.regId}\n` +
      `👤 பெயர்: ${data.fullName}\n` +
      `📱 தொலைபேசி: ${data.phone}\n` +
      `🎂 வயது / பாலினம்: ${data.age} / ${data.gender}\n` +
      `🧘 திட்டம்: ${data.selectedPlan}\n` +
      `⏰ நேரம்: ${data.batch}\n` +
      `📍 கிளை: ${data.branch}\n` +
      `🩺 உடல்நிலை: ${data.health}\n\n` +
      `தயவுசெய்து எனது சேர்க்கையை உறுதிப்படுத்தவும். நன்றி!`
    );

    const waBtn = document.getElementById('receiptWaBtn');
    if (waBtn) {
      // Primary Batticaloa WhatsApp number
      waBtn.href = `https://wa.me/94776064846?text=${waText}`;
    }

    receiptModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  if (closeReceiptBtn) {
    closeReceiptBtn.addEventListener('click', () => {
      receiptModal.classList.remove('active');
      document.body.style.overflow = '';
      if (regForm) regForm.reset();
    });
  }

  if (printReceiptBtn) {
    printReceiptBtn.addEventListener('click', () => {
      window.print();
    });
  }
});
