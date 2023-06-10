let formTicker = document.querySelector('.js-ticker-search');
let formName = document.querySelector('.js-name-search');
let tickerInput = document.querySelector('[name=ticker]');
let nameInput = document.querySelector('[name=company-name');
let quoteContainer = document.querySelector('.js-quote-container');
let searchResultContainer = document.querySelector('.js-name-response')
let newsContainer = document.querySelector('.js-news-container');

function getNewsImageHTML(news) {
    if (typeof news.image === 'string') {
        return `<img src="${news.image}" alt="${news.title}" class="news-img col-12 col-md-6 col-lg-4" />`;
    }
    return '';
}

function displayNews(news) {
    let html = '';
    for (let article of news) {
        html += `
            <div class="d-flex">
            <section class="news-item my-3">
            <h3>${article.title}</h3>
            <p class="news-date">${article.date}</p>
            ${getNewsImageHTML(article)}
            ${article.content}
            </section>
            </div>
        `;
    }
    newsContainer.innerHTML = html;
}

function displayErrorMessage() {
    let html = '<p class="error-msg">Content not available. Please try again later.</p>'
    quoteContainer.innerHTML = html;
}

function renderNews(response) {
    const news = response.content;

    if (typeof news === 'undefined') {
        displayErrorMessage();
    } else {
        displayNews(news);
    }
}

function queryNews() {
    const url = `https://financialmodelingprep.com/api/v3/fmp/articles?page=0&size=8&apikey=${apiKey}`

    fetch(url)
        .then((data) => data.json())
        .then(renderNews);
}

formTicker.addEventListener('submit', tickerSubmitted);
formName.addEventListener('submit', nameSubmitted);