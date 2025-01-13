import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { ClimatesCollection } from '/imports/api/climates'

Meteor.methods({
  'climates.findAll': async function() {
    const climates = await ClimatesCollection.find().fetchAsync()
    return climates;
  },
});