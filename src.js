

require("dotenv").config();
const Logger = require("@ryanforever/logger")
const logger = new Logger(__filename, {debug: true})
const axios = require("axios")
let Oath = require("./oath-creator.js")
const dateformat = require("dateformat")




function Mastertour(config = {}) {

	let key = config.key
	let secret = config.secret
	let defaultTourId = config.tourId
	let url = "https://my.eventric.com/portal/api/v5/"

	let oath = new Oath({
		consumerKey: key,
		consumerSecret: secret,
	})


	// GET TOURS // returns the tours on mastertour
	this.getTours = async function() {
		let request = {
			url: "https://my.eventric.com/portal/api/v5/tours",
			method: "GET",
			data: { version: 10 }
		}
		let req = { params: oath.create(request)}
		req.params.version = 10

		let res = await axios.get(request.url, req).catch(err => {
			throw new Error(err)
		})
		let data = res?.data?.data?.tours
		return data
	}

	// GET TOUR // returns the tour
	this.getTour = async function(tourId) {
		tourId = tourId || defaultTourId
		let request = {
			url: `https://my.eventric.com/portal/api/v5/tour/${tourId}`,
			method: "GET",
			data: { version: 10 }
		}
		let req = { params: oath.create(request)}
		req.params.version = 10

		let res = await axios.get(request.url, req).catch(err => {
			throw new Error(err)
		})
		let data = res?.data?.data?.tour
		return data
	}

	// GET DAY // returns day
	this.getDay = async function(dayId) {
		logger.debug(`getting day "${dayId}"...`)
		let request = {
			url: `https://my.eventric.com/portal/api/v5/day/${dayId}`,
			method: "GET",
			data: { version: 10 }
		}
		let req = { params: oath.create(request)}
		req.params.version = 10

		let res = await axios.get(request.url, req).catch(err => {
			throw new Error(err)
		})
		let data = res?.data?.data?.day
		logger.debug("parsing day...")
		// console.log(data)
		let parsed = parseDay(data)
		console.log(parsed)
		// return data
	}


	// GET TODAY // returns the current day of the tour
	this.getToday = async function(tourId) {
		logger.debug("getting today's info...")
		let tour = await this.getTour(tourId)
		let today = new Date(Date.now()).toLocaleDateString()
		logger.debug(`today's date: ${today}`)
		let match = tour.days.find(day => {
			let date = new Date(day.dayDate).toLocaleDateString()
			return date == today
		})
		if (!match) return undefined
		else return match
	}
	
	// GET DATE // returns a specific date of the tour
	this.getDate = async function(inputDate) {
		logger.debug("getting specified date...")
		let tour = await this.getTour(tourId)
		let year = new Date(inputDate).getFullYear()
		let currentYear = new Date(Date.now()).getFullYear()
		let selectedDate = new Date(inputDate)
		if (year !== currentYear) {
			selectedDate.setFullYear(currentYear)
		}
		selectedDate = selectedDate.toLocaleDateString()
		
		logger.debug(`selected date: ${selectedDate}`)
		let match = tour.days.find(day => {
			let date = new Date(day.dayDate).toLocaleDateString()
			return date == selectedDate
		})
		if (!match) return undefined
		else return match
	}

	// GET SCHEDULE // 
	this.getSchedule = async function(dayId) {
		let day = await this.getDay(dayId)
		let items = day.scheduleItems
		let schedule = []

		// parse items //
		items.forEach(item => schedule.push(parseScheduleEvent(item)))
		console.log(schedule)
		return schedule
	}

	// GET EVENTS // returns events
	this.getEvents = async function(dayId) {
		let request = {
			url: `https://my.eventric.com/portal/api/v5/day/${dayId}/events`,
			method: "GET",
			data: { version: 10 }
		}
		let req = { params: oath.create(request)}
		req.params.version = 10

		let res = await axios.get(request.url, req).catch(err => {
			throw new Error(err)
		})
		let rawEvents = res?.data?.data?.events
		let events = []

		logger.debug("parsing show data...")
		rawEvents.forEach(event => {
			events.push(parseShow(event))
		})
		return events
	}

	// TEST //
	this.test = async function() {
		let res = await axios.get("https://my.eventric.com/portal/api/v5/tours", req).catch(err => {
			throw new Error(err)
		})
		let data = res.data
	}


	function parseDay(input) {
		let newSchedule = []
		input.scheduleItems.forEach(item => {
			newSchedule.push(parseScheduleEvent(item))
		})
		let date = new Date(input.dayDate)
		let schema = {
			name: input.name,
			date: date,
			dateString: dateformat(date, "mmmm dd, yyyy"),
			city: input.city,
			state: input.state,
			country: input.country,
			notes: input.generalNotes,
			hotelNotes: input.hotelNotes,
			travelNotes: input.travelNotes,
			schedule: newSchedule
		}
		return schema
	}

	function parseShow(input) {
		// console.log(input)
		let schema = {
			eventName: input.eventName,
			venueName: input.venueName,
			fullAddress: undefined,
			street: input.venueAddressLine1,
			city: input.venueCity,
			state: input.venueState,
			zipCode: input.venueZip,
			country: input.venueCountry,
			capacity: input.venueCapacity,
			type: input.venueType,
			timeZone: input.venueTimeZone,
			url: input.venuePrimaryUrl,
			contacts: input.venueContacts
		}
		schema.fullAddress = `${schema.street}, ${schema.city}, ${schema.state}, ${schema.zipCode}`
		return schema
	}

	// PARSE SCHEDULE EVENT // returns simplified event
	function parseScheduleEvent(input) {
		console.log(input)
		let start = new Date(input.startDatetime)
		let end = new Date(input.endDatetime)

		let timeZone = input.dayTimeZone
		let schema = {
			time: dateformat(start, ("h:MMTT")),
			title: input.title,
			details: input.details,
			start: start,
			end: end,
			startString: start.toLocaleString({timeZone}),
			timeZone: timeZone,
			id: input.id,
			dayId: input.parentDayId
		}

		return schema
	}
}



let mastertour = new Mastertour({
	key: process.env.MASTERTOUR_KEY,
	secret: process.env.MASTERTOUR_SECRET,
	tourId: "35c66c4606b76ae73be2eaf54ee396c59a9bf36d"
})

let tourId = "35c66c4606b76ae73be2eaf54ee396c59a9bf36d"
let dayId = "7381aa0c16133f117b59920961a5af4b50ccf36f"

// mastertour.getTour().then(console.log)
// mastertour.getTour().then(console.log)
// mastertour.getToday().then(console.log)
mastertour.getDate("mar 22").then(console.log)




