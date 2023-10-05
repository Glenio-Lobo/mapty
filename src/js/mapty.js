// @ts-check
'use strict';


// @ts-ignore
import 'core-js/stable';
// @ts-ignore
import 'regenerator-runtime/runtime';
// @ts-ignore
import { async } from 'regenerator-runtime';

//Prettier-Ignore faz com que a formatação automática do prettier ignore a linha seguinte
// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const main = document.querySelector('.main');
const inputForm = document.querySelector('.workout__form');
const distanceInput = document.querySelector('.workout__input--distance');
const durationInput = document.querySelector('.workout__input--duration');
const cadenceInput = document.querySelector('.workout__input--cadence');
const gainInput = document.querySelector('.workout__input--gain');
const selectionInput = document.querySelector('.workout__select');
const workoutContainer = document.querySelector('.workout');
const deleteAllBtn = document.querySelector('.btn--delete-all');
const showAllWorkoutsBtn = document.querySelector('.btn--show-all');

/** App Class */
class App{
  /** @property {Array<Workout>} workouts Represents all the workouts */
  #workouts = [];

  /** @property {HTMLElement} map Leaflet map */
  #map;

  /** @property {MouseEvent} currentMapEvent Mouse Event of the Newest Marker*/
  #currentMapEvent;

  /** @property {LayerGroup} markers Leaflet LayerGroup */
  // @ts-ignore
  #markers = L.layerGroup();

  /**
   * Creates an App
   */
  constructor(){
    // this.reset();
    this.#getPosition();
    this.#getLocalStorage();

    inputForm?.addEventListener('submit', this.#newWorkout.bind(this));
    selectionInput?.addEventListener('change', this.#toggleElevationField);
    workoutContainer?.addEventListener('click', this.#workoutContainerController.bind(this))
    deleteAllBtn?.addEventListener('click', this.#deleteAllWorkouts.bind(this));
    showAllWorkoutsBtn?.addEventListener('click', this.#showAllWorkouts.bind(this));
  }

  /** 
   * Get the user geolocation
   * @property {Function}
   * @returns {void}
   */
  #getPosition(){
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this.#loadMap.bind(this), //Sucesso
        () => { //Caso falhe.
          new Error('Não foi possível obter sua localização.').renderErrorMessage();
        }
      );
    }
  }

  /**
   * Load the map on the user position
   * @property {Function} loadMap
   * @param {GeolocationPosition} position
   * @return {void}
   */
  #loadMap(position){
    const [latitude, longitude] = [position.coords.latitude, position.coords.longitude];

    //Renderiza o Mapa
    // @ts-ignore
    this.#map = L.map('map').setView([latitude, longitude], 13);

    // @ts-ignore
    // @ts-ignore
    const hotTileLayer = L.tileLayer(
      'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles style by <a href="https://www.hotosm.org/" target="_blank">Humanitarian OpenStreetMap Team</a> hosted by <a href="https://openstreetmap.fr/" target="_blank">OpenStreetMap France</a>',
      }
    ).addTo(this.#map);

    this.#map.on('click', this.#showForm.bind(this));

    this.#workouts.forEach( workout => {
      this.#renderWorkoutMarker(workout); //Render the markers after load map
    })
  }

  #toggleElevationField(){
    // @ts-ignore
    gainInput.closest('.workout__group').classList.toggle('hidden');
    // @ts-ignore
    cadenceInput.closest('.workout__group').classList.toggle('hidden');
  }

  /**
   * Add a new Workout
   * @param {Event} e 
   * @returns {void}
   */
  #newWorkout(e){
    e.preventDefault();

    /* Helper Functions */

    /* Verify if its a Number and Positive*/
    const isNumberAndPositive = (...arr) =>
      arr.every(value => Number.isFinite(value) && value > 0);

    /* End of Helper Functions */

    // @ts-ignore
    const typeInput = selectionInput.value;
    // @ts-ignore
    const distance = Number(distanceInput.value);
    // @ts-ignore
    const duration = Number(durationInput.value);
    let workout;

    //Running Case
    if(typeInput === 'running'){
      // @ts-ignore
      const cadence = Number(cadenceInput.value);

      //Validação das entradas
      if(!isNumberAndPositive(distance, duration, cadence)) return new Error('Input must be a positive number.').renderErrorMessage();
      workout = new Running(distance, duration, this.#currentMapEvent.latlng, cadence);
    }
    
    //Cycling case
    if(typeInput === 'cycling'){
      // @ts-ignore
      const gain = Number(gainInput.value);

      //Validação das entradas
      if(!isNumberAndPositive(distance, duration, gain)) return new Error('Input must be a positive number.').renderErrorMessage();
      workout = new Cycling(distance, duration, this.#currentMapEvent.latlng, gain);
    }

    this.#workouts.push(workout);
    // @ts-ignore
    this.#renderWorkout(workout);
    // @ts-ignore
    this.#renderWorkoutMarker(workout);
    this.#setLocalStorage();
    this.#hideForm();

  }

  /**
   * Renders the workouy
   * @param {Workout} workout 
   * @returns {void}
   */
  #renderWorkout(workout){
    const numberFormater = number => {
      let dollarFormat = Intl.NumberFormat('en', {
        style: 'decimal',
        minimumFractionDigits: 1,
      });
      return dollarFormat.format(number);
    }

    // @ts-ignore
    const html = `<div class="workout__item workout__card workout__card--${workout.name}" data-id= "${workout.id}">
                      <div class="workout__delete" data-id="${workout.id}">x</div>
                      <h1 class="workout__title">
                          ${workout.description}
                      </h1>

                      <div class="workout__data">
                          <div class="workout__info">
                              <span class="workout__info__icon">🚴‍♀️</span>
                              <span class="workout__info__value">${workout.distance}</span>
                              <span class="workout__info__unit">km</span>
                          </div>

                          <div class="workout__info">
                              <span class="workout__info__icon">⏱</span>
                              <span class="workout__info__value">${workout.duration}</span>
                              <span class="workout__info__unit">min</span>
                          </div>

                          <div class="workout__info">
                              <span class="workout__info__icon">⚡️</span>
                              <span class="workout__info__value">
                              ${workout.
// @ts-ignore
                              name === 'running' ? numberFormater(workout.pace) : numberFormater(workout.speed)}
                              </span>
                              <span class="workout__info__unit">
                              ${workout.
// @ts-ignore
                              name === 'running' ? 'MIN/KM' : 'KM/H'}
                              </span>
                          </div>

                          <div class="workout__info">
                              <span class="workout__info__icon">
                              ${workout.
// @ts-ignore
                              name === 'running' ? '🦶🏼' : '⛰'}
                              </span>
                              <span class="workout__info__value">
                              ${workout.
// @ts-ignore
                              name === 'running' ? workout.cadence : workout.gain}
                              </span>
                              <span class="workout__info__unit">
                              ${workout.
// @ts-ignore
                              name === 'running' ? 'SPM' : 'M'}
                              </span>
                          </div>
                      </div>
                  </div>`;
    
    // @ts-ignore
    inputForm.insertAdjacentHTML('afterend', html);
  }

  /**
   * Controls the workout container events
   * @param {Event} e 
   * @returns {void}
   */
  #workoutContainerController(e){
    if(!this.#map || !e || !e.target) return;

    // @ts-ignore
    if(e.target.closest('.workout__card')) this.#moveToPopup(e.target.closest('.workout__card'));
    // @ts-ignore
    if(e.target.closest('.workout__delete')) this.#deleteWorkout(e.target.closest('.workout__card'));
  }
  
  /**
   * Deletes a workout
   * @param {HTMLElement} workoutElement Workout Element Rendered on Page
   * @returns {void}
   */
  #deleteWorkout(workoutElement){
    // @ts-ignore
    const workoutToDelete = this.#workouts.findIndex( (val, index) => {
      return val.id === workoutElement.dataset.id;
    });

    // Deletes from the workout Array
    this.#workouts.splice(workoutToDelete, 1);
    // Removes from the page
    workoutElement.remove();
    // Removes from the local storage
    this.#setLocalStorage();
    //Removes marker
    this.#removeMarker(workoutElement);
  }

  /**
   * Deletes All Workouts
   * @param {Event} e
   * @returns {void}
   */
  #deleteAllWorkouts(e){
    //Deleting from page
    this.#workouts.forEach( (val, index) => {
      const workoutToDelete = document.querySelector(`.workout__item[data-id="${val.id}"]`)

      // @ts-ignore
      if(workoutToDelete) workoutToDelete.remove();
    })
    //Deleting all markers from map
    this.#markers.eachLayer( layer => layer.remove());

    //Deleting all workouts from array
    this.#workouts.splice(0, this.#workouts.length);

    //Deleting all markers
    this.#markers.clearLayers();

    //Reseting local storage
    this.reset();
  }

  /**
   * Remove the marker linked to the workout from the map
   * @param {HTMLElement} workoutElement Workout Element Rendered on Page
   * @returns {void}
   */
  #removeMarker(workoutElement){
    this.#markers.eachLayer( (layer) => {
      if(layer.options.workoutId === workoutElement.dataset.id) {
        layer.remove();
        this.#markers.removeLayer(layer);
        return;
      };
    });

  }

  /**
   * Render the workout marker
   * @property {Function}
   * @param {Workout} workout 
   * @returns {void}
   */
  #renderWorkoutMarker(workout){

    let popupOptions = {
      maxWidth: 350, minWidth: 100, 
      autoClose: false, closeOnClick: false, 
      // @ts-ignore
      className: `popup--${workout.name}`,
      // @ts-ignore
      content: (workout.name === 'running' ? '🏃‍♂️ ' : '🚴‍♀️ ') + workout.description,
    };

    // @ts-ignore
    let marker = L.marker(workout.coords, {workoutId: workout.id});
    // @ts-ignore
    marker.addTo(this.#map).bindPopup(L.popup(popupOptions)).openPopup();

    this.#markers.addLayer(marker);    
  }

  /**
   * Shows the creation workout form
   * @property {Function}
   * @param {MouseEvent} mapEvent 
   * @returns {void}
   */
  #showForm(mapEvent){
    this.#currentMapEvent = mapEvent;

    // @ts-ignore
    if(inputForm.classList.contains('hidden')){
      // @ts-ignore
      inputForm.classList.remove('hidden');
    }

    // @ts-ignore
    distance.focus();
  }

  /**
   * Shows All Workout Markers on the map
   * @param {Event} e 
   */
  #showAllWorkouts(e){
    // @ts-ignore
    const workoutFeatureGroup = L.featureGroup(this.#markers.getLayers());
    this.#map.fitBounds(workoutFeatureGroup.getBounds().pad(.2));
  }

  /**
   * Hides the markout form
   * @property {Function} hideform
   */
  #hideForm(){
    // @ts-ignore
    distanceInput.value = durationInput.value = gainInput.value = cadenceInput.value = '';
    // @ts-ignore
    inputForm.style.display = 'none';
    // @ts-ignore
    inputForm.classList.add('hidden');
    // @ts-ignore
    setTimeout(()=>inputForm.style.display = 'grid', 500);
  }

  /**
   * Moves the user to the popup linked to the clicked workout
   * @param {HTMLElement} workoutElement 
   * @returns {void}
   */
  #moveToPopup(workoutElement){

    //Find the workout
    const workoutTarget = this.#workouts.find( 
      // @ts-ignore
      (val) => val.id === workoutElement.dataset.id);
    
    
    this.#map.setView(workoutTarget.coords, 13, 
      {
        animate: true,
        pan: {
          duration: 1,
        }
      }
    );
  }
  
  /**
   * @property {Function} - Adds the workouts to the local Storage
   */
  #setLocalStorage(){
    localStorage.setItem('workouts', JSON.stringify(this.#workouts));
  }

  /** 
   * Get all the locally stored workouts
   * @property {Function}
   * @returns {void}
   * */
  #getLocalStorage(){
    // @ts-ignore
    const stored = JSON.parse(localStorage.getItem('workouts'));

    if(!stored) return;

    // Rebuilding Cycling and Running Objects
    stored.forEach( workout => {
        const workoutGenerated = workout.name === 'running' ? 
                                new Running(workout.distance, workout.duration, workout.coords, workout.cadence, new Date(workout.date))
                                : new Cycling(workout.distance, workout.duration, workout.coords, workout.gain, new Date(workout.date));
        this.#workouts.push(workoutGenerated);
        this.#renderWorkout(workoutGenerated);
      }   
    );
  }

  /**
   * Removes workouts from local storage
   */
  reset(){
    localStorage.removeItem('workouts');
    // location.reload();
    // window.stop();
  }
}

/** Workout Class */
class Workout{
  
  /**
   * Creates a new workout object
   * @param {number} distance 
   * @param {number} duration 
   * @param {Array<number>} coords Leaflet Object LatLng
   * @param {Date} [date=new Date()] 
   */
  constructor(distance, duration, coords, date = new Date()){
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
  }

  /**
   * Set the workout description
   */
  setDescription(){
    const dataFormater = date => {
      const options = { month: 'long', day: 'numeric' };
      // @ts-ignore
      return new Intl.DateTimeFormat('en', options).format(date);
    }

    // @ts-ignore
    this.description = `${this.name.replace(this.name[0], this.name[0].toUpperCase())} on
                        ${dataFormater(this.date)}`;
  }
}

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
   * @param {Date} [date=new Date()] 
   */
  constructor(distance, duration, coords, cadence, date=new Date()){
    super(distance, duration, coords, date);
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
   * @param {Date} [date=new Date()] 
   */
  constructor(distance, duration, coords, gain, date = new Date()){
    super(distance, duration, coords, date);
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

/** Error Class */
class Error {
  /**
   * Build a error object
   * @param {string} errorMessage 
   */
  constructor(errorMessage){
    this.errorMessage = errorMessage;
  }

  /**
   * Renders error message on the workout container
   */
  renderErrorMessage(){

    // Se já existir um erro renderizado retorne
    if(main?.querySelector('.error')) return;
    
    // Gera o erro
    const html = `<div class="error">${this.errorMessage}</div>`;
    main?.insertAdjacentHTML('afterbegin', html);
    const errorElement = main?.querySelector('.error');

    setTimeout( () => {
      //@ts-ignore
      errorElement.style.opacity = 0;
      //@ts-ignore
      errorElement.style.visibility = 'hidden';
    }, 2000);

    setTimeout( () => {
      errorElement?.remove();
    }, 2500);
  }

  /**
   * Sets the error message
   * @param {string} errorMessage 
   */
  setErrorMessage(errorMessage){
    this.errorMessage = errorMessage;
  }
}
/** [See App Class]{@link App} */
const app = new App();

// function formatDateString(date){
//   const movDate = new Date(date);
//   const now = new Date();
//   const dateDiff = Math.trunc(Math.abs((now-movDate)/(1000*60*60*24)));
//   const options = { year: 'numeric', month: 'numeric', day: 'numeric' };
//   const dateFormart = new Intl.DateTimeFormat('pt-BR', options).format(movDate);

//   if(dateDiff === 0)
//     return 'TODAY'
//   else if(dateDiff === 1)
//     return 'YESTERDAY'
//   else if(dateDiff <= 7)
//     return `${dateDiff} days ago`;
//   else
//     return dateFormart;
// }