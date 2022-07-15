

const Mastertour = require("./src/mastertour.js")
let mastertour = new Mastertour({
	key: process.env.MASTERTOUR_KEY,
	secret: process.env.MASTERTOUR_SECRET,
	tourId: process.env.TOUR_ID,
	debug: true
})

// mastertour.help()
// mastertour.getTour(tourId).then(data => {
// 	// console.log(data)
// 	let dates = data.days
// 	let shows = dates.filter(x => (x.type) ? x.type.toLowerCase().includes("show") : false)
// 	mastertour.getDay(shows[0].id).then(console.log)
// 	// console.log(show)
// 	// console.log(shows)
// })

// mastertour.getTour().then(console.log)

// mastertour.getShowDays().then(console.log)
mastertour.getShowDays().then(res => {
	res[0].getShow().then(show => {
		console.log(show.schedule[0].raw)
	})
})


// mastertour.getTours().then(console.log)
// mastertour.getToday().then(console.log)
// mastertour.getDate("sep 16").then(({raw}) => console.log(raw))
// mastertour.getCrew().then(console.log)