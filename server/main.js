import { Meteor } from 'meteor/meteor';
import { Random } from "meteor/random";
import { PlantsCollection } from '/imports/api/plants';
import { UsersCollection } from '/imports/api/users';
import { ClimatesCollection } from '/imports/api/climates';
import { SensorsCollection } from '/imports/api/sensors';

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
        maintenances: [
          {
            _id: Random.id(),
            name: "Arrosage",
            frequency: 5,
          },
          {
            _id: Random.id(),
            name: "Sulfatage",
            frequency: 150,
          }
        ]
      }),
      PlantsCollection.insertAsync({ 
        name: 'Basilic',
        maintenances: [
          {
            _id: Random.id(),
            name: "Arrosage",
            frequency: 5,
          },
          {
            _id: Random.id(),
            name: "Anti-limaces",
            frequency: 30,
          }
        ]
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
            plants: [
              {
                _id: Random.id(),
                plantId: 'id',
                position: { x: 2, y: 2 },
                sensors: [
                  {
                    _id: Random.id(),
                    sensorId: 'id',
                    datasUrl: "url"
                  }
                ],
                maintenancesDone: [
                  {
                    _id: Random.id(),
                    maintenanceId: "id",
                    date: new Date()
                  }
                ]
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
            plants: [
              {
                _id: Random.id(),
                plantId: 'id',
                position: { x: 2, y: 2 },
                sensors: [
                  {
                    _id: Random.id(),
                    sensorId: 'id',
                    datasUrl: "url"
                  }
                ],
                maintenancesDone: [
                  {
                    _id: Random.id(),
                    maintenanceId: "id",
                    date: new Date()
                  }
                ]
              }
            ]
          }
        ]
      })
    ]);
  }

  if ((await SensorsCollection.find().countAsync()) === 0) {
    await Promise.all([
      SensorsCollection.insertAsync({
        name: 'Capteur de Température',
      }),
      SensorsCollection.insertAsync({
        name: 'Capteur Humidité',
      })
    ]);
  }
});