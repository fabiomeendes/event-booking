const bcrypt = require('bcryptjs');

const Event = require('../../models/event');
const User = require('../../models/user');
const Booking = require('../../models/booking');

const events = async eventIds => {    
    try {
        const events = await Event.find( { _id: {$in: eventIds } });
        return events.map(event => {
            return {
                ...event._doc,
                date: new Date(event._doc.date).toISOString(),  
                creator: user.bind(this, event.creator)
            }
        });
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
}

module.exports = {
    events: async () => {
        try {
            const events = await Event.find();
            return events.map(event => {
                return {
                    ...event._doc,
                    date: new Date(event._doc.date).toISOString(),
                    creator: user.bind(this, event._doc.creator)
                };
                //return { ...event._doc, _id: event._doc._id.toString() };
                //return { ...event._doc, _id: event.id }; id is a string already                 
            });
        } catch (err){
            throw err;
        }                                
    },
    bookings: async () => {
        try {
            const bookings = await Booking.find();
            return bookings.map(booking => {
                return {
                    ...booking._doc,
                    _id: booking.id,
                    createdAt: new Date(booking._doc.createdAt).toISOString(),
                    updateAt: new Date(booking._doc.createdAt).toISOString()
                };
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
            date: new Date(args.eventInput.date),
            creator: '5cc0ba8ba77f37172c7a0cc9'
        });
        let createdEvent;
        try {
            const result = await event.save();                
            createdEvent = {
                ...result._doc,
                date: new Date(event._doc.date).toISOString(),
                creator: user.bind(this, result._doc.creator)
            };
            //return { ...result._doc, _id: result._doc._id.toString() };
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
        const fetchedEvent = await Event.findOne({ _id: args.eventId});        
        if (!fetchedEvent) {
            throw new Error('Event not found!');
        }
        const booking = new Booking ({ 
            user: '5cc0ba8ba77f37172c7a0cc9', // the same name -> model
            event: fetchedEvent
        });
        const result = await booking.save();
        return {
            ...result._doc,
            _id: result.id,
            createdAt: new Date(result._doc.createdAt).toString(),
            updateAt: new Date(result._doc.updateAt).toString()
        };
    }
}