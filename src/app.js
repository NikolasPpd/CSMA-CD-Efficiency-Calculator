//add event listener to button
document.getElementById('calculate').addEventListener('click', () => {
    //get values from input fields
    let distance = document.getElementById('eff-d').value;
    let velocity = document.getElementById('eff-v').value;
    let packetSize = document.getElementById('eff-l').value;
    let bitrate = document.getElementById('eff-r').value;

    //calculate efficiency and text color hue
    let efficiency = calculateEfficiency(distance, velocity, packetSize, bitrate);
    let hue = calculateColorHue(efficiency);
    let result = document.getElementById('result');

    //set result text
    result.style.color = `hsl(${hue}, 100%, 45%)`;
    result.innerHTML = efficiency;
});

function calculateEfficiency(distance, velocity, packetSize, bitrate) {
    let t_propagation = distance / velocity;
    let t_transmission = packetSize / bitrate;
    let a = t_propagation / t_transmission;

    let result = (1 / (1 + 5*a)) * 100;
    //round to 2 decimal places
    result = Math.round((result + Number.EPSILON) * 100) / 100

    return result;
}

function calculateColorHue(efficiency) {
    //hue is 120 (green) at 100% efficiency and 0 (red) at 0% efficiency
    let hue = 120 - ((100 - efficiency) * 1.2);
    return hue;
}