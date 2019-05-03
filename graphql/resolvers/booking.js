/* eslint-disable no-underscore-dangle */
const Booking = require('../../models/booking');
const Event = require('../../models/event');
const { transformBooking, transformerEvent } = require('./merge');

module.exports = {
  bookings: async (args, req) => {
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }
    try {
      const bookings = await Booking.find();
      return bookings.map(booking => transformBooking(booking));
    } catch (err) {
      throw err;
    }
  },
  bookEvent: async (args, req) => { // the same name -> root mutation/query
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }
    const fetchedEvent = await Event.findOne({ _id: args.eventId });
    if (!fetchedEvent) {
      throw new Error('Event not found!');
    }
    const booking = new Booking({
      user: req.userId, // the same name -> model
      event: fetchedEvent,
    });
    const result = await booking.save();
    return transformBooking(result);
  },
  cancelBooking: async (args, req) => {
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }
    try {
      const booking = await Booking.findById(args.bookingId).populate('event');
      const event = transformerEvent(booking._doc.event);
      await Booking.deleteOne({
        _id: args.bookingId,
      });
      return event;
    } catch (err) {
      throw err;
    }
  },
};
