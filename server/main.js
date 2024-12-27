import { Meteor } from 'meteor/meteor';
import { Random } from "meteor/random";
import { PlantsCollection } from '/imports/api/plants';
import { UsersCollection } from '/imports/api/users';
import { ClimatesCollection } from '/imports/api/climates';

//Reset dbs: db.getCollectionNames().forEach(function(collectionName){if (!collectionName.startsWith("system.")) {db[collectionName].drop();}});

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
        harvestPeriod: 3
      }),
      PlantsCollection.insertAsync({ 
        name: 'Basil',
        growthDuration: 10,
        harvestPeriod: 3
      })
    ]);
  }

  if ((await UsersCollection.find().countAsync()) === 0) {
    await Promise.all([
      UsersCollection.insertAsync({ 
        name: 'Marco Paladini',
        email: 'alice.dupont@email.com',
        gardens: [
          {
            _id: Random.id(),
            name: 'Main garden',
            climateId: 'id',
            tasks: [
              {
                _id: Random.id(),
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
              }
            ]
          }
        ]
      }),
      UsersCollection.insertAsync({ 
        name: 'Marc Bolan',
        email: 'bob.martin@email.com',
        gardens: [
          {
            _id: Random.id(),
            name: 'Urban Garden',
            climateId: 'id',
            tasks: [
              {
                _id: Random.id(),
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
              }
            ]
          }
        ]
      })
    ]);
  }
});