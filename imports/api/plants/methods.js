import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { PlantsCollection } from '/imports/api/plants';

Meteor.methods({
  'plants.findAll': async function() {
    const plants = await PlantsCollection.find().fetch();
    return plants;
  },

  'plants.search': async function(q) {
    check(q, String);

    const regex = new RegExp(q, 'i');
    const plants = await PlantsCollection.find({name: { $regex: regex }}).fetch();
    return plants;
  },
});
