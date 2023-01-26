// ***************************************************
//                    MODAL WINDOW
// ***************************************************
// get the modal
let modal = document.getElementById("settings-modal");
// get the settings button
let btnModalOpen = document.getElementById("settings-button");
// get the close button
let btnModalClose = document.getElementsByClassName("close")[0];

// check for keypresses
document.body.onkeyup = function(e) { 
    // if escape is pressed and modal is open, close modal
    if(e.key === 'Escape' && modal.style.display === "block") {
        closeModal();
    }
 } 

// open modal when the user clicks on the settings button
btnModalOpen.onclick = function() {
    document.body.classList.add('noscroll');
    modal.style.display = "block";
    setCalculatorTabIndexActive(false);
    //copy current settings to tempSettings without reference
    tempSettings = JSON.parse(JSON.stringify(settings));
}

//set calculator tab index active status
function setCalculatorTabIndexActive(setActive) {
    let tabIndex = setActive ? "0" : "-1";
    btnModalOpen.setAttribute("tabindex", tabIndex);
    document.querySelectorAll("input").forEach((input) => {
        input.setAttribute("tabindex", tabIndex);
    });
    document.getElementById("calculate").setAttribute("tabindex", tabIndex);
    document.querySelector("a").setAttribute("tabindex", tabIndex);
}


// close modal when the user clicks on the close button
btnModalClose.onclick = function() {
    closeModal();
}

// close modal when the user clicks anywhere outside of the modal
window.onclick = function(event) {
    if (event.target == modal) {
        closeModal();
    }
}

function closeModal() {
    document.body.classList.remove('noscroll');
    modal.style.display = "none";
    setCalculatorTabIndexActive(true);
    updateAllSelections();
}

// ***************************************************
//                CALCULATE FUNCTIONS
// ***************************************************
let distance;
let velocity;
let packetSize;
let bitrate;

let inDistance = document.getElementById('eff-d');
let inVelocity = document.getElementById('eff-v');
let inPacketSize = document.getElementById('eff-l');
let inBitrate = document.getElementById('eff-r');
//add event listener to the Calculate button
document.getElementById('calculate').addEventListener('click', () => {
    //get values from the input fields
    if (inDistance.value !== "" && inDistance.value > 0) {
        distance = convertToUnit(inDistance.value, settings.distance.power);
    }
    else {
        distance = undefined;
    }
    if (inVelocity.value !== "" && inVelocity.value > 0) {
        velocity = convertToUnit(inVelocity.value, settings.velocity.power);
    }
    else {
        velocity = undefined;
    }
    if (inPacketSize.value !== "" && inPacketSize.value > 0) {
        packetSize = convertToUnit(inPacketSize.value, settings.packetSize.power);
    }
    else {
        packetSize = undefined;
    }
    if (inBitrate.value !== "" && inBitrate.value > 0) {
        bitrate = convertToUnit(inBitrate.value, settings.bitrate.power);
    }
    else {
        bitrate = undefined;
    }

    //calculate efficiency and text color hue
    let efficiency = calculateEfficiency(distance, velocity, packetSize, bitrate);
    let result = document.getElementById('result');
    let hue;
    if (isNaN(efficiency)) {
        hue = 0;
        // get list of all input fields
        let inputs = document.querySelectorAll('input');
        for (const element of inputs) {
            // if the value is invalid add the class "red-border" to the input field
            if (!(element.value !== "" && element.value > 0)) {
                element.classList.add('red-border');
            }
        }
    } else {
        hue = calculateColorHue(efficiency);
    }

    //set result text
    result.style.color = `hsl(${hue}, 100%, 45%)`;
    result.innerHTML = efficiency;
});

// add event listener to input fields to capture when the value is changed
document.querySelectorAll('input').forEach((input) => {
    input.addEventListener('input', () => {
        // remove red-border class from input field
        input.classList.remove('red-border');
    });
});

function calculateEfficiency(distance, velocity, packetSize, bitrate) {
    let a = (distance * bitrate) / (velocity * packetSize);

    let result = (1 / (1 + 5*a)) * 100;
    //round to 2 decimal places
    result = Math.round((result + Number.EPSILON) * 100) / 100

    return result;
}

function convertToUnit(value, power) {
    return value * Math.pow(10, power);
}

function clearTextInputs() {
    inDistance.value = "";
    inVelocity.value = "";
    inPacketSize.value = "";
    inBitrate.value = "";
}

function updateInputValues() {
    inDistance.value = convertToUnit(inDistance.value, (settings.distance.power - tempSettings.distance.power));
    inVelocity.value = convertToUnit(inVelocity.value, (settings.velocity.power - tempSettings.velocity.power));
    inPacketSize.value = convertToUnit(inPacketSize.value, (settings.packetSize.power - tempSettings.packetSize.power));
    inBitrate.value = convertToUnit(inBitrate.value, (settings.bitrate.power - tempSettings.bitrate.power));
}

function calculateColorHue(efficiency) {
    //hue is 120 (green) at 100% efficiency and 0 (red) at 0% efficiency
    let hue = 120 - ((100 - efficiency) * 1.2);
    return hue;
}

//start with default settings
let settings = {
    distance: {
        unit: 'm',
        power: 0,
        selectionIndex: 0
    },
    velocity: {
        unit: 'm/s',
        power: 0,
        selectionIndex: 0
    },
    packetSize: {
        unit: 'bits',
        power: 0,
        selectionIndex: 0
    },
    bitrate: {
        unit: 'bits/s',
        power: 0,
        selectionIndex: 0
    }
}

let settingsChanged = false;
let tempSettings;

// load settings from local storage if available
function loadSettingsFromStorage() {
    if (localStorage.getItem('settings') !== null) {
        settings = JSON.parse(localStorage.getItem('settings'));
    }
}

// select buttons in settings modal based on current settings
function updateAllSelections() {
    document.querySelectorAll(".settings-option div").forEach((div) => {
        deselectAllGroupButtons(div.querySelector("button"));
    });
    document.querySelectorAll("#option-distance div button")[settings.distance.selectionIndex].classList.add("multi-selected");
    document.querySelectorAll("#option-velocity div button")[settings.velocity.selectionIndex].classList.add("multi-selected");
    document.querySelectorAll("#option-packet-size div button")[settings.packetSize.selectionIndex].classList.add("multi-selected");
    document.querySelectorAll("#option-bitrate div button")[settings.bitrate.selectionIndex].classList.add("multi-selected");
}

// update the units in the input fields based on the current settings
function updateUnits() {
    document.getElementById('unit-d').innerHTML = settings.distance.unit;
    document.getElementById('unit-v').innerHTML = settings.velocity.unit;
    document.getElementById('unit-l').innerHTML = settings.packetSize.unit;
    document.getElementById('unit-r').innerHTML = settings.bitrate.unit;
}

// load and update both units and selections in settings modal
function loadSettings() {
    loadSettingsFromStorage();
    updateAllSelections();
    updateUnits();
}

// temporarily save settings in tempSettings
function updateTempSettings(button) {
    let dataOption = button.parentNode.parentNode.getAttribute('data-option');

    tempSettings[dataOption].unit = allSettings[button.value].unit;
    tempSettings[dataOption].power = allSettings[button.value].power;
    tempSettings[dataOption].selectionIndex = Array.from(button.parentNode.children).indexOf(button);
}

// deselect all buttons in the same group as the clicked button
function deselectAllGroupButtons(button) {
    let buttons = button.parentNode.children;
    for (const element of buttons) {
        element.classList.remove("multi-selected");
    }
}

// update settings and save them to local storage
function saveSettings() {
    settings = JSON.parse(JSON.stringify(tempSettings));
    localStorage.setItem('settings', JSON.stringify(settings));
}

//add event listener to each settings buttons
document.querySelectorAll(".settings-option div").forEach((div) => {
    div.querySelectorAll("button").forEach((button) => {
        button.addEventListener('click', () => {
            if (!button.classList.contains("multi-selected")) {
                deselectAllGroupButtons(button);
                updateTempSettings(button);
                button.classList.add("multi-selected");
                settingsChanged = true;
            }
        });
    });
});

//add event listener to the save button
document.getElementById('save').addEventListener('click', () => {
    if (settingsChanged) {
        updateInputValues();
        saveSettings();
        updateUnits();
        updateAllSelections();
        settingsChanged = false;
    }
    closeModal();
});

//set copyright year
document.getElementById("current-year").textContent = new Date().getFullYear();

loadSettings();