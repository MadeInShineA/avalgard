import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { Accounts } from 'meteor/accounts-base';

Meteor.methods({
  'gardens.insert': async function (userId, garden) {
    check(userId, String);
    check(garden, {
      _id: String,
      name: String,
      climateId: String,
      height: Number,
      width: Number,
      tasks: Array,
      plants: Array,
    });

    const NonEmptyString = Match.Where((x) => {
      check(x, String);
      return x.length > 0;
    });
    check(garden.name, NonEmptyString);

    check(garden.climateId, NonEmptyString)

    return await Accounts.users.updateAsync(userId, { $push: { 'profile.gardens': garden } });
  },
  'gardens.remove': async function (userId, gardenId) {
    check(userId, String);
    check(gardenId, String);

    return await Accounts.users.updateAsync(userId, { $pull: { 'profile.gardens': { _id: gardenId } } });
  },
  'gardens.update': async function (userId, gardenId, garden) {
    check(userId, String);
    check(gardenId, String);
    check(garden, Match.ObjectIncluding({
      name: String,
      climateId: String,
      height: Number,
      width: Number,
      tasks: Array,
      plants: Array,
    }));

    // Ne pas permettre la modification de l'ID de l'utilisateur
    // delete garden._id;

    return await Accounts.users.updateAsync(
      { _id: userId, 'profile.gardens._id': gardenId },
      { $set: { 'profile.gardens.$': garden } }
    );
  },
  'gardens.find': async function (userId, gardenId) {
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
  'gardens.findAll': async function (userId) {
    const user = await Accounts.users.findOneAsync(userId);
    if (!user) {
      throw new Meteor.Error('not-found', 'User not found');
    }
    const gardens = user.profile.gardens
    return gardens;
  },
  'gardens.savePlants': async function (userId, gardenId, plants) {
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

    let plantsToSave = []
    plants.forEach(plant => {
      check(plant.plantId, String);
      check(plant.x, Number);
      check(plant.y, Number)
      plantsToSave.push({
        plantId: plant.plantId,
        position: { x: plant.x, y: plant.y },
        width: plant.w,
        height: plant.h,
        lastHarvestDate: plant.lastHarvestDate,
        lastWateringDate: plant.lastWateringDate
      })
    });

    return await Accounts.users.updateAsync(
      { _id: userId, 'profile.gardens._id': gardenId },
      { $set: { 'profile.gardens.$.plants': plantsToSave } }
    );
  },
});
