import { Meteor } from 'meteor/meteor';
import { Random } from "meteor/random";
import { ClimatesCollection, PlantsCollection } from '/imports/api/collections';
import { Accounts } from 'meteor/accounts-base';
import plantsData from '../data/plant_data.json';
import climatesData from '../data/climate_data.json';
import '../imports/api/climates/methods';
import '../imports/api/gardens/methods';
import '../imports/api/plants/methods';
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

    const tomato = await Meteor.callAsync('plants.findByName', 'tomato');

    const dateObj = new Date();
    const month = (dateObj.getUTCMonth() + 1).toString().padStart(2, '0');
    const day = dateObj.getUTCDate().toString().padStart(2, '0');
    const year = dateObj.getUTCFullYear();
  
    const date = year + "-" + month + "-" + day
    await Accounts.createUserAsync({
      username: 'pmudry',
      password: 'isc',
      profile: {
        gardens: [
          {
            _id: Random.id(),
            name: 'Main garden',
            climateId: firstClimate._id,
            height: 10,
            width: 10,
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
      throw new Meteor.Error("not-authorized", "Vous devez être connecté pour supprimer votre compte.");
    }
    
    const user = await Meteor.users.findOneAsync(this.userId);
    if (!user || !user.services || !user.services.password || !user.services.password.bcrypt) {
      throw new Meteor.Error("user-invalid", "Impossible de vérifier le mot de passe de l'utilisateur.");
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
