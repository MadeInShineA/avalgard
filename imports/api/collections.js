import { Mongo } from 'meteor/mongo';

export const PlantsCollection = new Mongo.Collection('plants');
export const ClimatesCollection = new Mongo.Collection('climates');