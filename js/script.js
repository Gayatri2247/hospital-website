const sections = document.querySelectorAll(".section");

const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if(e.isIntersecting){
      e.target.style.opacity = 1;
      e.target.style.transform = "translateY(0)";
    }
  });
});

sections.forEach(s => {
  s.style.opacity = 0;
  s.style.transform = "translateY(20px)";
  s.style.transition = "0.6s ease";
  observer.observe(s);
});