/**
 * Contact enquiries are handed to WhatsApp explicitly.
 * The form never claims that a message was delivered until the visitor sends it.
 */
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contactInquiryForm');
  if (!form) return;

  const status = document.getElementById('contactInquiryStatus');
  const fallbackLink = document.getElementById('contactWhatsAppFallback');

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = form.querySelector('input[type="text"]')?.value.trim() || '';
    const phone = form.querySelector('input[type="tel"]')?.value.trim() || '';
    const branch = form.querySelector('select')?.value || '';
    const message = form.querySelector('textarea')?.value.trim() || '';

    if (name.length < 2 || phone.length < 7 || message.length < 3) {
      if (status) status.textContent = 'தயவுசெய்து சரியான பெயர், தொலைபேசி எண் மற்றும் செய்தியை உள்ளிடவும்.';
      return;
    }

    const text = [
      'வணக்கம் ஸ்ரீ ஐஸ்வர்யம் யோகா கலையகம் 🙏',
      '',
      'இணையதள விசாரணை',
      'பெயர்: ' + name,
      'தொலைபேசி: ' + phone,
      'விருப்பமான கிளை: ' + branch,
      'செய்தி: ' + message
    ].join('\n');
    const url = 'https://wa.me/94776064846?text=' + encodeURIComponent(text);

    if (fallbackLink) {
      fallbackLink.href = url;
      fallbackLink.hidden = false;
    }
    if (status) status.textContent = 'உங்கள் செய்தி WhatsApp-ல் தயார். திறக்கும் சாளரத்தில் Send அழுத்தினால் மட்டுமே செய்தி அனுப்பப்படும்.';
    window.open(url, '_blank', 'noopener,noreferrer');
    if (status) {
      status.textContent += ' WhatsApp திறக்கவில்லை என்றால் கீழே உள்ள இணைப்பைத் தேர்ந்தெடுக்கவும்.';
    }
  });
});
