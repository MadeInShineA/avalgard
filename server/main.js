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
        name: 'Tempéré', 
        description: 'Climat modéré avec quatre saisons distinctes',
        temperatureRange: { min: 5, max: 25 }
      }),
      ClimatesCollection.insertAsync({ 
        name: 'Méditerranéen', 
        description: 'Climat chaud et sec en été, doux en hiver',
        temperatureRange: { min: 10, max: 35 }
      })
    ]);
  }

  if ((await PlantsCollection.find().countAsync()) === 0) {
    await Promise.all([
      PlantsCollection.insertAsync({ 
        name: 'Tomate',
        growthDuration: 10,
        harvestPeriod: 3
      }),
      PlantsCollection.insertAsync({ 
        name: 'Basilic',
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
            name: 'Jardin Principal',
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
            name: 'Jardin Urbain',
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