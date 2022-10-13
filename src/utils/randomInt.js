//Returns a random integer between min and max included;
//min: 1, max:5 can give [1, 2, 3, 4, 5]
export function randomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min)
}