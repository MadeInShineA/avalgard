import { Meteor } from 'meteor/meteor';
import { Random } from "meteor/random";
import { PlantsCollection } from '/imports/api/collections';
import { ClimatesCollection } from '/imports/api/collections';
import { loadFixtures } from '../imports/api/import_data_mongoDB';
import { Accounts } from 'meteor/accounts-base';
import './methods';

Meteor.startup(async () => {
  loadFixtures();
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
