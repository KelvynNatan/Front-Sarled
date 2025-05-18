document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll('.avaliacao-estrelas').forEach(container => {
    const estrelas = container.querySelectorAll('.estrela');
    const texto = container.nextElementSibling;

    estrelas.forEach((estrela, index) => {
      estrela.addEventListener('click', () => {
        estrelas.forEach((s, i) => {
          s.classList.toggle('selecionada', i <= index);
        });
        const nota = index + 1;
        texto.textContent = `Você avaliou com ${nota} estrela${nota > 1 ? 's' : ''}.`;
      });

      estrela.addEventListener('mouseover', () => {
        estrelas.forEach((s, i) => {
          s.style.color = i <= index ? 'gold' : '#444';
        });
      });

      estrela.addEventListener('mouseout', () => {
        estrelas.forEach((s) => {
          s.style.color = s.classList.contains('selecionada') ? 'gold' : '#444';
        });
      });
    });
  });
});
