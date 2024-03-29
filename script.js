const ageDataCells = document.querySelectorAll('.age-data');
const percentageItem = document.getElementById('percentage-item');
const numberItem = document.getElementById('number-item');

let vaccineFeatures, countyFeatures, selectedWeekAttributes;
let vaccineURL = "https://services-eu1.arcgis.com/z6bHNio59iTqqSUY/arcgis/rest/services/COVID19_Weekly_Vaccination_Figures/FeatureServer/0/query?where=1%3D1&outFields=*&outSR=4326&f=json";
let countyURL = "https://services1.arcgis.com/eNO7HHeQ3rUcBllm/arcgis/rest/services/Covid19CountyStatisticsHPSCIrelandOpenData/FeatureServer/0/query?where=1%3D1&outFields=*&outSR=4326&f=json";
let countiesOnPage = [];

getData(countyURL).then(features => {
    countyFeatures = features;
    populateCounties(countyFeatures)
    generateProportionCards(countyFeatures)
})

getData(vaccineURL).then(features => {
    vaccineFeatures = features;
    let currentWeek = vaccineFeatures.length-1;
    populateWeeks(currentWeek)
    generateVaccineData(currentWeek)
})

percentageItem.addEventListener('click', () => getPercAgeStats(selectedWeekAttributes))
numberItem.addEventListener('click', () => getTotalAgeStats(selectedWeekAttributes))

async function getData(url) {
    try {
    const response = await fetch(url, {mode: 'cors'});
    if (!response.ok) {
        throw Error(response.statusText);
    }
    const JSON = await response.json();
    return JSON.features;
    } catch (error) { 
        console.log(`Error: ${error}`)
        displayErrorMessage()
    }
}
function displayErrorMessage() {
    function createErrorCard() {
        let rowDiv = document.createElement('div');
        let colDiv = document.createElement('div');
        let cardDiv = document.createElement('div');
        let cardBody = document.createElement('div');
        let cardHeader = document.createElement('h5');
        let cardContent = document.createElement('p');
        
        rowDiv.classList.add("row", "justify-content-center", "mt-5")
        colDiv.classList.add("col-lg-6")
        cardDiv.classList.add("card")
        cardHeader.classList.add("card-header", "bg-danger")
        cardBody.classList.add("card-body")
        cardContent.classList.add("card-text")
        cardHeader.textContent = "Error";
        cardContent.textContent = "There was an error retrieving the data. Please try again later."
        cardDiv.appendChild(cardHeader)
        cardBody.appendChild(cardContent)
        cardDiv.appendChild(cardBody)
        colDiv.appendChild(cardDiv)
        rowDiv.appendChild(colDiv)
        containerDiv.appendChild(rowDiv)
    }
    function removeSections() {
        let containerChildren = containerDiv.childNodes;
        while (containerChildren.length > 0) containerChildren.forEach(child => containerDiv.removeChild(child));
    }
    const containerDiv = document.getElementsByClassName("container")[0];
    removeSections()
    createErrorCard()
}

function getTotalAgeStats(attributes) {
    const totalAgeKeys = ["FullyCum_Age10to19", "FullyCum_Age20to29", "FullyCum_Age30to39", "FullyCum_Age40to49", 
    "FullyCum_Age50to59", "FullyCum_Age60to69","FullyCum_Age70to79", "FullyCum_80_"];
    
    for (let i=0; i < totalAgeKeys.length; i++) {ageDataCells[i].innerHTML = attributes[totalAgeKeys[i]];}
}

function getPercAgeStats(attributes) {
    const agePercKeys = ["FullyPer_Age10to19", "FullyPer_Age20to29", "FullyPer_Age30to39", "FullyPer_Age40to49",
    "FullyPer_Age50to59", "FullyPer_Age60to69", "FullyPer_Age70to79", "FullyPer_80_"];
    
    for (let i=0; i < agePercKeys.length; i++) {
        let percValue = (attributes[agePercKeys[i]] * 100).toFixed(2);
        ageDataCells[i].innerHTML = percValue;
    }
}

function populateWeeks(currentWeek) {
    const weekMenuElem = document.getElementById('week-menu');
    const weekButton = document.getElementById('week-menu-button');
    
    for (let i = currentWeek; i >= 1; i--) {
        let itemElem = document.createElement('div');
        itemElem.classList.add('dropdown-item')
        itemElem.textContent = i;
        itemElem.addEventListener('click', () => generateVaccineData(i))
        itemElem.addEventListener('click', () => weekButton.textContent = `Week ${i}`)
        weekMenuElem.appendChild(itemElem)
    }
    weekButton.textContent = `Week ${currentWeek}`;
}

function populateCounties(features) {
    function generateDropdowns(menuElem, elemIndex) {
        for (let i=0; i < 26; i++) {  // i set manually to 26 due to county data sometimes being doubled up by HSE
            let countyNameElem = document.createElement('div');
            countyNameElem.classList.add('dropdown-item');
            let countyName = features[i]["attributes"]["CountyName"];
            countyNameElem.textContent = countyName;
            countyNameElem.addEventListener('click', () => generateCountyCard(countyName, elemIndex))
            menuElem.appendChild(countyNameElem);
        }
    }   
    const countyMenus = document.querySelectorAll('.county-menu')
    countyMenus.forEach((menu, index) => generateDropdowns(menu, index))
}

function generateCountyCard(countyName, menuIndex) {
    function getCountyData(countyName) {
        for(let i=0; i < countyFeatures.length; i++) {
            if (countyFeatures[i]["attributes"]["CountyName"] === countyName) {
                let populationValue = countyFeatures[i]["attributes"]["PopulationCensus16"];
                let confirmedValue = countyFeatures[i]["attributes"]["ConfirmedCovidCases"];
                let proportionValue = countyFeatures[i]["attributes"]["PopulationProportionCovidCases"].toFixed(2);
                return [populationValue, confirmedValue, proportionValue]
            }
        } 
    }  
    function createCountyCard(countyName, dataArray) {
        const textContents = ["Population", "Cases", "Cases per 100000"];
        let cardDiv = document.createElement('div');
        let cardHeader = document.createElement('h5');
        let cardBody = document.createElement('div');
        let pElem;
        
        cardDiv.classList.add('card')
        cardHeader.classList.add('card-header')
        cardHeader.textContent = countyName;
        cardDiv.appendChild(cardHeader)
        cardBody.classList.add("card-body");
        for (let i=0; i < dataArray.length; i++) {
            pElem = document.createElement('p');
            pElem.classList.add('card-text')
            pElem.textContent = `${textContents[i]}: ${dataArray[i]}`;
            cardBody.appendChild(pElem)
        }
        cardDiv.appendChild(cardBody);
        return cardDiv
    }
    function addCloseIcon(menuIndex, countyName) {
        const cardElem = cardSlotElems[menuIndex].querySelector(".card");
        const cardHeader = cardElem.querySelector("h5");
        let closeButton = document.createElement("button");
        let closeIcon = document.createElement("span");
        
        closeButton.classList.add("close");
        closeIcon.textContent = "x";
        closeButton.appendChild(closeIcon)
        closeButton.addEventListener('click', () => {
            cardSlotElems[menuIndex].removeChild(cardElem)
            let index = countiesOnPage.indexOf(countyName);
            countiesOnPage.splice(index, 1)
        }) 
        cardHeader.appendChild(closeButton)
    }
    const cardSlotElems = document.querySelectorAll('.card-slot');
    if (!countiesOnPage.includes(countyName)) {
        if (cardSlotElems[menuIndex].querySelector(".card") != null) {
            let existingCard = cardSlotElems[menuIndex].querySelector(".card");
            let existingCounty = existingCard.querySelector("h5").textContent.replace('x', '');
            cardSlotElems[menuIndex].removeChild(existingCard);
            let index = countiesOnPage.indexOf(existingCounty);
            countiesOnPage.splice(index, 1)
        }
        countiesOnPage.push(countyName)
        let countyData = getCountyData(countyName);
        let countyCard = createCountyCard(countyName, countyData);
        cardSlotElems[menuIndex].appendChild(countyCard)
        addCloseIcon(menuIndex, countyName);
    }
}

function generateProportionCards(features) {
    function createCard(county, value, bgColour, slotName) {
        const cardSlot = document.getElementById(slotName);
        let cardDiv = document.createElement('div');
        let cardHeader = document.createElement('h5');
        let bodyDiv = document.createElement('div');
        let cardPara = document.createElement('p');
        
        cardDiv.classList.add('card')
        cardHeader.classList.add('card-header')
        cardHeader.classList.add(bgColour)
        bodyDiv.classList.add('card-body')
        cardPara.classList.add('card-text')
        cardHeader.textContent = county
        cardPara.textContent = `Cases per 100000: ${value.toFixed(2)}`
        bodyDiv.appendChild(cardPara)
        cardDiv.appendChild(cardHeader)
        cardDiv.appendChild(bodyDiv)
        cardSlot.appendChild(cardDiv)
    }
    
    let countyPropObj = {};
    for (let i = 0; i < features.length; i++) {
        let countyName = features[i]["attributes"]["CountyName"];
        let proportionValue = features[i]["attributes"]["PopulationProportionCovidCases"];
        countyPropObj[countyName] = proportionValue;
    }
    let highestPropVal = Math.max(...Object.values(countyPropObj));
    let lowestPropVal = Math.min(...Object.values(countyPropObj));
    let highestCounty = Object.keys(countyPropObj).find(key => countyPropObj[key] === highestPropVal);
    let lowestCounty = Object.keys(countyPropObj).find(key => countyPropObj[key] === lowestPropVal);
    createCard(highestCounty, highestPropVal, "bg-danger", "highest")
    createCard(lowestCounty, lowestPropVal, "bg-success", "lowest")
}

function generateVaccineData(week) {
    function getTotalVaccinated(attributes) {
        const totalVaccinatedElem = document.getElementById('total-vaccines');
        let totalVaccinated = attributes.FullyCum_Age10to19 + attributes.FullyCum_Age20to29 + 
            attributes.FullyCum_Age30to39 + attributes.FullyCum_Age40to49 + attributes.FullyCum_Age50to59 + 
            attributes.FullyCum_Age60to69 + attributes.FullyCum_Age70to79 + attributes.FullyCum_80_ + attributes.FullyCum_NA;
        totalVaccinatedElem.textContent = totalVaccinated;
    }
    function getWeeklyVaccinated(attributes) {
        const weeklyVaccinatedElem = document.getElementById('weekly-vaccines');
        let weeklyVaccinated = attributes.TotalweeklyVaccines;
        weeklyVaccinatedElem.textContent = weeklyVaccinated;
    }
    function getManufacturerTable(attributes) {
        const manuKeys = ['Moderna', 'Pfizer', 'Janssen', 'AstraZeneca'];
        const manuDataCells = document.querySelectorAll('.manu-data');
        for (let i=0; i < manuKeys.length; i++) {manuDataCells[i].innerHTML = attributes[manuKeys[i]];}
    }
    selectedWeekAttributes = vaccineFeatures[week].attributes;
    getTotalVaccinated(selectedWeekAttributes)
    getWeeklyVaccinated(selectedWeekAttributes)
    getManufacturerTable(selectedWeekAttributes)
    getTotalAgeStats(selectedWeekAttributes)
};