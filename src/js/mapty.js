'use strict';


import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { async } from 'regenerator-runtime';

//Prettier-Ignore faz com que a formatação automática do prettier ignore a linha seguinte
// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const inputForm = document.querySelector('.workout__form');
const distanceInput = document.querySelector('.workout__input--distance');
const durationInput = document.querySelector('.workout__input--duration');
const cadenceInput = document.querySelector('.workout__input--cadence');
const gainInput = document.querySelector('.workout__input--gain');
const selectionInput = document.querySelector('.workout__select');
const workoutContainer = document.querySelector('.workout');

class App{
  #workouts = [];
  #map;
  #currentMapEvent;

  constructor(){
    // this.reset();
    this.#getPosition();
    this.#getLocalStorage();
    inputForm.addEventListener('submit', this.#newWorkout.bind(this));
    selectionInput.addEventListener('change', this.#toggleElevationField);
    workoutContainer.addEventListener('click', this.#moveToPopup.bind(this))
  }

  #getPosition(){
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this.#loadMap.bind(this), //Sucesso
        () => { //Caso falhe.
          alert('Não foi possível obter sua localização.');
        }
      );
    }
  }

  #loadMap(position){
    const [latitude, longitude] = [position.coords.latitude, position.coords.longitude];

    //Renderiza o Mapa
    this.#map = L.map('map').setView([latitude, longitude], 13);

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
    gainInput.closest('.workout__group').classList.toggle('hidden');
    cadenceInput.closest('.workout__group').classList.toggle('hidden');
  }

  #newWorkout(e){
    e.preventDefault();

    /* Helper Functions */
    const isNumberAndPositive = (...arr) =>
      arr.every(value => Number.isFinite(value) && value > 0);

    /* End of Helper Functions */

    const typeInput = selectionInput.value;
    const distance = Number(distanceInput.value);
    const duration = Number(durationInput.value);
    let workout;

    //Running Case
    if(typeInput === 'running'){
      const cadence = Number(cadenceInput.value);

      //Validação das entradas
      if(!isNumberAndPositive(distance, duration, cadence)) return alert('Input must be a positive number.');
      workout = new Running(distance, duration, this.#currentMapEvent.latlng, cadence);
    }
    
    //Cycling case
    if(typeInput === 'cycling'){
      const gain = Number(gainInput.value);

      //Validação das entradas
      if(!isNumberAndPositive(distance, duration, gain)) return alert('Input must be a positive number.');
      workout = new Cycling(distance, duration, this.#currentMapEvent.latlng, gain);
    }

    this.#workouts.push(workout);
    this.#renderWorkout(workout);
    this.#renderWorkoutMarker(workout);
    this.#setLocalStorage();
    this.#hideForm();

  }

  #renderWorkout(workout){
    const numberFormater = number => {
      let dollarFormat = Intl.NumberFormat('en', {
        style: 'decimal',
        minimumFractionDigits: 1,
      });
      return dollarFormat.format(number);
    }

    const html = `<div class="workout__item workout__card workout__card--${workout.name}" data-id= "${workout.id}">
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
                              ${workout.name === 'running' ? numberFormater(workout.pace) : numberFormater(workout.speed)}
                              </span>
                              <span class="workout__info__unit">
                              ${workout.name === 'running' ? 'MIN/KM' : 'KM/H'}
                              </span>
                          </div>

                          <div class="workout__info">
                              <span class="workout__info__icon">
                              ${workout.name === 'running' ? '🦶🏼' : '⛰'}
                              </span>
                              <span class="workout__info__value">
                              ${workout.name === 'running' ? workout.cadence : workout.gain}
                              </span>
                              <span class="workout__info__unit">
                              ${workout.name === 'running' ? 'SPM' : 'M'}
                              </span>
                          </div>
                      </div>
                  </div>`;
    
    inputForm.insertAdjacentHTML('afterend', html);
  }

  #renderWorkoutMarker(workout){

    let popupOptions = {
      maxWidth: 350, minWidth: 100, 
      autoClose: false, closeOnClick: false, 
      className: `popup--${workout.name}`,
      content: (workout.name === 'running' ? '🏃‍♂️ ' : '🚴‍♀️ ') + workout.description,
    };

    let marker = L.marker(workout.coords);
    marker.addTo(this.#map).bindPopup(L.popup(popupOptions)).openPopup();
  }

  #showForm(mapEvent){
    this.#currentMapEvent = mapEvent;

    if(inputForm.classList.contains('hidden')){
      inputForm.classList.remove('hidden');
    }

    distance.focus();
  }

  #hideForm(){
    distanceInput.value = durationInput.value = gainInput.value = cadenceInput.value = '';
    inputForm.style.display = 'none';
    inputForm.classList.add('hidden');
    setTimeout(()=>inputForm.style.display = 'grid', 500);
  }

  #moveToPopup(e){
    const actualWorkout = e.target.closest('.workout__card');
    
    if(!this.#map) return;
    if(!actualWorkout) return;

    const workoutTarget = this.#workouts.find( 
      (val) => val.id === actualWorkout.dataset.id);
    
    
    this.#map.setView(workoutTarget.coords, 13, 
      {
        animate: true,
        pan: {
          duration: 1,
        }
      }
    );
  }

  #setLocalStorage(){
    localStorage.setItem('workouts', JSON.stringify(this.#workouts));
  }

  #getLocalStorage(){
    const stored = JSON.parse(localStorage.getItem('workouts'));

    if(!stored) return;

    this.#workouts = stored;

    this.#workouts.forEach( workout => {
      this.#renderWorkout(workout);
      // this.#renderWorkoutMarker(workout);
    })
  }

  reset(){
    localStorage.removeItem('workouts');
    // location.reload();
    // window.stop();
  }
}

class Workout{
  date = new Date();
  id = (Date.now() + '').slice(-10);

  constructor(distance, duration, coords){
    this.distance = distance; // km
    this.duration = duration; // min
    this.coords = coords; // [lat, long]
  }

  setDescription(){
    const dataFormater = date => {
      const options = { month: 'long', day: 'numeric' };
      return new Intl.DateTimeFormat('en', options).format(date);
    }

    this.description = `${this.name.replace(this.name[0], this.name[0].toUpperCase())} on
                        ${dataFormater(this.date)}`;
  }
}

class Running extends Workout{
  name = 'running';

  constructor(distance, duration, coords, cadence){
    super(distance, duration, coords);
    this.cadence = cadence;
    this.#calcPace();
    this.setDescription();
  }

  #calcPace(){
    this.pace = this.duration/this.distance;
    return this.pace;
  }
}

class Cycling extends Workout{
  name = 'cycling';

  constructor(distance, duration, coords, gain){
    super(distance, duration, coords);
    this.gain = gain;
    this.#calcSpeed();
    this.setDescription();
  }

  #calcSpeed(){
    this.speed = this.distance/(this.duration/60);
    return this.speed;
  }
}

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