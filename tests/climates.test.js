import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { assert } from 'chai';
import { ClimatesCollection } from '/imports/api/collections';
import '/imports/api/climates/methods.js';

if (Meteor.isServer) {
  describe('Climates Methods', function () {
    beforeEach(async function () {
      await ClimatesCollection.removeAsync({});
    });

    it('climates.findByName doit retourner le bon climat', async function () {
      const climateName = 'Tropical';
      const climateId = await ClimatesCollection.insertAsync({ name: climateName });

      const result = await Meteor.callAsync('climates.findByName', climateName);
      assert.strictEqual(result._id, climateId.toString()); // Convertir en string
    });

    it('climates.findById doit retourner le bon climat', async function () {
      const climateName = 'Desert';
      const climateId = await ClimatesCollection.insertAsync({ name: climateName });

      const result = await Meteor.callAsync('climates.findById', climateId.toString()); // Convertir en string
      assert.strictEqual(result.name, climateName);
    });

    it('climates.findAll doit retourner tous les climats', async function () {
      await ClimatesCollection.insertAsync({ name: 'Arctic' });
      await ClimatesCollection.insertAsync({ name: 'Mediterranean' });

      const result = await Meteor.callAsync('climates.findAll');
      assert.strictEqual(result.length, 2);
    });

    it('climates.findByName doit lever une erreur si le climat n’existe pas', async function () {
      try {
        await Meteor.callAsync('climates.findByName', 'Inconnu');
        assert.fail('Devrait lever une erreur');
      } catch (error) {
        assert.strictEqual(error.error, 'not-found');
      }
    });

    it('climates.findById doit lever une erreur si l’ID est invalide', async function () {
      try {
        await Meteor.callAsync('climates.findById', Random.id());
        assert.fail('Devrait lever une erreur');
      } catch (error) {
        assert.strictEqual(error.error, 'not-found');
      }
    });
  });
}
