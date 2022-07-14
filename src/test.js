

const Mastertour = require("./src.js")
let mastertour = new Mastertour({
	key: process.env.MASTERTOUR_KEY,
	secret: process.env.MASTERTOUR_SECRET,
	tourId: "cac799152a836556cd931594df1c6a6ec6203738",
	debug: true
})

let tourId = "cac799152a836556cd931594df1c6a6ec6203738"
let dayId = "7381aa0c16133f117b59920961a5af4b50ccf36f"

mastertour.help()
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


// mastertour.getTours().then(console.log)
// mastertour.getToday().then(console.log)
// mastertour.getDate("mar 22").then(console.log)