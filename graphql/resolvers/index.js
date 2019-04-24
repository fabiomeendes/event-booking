const bcrypt = require('bcryptjs');

const Event = require('../../models/event');
const User = require('../../models/user');

module.exports = {
        events: () => {
            return Event.find()
                .populate('creator')
                .then(events => {
                    return events.map(event => {
                        return { 
                            ...event._doc,
                            creator: {
                                ...event._doc.creator._doc,
                            }
                        };
                        //return { ...event._doc, _id: event._doc._id.toString() };
                        //return { ...event._doc, _id: event.id }; id is a string already                 
                    });
                }).catch(err => {
                    throw err; 
                });
        },
        createEvent: args => {            
            const event = new Event({
                title: args.eventInput.title,
                description: args.eventInput.description,
                price: args.eventInput.price,
                date: new Date(args.eventInput.date),
                creator: '5cbc7eee4618b948a80d5712'
            });
            let createdEvent;
            return event
            .save()
            .then(result => {                
                createdEvent = { ...result._doc };
                //return { ...result._doc, _id: result._doc._id.toString() };   
                return User.findById('5cbc7eee4618b948a80d5712');
            })
            .then(user => {
                 if (!user) {
                    throw new Error('User not found');
                }
                user.createdEvents.push(event); // can pass whe event id too
                return user.save();
            })
            .then(result => {
                return createdEvent;                   
            })
            .catch(err => {
                console.log(err,"error");
                throw err;
            });            
        },
        createUser: args => {
            return User.findOne({email: args.userInput.email})                
                .then(user => {
                    if (user) {
                        throw new Error('User exists already');
                    }
                    return bcrypt.hash(args.userInput.password, 12);
                })
                .then(hashedPassword => {
                    const user = new User({
                        email: args.userInput.email,
                        password: hashedPassword
                    });
                    return user.save();
                })
                .then(result => {
                    return {...result._doc, password: null, _id: result.id}
                })
                .catch(err => {
                    throw err;
                });            
        }
    }