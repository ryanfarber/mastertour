// schemas.js


const dateformat = require("dateformat")
// day-schema.js


function parseDayType(input) {
	let dayTypes = new Map([
		["travel", "travel"],
		["travel day", "travel"],
		["off", "off"],
		["day off", "off"],
		["show", "show"],
		["show day", "show"]
	])
	input = input.toLowerCase().trim()

	let keys = Array.from(dayTypes.keys())
	let type
	keys.forEach(key => {
		if (input == key) type = dayTypes.get(key)
	})


	if (type) return type
	else return undefined

}


// DAY SCHEMA //
function DaySchema(d = {}) {
	
	let newSchedule = []
	if (d.hasOwnProperty("scheduleItems")) {
		d.scheduleItems.forEach(item => {
			newSchedule.push(new EventSchema(item))
		})
	}


	let date = new Date(d.dayDate)
	this.name = d.name
	this.type = d.dayType
	this.dateString = dateformat(date, "mmmm dd, yyyy"),
	this.id = d.id
	this.date = date
	this.timezone = d.timeZone
	this.city = d.city
	this.state = d.state
	this.country = d.country
	this.notes = d.generalNotes
	this.hotelNotes = d.hotelNotes
	this.travelNotes = d.travelNotes
	this.schedule = newSchedule
	this.tourId = d.tourId
	this.raw = undefined

	this.type = parseDayType(d.dayType) || parseDayType(d.name)
	Object.defineProperty(this, "raw", {get: function() {return d}})
	for (let [key, val] of Object.entries(this)) if (val == "") this[key] = undefined

}


// SHOW SCHEMA //
function ShowSchema(d = {}) {
	this.eventName = d.eventName
	this.venueName = d.venueName
	this.fullAddress = undefined
	this.street = d.venueAddressLine1
	this.city = d.venueCity
	this.state = d.venueState
	this.zipCode = d.venueZip
	this.country = d.venueCountry
	this.capacity = d.venueCapacity
	this.type = d.venueType
	this.timeZone = d.venueTimeZone
	this.url = d.venuePrimaryUrl
	this.contacts = d.venueContacts
	this.fullAddress = `${this.street}, ${this.city}, ${this.state}, ${this.zipCode}`
	this.raw = undefined
	Object.defineProperty(this, "raw", {get: function() {return d}})
	for (let [key, val] of Object.entries(this)) if (val == "") this[key] = undefined
}


function EventSchema(d = {}) {

	let start = new Date(d.startDatetime)
	let end = new Date(d.endDatetime)

	let timeZone = d.dayTimeZone
	this.time = dateformat(start, ("h:MMTT"))
	this.title = d.title
	this.details = d.details
	this.start = start
	this.end = end
	this.startString = start.toLocaleString({timeZone}),
	this.timeZone = timeZone
	this.id = d.id
	this.dayId = d.parentDayId
	this.raw = undefined
	Object.defineProperty(this, "raw", {get: function() {return d}})
	for (let [key, val] of Object.entries(this)) if (val == "") this[key] = undefined
}


function TourSchema(d = {}) {
	this.artistName = d.artistName
	this.legName = d.legName
	this.tourName = d.tourName
	this.id = d.tourId || d.id
	this.artistId = d.artistId
	this.tourGraphics = d.tourGraphics
	this.artistGraphics = d.artistGraphics
	this.raw = undefined
	this.days = undefined
	if (d.days) this.days = d.days.map(x => x = new DaySchema(x))

	Object.defineProperty(this, "raw", {get: function() {return d}})
	for (let [key, val] of Object.entries(this)) if (val == "") this[key] = undefined
}


module.exports = {DaySchema, ShowSchema, EventSchema, TourSchema}