const URL = 'https://google-doodles.herokuapp.com/doodles/year/month?hl=en';
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const dateFieldContainer = document.getElementById("date-field-container");
const dateField = document.getElementById("date-field");
const dateText = document.getElementById("date-text");
const dateIncrementer = document.getElementById("date-incrementer");
const years = getYears();
const doodleContainer = document.getElementById("doodle-container");
let monthData = [];
let selectedDate = new Date();

async function doMainBuild(doFetch) {

    dateField.value = getFormattedDate();
    dateText.innerText = getFormattedDate();
    if (doFetch)
        monthData = await fetchMonthly();

    let todayByYear = getTodayByYear();
    buildCards(todayByYear);
    console.log("Initialized app");
}

async function incrementDate(amount) {
    let previousMonth = selectedDate.getMonth();
    selectedDate = selectedDate.addDays(amount);
    let shouldFetch = previousMonth != selectedDate.getMonth();
    await doMainBuild(shouldFetch);
}

function switchToTextInput() {
    dateFieldContainer.hidden = false;
    dateIncrementer.hidden = true;
}

function switchToIncrementer() {
    dateFieldContainer.hidden = true;
    dateIncrementer.hidden = false;
}

function getYears() {
    let arr = [];
    let currentYear = new Date().getFullYear();
    while (currentYear != 1997)
        arr.push(currentYear--);

    return arr;
}

async function fetchMonthly() {
    let urls = []
    for (const year of years)
        urls.push(URL.replace("year", year).replace("month", selectedDate.getMonth() + 1));

    let requests = urls.map(url => fetch(url));
    let responses = await Promise.all(requests);

    // Get all the jsons
    let jsons = [];
    for (const response of responses) {
        const json = await response.json();
        jsons.push(json);
    }
    console.log("Fetched");
    return jsons;
}

function getTodayByYear() {
    let jsons = [];
    for (const json of monthData) {
        try {
            const todayDoodle = extractTodayFromMonth(json, selectedDate.getDate());
            if (todayDoodle.length > 0)
                jsons.push(todayDoodle[0]);
        } catch (error) {}
    }
    return jsons;
}

function extractTodayFromMonth(jsonList, day) {
    let todayList = [];
    for (const json of jsonList)
        if (json.run_date_array[2] == day)
            todayList.push(json);

    return todayList;
}

function buildCards(daily) {
    doodleContainer.innerHTML = "";
    for (const json of daily) {

        const title = document.createElement("span");
        title.innerText = json.title;

        const dateElement = document.createElement("span");
        const date = new Date(json.run_date_array[0], json.run_date_array[1], json.run_date_array[2], );
        dateElement.innerText = getFormattedDate(date);

        const btn = document.createElement("button");
        btn.className = "btn btn-primary";
        btn.innerText = "What in the doodle?";

        const textAndButton = document.createElement("div");
        textAndButton.className = "doodle-text-and-button";

        textAndButton.append(title);
        textAndButton.append(dateElement);
        textAndButton.append(document.createElement("br"));
        textAndButton.append(btn);

        const image = document.createElement("img");
        image.className = "doodle-img";
        image.src = json.url;

        const doodleCard = document.createElement("div");
        doodleCard.className = "card doodle";
        doodleCard.append(image);
        doodleCard.append(textAndButton);

        doodleContainer.append(doodleCard);
    }
}

Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}

function getFormattedDate() {
    return months[selectedDate.getMonth()] + " " + selectedDate.getDate() + ", " + selectedDate.getFullYear();
}

class Doodle {
    constructor(imgUrl, title, date) {
        this.imgUrl = imgUrl;
        this.title = title;
        this.date = date;
    }
}