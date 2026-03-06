const countriesContainer = document.querySelector(".countries")
const searchInput = document.querySelector("#searchInput");
const dropdownMenu = document.querySelector("#regionDropdown");
let filteredRegion = ""
let allCountries = []
async function fetchCountries() {
    try {
        const r = await fetch("assets/data/data.json")
        const data = await r.json()
        return data
    } catch (error) {
        console.error(error.message);
        handleState("error")
    }

}

async function init() {
    handleState("loading")
    allCountries = await fetchCountries()
    if (allCountries) {
        setCountryCards(allCountries)
    }

}

function handleThemeSwitcher() {
    const themeSwitcher = document.querySelector(".theme-switcher")
    themeSwitcher.addEventListener("click", () => {
        let iconName = themeSwitcher.querySelector("ion-icon")
        document.body.classList.toggle("dark")
        iconName.name = iconName.name == "moon-outline" ? "moon-sharp" : "moon-outline"
    })
}

function handleDropdownMenu() {
    const dropdown = document.getElementById('regionDropdown');
    const header = dropdown.querySelector('.dropdown-header');
    const options = dropdown.querySelectorAll('.dropdown-menu li');
    const selectedRegion = document.getElementById('selectedRegion');

    header.addEventListener("click", () => {
        dropdown.classList.toggle("active")
    })

    options.forEach(option => {
        option.addEventListener("click", () => {
            filteredRegion = option.dataset.value
            updateUi()
            const region = option.innerText
            selectedRegion.innerText = region
            dropdown.classList.remove("active")
        })
    })

    window.addEventListener("click", (e) => {
        if (!dropdown.contains(e.target)) {
            dropdown.classList.remove("active")
        }
    })
}

function setCountryCards(data) {
    countriesContainer.innerHTML = ''
    if (data.length == 0) {
        handleState("notMatch")
        return
    }
    let domObjects = []
    data.forEach(obj => {
        const card = `
        <div class="country" data-code="${obj.alpha3Code}">
            <img src="${obj.flags.png}" alt="">

            <div class="info">
                <h3>${obj.name}</h3>
                <div class="details">
                    <p>
                        <strong>Population:</strong> ${obj.population.toLocaleString()}
                    </p>
                    <p>
                        <strong>Region:</strong> ${obj.region}
                    </p>
                    <p>
                        <strong>Capital:</strong> ${obj.capital}
                    </p>
                </div>
            </div>
        </div>`
        domObjects.push(card)
    })
    countriesContainer.innerHTML = domObjects.join("")

}

function filterCountries(searchTerm = "", filterMenuTerm = "") {
    searchTerm = searchTerm.toLowerCase().trim()
    const filteredCountries = allCountries.filter(country => {
        const byName = searchTerm == "" || country.name.toLowerCase().includes(searchTerm)

        const byRegion = filterMenuTerm == "" || country.region == filterMenuTerm

        return byName && byRegion
    })
    return filteredCountries
}

function updateUi() {
    const filtered = filterCountries(searchInput.value, filteredRegion)
    setCountryCards(filtered)
}

searchInput.addEventListener("input", () => {
    updateUi();
});

function handleState(state) {
    const states = {
        "loading": "Loading...",
        "error": "Error fetching data",
        "notMatch": "No matches"
    }
    countriesContainer.innerHTML = `<p class="msg">${states[state]}</p>`
}

window.addEventListener("click", (e) => {
    if (e.target.closest(".country")) {
        clickedCard = e.target.closest(".country")
        pageToshow("details")
        handleDetailsPage(clickedCard.dataset.code)
    }
})

function handleDetailsPage(code) {
    const country = getCountryByInfo("alpha3Code", code)
    if (!country) return;
    const languages = country.languages?.map(lang => lang.name).join(", ")
    const detailsStruc = `
        <img src="${country.flags.png}" alt="">

            <div class="text">
                <div class="more-details">
                    <h2>
                    ${country.name}
                    </h2>
                    <div class="info">
    
                        <div class="left">
                            <p><strong>Native Name: </strong>${country.nativeName}</p>
                            <p><strong>Population: </strong>${country.population.toLocaleString()}</p>
                            <p><strong>Region: </strong>${country.region}</p>
                            <p><strong>Sub Region: </strong>${country.subregion}</p>
                            <p><strong>Capital: </strong>${country.capital}</p>

                        </div>
                        <div class="right">
                            <p><strong>Top Level Domain: </strong> ${country.topLevelDomain}</p>
                            <p><strong>Currencies: </strong> ${country.currencies[0].name} ( ${country.currencies[0].symbol} )</p>
                            <p><strong>Languages: </strong> ${languages}</p> 
                        </div>
    
                    </div>
                </div>


                <div class="border-countries">
                    <strong>Border Countries: </strong>
                    <div class="actions">
                    
                        ${country.borders ? country.borders.map(countryBorderCode =>
        `<button onclick="handleDetailsPage('${countryBorderCode}')">${getCountryByInfo("alpha3Code", countryBorderCode).name}</button>`
    ).join('') : 'No border countries'
        }
                    
                    </div>
                </div>

            </div>

    `

    document.querySelector(".content").innerHTML = detailsStruc
}

function getCountryByInfo(property, value) {
    return allCountries.find(c => c[property] == value)
}

function pageToshow(page) {
    switch (page) {
        case "details":
            document.querySelector(".countries").classList.add("hidden")
            document.querySelector(".search-and-filter").classList.add("hidden")
            document.querySelector(".details-page").classList.remove("hidden")
            break
        case "countries":
            document.querySelector(".countries").classList.remove("hidden")
            document.querySelector(".search-and-filter").classList.remove("hidden")
            document.querySelector(".details-page").classList.add("hidden")
    }

}

function goBack() {
    pageToshow("countries")
    setCountryCards(allCountries)
}

handleThemeSwitcher()
handleDropdownMenu()
init()

