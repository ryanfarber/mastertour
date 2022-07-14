# mastertour
interact with the API for [Master Tour](https://www.eventric.com/master-tour-management-software/)

***this is a work in progress and should not be used for production!***

## usage
```javascript

const Mastertour = require("mastertour")
const mastertour = new Mastertour({
    key: process.env.MASTERTOUR_KEY,
    secret: process.env.MASTERTOUR_SECRET
    tourId: "abcdefg1234567" // optional tour id which will be used for calls
})

mastertour.getTours().then(console.log)
```

## methods
- `getTours` - get a list of all tours from your account
- `getTour` - get data for a given tour
- `getDay` - get data about a specific day
- `getToday` - returns data for current date
- `getDate` - get data given a specified date