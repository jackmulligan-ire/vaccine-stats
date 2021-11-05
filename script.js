const total_vaccinated_elem = document.getElementById('total-vaccines');
const weekly_vaccinated_elem = document.getElementById('weekly-vaccines');
const manu_table_body = document.getElementById('manufacturer-table-body');

let xmlhttp = new XMLHttpRequest();
let url = "https://services-eu1.arcgis.com/z6bHNio59iTqqSUY/arcgis/rest/services/COVID19_Weekly_Vaccination_Figures/FeatureServer/0/query?where=1%3D1&outFields=*&outSR=4326&f=json";

xmlhttp.onreadystatechange = () => {
    if (xmlhttp.readyState === 4 && xmlhttp.status == 200) {
        let myJSON = JSON.parse(xmlhttp.responseText);
        let features_array = myJSON.features;
        get_latest_week(features_array);
    }
};
xmlhttp.open("GET", url, true)
xmlhttp.send()

function get_latest_week(obj_array) {
    function get_total_vaccinated(lw_attributes) {
        let total_vaccinated = lw_attributes.FullyCum_Age10to19 + 
        lw_attributes.FullyCum_Age20to29 + lw_attributes.FullyCum_Age30to39 + 
        lw_attributes.FullyCum_Age40to49 + lw_attributes.FullyCum_Age50to59 + 
        lw_attributes.FullyCum_Age60to69 + lw_attributes.FullyCum_Age70to79 + 
        lw_attributes.FullyCum_80_ + lw_attributes.FullyCum_NA;
        
        total_vaccinated_elem.textContent = total_vaccinated;
    };
    function get_weekly_vaccinated(lw_attributes) {
        let weekly_vaccinated = lw_attributes.TotalweeklyVaccines;
        weekly_vaccinated_elem.textContent = weekly_vaccinated;
    };

    function get_manufacturer_table(lw_attributes) {
        // CITATION: https://stackoverflow.com/questions/39336556/how-can-i-slice-an-object-in-javascript
        let lw_keys = Object.keys(lw_attributes);
        let manu_keys = lw_keys.slice(6,10);
        for (i = 0; i < manu_keys.length; i++) {
            // CITATION: https://www.theodinproject.com/paths/foundations/courses/foundations/lessons/dom-manipulation
            let table_row = document.createElement('tr');
            let name_cell = document.createElement('td');
            let number_cell = document.createElement('td');
            name_cell.innerHTML = manu_keys[i];
            number_cell.innerHTML = lw_attributes[manu_keys[i]];
            table_row.appendChild(name_cell)
            table_row.appendChild(number_cell)
            manu_table_body.appendChild(table_row)
        }
    }
    let lw_attributes = obj_array[obj_array.length - 1].attributes;
    //let lw_attributes = lw_obj.attributes;
    get_total_vaccinated(lw_attributes)
    get_weekly_vaccinated(lw_attributes)
    get_manufacturer_table(lw_attributes)
};