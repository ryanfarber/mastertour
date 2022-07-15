// mastertour

require("dotenv").config()
const Logger = require("@ryanforever/logger")
const logger = new Logger(__filename, {debug: false})
const axios = require("axios")
let Oath = require("./oath-creator.js")
const dateformat = require("dateformat")
const {DaySchema, ShowSchema, EventSchema, TourSchema} = require("./schemas.js")


function Mastertour(config = {}) {

	let key = config.key
	let secret = config.secret

	if (!key) throw new Error("please enter your [key]")
	if (!secret) throw new Error("please enter your [secret]")

	let defaultTourId = config.tourId
	let url = "https://my.eventric.com/portal/api/v5/"
	let debug = config.debug
	if (debug) logger._debug = true

	let oath = new Oath({
		consumerKey: key,
		consumerSecret: secret,
	})
	this.tourId = defaultTourId

	//! get a list of all tours on master tour
	this.getTours = async function() {
		logger.debug("getting tours...")
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
		data = data.map(x => new TourSchema(x))
		return data
	}

	//! get a tour with a given ID, or the id specified in config
	this.getTour = async function(tourId) {
		tourId = tourId || defaultTourId
		logger.debug(`getting tour ${tourId}...`)
		let request = {
			url: `https://my.eventric.com/portal/api/v5/tour/${tourId}`,
			method: "GET",
			data: { version: 10 }
		}
		let req = { params: oath.create(request)}
		req.params.version = 10

		let res = await axios.get(request.url, req).catch(err => {
			let msg = err?.response?.data?.message
			if (msg) throw new Error(msg)
			else throw new Error(err)
		})
		let raw = res?.data?.data?.tour
		// console.log(data)
		let data = new TourSchema(raw)
		// raw.days = raw.days.map(x => x = new DaySchema(x))
		return data
	}

	//! returns only show days of given tour
	this.getShowDays = async function(tourId) {
		tourId = tourId || defaultTourId
		logger.debug(`getting show days for tour ${tourId}...`)
		let data = await this.getTour(tourId)
		let days = data.days
		let shows = days.filter(x => x.type == "show")
		shows = shows.map(x => {
			x.getShow = async () => this.getDay(x.id)
			return x
		})
		return shows
	}

	//! get details about a specific day
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
		let parsed = new DaySchema(data)
		return parsed
	}


	//! returns current day of tour
	this.getToday = async function(tourId) {
		tourId = tourId || defaultTourId
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
	
	//! get a specific date of the tour
	this.getDate = async function(inputDate) {
		logger.debug("getting specified date...")
		tourId = defaultTourId
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
			let date = new Date(day.date).toLocaleDateString()
			return date == selectedDate
		})
		if (!match) return undefined
		else return match
	}

	//! not sure what this does
	this.getSchedule = async function(dayId) {
		let day = await this.getDay(dayId)
		let items = day.scheduleItems
		let schedule = []

		// parse items //
		items.forEach(item => schedule.push(new EventSchema(item)))
		console.log(schedule)
		return schedule
	}

	//! returns events
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
			events.push(new ShowSchema(event))
		})
		return events
	}


	this.getCrew = async function(tourId) {
		// logger.deprecated("not working")
		tourId = tourId || this.tourId
		logger.debug(`getting crew for tour ${tourId}...`)

		let request = {
			url: `https://my.eventric.com/portal/api/v5/tour/${tourId}/crew`,
			method: "GET",
			data: { version: 10 }
		}
		let req = { params: oath.create(request)}
		req.params.version = 10

		let res = await axios.get(request.url, req).catch(err => {
			let msg = err?.response?.data?.message
			if (msg) throw new Error(msg)
			else throw new Error(err)
		})

		let data = res?.data?.data?.crew
		return data
	}

	//! this does something
	this.test = async function() {
		let res = await axios.get("https://my.eventric.com/portal/api/v5/tours", req).catch(err => {
			throw new Error(err)
		})
		let data = res.data
	}

	//! this retusrns help
	this.help = function() {
		const util = require("util")
		const fs = require("fs")
		let x = fs.readFileSync(__filename, "utf8")
		let methods = []
		// console.log(x)
		let matches = x.match(/\/\/\!.+(.|\n).+?$/mgi)
			// console.log(matches)
		matches.forEach(match => {
			match = match.split("\n")
			let description = match[0].replace("//!" ,"").trim()
			let name = match[1].match(/(?<=this\.).+?(?=\s|\=)/gi)
			if (name) name = name[0]
			if (name) methods.push({name, description})
		})
		// for (let [k, v] of Object.entries(this)) {
		// 	let x = util.inspect(k)
		// 	console.log(x)
		// }
		// console.table(methods)
		console.log("mastertour help\n")
		let list = methods.map(x => `${x.name} - ${x.description}`).join("\n")
		console.log(list)
	}
}

class ERROR extends Error {
	constructor(input) {
		super()

		if (true) {}
	}
}


module.exports = Mastertour

