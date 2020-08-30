const form = document.getElementById('form');

form.addEventListener('submit', (e) => {
  setTimeout(() => {
    form.innerHTML = '';

    const html = `
    <div class='text-center'>
    <h1 class='contact-title'>Wiadomość wysłano</h1>
    <i class="far fa-check-circle contact-title contact-icon"></i>
    </div>
    
    `;

    form.insertAdjacentHTML('beforeend', html);
  }, 400);
});
