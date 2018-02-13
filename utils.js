const _ = require('lodash');
const emojiStrip = require('emoji-strip');

function calculateCalories(gender, size, weight, age, activity) {
	//Mifflin - St Jeor Formula : https://www.freedieting.com/calorie-needs
	let calories;
	if (gender === 'male') {
		calories = 10 * weight + 6.25 * size + 5 * age + 5;
	} else {
		calories = 10 * weight + 6.25 * size + 5 * age - 161;
	}

	const modifiedActivity = _.deburr(
		_.trimEnd(emojiStrip(activity.toLowerCase()))
	);

	console.log(modifiedActivity);
	switch (modifiedActivity) {
		case 'sedentaire':
			calories = calories * 1;
			break;
		case 'peu actif':
			calories = calories * 1.2;
			break;
		case 'moyennement actif':
			calories = calories * 1.4;
			break;
		case 'tres actif':
			calories = calories * 1.6;
			break;
		default:
			calories = calories * 1;
	}

	return Math.round(calories);
}

//How many calories if the user wants to loose some weight
function calculateLooseCalories(calories) {
	//Mifflin - St Jeor Formula : https://www.freedieting.com/calorie-needs
	const looseCalories = calories * 0.8;

	return Math.round(looseCalories);
}

//Transform activity in an integer
function enumActivity(activity) {
	const modifiedActivity = _.deburr(
		_.trimEnd(emojiStrip(activity.toLowerCase()))
	);

	switch (modifiedActivity) {
		case 'sedentaire':
			return 0;
			break;
		case 'peu actif':
			return 1;
			break;
		case 'moyennement actif':
			return 2;
			break;
		case 'tres actif':
			return 3;
			break;
		default:
			return 0;
	}
}

//Use De Creff formula : https://www.calculersonimc.fr/autres-calculs/poids-ideal-creff.html
function calculateIBM(height, age, frame){
	let ibm = (height - 100 + (age/10)) * 0.9;

	switch (frame.toLowerCase()) {
		case 'mince':
			ibm = ibm * 0.9;
			break;
		case 'normale':
			ibm = ibm;
			break;
		case 'large':
			ibm = ibm * 1.1;
			break;
		default:
			ibm = ibm;
	}

	return Math.round(ibm);
}

module.exports = {
	calculateCalories,
	calculateLooseCalories,
	enumActivity,
	calculateIBM
};
