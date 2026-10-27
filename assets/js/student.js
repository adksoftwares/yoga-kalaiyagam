/**
 * ஸ்ரீ ஐஸ்வர்யம் யோகா கலையகம் - மாணவர் உள்நுழைவு & போர்ட்டல்
 * Aiswaryam Yoga - Student Portal Script
 */

document.addEventListener('DOMContentLoaded', () => {
  initStudentPortal();
});

const DEMO_STUDENT = {
  id: 'AY-101',
  name: 'குமாரவேல் சுதாகரன் (K. Sudhakaran)',
  phone: '0776064846',
  email: 'sudhakaran@example.com',
  course: 'ஹட யோகா & சூரிய நமஸ்கார வகுப்பு',
  batch: 'காலை தொகுதி 1: 05:30 AM - 06:30 AM',
  branch: 'No: 16, Loyds Avenue Road, Batticaloa',
  guru: 'எஸ். ஸ்ரீதரன் (B.Sc) & ஏ. ஜெயஹரன் (B.Ed)',
  joinedDate: '2026-01-10',
  validUntil: '2026-12-31',
  attendanceStreak: '28 நாட்கள் (Days)',
  bloodGroup: 'O+ve',
  status: 'செயலில் உள்ள உறுப்பினர் (Active Member)'
};

function initStudentPortal() {
  const loginForm = document.getElementById('studentLoginForm');
  const authSection = document.getElementById('studentAuthSection');
  const portalSection = document.getElementById('studentDashboardSection');
  const logoutBtn = document.getElementById('studentLogoutBtn');

  // Check existing session
  const currentStudent = JSON.parse(sessionStorage.getItem('aiswaryam_current_student'));

  if (currentStudent && authSection && portalSection) {
    authSection.style.display = 'none';
    portalSection.style.display = 'block';
    populateStudentData(currentStudent);
  }

  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const studentId = document.getElementById('studentIdInput').value.trim();
      const studentPhone = document.getElementById('studentPhoneInput').value.trim();

      // Check registered members from localStorage
      const registeredMembers = JSON.parse(localStorage.getItem('aiswaryam_memberships') || '[]');
      let matchedStudent = registeredMembers.find(m => 
        (m.regId && m.regId.toLowerCase() === studentId.toLowerCase()) || 
        (m.phone && m.phone === studentPhone)
      );

      // Or match demo student
      if (!matchedStudent && (studentId === 'AY-101' || studentPhone === '0776064846' || studentPhone === '0776047081')) {
        matchedStudent = DEMO_STUDENT;
      }

      if (matchedStudent) {
        // Normalize fields if from registration
        const studentProfile = {
          id: matchedStudent.regId || matchedStudent.id || 'AY-101',
          name: matchedStudent.fullName || matchedStudent.name || 'யோகா மாணவர்',
          phone: matchedStudent.phone || studentPhone,
          course: matchedStudent.selectedPlan || matchedStudent.course || 'ஹட யோகா & பிராணாயாமம்',
          batch: matchedStudent.batch || 'காலை தொகுதி: 06:00 AM - 07:00 AM',
          branch: 'No: 16, Loyds Avenue Road, Batticaloa',
          guru: 'எஸ். ஸ்ரீதரன் (B.Sc) & ஏ. ஜெயஹரன் (B.Ed)',
          attendanceStreak: '14 நாட்கள்',
          status: 'செயலில் உள்ள உறுப்பினர் (Active)'
        };

        sessionStorage.setItem('aiswaryam_current_student', JSON.stringify(studentProfile));
        authSection.style.display = 'none';
        portalSection.style.display = 'block';
        populateStudentData(studentProfile);
        if (window.AiswaryamYoga) window.AiswaryamYoga.showToast('வணக்கம்! மாணவர் போர்ட்டலுக்கு நல்வரவு 🙏');
      } else {
        alert('மாணவர் விபரம் காணப்படவில்லை! மாதிரி ஐடி (Demo ID): AY-101 அல்லது தொலைபேசி: 0776064846 பயன்படுத்தலாம்.');
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      sessionStorage.removeItem('aiswaryam_current_student');
      window.location.reload();
    });
  }
}

function populateStudentData(student) {
  // Fill profile fields
  const elName = document.getElementById('spStudentName');
  const elId = document.getElementById('spStudentId');
  const elCourse = document.getElementById('spStudentCourse');
  const elBatch = document.getElementById('spStudentBatch');
  const elBranch = document.getElementById('spStudentBranch');
  const elStreak = document.getElementById('spStudentStreak');
  const elStatus = document.getElementById('spStudentStatus');

  if (elName) elName.textContent = student.name;
  if (elId) elId.textContent = student.id;
  if (elCourse) elCourse.textContent = student.course;
  if (elBatch) elBatch.textContent = student.batch;
  if (elBranch) elBranch.textContent = student.branch;
  if (elStreak) elStreak.textContent = student.attendanceStreak || '12 நாட்கள்';
  if (elStatus) elStatus.textContent = student.status || 'Active Member';

  // Digital ID card elements
  const idName = document.getElementById('idCardName');
  const idNum = document.getElementById('idCardNumber');
  const idBatch = document.getElementById('idCardBatch');
  const idBranch = document.getElementById('idCardBranch');

  if (idName) idName.textContent = student.name;
  if (idNum) idNum.textContent = student.id;
  if (idBatch) idBatch.textContent = student.batch;
  if (idBranch) idBranch.textContent = student.branch;
}

window.printStudentIDCard = function() {
  window.print();
};
