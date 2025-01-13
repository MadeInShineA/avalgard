import { Meteor } from 'meteor/meteor';
import { Random } from "meteor/random";
import { ClimatesCollection, PlantsCollection } from '/imports/api/collections';
import { Accounts } from 'meteor/accounts-base';

Meteor.startup(async () => {
  if (PlantsCollection.find().countAsync() === 0) {
    plantsData.forEach(plant => PlantsCollection.insert(plant));
  }

  if (ClimatesCollection.find().countAsync() === 0) {
    climatesData.forEach(climate => ClimatesCollection.insert(climate));
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
                lastWateringDate: new Date(),
              }
            ]
          }
        ]
      }
    });
  }
});
