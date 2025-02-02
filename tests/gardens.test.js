import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { assert } from 'chai';
import { Accounts } from 'meteor/accounts-base';
import '/imports/api/gardens/methods.js';

if (Meteor.isServer) {
  describe('Gardens Methods', function () {
    let userId;

    beforeEach(async function () {
      // Création d'un utilisateur de test
      userId = await Accounts.createUserAsync({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        profile: { gardens: [] }
      });
    });

    afterEach(async function () {
      // Suppression des utilisateurs après chaque test
      await Accounts.users.removeAsync({ _id: userId });
    });

    it('gardens.insert doit ajouter un jardin à un utilisateur', async function () {
      const garden = {
        _id: Random.id(),
        name: 'My Garden',
        climateId: Random.id(),
        height: 10,
        width: 15,
        tasks: [],
        plants: []
      };

      await Meteor.callAsync('gardens.insert', userId, garden);

      const user = await Accounts.users.findOneAsync(userId);
      assert.strictEqual(user.profile.gardens.length, 1);
      assert.strictEqual(user.profile.gardens[0].name, garden.name);
    });

    it('gardens.remove doit supprimer un jardin d\'un utilisateur', async function () {
      const garden = {
        _id: Random.id(),
        name: 'Garden to remove',
        climateId: Random.id(),
        height: 5,
        width: 5,
        tasks: [],
        plants: []
      };

      await Meteor.callAsync('gardens.insert', userId, garden);
      await Meteor.callAsync('gardens.remove', userId, garden._id);

      const user = await Accounts.users.findOneAsync(userId);
      assert.strictEqual(user.profile.gardens.length, 0);
    });

    it('gardens.update doit modifier un jardin existant', async function () {
      const garden = {
        _id: Random.id(),
        name: 'Old Name',
        climateId: Random.id(),
        height: 10,
        width: 10,
        tasks: [],
        plants: []
      };

      await Meteor.callAsync('gardens.insert', userId, garden);

      const updatedGarden = {
        name: 'Updated Name',
        climateId: garden.climateId,
        height: 20,
        width: 25,
        tasks: ['Watering'],
        plants: ['Tomato']
      };

      await Meteor.callAsync('gardens.update', userId, garden._id, updatedGarden);

      const user = await Accounts.users.findOneAsync(userId);
      const modifiedGarden = user.profile.gardens.find(g => g._id === garden._id);

      assert.strictEqual(modifiedGarden.name, 'Updated Name');
      assert.strictEqual(modifiedGarden.tasks.length, 1);
      assert.strictEqual(modifiedGarden.plants.length, 1);
    });

    it('gardens.find doit retourner un jardin spécifique', async function () {
      const garden = {
        _id: Random.id(),
        name: 'Specific Garden',
        climateId: Random.id(),
        height: 8,
        width: 8,
        tasks: [],
        plants: []
      };

      await Meteor.callAsync('gardens.insert', userId, garden);
      const result = await Meteor.callAsync('gardens.find', userId, garden._id);

      assert.strictEqual(result.name, garden.name);
      assert.strictEqual(result._id, garden._id);
    });

    it('gardens.findAll doit retourner tous les jardins d\'un utilisateur', async function () {
      await Meteor.callAsync('gardens.insert', userId, {
        _id: Random.id(),
        name: 'Garden 1',
        climateId: Random.id(),
        height: 6,
        width: 6,
        tasks: [],
        plants: []
      });

      await Meteor.callAsync('gardens.insert', userId, {
        _id: Random.id(),
        name: 'Garden 2',
        climateId: Random.id(),
        height: 7,
        width: 7,
        tasks: [],
        plants: []
      });

      const result = await Meteor.callAsync('gardens.findAll', userId);
      assert.strictEqual(result.length, 2);
    });

    it('gardens.find doit lever une erreur si le jardin n\'existe pas', async function () {
      try {
        await Meteor.callAsync('gardens.find', userId, Random.id());
        assert.fail('Devrait lever une erreur');
      } catch (error) {
        assert.strictEqual(error.error, 'not-found');
      }
    });

    it('gardens.findAll doit lever une erreur si l\'utilisateur n\'existe pas', async function () {
      try {
        await Meteor.callAsync('gardens.findAll', Random.id());
        assert.fail('Devrait lever une erreur');
      } catch (error) {
        assert.strictEqual(error.error, 'not-found');
      }
    });
  });
}
