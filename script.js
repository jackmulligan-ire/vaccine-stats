const total_vaccinated_elem = document.getElementById('total-vaccines');
const weekly_vaccinated_elem = document.getElementById('weekly-vaccines');

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
    
    let lw_obj = obj_array[obj_array.length - 1];
    let lw_attributes = lw_obj.attributes;
    get_total_vaccinated(lw_attributes)
    get_weekly_vaccinated(lw_attributes)
};