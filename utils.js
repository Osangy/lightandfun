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
	//const looseCalories = calories * 0.8;
	const looseCalories = calories - 500;

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

function calculatePercentiles(data){
	let percentiles = {};

	// Start by ordering data
	data.sort();

	const len = data.length;

	// 95 percentile
	let percentage = 0.95;
	let nfPercentile = 0.95 * len;
	if(isInt(nfPercentile)){
		percentiles["95"] = (data[nfPercentile] + data[nfPercentile])/2;
	}
	else{
		nfPercentile = Math.round(percentage * len);
		percentiles["95"] = data[nfPercentile];
	}

	// 90 percentile
	percentage = 0.90;
	let nPercentile = percentage * len;
	if(isInt(nPercentile)){
		percentiles["90"] = (data[nPercentile] + data[nPercentile])/2;
	}
	else{
		nPercentile = Math.round(percentage * len);
		percentiles["90"] = data[nPercentile];
	}

	// 75 percentile
	percentage = 0.75;
	let sfPercentile = 0.75 * len;
	if(isInt(sfPercentile)){
		percentiles["75"] = (data[sfPercentile] + data[sfPercentile])/2;
	}
	else{
		sfPercentile = Math.round(percentage * len);
		percentiles["75"] = data[sfPercentile];
	}

	// 50 percentile
	percentage = 0.50;
	let fPercentile = percentage * len;
	if(isInt(fPercentile)){
		percentiles["50"] = (data[fPercentile] + data[fPercentile])/2;
	}
	else{
		fPercentile = Math.round(percentage * len);
		percentiles["50"] = data[fPercentile];
	}

	return percentiles;
}

function howUserPerformToPercentiles(nb, percentiles){
	if(nb > percentiles["95"]) return "95";
	else if(nb > percentiles["90"]) return "90";
	else if(nb > percentiles["75"]) return "75";
	else if(nb > percentiles["50"]) return "50";
	return "0";
}

function isInt(n){
	return Number(n) === n && n % 1 === 0;
}

module.exports = {
	calculateCalories,
	calculateLooseCalories,
	enumActivity,
	calculateIBM,
	calculatePercentiles,
	howUserPerformToPercentiles
};
