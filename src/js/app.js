
let movies = [];
let series = [];

fetch('src/db/db.json')
  .then(response => response.json())
  .then(data => {
    movies = data.movies;
    series = data.series;

    if (document.getElementById('divcarousel')) generateFeatureCarousel();
    if (document.getElementById('divimagescarousel1')) generateMoviesPosters();
    if (document.getElementById('divimagescarousel2')) generateSeriesPoster();
    if (document.getElementById('content')) loadContentDetails();
  });

// ==== GERAÇÃO DE POSTS DE FILMES, SÉRIES E CARROSSEL ====

function generateMoviesPosters() {
    const imagescarousel = document.getElementById('divimagescarousel1');
    for (let i = 0; i < 8; i++) {
        const { poster, title, year } = movies[i];
        imagescarousel.innerHTML += `
            <div class="card m-2" style="width: 25rem;">
                <a href="detalhe.html?id=${i + 1}">
                    <img src="${poster}" class="card-img-top" alt="${title}">
                </a>
                <div class="card-body">
                    <h5 class="card-title">${title}</h5>
                    <p class="card-text">${year}</p>
                </div>
            </div>`;
    }
}

function generateSeriesPoster() {
    const imagescarousel = document.getElementById('divimagescarousel2');
    for (let i = 0; i < 8; i++) {
        const { poster, title, year } = series[i];
        imagescarousel.innerHTML += `
            <div class="card m-2" style="width: 25rem;">
                <a href="detalhe.html?id=${i + 11}">
                    <img src="${poster}" class="card-img-top" alt="${title}">
                </a>
                <div class="card-body">
                    <h5 class="card-title">${title}</h5>
                    <p class="card-text">${year}</p>
                </div>
            </div>`;
    }
}

function generateFeatureCarousel() {
    const carousel = document.getElementById('divcarousel');
    let usedIndices = [];

    for (let i = 0; i < 3; i++) {
        let randomIndex;
        do {
            randomIndex = Math.floor(Math.random() * movies.length);
        } while (usedIndices.includes(randomIndex));

        usedIndices.push(randomIndex);

        const { title, year, rating, trailer } = movies[randomIndex];
        carousel.innerHTML += `
            <a href="detalhe.html?id=${randomIndex + 1}">
                <div class="carousel-item ${i === 0 ? 'active' : ''}">
                    <iframe id="movietrailer" class="video" width="1280" height="720"
                        src="${trailer}" frameborder="0" allowfullscreen tabindex="0"></iframe>
                    <div class="carousel-caption d-none d-md-block">
                        <h2>${title} (${year})</h2>
                        <p>Rating:  ${rating}</p>
                    </div>
                </div>
            </a>`;
    }
}

// ==== DETALHES INDIVIDUAIS DE FILMES E SÉRIES ====

function generateGenres(content) {
    const genres = document.getElementById('genres');
    if (!genres || !content.genre) return;

    genres.innerHTML = '';
    content.genre.forEach(genre => {
        const genreTag = document.createElement('span');
        genreTag.className = 'genre-tag';
        genreTag.textContent = genre;
        genres.appendChild(genreTag);
    });
}

function loadContentDetails() {
    const params = new URLSearchParams(location.search);
    const id = parseInt(params.get("id"));
    if (!id) {
        showNotFound();
        return;
    }

    let content, contentType;

    if (id <= 10) {
        content = movies.find(movie => movie.id === id);
        contentType = 'movie';
    } else {
        content = series.find(serie => serie.id === id);
        contentType = 'series';
    }

    if (!content) {
        showNotFound();
        return;
    }

    displayContent(content, contentType);
    generateGenres(content);

    document.title = `${content.title} - My Movie List`;

    const poster = document.querySelector('.poster');
    if (poster) {
        const badge = document.createElement('div');
        badge.className = `content-badge ${contentType}`;
        badge.textContent = contentType === 'movie' ? 'MOVIE' : 'TV SERIES';
        poster.appendChild(badge);
    }
}

function displayContent(content, contentType) {
    const container = document.getElementById('content');

    const {
        title, year, rating, synopsis, poster, trailer,
        language, country, images
    } = content;

    const infoExtra = contentType === 'movie'
        ? `<span class="divider">•</span><span>${content.duration} min</span>`
        : `<span class="divider">•</span><span>${content.seasons} Seasons</span><span class="divider">•</span><span>${content.episodes} Episodes</span>`;

    const creatorInfo = contentType === 'movie'
        ? `<div><div class="info-label">Director</div><div>${content.director}</div></div>`
        : `<div><div class="info-label">Creator</div><div>${content.creator}</div></div>`;

    container.innerHTML = `
        <div class="top-section">
            <div class="poster">
                <img src="${poster}" alt="${title} poster">
            </div>
            <div id="contentCarousel" class="carousel slide" data-bs-ride="carousel">
                <div class="carousel-inner">
                    <div class="carousel-item active">
                        <div class="trailer-container">
                            <iframe src="${trailer}" allowfullscreen></iframe>
                        </div>
                    </div>
                    ${images.map(image => `
                        <div class="carousel-item">
                            <img src="${image}" class="d-block w-100" alt="Movie still">
                        </div>`).join('')}
                </div>
                <button class="carousel-control-prev" type="button" data-bs-target="#contentCarousel" data-bs-slide="prev">
                    <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                    <span class="visually-hidden">Previous</span>
                </button>
                <button class="carousel-control-next" type="button" data-bs-target="#contentCarousel" data-bs-slide="next">
                    <span class="carousel-control-next-icon" aria-hidden="true"></span>
                    <span class="visually-hidden">Next</span>
                </button>
            </div>
        </div>

        <div class="content-wrapper">
            <div class="content-details">
                <div class="left-content">
                    <div>
                        <h1 class="content-title">${title}</h1>
                        <div class="content-meta">
                            <span>${year}</span>
                            <span class="divider">•</span>
                            <span>${language}</span>
                            ${infoExtra}
                        </div>
                    </div>

                    <div>
                        <div class="rating">
                            <span class="rating-value">${rating}</span>
                            <span class="rating-max">/10</span>
                        </div>
                        <div id="genres" class="genres"></div>
                    </div>
                </div>

                <div class="right-content">
                    <div>
                        <h2 class="section-title">Synopsis</h2>
                        <p class="synopsis">${synopsis}</p>
                    </div>

                    <div class="additional-info">
                        ${creatorInfo}
                        <div>
                            <div class="info-label">Country</div>
                            <div>${country}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
}

function showNotFound() {
    const container = document.getElementById('content');
    container.innerHTML = `
        <div class="not-found">
            <h1>Content Not Found</h1>
            <p>Sorry, we couldn't find the movie or series you're looking for.</p>
            <a href="index.html" class="back-button">Back to Home</a>
        </div>`;
}
