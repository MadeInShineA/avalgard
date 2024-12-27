import { Meteor } from 'meteor/meteor';
import { Random } from "meteor/random";
import { PlantsCollection } from '/imports/api/plants';
import { ClimatesCollection } from '/imports/api/climates';
import { Accounts } from 'meteor/accounts-base';
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
            name: 'Jardin Principal',
            climateId: 'id',
            plants: [
              {
                _id: Random.id(),
                plantId: 'id',
                position: { x: 2, y: 2 },
                lastHarvestDate: new Date(),
                lastWatteringDate: new Date(),
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
      }
    });
  }
});
>>>>>>> 4b760ac (Added user login, register and logout (need to fix register error messages))
