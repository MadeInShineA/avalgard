import { Meteor } from 'meteor/meteor';
import { Random } from "meteor/random";
import { PlantsCollection } from '/imports/api/plants';
import { ClimatesCollection } from '/imports/api/climates';
import { Accounts } from 'meteor/accounts-base';
import '../imports/api/gardens/methods';
import './methods';

Meteor.startup(async () => {
  if ((await ClimatesCollection.find().countAsync()) === 0) {
    await Promise.all([
      ClimatesCollection.insertAsync({
        name: 'Temperate',
        description: 'Moderate climate with four distinct seasons',
        temperatureRange: { min: 5, max: 25 }
      }),
      ClimatesCollection.insertAsync({
        name: 'Mediterranean',
        description: 'Hot and dry in summer, mild in winter',
        temperatureRange: { min: 10, max: 35 }
      })
    ]);
  }

  if ((await PlantsCollection.find().countAsync()) === 0) {
    await Promise.all([
      PlantsCollection.insertAsync({
        name: 'Tomato',
        growthDuration: 10,
        harvestPeriod: 3,
        watterRequirement: 3,
        temperatureRange: { min: 20, max: 35 }
      }),
      PlantsCollection.insertAsync({
        name: 'Basil',
        growthDuration: 10,
        harvestPeriod: 3,
        watterRequirement: 3,
        temperatureRange: { min: 20, max: 30 }
      })
    ]);
  }

  const pmudry = await Accounts.findUserByUsername('pmudry');
  if (!pmudry) {
    await Accounts.createUserAsync({
      username: 'pmudry',
      password: 'isc',
      profile: {
        gardens: [
          {
            _id: Random.id(),
            name: 'Main garden',
            climateId: 'id',
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
                lastWatteringDate: new Date(),
              }
            ]
          }
        ]
      }
    });
  }
});
