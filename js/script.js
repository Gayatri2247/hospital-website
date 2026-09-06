const sections = document.querySelectorAll('.section');

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });

sections.forEach((section) => {
  section.style.opacity = '0';
  section.style.transform = 'translateY(20px)';
  section.style.transition = 'opacity .6s ease, transform .6s ease';
  observer.observe(section);
});

const nav = document.querySelector('.nav-container');
const navLinks = document.querySelector('.nav-links');

if (nav && navLinks) {
  const menuButton = document.createElement('button');
  menuButton.className = 'menu-toggle';
  menuButton.type = 'button';
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-controls', 'primary-navigation');
  menuButton.textContent = 'Menu';
  navLinks.id = 'primary-navigation';
  nav.insertBefore(menuButton, navLinks);

  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  navLinks.querySelectorAll('a').forEach((link) => {
    if (link.getAttribute('href') === currentPage) link.setAttribute('aria-current', 'page');
  });

  menuButton.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('is-open');
    menuButton.setAttribute('aria-expanded', String(isOpen));
    menuButton.textContent = isOpen ? 'Close' : 'Menu';
  });

  navLinks.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('is-open');
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.textContent = 'Menu';
    });
  });
}

const appointmentForm = document.querySelector('#appointment-form');
const formStatus = document.querySelector('#form-status');

if (appointmentForm && formStatus) {
  appointmentForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!appointmentForm.checkValidity()) {
      appointmentForm.reportValidity();
      return;
    }
    formStatus.textContent = 'Thank you. Please call the hospital during working hours to confirm your appointment request.';
    appointmentForm.reset();
  });
}

const bookingModal = document.querySelector('#booking-modal');
const bookingSteps = bookingModal ? bookingModal.querySelectorAll('.booking-step') : [];
const bookingDots = bookingModal ? bookingModal.querySelectorAll('[data-step-dot]') : [];
const bookingDoctor = document.querySelector('#booking-doctor');
const bookingService = document.querySelector('#booking-service');
const bookingDate = document.querySelector('#booking-date');
const bookingWhatsApp = document.querySelector('[data-whatsapp-link]');
let activeBookingStep = 1;
let lastFocusedElement = null;

if (bookingDate) {
  bookingDate.min = new Date().toISOString().split('T')[0];
}

const showBookingStep = (step) => {
  activeBookingStep = step;
  bookingSteps.forEach((section) => {
    const isVisible = section.dataset.step === String(step);
    section.hidden = !isVisible;
    section.classList.toggle('is-active', isVisible);
  });
  bookingDots.forEach((dot) => dot.classList.toggle('is-active', Number(dot.dataset.stepDot) <= step));
};

const openBooking = (doctorName = '') => {
  if (!bookingModal) return;
  lastFocusedElement = document.activeElement;
  bookingModal.hidden = false;
  document.body.style.overflow = 'hidden';
  showBookingStep(1);
  if (doctorName && bookingDoctor) bookingDoctor.value = doctorName;
  bookingModal.querySelector('.modal-close').focus();
};

const closeBooking = () => {
  if (!bookingModal) return;
  bookingModal.hidden = true;
  document.body.style.overflow = '';
  if (lastFocusedElement) lastFocusedElement.focus();
};

document.querySelectorAll('[data-open-booking]').forEach((button) => {
  button.addEventListener('click', () => openBooking(button.dataset.doctor || ''));
});

if (bookingModal) {
  bookingModal.querySelectorAll('[data-close-booking]').forEach((button) => button.addEventListener('click', closeBooking));
  bookingModal.addEventListener('click', (event) => {
    if (event.target === bookingModal) closeBooking();
  });
  bookingModal.querySelectorAll('[data-next-step]').forEach((button) => {
    button.addEventListener('click', () => {
      const nextStep = Number(button.dataset.nextStep);
      if (activeBookingStep === 1 && (!bookingService.checkValidity() || !bookingDoctor.checkValidity())) {
        if (!bookingService.checkValidity()) bookingService.reportValidity();
        else bookingDoctor.reportValidity();
        return;
      }
      if (activeBookingStep === 2 && (!bookingModal.querySelector('input[name="booking-slot"]:checked') || !bookingDate.checkValidity())) {
        if (!bookingModal.querySelector('input[name="booking-slot"]:checked')) bookingModal.querySelector('input[name="booking-slot"]').reportValidity();
        else bookingDate.reportValidity();
        return;
      }
      showBookingStep(nextStep);
      bookingModal.querySelector(`[data-step="${nextStep}"] input, [data-step="${nextStep}"] textarea, [data-step="${nextStep}"] select`)?.focus();
    });
  });
  bookingModal.querySelectorAll('[data-previous-step]').forEach((button) => button.addEventListener('click', () => showBookingStep(Number(button.dataset.previousStep))));
  bookingModal.querySelector('[data-submit-booking]').addEventListener('click', () => {
    const requiredFields = bookingModal.querySelectorAll('[data-step="3"] [required]');
    const isValid = [...requiredFields].every((field) => field.checkValidity());
    if (!isValid) {
      requiredFields[0].reportValidity();
      return;
    }
    const selectedSlot = bookingModal.querySelector('input[name="booking-slot"]:checked').value;
    const summary = `Thank you. We received your ${bookingService.value} request for ${bookingDoctor.value} on ${bookingDate.value} during the ${selectedSlot.toLowerCase()} window. Please call +91 99130 87092 to confirm.`;
    document.querySelector('#booking-summary').textContent = summary;
    if (bookingWhatsApp) {
      const message = `Appointment request for ${bookingService.value} with ${bookingDoctor.value} on ${bookingDate.value}, ${selectedSlot}. I would like help with: ${document.querySelector('#booking-symptoms').value}`;
      bookingWhatsApp.href = `https://wa.me/919898073213?text=${encodeURIComponent(message)}`;
    }
    showBookingStep('success');
  });
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && bookingModal && !bookingModal.hidden) closeBooking();
});

const clinicStatus = document.querySelector('[data-clinic-status]');
const statusDot = document.querySelector('.status-dot');

if (clinicStatus && statusDot) {
  const now = new Date();
  const day = now.getDay();
  const minutes = now.getHours() * 60 + now.getMinutes();
  const openWindows = day === 0 ? [[600, 720]] : [[570, 720], [1050, 1200]];
  const isOpen = openWindows.some(([start, end]) => minutes >= start && minutes < end);
  clinicStatus.textContent = isOpen ? 'Open now' : 'Currently closed';
  statusDot.classList.toggle('is-open', isOpen);
}