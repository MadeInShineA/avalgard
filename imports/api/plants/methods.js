import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { PlantsCollection } from '../collections.js';

Meteor.methods({
  'plants.findAll': async function () {
    const plants = await PlantsCollection.find().fetch();
    return plants;
  },

  'plants.search': async function (q) {
    check(q, String);

    const regex = new RegExp(q, 'i');
    const plants = await PlantsCollection.find({ name: { $regex: regex } }).fetch();
    return plants;
  },
  'plants.findByName': async function (plantName) {
    check(plantName, String);

    const plant = await PlantsCollection.findOneAsync({ name: plantName });
    if (!plant) {
      throw new Meteor.Error('not-found', 'Plant not found');
    }

    return plant;
  },
  'plants.findById': async function (plantId) {
    check(plantId, String)

    const plant = await PlantsCollection.findOneAsync({ _id: plantId });
    if (!plant) {
      throw new Meteor.Error('not-found', 'Plant not foud');
    }
    return plant
  }
});
