const total_vaccinated_elem = document.getElementById('total-vaccines');
const weekly_vaccinated_elem = document.getElementById('weekly-vaccines');
const manu_table_body = document.getElementById('manufacturer-table-body');
const age_table_rows = document.querySelectorAll('.age-row');

let data_features, selected_week_attributes;
let xmlhttp = new XMLHttpRequest();
let url = "https://services-eu1.arcgis.com/z6bHNio59iTqqSUY/arcgis/rest/services/COVID19_Weekly_Vaccination_Figures/FeatureServer/0/query?where=1%3D1&outFields=*&outSR=4326&f=json";

xmlhttp.onreadystatechange = () => {
    if (xmlhttp.readyState === 4 && xmlhttp.status == 200) {
        let myJSON = JSON.parse(xmlhttp.responseText);
        data_features = myJSON.features;
        let current_week_index = data_features.length-1
        selected_week_attributes = data_features[current_week_index].attributes
        generate_page_data(selected_week_attributes);
    }
};
xmlhttp.open("GET", url, true)
xmlhttp.send()

function get_total_age_stats(attributes) {
    const total_age_keys = ["FullyCum_Age10to19", "FullyCum_Age20to29", "FullyCum_Age30to39", "FullyCum_Age40to49", 
    "FullyCum_Age50to59", "FullyCum_Age60to69","FullyCum_Age70to79", "FullyCum_80_"];
    
    for (i=0; i < total_age_keys.length; i++) {
        let number_td = document.createElement('td');
        number_td.innerHTML = attributes[total_age_keys[i]];
        age_table_rows[i].appendChild(number_td)
    }
}
function generate_page_data(week_attributes) {
    function get_total_vaccinated(attributes) {
        let total_vaccinated = attributes.FullyCum_Age10to19 + 
        attributes.FullyCum_Age20to29 + attributes.FullyCum_Age30to39 + 
        attributes.FullyCum_Age40to49 + attributes.FullyCum_Age50to59 + 
        attributes.FullyCum_Age60to69 + attributes.FullyCum_Age70to79 + 
        attributes.FullyCum_80_ + attributes.FullyCum_NA;
        
        total_vaccinated_elem.textContent = total_vaccinated;
    }
    function get_weekly_vaccinated(attributes) {
        let weekly_vaccinated = attributes.TotalweeklyVaccines;
        weekly_vaccinated_elem.textContent = weekly_vaccinated;
    }
    function get_manufacturer_table(attributes) {
        const manu_keys = ['Moderna', 'Pfizer', 'Janssen', 'AstraZeneca'];
        // CITATION: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Working_with_Objects#enumerate_the_properties_of_an_object
        let attr_keys = Object.keys(attributes);
        for (i = 0; i < attr_keys.length; i++) {
            // CITATION: https://www.w3schools.com/jsref/jsref_includes_array.asp
            if (manu_keys.includes(attr_keys[i])) {
                // CITATION: https://www.theodinproject.com/paths/foundations/courses/foundations/lessons/dom-manipulation
                let table_row = document.createElement('tr');
                let name_cell = document.createElement('td');
                let number_cell = document.createElement('td');
                name_cell.innerHTML = attr_keys[i];
                number_cell.innerHTML = attributes[attr_keys[i]];
                table_row.appendChild(name_cell)
                table_row.appendChild(number_cell)
                manu_table_body.appendChild(table_row)
            }
        }
    }
    get_total_vaccinated(week_attributes)
    get_weekly_vaccinated(week_attributes)
    get_manufacturer_table(week_attributes)
    get_total_age_stats(week_attributes)
};