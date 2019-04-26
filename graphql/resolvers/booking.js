const Booking = require('../../models/booking');
const Event = require('../../models/event');
const { transformBooking, transformerEvent } = require('./merge');

module.exports = {    
    bookings: async () => {
        try {
            const bookings = await Booking.find();
            return bookings.map(booking => {
                return transformBooking(booking);
            });
        } catch (err) {
            throw err;
        }
    },
    bookEvent: async args => { // the same name -> root mutation/query        
        const fetchedEvent = await Event.findOne({ _id: args.eventId });
        if (!fetchedEvent) {
            throw new Error('Event not found!');
        }
        const booking = new Booking({
            user: '5cc201a34e2ffb1a74e694ce', // the same name -> model
            event: fetchedEvent
        });
        const result = await booking.save();
        return transformBooking(result);
    },
    cancelBooking: async args => {
        try {
            const booking = await Booking.findById(args.bookingId).populate('event');
            const event = transformerEvent(booking._doc.event);
            await Booking.deleteOne({
                _id: args.bookingId
            });
            return event;
        } catch (err) {
            throw err;
        }
    }
}