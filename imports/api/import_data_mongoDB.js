import { PlantsCollection, ClimatesCollection } from './collections';
import plantsData from '../../data/plant_data.json';
import climatesData from '../../data/climate_data.json';

export const loadFixtures = () => {
  if (PlantsCollection.find().count() === 0) {
    plantsData.forEach(plant => PlantsCollection.insert(plant));
  }
  
  if (ClimatesCollection.find().count() === 0) {
    climatesData.forEach(climate => ClimatesCollection.insert(climate));
  }
};