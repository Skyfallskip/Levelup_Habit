document.addEventListener('DOMContentLoaded', () => {
  const habitList = document.getElementById('habitList');

  habitList.addEventListener('click', (e) => {
    if (e.target.classList.contains('habit')) {
      e.target.classList.toggle('done');
    }
  });
});