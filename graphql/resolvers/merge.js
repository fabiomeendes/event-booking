const Event = require('../../models/event');
const User = require('../../models/user');
const { dateToString, dateToISOString } = require('../../helpers/date');

const events = async eventIds => {
    try {
        const events = await Event.find({
            _id: {
                $in: eventIds
            }
        });
        return events.map(event => {
            return transformerEvent(event);
        });
    } catch (err) {
        throw err;
    }
}

const singleEvent = async eventId => {
    try {
        const event = await Event.findById(eventId);
        return transformerEvent(event);
    } catch (err) {
        throw err;
    }
}

const user = async userId => {
    try {
        const user = await User.findById(userId);
        return {
            ...user._doc,
            createdEvents: events.bind(this, user._doc.createdEvents)
        };
    } catch (err) {
        throw err;
    }
};

const transformerEvent = event => {    
    return {
        ...event._doc,
        _id: event.id, // maybe don´t need
        date: dateToISOString(event._doc.date),
        creator: user.bind(this, event.creator)
        // return { ...event._doc, _id: event._doc._id.toString() };
        // return { ...event._doc, _id: event.id }; id is a string already
    };
}

const transformBooking = booking => {    
    return {
        ...booking._doc,
        _id: booking.id,
        user: user.bind(this, booking._doc.user),
        event: singleEvent.bind(this, booking._doc.event),
        createdAt: dateToISOString(booking._doc.createdAt),
        updatedAt: dateToISOString(booking._doc.updatedAt)
    }
}

exports.transformBooking = transformBooking;
exports.transformerEvent = transformerEvent;
//exports.user = user;
//exports.events = events;
//exports.singleEvent = singleEvent;
