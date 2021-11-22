const URL = 'https://google-doodles.herokuapp.com/doodles/year/month?hl=en';
const GOOGLE_HANDOFF = "https://www.google.com/search?q=query";
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const colors = ['red', 'green', 'blue', 'yellow'];

const loader = document.getElementById("loader");
const dateFieldContainer = document.getElementById("date-field-container");
const dateField = document.getElementById("date-field");
const dateText = document.getElementById("date-text");
const dateIncrementer = document.getElementById("date-incrementer");
const years = getYears();
const doodleContainer = document.getElementById("doodle-container");
const errorBox = document.getElementById("error-text");
const titleHolder = document.getElementById("title-holder");
const submitButton = document.getElementById("submit-button");

const decrementer = document.getElementById("decrementer");
const incrementer = document.getElementById("incrementer");

let monthData = [];
let selectedDate = new Date();
let initial = true;

async function doMainBuild(doFetch) {
    if (initial) {
        assignColorIncrementer(decrementer);
        assignColorIncrementer(incrementer);
        buildTitleHolder();
        assignColor(submitButton);
        initial = false;
    }
    errorBox.hidden = true;
    dateField.value = getFormattedDate(selectedDate);
    dateText.innerText = getFormattedDate(selectedDate);
    if (doFetch) {
        showPlaceholder(true);
        monthData = await fetchMonthly();
        showPlaceholder(false);
    }

    let todayByYear = getTodayByYear();
    buildCards(todayByYear);



    console.log("Built cards");
}

async function buildWithDateField() {

    console.log(dateField.value);
    let date = new Date(Date.parse(dateField.value));
    if (isNaN(date)) {
        errorBox.hidden = false;
        return;
    }
    let previousMonth = selectedDate.getMonth();
    selectedDate = date;
    let shouldFetch = previousMonth != selectedDate.getMonth();
    doMainBuild(shouldFetch);
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

        // The json doodle title
        const title = document.createElement("span");
        title.innerText = json.title;

        // Get the date element 
        const dateElement = document.createElement("span");
        const date = new Date(json.run_date_array[0], json.run_date_array[1], json.run_date_array[2]);
        dateElement.innerText = getFormattedDate(date);

        // Create the button to open the Google search
        const btn = document.createElement("button");
        assignColor(btn);
        btn.innerText = "What in the doodle?";
        btn.onmouseenter = () => assignColor(btn);

        // Make the a tag link to new Google search
        const link = document.createElement("a");
        link.href = GOOGLE_HANDOFF.replace("query", json.title);
        link.append(btn);
        link.target = "_blank"; // Force new tab

        // The title, date, and link button as one object
        const textAndButton = document.createElement("div");
        textAndButton.className = "doodle-text-and-button";
        textAndButton.append(title);
        textAndButton.append(dateElement);
        textAndButton.append(document.createElement("br"));
        textAndButton.append(link);

        // Create the image
        const image = document.createElement("img");
        image.className = "doodle-img";
        image.src = json.url;

        // The overall card has two objects only, allowing easy spacing
        const doodleCard = document.createElement("div");
        doodleCard.className = "card doodle";
        doodleCard.append(image);
        doodleCard.append(textAndButton);

        doodleContainer.append(doodleCard);
    }
}

function assignColorIncrementer(element) {
    assignColor(element);
    element.className = element.className + " btn btn-primary rounded-circle";
}

function assignColor(element) {
    let color = getRandomColor();
    element.className = color + " btn";
}

Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}

function getFormattedDate(date) {
    return months[selectedDate.getMonth()] + " " + date.getDate() + ", " + date.getFullYear();
}

function showPlaceholder(shouldShow) {
    if (shouldShow) {
        doodleContainer.innerHTML = "";
    }
    loader.hidden = !shouldShow;
}

function getRandomColor() {
    let colorIndex = Math.floor(Math.random() * 4);
    let color = colors[colorIndex];
    return color;
}

function buildTitleHolder() {
    let title = "Today in Google Doodles History";

    for (const letter of title) {
        let span = document.createElement("span");
        let color = getRandomColor();
        span.className = color + "-letter";
        span.innerText = letter;
        titleHolder.append(span);
    }

}