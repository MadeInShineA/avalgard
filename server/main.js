import { Meteor } from 'meteor/meteor';
import { Random } from "meteor/random";
import { ClimatesCollection, PlantsCollection } from '/imports/api/collections';
import { Accounts } from 'meteor/accounts-base';
import plantsData from '../data/plant_data.json';
import climatesData from '../data/climate_data.json';
import '../imports/api/climates/methods';
import '../imports/api/gardens/methods';
import '../imports/api/users/methods';

Meteor.startup(async () => {
  if (await PlantsCollection.find().countAsync() === 0) {
    await Promise.all(plantsData.map(plant => PlantsCollection.insertAsync(plant)));
  }

  if (await ClimatesCollection.find().countAsync() === 0) {
    await Promise.all(climatesData.map(climate => ClimatesCollection.insertAsync(climate)));
  }

  const pmudry = await Accounts.findUserByUsername('pmudry');
  if (!pmudry) {
    const allClimates = await Meteor.callAsync('climates.findAll');
    const firstClimate = allClimates[0]

    await Accounts.createUserAsync({
      username: 'pmudry',
      password: 'isc',
      profile: {
        gardens: [
          {
            _id: firstClimate._id,
            name: 'Main garden',
            climateId: firstClimate._id,
            tasks: [
              {
                _id: Random.id(),
                name: "task name",
                description: "task",
                deadLine: new Date(),
                completed: false,
              }
            ],
            plants: [
              {
                _id: Random.id(),
                plantId: 'id',
                position: { x: 2, y: 2 },
                lastHarvestDate: new Date(),
                lastWateringDate: new Date(),
              }
            ]
          }
        ]
      }
    });
  }
});
