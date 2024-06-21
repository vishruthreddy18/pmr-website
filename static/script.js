let publications = [];
let sortedPublications = [];
let currentPage = 1;
let itemsPerPage = 5;
const defaultSortCriteria = 'popular'; // Set default sort criteria to 'popular'
const publicationsList = document.getElementById('publications-list');
const sortLinks = document.querySelectorAll('.sort-options a');
const itemsPerPageLinks = document.querySelectorAll('.items-per-page a');
const prevPageBtns = document.querySelectorAll('#prev-page');
const nextPageBtns = document.querySelectorAll('#next-page');
const firstPageBtns = document.querySelectorAll('#first-page');
const lastPageBtns = document.querySelectorAll('#last-page');
const backToTopBtn = document.getElementById('back-to-top');

document.addEventListener('DOMContentLoaded', function() {
  fetchPublications();
  sortLinks.forEach(link => link.addEventListener('click', updateSortCriteria));
  itemsPerPageLinks.forEach(link => link.addEventListener('click', updateItemsPerPage));
  prevPageBtns.forEach(btn => btn.addEventListener('click', () => changePage(-1)));
  nextPageBtns.forEach(btn => btn.addEventListener('click', () => changePage(1)));
  firstPageBtns.forEach(btn => btn.addEventListener('click', () => goToPage(1)));
  lastPageBtns.forEach(btn => btn.addEventListener('click', () => goToPage(Math.ceil(sortedPublications.length / itemsPerPage))));
  window.addEventListener('scroll', handleScroll);
  backToTopBtn.addEventListener('click', scrollToTop);
});

async function fetchPublications() {
  const response = await fetch('/fetch-publications?author=Brad Dicianno');
  const data = await response.json();
  console.log('Fetched data:', data);

  publications = data.map(pub => ({
    title: pub.title || 'No title',
    year: pub.year || 'Unknown',
    citations: typeof pub.citations === 'number' ? pub.citations : parseInt(pub.citations) || 'Unknown',
    link: pub.link || '#'
  }));

  console.log('Processed publications:', publications);
  sortAndDisplay(defaultSortCriteria); // Default to 'popular' sort criteria
}

function updateSortCriteria(event) {
  event.preventDefault();
  const sortCriteria = event.target.getAttribute('data-sort');
  sortLinks.forEach(link => link.classList.remove('active'));
  event.target.classList.add('active');
  sortAndDisplay(sortCriteria);
}

function sortAndDisplay(criteria) {
  sortedPublications = sortPublications(publications, criteria);
  currentPage = 1;
  displayPublications();
}

function displayPublications() {
  const paginatedPublications = paginatePublications(sortedPublications, currentPage, itemsPerPage);
  publicationsList.innerHTML = '';
  paginatedPublications.forEach(pub => {
    console.log('Displaying publication:', pub);
    const li = document.createElement('li');
    li.innerHTML = `
      <strong>Title:</strong> <a href="${pub.link}" target="_blank">${pub.title}</a><br>
      <strong>Year:</strong> ${pub.year}<br>
      <strong>Citations:</strong> ${pub.citations}
    `;
    publicationsList.appendChild(li);
  });
  updatePaginationControls();
}

function sortPublications(publications, criteria) {
  const publicationsCopy = [...publications];
  if (criteria === 'latest') {
    return publicationsCopy.sort((a, b) => {
      if (a.year === 'Unknown') return 1;
      if (b.year === 'Unknown') return -1;
      return b.year - a.year;
    });
  } else if (criteria === 'oldest') {
    return publicationsCopy.sort((a, b) => {
      if (a.year === 'Unknown') return 1;
      if (b.year === 'Unknown') return -1;
      return a.year - b.year;
    });
  } else if (criteria === 'popular') {
    return publicationsCopy.sort((a, b) => {
      if (a.citations === 'Unknown') return 1;
      if (b.citations === 'Unknown') return -1;
      return b.citations - a.citations;
    });
  }
  return publicationsCopy;
}

function paginatePublications(publications, page, itemsPerPage) {
  const start = (page - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return publications.slice(start, end);
}

function updateItemsPerPage(event) {
  event.preventDefault();
  itemsPerPage = parseInt(event.target.getAttribute('data-items'));
  currentPage = 1;
  itemsPerPageLinks.forEach(link => link.classList.remove('active'));
  event.target.classList.add('active');
  displayPublications();
}

function changePage(direction) {
  const totalPages = Math.ceil(sortedPublications.length / itemsPerPage);
  currentPage = Math.min(Math.max(1, currentPage + direction), totalPages);
  displayPublications();
}

function goToPage(page) {
  currentPage = page;
  displayPublications();
}

function updatePaginationControls() {
  const totalPages = Math.ceil(sortedPublications.length / itemsPerPage);
  const pageInfoText = `Page ${currentPage} of ${totalPages}`;

  document.querySelectorAll('#page-info').forEach(span => {
    span.textContent = pageInfoText;
  });

  if (currentPage === 1) {
    firstPageBtns.forEach(btn => btn.classList.add('disabled'));
    prevPageBtns.forEach(btn => btn.classList.add('disabled'));
  } else {
    firstPageBtns.forEach(btn => btn.classList.remove('disabled'));
    prevPageBtns.forEach(btn => btn.classList.remove('disabled'));
  }

  if (currentPage === totalPages) {
    nextPageBtns.forEach(btn => btn.classList.add('disabled'));
    lastPageBtns.forEach(btn => btn.classList.add('disabled'));
  } else {
    nextPageBtns.forEach(btn => btn.classList.remove('disabled'));
    lastPageBtns.forEach(btn => btn.classList.remove('disabled'));
  }
}

function handleScroll() {
  if (window.pageYOffset > 300) {
    backToTopBtn.style.display = 'block';
  } else {
    backToTopBtn.style.display = 'none';
  }
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
