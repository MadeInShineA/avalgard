import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { Accounts } from 'meteor/accounts-base';

Meteor.methods({
  'gardens.insert': async function(userId, garden) {
    check(userId, String);
    check(garden, {
      _id: String,
      name: String,
      climateId: String,
      tasks: Array,
      plants: Array,
    });

    return await Accounts.users.updateAsync(userId, { $push: { 'profile.gardens': garden } });
  },
  'gardens.remove': async function(userId, gardenId) {
    check(userId, String);
    check(gardenId, String);

    return await Accounts.users.updateAsync(userId, { $pull: { 'profile.gardens': { _id: gardenId } } });
  },
  'gardens.update': async function(userId, gardenId, garden) {
    check(userId, String);
    check(gardenId, String);
    check(garden, Match.ObjectIncluding({
      name: String,
      climateId: String,
      tasks: Array,
      plants: Array,
    }));

    // Ne pas permettre la modification de l'ID de l'utilisateur
    delete garden._id;

    return await Accounts.users.updateAsync(
      { _id: userId, 'profile.gardens._id': gardenId },
      { $set: { 'profile.gardens.$': garden } }
    );
  },
  'gardens.find': async function(userId, gardenId) {
    check(userId, String);
    check(gardenId, String);

    const user = await Accounts.users.findOneAsync(userId);
    if (!user || !user.profile || !user.profile.gardens) {
      throw new Meteor.Error('not-found', 'User or garden not found');
    }

    const garden = user.profile.gardens.find(g => g._id === gardenId);
    if (!garden) {
      throw new Meteor.Error('not-found', 'Garden not found');
    }

    return garden;
  },
  'gardens.findAll': async function() {
    const users = await Accounts.users.find().fetch();
    const gardens = users.flatMap(user => 
      (user.profile?.gardens || []).map(garden => ({
        ...garden,
        username: user.username
      }))
    );
    return gardens;
  },
});