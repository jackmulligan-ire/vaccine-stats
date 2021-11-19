const ageDataCells = document.querySelectorAll('.age-data');
const percentageItem = document.getElementById('percentage-item');
const numberItem = document.getElementById('number-item');
let vaccineFeatures, countyFeatures, selectedWeekAttributes;
let vaccineXMLHttp = new XMLHttpRequest(); 
let countyXMLHttp = new XMLHttpRequest();
let vaccineURL = "https://services-eu1.arcgis.com/z6bHNio59iTqqSUY/arcgis/rest/services/COVID19_Weekly_Vaccination_Figures/FeatureServer/0/query?where=1%3D1&outFields=*&outSR=4326&f=json";
let countyURL = "https://services1.arcgis.com/eNO7HHeQ3rUcBllm/arcgis/rest/services/Covid19CountyStatisticsHPSCIrelandOpenData/FeatureServer/0/query?where=1%3D1&outFields=*&outSR=4326&f=json";

vaccineXMLHttp.onreadystatechange = () => {
    if (vaccineXMLHttp.readyState === 4 && vaccineXMLHttp.status == 200) {
        let myJSON = JSON.parse(vaccineXMLHttp.responseText);
        vaccineFeatures = myJSON.features;
        let currentWeek = vaccineFeatures.length-1;
        populateWeeks(currentWeek)
        generateVaccineData(currentWeek)
    }
};

countyXMLHttp.onreadystatechange = () => {
    if (countyXMLHttp.readyState === 4 && countyXMLHttp.status == 200) {
        let countyJSON = JSON.parse(countyXMLHttp.responseText);
        countyFeatures = countyJSON.features;
        populateCounties(countyFeatures)
        generateProportionCards(countyFeatures)
    }
};
vaccineXMLHttp.open("GET", vaccineURL, true)
vaccineXMLHttp.send()
countyXMLHttp.open("GET", countyURL, true)
countyXMLHttp.send()

// CITATION: https://javascript.info/arrow-functions-basics, https://www.theodinproject.com/paths/foundations/courses/foundations/lessons/dom-manipulation
percentageItem.addEventListener('click', () => getPercAgeStats(selectedWeekAttributes))
numberItem.addEventListener('click', () => getTotalAgeStats(selectedWeekAttributes))

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
        //CITATION: https://www.theodinproject.com/paths/foundations/courses/foundations/lessons/dom-manipulation
        let itemElem = document.createElement('div');
        itemElem.classList.add('dropdown-item')
        itemElem.textContent = i;
        // CITATION: https://javascript.info/arrow-functions-basics
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
    const cardSlotElems = document.querySelectorAll('.card-slot');
    let countyData = getCountyData(countyName);
    let countyCard = createCountyCard(countyName, countyData);
    //CITATION: https://stackoverflow.com/questions/39103756/check-if-any-element-in-a-nodelist-has-a-specific-class-using-es6
    if (cardSlotElems[menuIndex].querySelector(".card") != null) {
        let existingCard = cardSlotElems[menuIndex].querySelector(".card");
        cardSlotElems[menuIndex].removeChild(existingCard);
    }
    cardSlotElems[menuIndex].appendChild(countyCard)
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
        //CITATION: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Working_with_Objects#objects_and_properties
        countyPropObj[countyName] = proportionValue;
    }
    //CITATION: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/max#getting_the_maximum_element_of_an_array
    //CITATION: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/values
    let highestPropVal = Math.max(...Object.values(countyPropObj));
    let lowestPropVal = Math.min(...Object.values(countyPropObj));
    //CITATION: https://stackoverflow.com/questions/9907419/how-to-get-a-key-in-a-javascript-object-by-its-value
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