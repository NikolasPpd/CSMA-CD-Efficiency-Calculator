// ***************************************************
//                    MODAL WINDOW
// ***************************************************
// get the modal
var modal = document.getElementById("settings-modal");
// get the settings button
var btnModalOpen = document.getElementById("settings-button");
// get the close button
var btnModalClose = document.getElementsByClassName("close")[0];

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
    //copy current settings to tempSettings without reference
    tempSettings = JSON.parse(JSON.stringify(settings));
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
    updateAllSelections();
}

// ***************************************************
//                CALCULATE FUNCTIONS
// ***************************************************
let distance;
let velocity;
let packetSize;
let bitrate;
//add event listener to the Calculate button
document.getElementById('calculate').addEventListener('click', () => {
    //get values from the input fields
    distance = convertToBaseUnit(document.getElementById('eff-d').value, settings.distance.power);
    velocity = convertToBaseUnit(document.getElementById('eff-v').value, settings.velocity.power);
    packetSize = convertToBaseUnit(document.getElementById('eff-l').value, settings.packetSize.power);
    bitrate = convertToBaseUnit(document.getElementById('eff-r').value, settings.bitrate.power);

    //calculate efficiency and text color hue
    let efficiency = calculateEfficiency(distance, velocity, packetSize, bitrate);
    let result = document.getElementById('result');
    let hue;
    if (isNaN(efficiency)) {
        hue = 0;
    } else {
        hue = calculateColorHue(efficiency);
    }

    //set result text
    result.style.color = `hsl(${hue}, 100%, 45%)`;
    result.innerHTML = efficiency;
});

function calculateEfficiency(distance, velocity, packetSize, bitrate) {
    let a = (distance * bitrate) / (velocity * packetSize);

    let result = (1 / (1 + 5*a)) * 100;
    //round to 2 decimal places
    result = Math.round((result + Number.EPSILON) * 100) / 100

    return result;
}

function convertToBaseUnit(value, power) {
    return value * Math.pow(10, power);
}

function clearTextInputs() {
    document.getElementById('eff-d').value = "";
    document.getElementById('eff-v').value = "";
    document.getElementById('eff-l').value = "";
    document.getElementById('eff-r').value = "";
}

function calculateColorHue(efficiency) {
    //hue is 120 (green) at 100% efficiency and 0 (red) at 0% efficiency
    let hue = 120 - ((100 - efficiency) * 1.2);
    return hue;
}

// ***************************************************
//                    SETTINGS
// ***************************************************
//all available settings
let allSettings = {
    //distance
    m: {
        unit: 'm',
        power: 0
    },
    km: {
        unit: 'km',
        power: 3
    },
    //velocity
    ms: {
        unit: 'm/s',
        power: 0
    },
    kms: {
        unit: 'km/s',
        power: 3
    },
    //packet size
    bits: {
        unit: 'bits',
        power: 0
    },
    kbits: {
        unit: 'Kb',
        power: 3
    },
    mbits: {
        unit: 'Mb',
        power: 6
    },
    gbits: {
        unit: 'Gb',
        power: 9
    },
    tbits: {
        unit: 'Tb',
        power: 12
    },
    //bitrate
    bps: {
        unit: 'bits/s',
        power: 0
    },
    kbps: {
        unit: 'Kb/s',
        power: 3
    },
    mbps: {
        unit: 'Mb/s',
        power: 6
    },
    gbps: {
        unit: 'Gb/s',
        power: 9
    },
    tbps: {
        unit: 'Tb/s',
        power: 12
    }
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
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].classList.remove("multi-selected");
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
        clearTextInputs();
        saveSettings();
        updateUnits();
        updateAllSelections();
        settingsChanged = false;
    }
    closeModal();
});

loadSettings();