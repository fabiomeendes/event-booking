const bcrypt = require('bcryptjs');

const Event = require('../../models/event');
const User = require('../../models/user');
const Booking = require('../../models/booking');
const { dateToString } = require('../../helpers/date');

const transformerEvent = event => {
    return {
        ...event._doc,
        _id: event.id, // maybe don´t need
        date: dateToString(event._doc.date),
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
        createdAt: dateToString(booking._doc.createdAt),
        updateAt: dateToString(booking._doc.updateAt)
    }
}

const events = async eventIds => {    
    try {
        const events = await Event.find( { _id: {$in: eventIds } });
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
    } catch(err) {
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
}

module.exports = {
    events: async () => {
        try {
            const events = await Event.find();
            return events.map(event => {
                return transformerEvent(event);
                             
            });
        } catch (err){
            throw err;
        }                                
    },
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
    createEvent: async args => {            
        const event = new Event({
            title: args.eventInput.title,
            description: args.eventInput.description,
            price: args.eventInput.price,
            date: dateToString(args.eventInput.date),
            creator: '5cc0ba8ba77f37172c7a0cc9'
        });
        let createdEvent;
        try {
            const result = await event.save();                
            createdEvent = transformerEvent(result);            
            const creator = await User.findById('5cc0ba8ba77f37172c7a0cc9');
            if (!creator) {
                throw new Error('User not found!');
            }
            creator.createdEvents.push(event); // can pass whe event id too
            await creator.save();
            return createdEvent;
        } catch (err) {
            throw err;
        }
    },
    createUser: async args => {
        try {
            const existingUser = await User.findOne({ email: args.userInput.email });
            if (existingUser) {
                throw new Error('User exists already!');
            }
            const hashedPassword = await bcrypt.hash(args.userInput.password, 12);                         
            const user = new User({
                email: args.userInput.email,
                password: hashedPassword
            });
            const result = await user.save();
            return {...result._doc, password: null, _id: result.id}
        } catch (err) {
            throw err;
        }
    },
    bookEvent: async args => { // the same name -> root mutation/query        
        const fetchedEvent = await Event.findOne({ _id: args.eventId });        
        if (!fetchedEvent) {
            throw new Error('Event not found!');
        }
        const booking = new Booking ({ 
            user: '5cc0ba8ba77f37172c7a0cc9', // the same name -> model
            event: fetchedEvent
        });
        const result = await booking.save();
        return transformBooking(result);
    },
    cancelBooking: async args => {
        try {
            const booking = await Booking.findById(args.bookingId).populate('event');
            const event = transformerEvent(booking._doc.event);
            await Booking.deleteOne({ _id: args.bookingId });
            return event;
        } catch (err) {
            throw err;
        }
    }
}