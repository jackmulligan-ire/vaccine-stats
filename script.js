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
        generatePageData(currentWeek)
    }
};

countyXMLHttp.onreadystatechange = () => {
    if (countyXMLHttp.readyState === 4 && countyXMLHttp.status == 200) {
        let countyJSON = JSON.parse(countyXMLHttp.responseText);
        countyFeatures = countyJSON.features;
        populateCounties(countyFeatures)
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

    for (let i=1; i <= currentWeek; i++) {
        //CITATION: https://www.theodinproject.com/paths/foundations/courses/foundations/lessons/dom-manipulation
        let itemElem = document.createElement('div');
        itemElem.classList.add('dropdown-item')
        itemElem.textContent = i;
        // CITATION: https://javascript.info/arrow-functions-basics
        itemElem.addEventListener('click', () => generatePageData(i))
        weekMenuElem.appendChild(itemElem)
    }
}

function populateCounties(features) {    
    function generateDropdowns(menuElem) {
        for (let i=0; i < 26; i++) {  // i set manually to 26 due to county data sometimes being doubled up by HSE
            let countyNameElem = document.createElement('div');
            countyNameElem.classList.add('dropdown-item');
            countyNameElem.textContent = features[i]["attributes"]["CountyName"];
            menuElem.appendChild(countyNameElem);
        }
    }   
    const countyMenus = document.querySelectorAll('.county-menu')
    countyMenus.forEach(menu => generateDropdowns(menu))
}

function generatePageData(week) {
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