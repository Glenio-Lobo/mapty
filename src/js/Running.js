// @ts-check
'use strict';

import Workout from "./Workout";

/**
 * Running Class
 * @extends Workout
 */
class Running extends Workout{
    /** @property {string} name Workout name */
    name = 'running';
  
     /**
     * Creates a new Running object
     * @param {number} distance 
     * @param {number} duration 
     * @param {Array<number>} coords - Leaflet Object LatLng
     * @param {number} cadence
     * @param {string} location State and country of the workout
     * @param {Date} [date=new Date()] 
     */
    constructor(distance, duration, coords, cadence, location, date=new Date()){
      super(distance, duration, coords, location, date);
      this.cadence = cadence;
      this.#calcPace();
      this.setDescription();
    }
  
    /**
     * Calcule workout pace
     * @returns {number}
     */
    #calcPace(){
      this.pace = this.duration/this.distance;
      return this.pace;
    }
}

export default Running;