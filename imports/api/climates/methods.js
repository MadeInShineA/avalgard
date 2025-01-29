import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { ClimatesCollection } from '/imports/api/collections';

Meteor.methods({
  'climates.findByName': async function(climateName) {
    check(climateName, String);

    const climate = await ClimatesCollection.findOneAsync({ name: climateName });
    if (!climate) {
      throw new Meteor.Error('not-found', 'Climate not found');
    }

    return climate;
  },
  'climates.findById': async function(climateId) {
    check(climateId, String);
    console.log("Climate id: " + climateId)
    const climate = await ClimatesCollection.findOneAsync({ _id: climateId });
    if (!climate) {
      throw new Meteor.Error('not-found', 'Climate not found');
    }

    return climate;
  },
  'climates.findAll': async function() {
    const climates = await ClimatesCollection.find().fetch();
    return climates;
  },
});