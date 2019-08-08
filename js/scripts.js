(() => {
  if (window.Element && !Element.prototype.closest) {
    Element.prototype.closest =
    function(s) {
      var matches = (this.document || this.ownerDocument).querySelectorAll(s),
      i,
      el = this;
      do {
        i = matches.length;
        while (--i >= 0 && matches.item(i) !== el) {};
      } while ((i < 0) && (el = el.parentElement));
      return el;
    };
  }
  let
  qsAmount,
  qsCompound,
  qsDarkMode,
  qsInputContainers,
  qsInterestRate,
  qsInterestType,
  qsPrincipal,
  qsScreenBody,
  qsSolveFor,
  qsTimeLength,
  qsTimePeriod,
  solveFor;
  const calculate = () => {
    const amount       = parseFloat( qsAmount.value );
    const compound     = qsCompound.value;
    let interestRate   = parseFloat( qsInterestRate.value );
    const interestType = qsInterestType.value;
    const principal    = parseFloat( qsPrincipal.value );
    const timePeriod   = qsTimePeriod.value;
    let timeLength     = parseFloat( qsTimeLength.value );
    let numberOfCompounds;
    let validInputsObj = { amount, interestRate, principal, timeLength };
    delete validInputsObj[solveFor];
    if ( validInputs( validInputsObj ) ) {
      if ( interestType == 'percent' ) {
        interestRate = interestRate / 100;
      }
      switch( compound ) {
        case 'daily':
        switch( timePeriod ) {
          case 'days'   : numberOfCompounds = 1; break;
          case 'weeks'  : numberOfCompounds = 7; break;
          case 'months' : numberOfCompounds = 365 / 12; break;
          case 'years'  : numberOfCompounds = 365; break;
        }
        break;
        case 'weekly':
        switch( timePeriod ) {
          case 'days'   :
          numberOfCompounds = Math.floor( timeLength / 7 );
          timeLength        = Math.floor( timeLength / 7 );
          break;
          case 'weeks'  : numberOfCompounds = 1; break;
          case 'months' : numberOfCompounds = 52 / 12; break;
          case 'years'  : numberOfCompounds = 52; break;
        }
        break;
        case 'monthly':
        switch( timePeriod ) {
          case 'days'   :
          numberOfCompounds = Math.floor( timeLength / 365 * 12 );
          timeLength        = Math.floor( timeLength / 365 * 12 );
          break;
          case 'weeks'  :
          numberOfCompounds = Math.floor( timeLength / 52 * 12 );
          timeLength        = Math.floor( timeLength / 52 * 12 );
          break;
          case 'months' : numberOfCompounds = 1; break;
          case 'years'  : numberOfCompounds = 12; break;
        }
        break;
        case 'yearly':
        switch( timePeriod ) {
          case 'days'   :
          numberOfCompounds = Math.floor( timeLength / 365 );
          timeLength        = Math.floor( timeLength / 365 );
          break;
          case 'weeks'  :
          numberOfCompounds = Math.floor( timeLength / 52 );
          timeLength        = Math.floor( timeLength / 52 );
          break;
          case 'months' :
          numberOfCompounds = Math.floor( timeLength / 12 );
          timeLength        = Math.floor( timeLength / 12 );
          break;
          case 'years'  : numberOfCompounds = 1; break;
        }
        break;
      }
      switch ( solveFor ) {
        case 'amount'       : qsAmount.value       = Math.round( principal * Math.pow( 1 + interestRate / numberOfCompounds, numberOfCompounds * timeLength ) * 100 ) / 100; break;
        case 'interestRate' :
          let interestFactor = 1;
          if ( interestType == 'percent' ) {
            interestFactor = 100;
          }
          qsInterestRate.value = Math.round( numberOfCompounds * ( Math.pow( amount / principal, 1 / numberOfCompounds / timeLength ) - 1 ) * 1000 * interestFactor ) / 1000;
          break;
        case 'principal'    : qsPrincipal.value    = Math.round( amount / Math.pow( 1 + interestRate / numberOfCompounds, numberOfCompounds * timeLength ) * 100 ) / 100; break;
      }
    }
  }
  const init = () => {
    setQuerySelectors();
    setListeners();
    reorderInputs();
    updateTheme();
  }
  const normalizeTimePeriod = () => {
    const timeLength = parseInt( qsTimeLength.value );
    switch( timeLength ) {
      case 1 :
      for ( let i = 0; i < qsTimePeriod.options.length; i++ ) {
        if ( qsTimePeriod.options[i].text.charAt( qsTimePeriod.options[i].text.length - 1 ) == 's' ) {
          qsTimePeriod.options[i].text = qsTimePeriod.options[i].text.substr( 0, qsTimePeriod.options[i].text.length - 1 );
        }
      }
      break;
      default :
      for ( let i = 0; i < qsTimePeriod.options.length; i++ ) {
        if ( qsTimePeriod.options[i].text.charAt( qsTimePeriod.options[i].text.length - 1 ) != 's' ) {
          qsTimePeriod.options[i].text = qsTimePeriod.options[i].text + 's';
        }
      }
      break;
    }
  }
  const reorderInputs = () => {
    if ( solveFor === undefined ) {
      solveFor = qsSolveFor.value;
    }
    qsScreenBody.querySelectorAll( 'input, select' ).forEach( input => {
      input.closest( '.inputContainer' ).classList.remove( 'solveFor' );
      input.setAttribute( 'tabIndex', 1 );
    } );
    const qsInputSolveFor = document.querySelector( `*[name="${solveFor}"]` );
    qsInputSolveFor.closest( '.inputContainer' ).classList.add( 'solveFor' );
    qsInputSolveFor.closest( '.inputContainer' ).querySelectorAll( 'input, select' ).forEach( input => {
      input.setAttribute( 'tabIndex', 2 );
    } );
  }
  const setDarkMode = darkMode => {
    localStorage.setItem( 'darkMode', darkMode );
  }
  const setListeners = () => {
    qsDarkMode.addEventListener( 'change', e => {
      console.log( e.target.checked );
      setDarkMode( e.target.checked );
      updateTheme();
    } );
    qsSolveFor.addEventListener( 'change', e => {
      console.log( 'input change' );
      solveFor = e.target.value;
      reorderInputs();
      calculate();
    } );
    qsInputs.forEach( qsInput => {
      qsInput.addEventListener( 'change', e => {
        calculate();
      } );
    } );
    qsTimeLength.addEventListener( 'change', e => {
      normalizeTimePeriod();
    } );
  }
  const setQuerySelectors = () => {
    qsAmount          = document.querySelector( '*[name="amount"]' );
    qsCompound        = document.querySelector( '*[name="compound"]' );
    qsDarkMode        = document.querySelector( '#switch--darkMode' );
    qsInputs          = document.querySelectorAll( 'input:not(#switch--darkMode), select:not(:first-child)' );
    qsInterestRate    = document.querySelector( '*[name="interestRate"]' );
    qsInterestType    = document.querySelector( '*[name="interestType"]' );
    qsPrincipal       = document.querySelector( '*[name="principal"]' );
    qsScreenBody      = document.querySelector( 'screenBody' );
    qsSolveFor        = document.querySelector( '*[name="solveFor"]' );
    qsTimeLength      = document.querySelector( '*[name="timeLength"]' );
    qsTimePeriod      = document.querySelector( '*[name="timePeriod"]' );
  }
  const updateTheme = () => {
    const darkMode = localStorage.getItem( 'darkMode' );
    const theme = ( darkMode === 'true' ? 'dark' : 'light' );
    console.log( {'darkMode': darkMode, 'theme' : theme} );
    document.body.setAttribute( 'data-theme', theme );
    qsDarkMode.checked = ( darkMode === 'true' ? true : false );
  }
  const validInputs = obj => {
    let valid = true;
    for( prop in obj ) {
      if ( obj[prop] === '' || isNaN( obj[prop] ) ) {
        valid = false;
        break;
      }
    }
    return valid;
  }
  document.addEventListener( 'DOMContentLoaded', e => {
    init();
  } );
})();
if ( 'serviceWorker' in navigator ) {
  //register serviceWorker
  navigator.serviceWorker.register( '/service-worker.js' ).then( reg => {
    //check if service worker has been updated
    reg.onupdatefound = () => {
      const installingWorker = reg.installing;
      installingWorker.onstatechange = () => {
        if ( installingWorker.state === 'installed' ) {
          // window.location.reload();
        }
      };
    };
  } );
}
