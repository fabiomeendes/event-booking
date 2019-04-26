const Event = require('../../models/event');
const User = require('../../models/user');
const { transformerEvent } = require('./merge');

module.exports = {
    events: async () => {
        try {
            const events = await Event.find();
            return events.map(event => {
                return transformerEvent(event);
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
            creator: '5cc201a34e2ffb1a74e694ce'
        });
        let createdEvent;
        try {
            const result = await event.save();
            createdEvent = transformerEvent(result);
            const creator = await User.findById('5cc201a34e2ffb1a74e694ce');
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
}