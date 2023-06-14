let formTicker = document.querySelector('.js-ticker-search');
let formName = document.querySelector('.js-name-search');
let tickerInput = document.querySelector('[name=ticker]');
let nameInput = document.querySelector('[name=company-name');
let quoteContainer = document.querySelector('.js-quote-container');
let searchResultContainer = document.querySelector('.js-name-response');
let newsContainer = document.querySelector('.js-news-container');
let apiKey = '5955f1778e2339968704f8851bec5d87';

function formatMktCap(mktCap) {
    if (mktCap > 999999999999) {
        mktCap = (mktCap / 1e12).toFixed(2) + 'T'; // trillion
    } else if (mktCap > 999999999) {
        mktCap = (mktCap / 1e9).toFixed(2) + 'B'; // billion
    } else if (mktCap > 999999) {
        mktCap = (mktCap / 1e6).toFixed(2) + 'M'; // million
    }
    return mktCap;
}

function getChangeColor(change) {
    return change < 0 ? 'red' : 'green'; 
}

function displayQuote(quoteData) {
    let quote = quoteData[0][0];
    let profile = quoteData[1][0];
    let mktCap = formatMktCap(profile.mktCap);
    let chgAmt = quote.change.toFixed(2);
    let chgPct = quote.changesPercentage.toFixed(2);
    let changeColor = getChangeColor(quote.change);
    let pe = quote.pe === null ? '' : quote.pe;
    
    let html = `
        <h2 class="quote-name">${quote.name}</h2>
            <p class="exchange-ticker">${quote.exchange}: ${quote.symbol}</p>
            <p class="quote-price">${quote.price} 
                <span class="currency">${profile.currency}</span>
            </p>
            <p class="change ${changeColor}">${chgAmt} (${chgPct}%)</p>
            <div class="table-container"><div class="column">
                <table>
                    <tr>
                        <th class="label">Open</th>
                        <td class="value">${quote.open}</td>
                    </tr>
                    <tr>
                        <th class="label">High</th>
                        <td class="value">${quote.dayHigh}</td>
                    </tr>
                    <tr>
                        <th class="label">Low</th>
                        <td class="value">${quote.dayLow}</td>
                    </tr>
                </table>
            </div>
            <div class="column">
                <table>
                    <tr>
                        <th class="label">Mkt cap</th>
                        <td class="value">${mktCap}</td>
                    </tr>
                    <tr>
                        <th class="label">P/E ratio</th>
                        <td class="value">${pe}</td>
                    </tr>
                    <tr>
                        <th class="label">EPS</th>
                        <td class="value">${quote.eps}</td>
                    </tr>
                </table>
            </div>
            <div class="column">
                <table>
                    <tr>
                        <th class="lable">52-wk high</th>
                        <td class="value r-col">${quote.yearHigh}</td>
                    </tr>
                    <tr>
                        <th class="label">52-wk low</th>
                        <td class="value r-col">${quote.yearLow}</td>
                    </tr>
                    <tr>
                        <th class="label">Sector</th>
                        <td class="value r-col">${profile.sector}</td>
                    </tr>
                </table>
            </div>
        </div>
    `;
    quoteContainer.innerHTML = html;
    searchResultContainer.innerHTML = '';
}

function displaySearchResults(searchResults) {
    let results = searchResults;
    let html = '<table>';

    for (let result of results) {
        html += `
            <tr>
                <td class="value">
                    <a href="#" onclick="return queryTicker('${result.symbol}')">
                        ${result.exchangeShortName}: ${result.symbol}
                    </a>
                </td>
                <td class="value r-col">
                    <a href="#" onclick="return queryTicker('${result.symbol}')">
                        ${result.name}
                    </a>
                </td>
            </tr>
        `;
    }
    html += '</table>';
    searchResultContainer.innerHTML = html;
    quoteContainer.innerHTML = '';
}

function renderQuote(response) {
    if (typeof response[0][0] === 'undefined') {
        displayErrorMessage('quoteContainer');
    } else {
        displayQuote(response);
    }
}

function renderSearchResults(response) {
    if (typeof response[0] === "undefined") {
        displayErrorMessage();
    } else if (response.length === 1) {  // if 1 search result display quote
        queryTicker(response[0].symbol);
    } else {
        displaySearchResults(response);
    }
}

function queryTicker(ticker) {
    const url1 = `https://financialmodelingprep.com/api/v3/quote/${ticker}?apikey=${apiKey}`;
    const url2 = `https://financialmodelingprep.com/api/v3/profile/${ticker}?apikey=${apiKey}`;

    Promise.all([
        fetch(url1).then(resp => resp.json()),
        fetch(url2).then(resp => resp.json()),
    ]).then(renderQuote);
}

function queryName(searchExpression) {
    const url = `
        https://financialmodelingprep.com/api/v3/search-name?query=${searchExpression}&limit=10&exchange=NYSE,NASDAQ&apikey=${apiKey}
    `;

    fetch(url)
        .then((data) => data.json())
        .then(renderSearchResults);
}

function tickerSubmitted(event) {
    event.preventDefault();

    queryTicker(tickerInput.value.trim());
    tickerInput.value = '';
    document.activeElement?.blur();
}

function nameSubmitted(event) {
    event.preventDefault();

    queryName(nameInput.value.trim());
    nameInput.value = '';
    document.activeElement?.blur();
}

function getNewsImageHTML(news) {
    if (typeof news.image === 'string') {
        return `<img src="${news.image}" alt="${news.title}" class="news-img col-12 col-md-6 col-lg-4" />`;
    }
    return '';
}

function displayNews(news) {
    let html = '';
    for (let article of news) {
        let content = article.content.replaceAll('<a ', '<a target="_blank" ');
        html += `
            <div class="d-flex">
                <section class="news-item my-3">
                    <h3>${article.title}</h3>
                    <p class="news-date">${article.date}</p>
                    ${getNewsImageHTML(article)}
                    ${content}
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
    const url = `https://financialmodelingprep.com/api/v3/fmp/articles?page=0&size=8&apikey=${apiKey}`;

    fetch(url)
        .then((data) => data.json())
        .then(renderNews);
}

formTicker.addEventListener('submit', tickerSubmitted);
formName.addEventListener('submit', nameSubmitted);
queryNews();