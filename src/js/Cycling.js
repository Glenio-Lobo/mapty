// @ts-check
'use strict';

import Workout from "./Workout";


/**
 * Cycling Class
 * @extends Workout
 */
class Cycling extends Workout{
    /** @property {string} name Workout name */
    name = 'cycling';
  
    /**
     * Creates a new Cycling object
     * @param {number} distance 
     * @param {number} duration 
     * @param {Array<number>} coords - Leaflet Object LatLng
     * @param {number} gain
     * @param {string} location State and country of the workout
     * @param {Date} [date=new Date()] 
     */
    constructor(distance, duration, coords, gain, location, date = new Date()){
      super(distance, duration, coords, location, date);
      this.gain = gain;
      this.#calcSpeed();
      this.setDescription();
    }
  
    /**
     * Calcule workout speed
     * @returns {number}
     */
    #calcSpeed(){
      this.speed = this.distance/(this.duration/60);
      return this.speed;
    }
}

export default Cycling;