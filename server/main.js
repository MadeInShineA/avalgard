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
Meteor.methods({
  async deleteUserAccount(password) {
    if (!this.userId) {
      throw new Meteor.Error("not-authorized", "You must be logged in to delete your account.");
    }
    
    const user = await Meteor.users.findOneAsync(this.userId);
    if (!user || !user.services || !user.services.password || !user.services.password.bcrypt) {
      throw new Meteor.Error("user-invalid", "Unable to check user password.");
    }
    // Todo: Vérifier le mot de passe


    /*const isValid = await bcrypt.compare(password, user.services.password.bcrypt);
    if (!isValid) {
      throw new Meteor.Error("incorrect-password", "Mot de passe incorrect.");
    }*/
    
    if (Meteor.users.removeAsync) {
      await Meteor.users.removeAsync(this.userId);
    } else {
      await Meteor.users.rawCollection().deleteOne({ _id: this.userId });
    }
    
    return true;
  }
});
