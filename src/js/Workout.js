// @ts-check
'use strict';

import { dataFormater } from "./utils";

/** Workout Class */
class Workout{
  
    /**
     * Creates a new workout object
     * @param {number} distance 
     * @param {number} duration 
     * @param {Array<number>} coords Leaflet Object LatLng
     * @param {Date} [date=new Date()]
     * @param {string} location State and country of the workout
     */
    constructor(distance, duration, coords, location, date = new Date()){
      /** 
       * @property {number} id
      */
      this.id = (Date.now() + '').slice(-10);
      /** @property {Date} date */
      this.date = date;
      /** @property {number} distance */
      this.distance = distance; // km
      /** @property {number} duration */
      this.duration = duration; // min
      /** @property {LatLng} coords Leaflet LatLng Object */
      this.coords = coords; // [lat, long]
      /** @property {string} location State and country of the workout*/
      this.location = location;
    }
  
    /**
     * Set the workout description
     */
    setDescription(){
      // @ts-ignore
      this.description = `${this.name.replace(this.name[0], this.name[0].toUpperCase())} on
                          ${dataFormater(this.date)}`;
    }
}

export default Workout;