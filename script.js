const totalVaccinatedElem = document.getElementById('total-vaccines');
const weeklyVaccinatedElem = document.getElementById('weekly-vaccines');
const manuTableBody = document.getElementById('manufacturer-table-body');
const ageDataCells = document.querySelectorAll('.age-data');
const percentageItem = document.getElementById('percentage-item');
const numberItem = document.getElementById('number-item');
const weekMenuElem = document.getElementById('week-menu');

let dataFeatures, selectedWeekAttributes;
let xmlhttp = new XMLHttpRequest();
let url = "https://services-eu1.arcgis.com/z6bHNio59iTqqSUY/arcgis/rest/services/COVID19_Weekly_Vaccination_Figures/FeatureServer/0/query?where=1%3D1&outFields=*&outSR=4326&f=json";

xmlhttp.onreadystatechange = () => {
    if (xmlhttp.readyState === 4 && xmlhttp.status == 200) {
        let myJSON = JSON.parse(xmlhttp.responseText);
        dataFeatures = myJSON.features;
        let currentWeekIndex = dataFeatures.length-1;
        populateWeeks(currentWeekIndex)
        selectedWeekAttributes = dataFeatures[currentWeekIndex].attributes;
        generatePageData(selectedWeekAttributes)
    }
};
xmlhttp.open("GET", url, true)
xmlhttp.send()

percentageItem.addEventListener('click', () => getPercAgeStats(selectedWeekAttributes))
numberItem.addEventListener('click', () => getTotalAgeStats(selectedWeekAttributes))

function getTotalAgeStats(attributes) {
    const totalAgeKeys = ["FullyCum_Age10to19", "FullyCum_Age20to29", "FullyCum_Age30to39", "FullyCum_Age40to49", 
    "FullyCum_Age50to59", "FullyCum_Age60to69","FullyCum_Age70to79", "FullyCum_80_"];
    
    for (i=0; i < totalAgeKeys.length; i++) {ageDataCells[i].innerHTML = attributes[totalAgeKeys[i]];}
}

function getPercAgeStats(attributes) {
    const agePercKeys = ["FullyPer_Age10to19", "FullyPer_Age20to29", "FullyPer_Age30to39", "FullyPer_Age40to49",
    "FullyPer_Age50to59", "FullyPer_Age60to69", "FullyPer_Age70to79", "FullyPer_80_"];
    
    for (i=0; i < agePercKeys.length; i++) {
        let percValue = (attributes[agePercKeys[i]] * 100).toFixed(2);
        ageDataCells[i].innerHTML = percValue;
    }
}

function populateWeeks(currentWeek) {
    for (i=1; i <= currentWeek; i++) {
        let itemElem = document.createElement('div');
        itemElem.classList.add('dropdown-item')
        itemElem.textContent = i;
        weekMenuElem.appendChild(itemElem)
    }
}

function generatePageData(weekAttributes) {
    function getTotalVaccinated(attributes) {
        let totalVaccinated = attributes.FullyCum_Age10to19 + 
        attributes.FullyCum_Age20to29 + attributes.FullyCum_Age30to39 + 
        attributes.FullyCum_Age40to49 + attributes.FullyCum_Age50to59 + 
        attributes.FullyCum_Age60to69 + attributes.FullyCum_Age70to79 + 
        attributes.FullyCum_80_ + attributes.FullyCum_NA;
        
        totalVaccinatedElem.textContent = totalVaccinated;
    }
    function getWeeklyVaccinated(attributes) {
        let weeklyVaccinated = attributes.TotalweeklyVaccines;
        weeklyVaccinatedElem.textContent = weeklyVaccinated;
    }
    function getManufacturerTable(attributes) {
        const manuKeys = ['Moderna', 'Pfizer', 'Janssen', 'AstraZeneca'];
        // CITATION: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Working_with_Objects#enumerate_the_properties_of_an_object
        let attrKeys = Object.keys(attributes);
        for (i = 0; i < attrKeys.length; i++) {
            // CITATION: https://www.w3schools.com/jsref/jsref_includes_array.asp
            if (manuKeys.includes(attrKeys[i])) {
                // CITATION: https://www.theodinproject.com/paths/foundations/courses/foundations/lessons/dom-manipulation
                let tableRow = document.createElement('tr');
                let nameCell = document.createElement('td');
                let numberCell = document.createElement('td');
                nameCell.innerHTML = attrKeys[i];
                numberCell.innerHTML = attributes[attrKeys[i]];
                tableRow.appendChild(nameCell)
                tableRow.appendChild(numberCell)
                manuTableBody.appendChild(tableRow)
            }
        }
    }
    getTotalVaccinated(weekAttributes)
    getWeeklyVaccinated(weekAttributes)
    getManufacturerTable(weekAttributes)
    getTotalAgeStats(weekAttributes)
};

