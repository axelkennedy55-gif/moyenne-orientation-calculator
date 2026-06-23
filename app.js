document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const form = document.getElementById('calc-form');
  const checkboxBepc = document.getElementById('bepc-admitted');
  const inputMga = document.getElementById('mga-score');
  
  // French Inputs
  const inputFrClass = document.getElementById('fr-class');
  const inputFrExam = document.getElementById('fr-exam');
  
  // Math Inputs
  const inputMathClass = document.getElementById('math-class');
  const inputMathExam = document.getElementById('math-exam');
  
  // Physics Inputs
  const inputPhysClass = document.getElementById('phys-class');
  const inputPhysExam = document.getElementById('phys-exam');
  
  // English Inputs & Profile
  const inputAngClass = document.getElementById('ang-class');
  const angProfileSelect = document.getElementById('ang-profile');
  const containerAngRegular = document.getElementById('ang-regular-fields');
  const containerAngTest = document.getElementById('ang-test-fields');
  const inputAngOral = document.getElementById('ang-exam-oral');
  const inputAngWritten = document.getElementById('ang-exam-written');
  const inputAngTestExam = document.getElementById('ang-exam-test');

  // Error & Status Indicators
  const alertEligible = document.getElementById('eligibility-alert');
  const textEligible = document.getElementById('eligibility-text');
  
  // Results Container & UI Elements
  const resultsContainer = document.getElementById('results-card');
  const resultScoreText = document.getElementById('result-score-text');
  const resultMoText = document.getElementById('result-mo-text');
  const resultPercentText = document.getElementById('result-percent-text');
  const progressCircle = document.getElementById('progress-circle');
  const progressPercentText = document.getElementById('progress-percent');
  
  // Detail elements
  const detailFrPoints = document.getElementById('detail-fr-points');
  const detailMathPoints = document.getElementById('detail-math-points');
  const detailPhysPoints = document.getElementById('detail-phys-points');
  const detailAngPoints = document.getElementById('detail-ang-points');

  // Encouragement & Orientation Chances elements
  const encouragementText = document.getElementById('encouragement-message');
  const chanceSecondeA = document.getElementById('chance-seconde-a');
  const barSecondeA = document.getElementById('bar-seconde-a');
  const chanceSecondeC = document.getElementById('chance-seconde-c');
  const barSecondeC = document.getElementById('bar-seconde-c');

  // Initial State Setup
  let eligibility = {
    isAdmitted: false,
    mgaValid: false
  };

  // Toggle English profile fields
  angProfileSelect.addEventListener('change', (e) => {
    const profile = e.target.value;
    if (profile === 'regular') {
      containerAngRegular.classList.remove('hidden');
      containerAngTest.classList.add('hidden');
      inputAngTestExam.removeAttribute('required');
      inputAngOral.setAttribute('required', '');
      inputAngWritten.setAttribute('required', '');
    } else {
      containerAngRegular.classList.add('hidden');
      containerAngTest.classList.remove('hidden');
      inputAngTestExam.setAttribute('required', '');
      inputAngOral.removeAttribute('required');
      inputAngWritten.removeAttribute('required');
    }
    // Recalculate if everything else is filled
    calculateOrientation();
  });

  // Event Listeners for Live Calculations
  form.addEventListener('input', () => {
    validateInputs();
    calculateOrientation();
  });

  checkboxBepc.addEventListener('change', () => {
    validateInputs();
    calculateOrientation();
  });

  // Strict Numeric Input Bounds (0 to 20)
  const numericInputs = form.querySelectorAll('input[type="number"]');
  numericInputs.forEach(input => {
    input.addEventListener('input', (e) => {
      let value = parseFloat(e.target.value);
      if (value > 20) {
        e.target.value = 20;
        showInlineError(e.target, "La note ne peut pas dépasser 20.");
      } else if (value < 0) {
        e.target.value = 0;
        showInlineError(e.target, "La note ne peut pas être négative.");
      } else {
        clearInlineError(e.target);
      }
    });
  });

  // Inline Validation Helpers
  function showInlineError(inputElement, message) {
    inputElement.classList.add('input-premium-error');
    const parent = inputElement.parentElement;
    let errorSpan = parent.querySelector('.error-msg');
    if (!errorSpan) {
      errorSpan = document.createElement('span');
      errorSpan.className = 'error-msg text-xs text-red-500 mt-1 block font-medium';
      parent.appendChild(errorSpan);
    }
    errorSpan.textContent = message;
  }

  function clearInlineError(inputElement) {
    inputElement.classList.remove('input-premium-error');
    const parent = inputElement.parentElement;
    const errorSpan = parent.querySelector('.error-msg');
    if (errorSpan) {
      errorSpan.remove();
    }
  }

  // Validate Eligibility Rules
  function validateInputs() {
    const isAdmitted = checkboxBepc.checked;
    const mga = parseFloat(inputMga.value);
    const hasMga = !isNaN(mga);

    eligibility.isAdmitted = isAdmitted;
    eligibility.mgaValid = hasMga && mga >= 8.5;

    // Reset warnings
    alertEligible.classList.add('hidden');
    alertEligible.classList.remove('bg-red-50', 'border-red-200', 'bg-amber-50', 'border-amber-200');

    // 1. Check BEPC Admission
    if (!isAdmitted) {
      alertEligible.className = 'p-4 rounded-xl border bg-amber-50 border-amber-200 text-amber-800 text-sm font-medium flex items-start gap-3 animate-fade-up';
      textEligible.innerHTML = `<span class="font-bold">Attention :</span> L'admission au BEPC est requise pour être orienté en classe de Seconde. Veuillez cocher la case d'admission.`;
      alertEligible.classList.remove('hidden');
      return false;
    }

    // 2. Check MGA Threshold
    if (hasMga && mga < 8.5) {
      alertEligible.className = 'p-4 rounded-xl border bg-red-50 border-red-200 text-red-800 text-sm font-medium flex items-start gap-3 animate-fade-up';
      textEligible.innerHTML = `<span class="font-bold">Statut : Non éligible à l'orientation.</span> La Moyenne Générale Annuelle (MGA) de classe de 3ème doit être supérieure ou égale à 8,50/20 (Arrêté n°0050/MENA).`;
      alertEligible.classList.remove('hidden');
      inputMga.classList.add('input-premium-error');
      return false;
    } else if (hasMga) {
      inputMga.classList.remove('input-premium-error');
    }

    return isAdmitted && hasMga && mga >= 8.5;
  }

  // Core Calculator Logic
  function calculateOrientation() {
    // Hide results by default unless valid
    if (!eligibility.isAdmitted || !eligibility.mgaValid) {
      resultsContainer.classList.add('hidden');
      return;
    }

    // Gather Subject values
    const frClass = parseFloat(inputFrClass.value);
    const frExam = parseFloat(inputFrExam.value);
    const mathClass = parseFloat(inputMathClass.value);
    const mathExam = parseFloat(inputMathExam.value);
    const physClass = parseFloat(inputPhysClass.value);
    const physExam = parseFloat(inputPhysExam.value);
    const angClass = parseFloat(inputAngClass.value);

    // Dynamic English Exam Calculation
    let angExam = 0;
    const profile = angProfileSelect.value;
    
    if (profile === 'regular') {
      const oral = parseFloat(inputAngOral.value);
      const written = parseFloat(inputAngWritten.value);
      if (!isNaN(oral) && !isNaN(written)) {
        angExam = (oral + written) / 2;
      } else {
        resultsContainer.classList.add('hidden');
        return;
      }
    } else {
      const written = parseFloat(inputAngTestExam.value);
      if (!isNaN(written)) {
        angExam = written;
      } else {
        resultsContainer.classList.add('hidden');
        return;
      }
    }

    // Check if other primary inputs are numbers
    if (isNaN(frClass) || isNaN(frExam) || isNaN(mathClass) || isNaN(mathExam) || 
        isNaN(physClass) || isNaN(physExam) || isNaN(angClass)) {
      resultsContainer.classList.add('hidden');
      return;
    }

    // Double check that all grades are within 0-20
    const allGrades = [frClass, frExam, mathClass, mathExam, physClass, physExam, angClass];
    if (profile === 'regular') {
      allGrades.push(parseFloat(inputAngOral.value), parseFloat(inputAngWritten.value));
    } else {
      allGrades.push(parseFloat(inputAngTestExam.value));
    }
    
    if (allGrades.some(grade => isNaN(grade) || grade < 0 || grade > 20)) {
      resultsContainer.classList.add('hidden');
      return;
    }

    // Calculations
    // Note Matière = Moyenne Annuelle Classe + Note Examen BEPC
    const noteFr = frClass + frExam; // Max 40
    const pointsFr = noteFr * 2;     // Coeff 2, Max 80

    const noteMath = mathClass + mathExam; // Max 40
    const pointsMath = noteMath * 2;       // Coeff 2, Max 80

    const notePhys = physClass + physExam; // Max 40
    const pointsPhys = notePhys * 1;       // Coeff 1, Max 40

    const noteAng = angClass + angExam;   // Max 40
    const pointsAng = noteAng * 1;         // Coeff 1, Max 40

    // Overall Calculation
    const totalPoints = pointsFr + pointsMath + pointsPhys + pointsAng; // Max 240
    const mo = totalPoints / 12; // Out of 20
    const percentOrientation = (totalPoints / 240) * 100;

    // Show Results Card
    resultsContainer.classList.remove('hidden');

    // Trigger details write-in
    detailFrPoints.textContent = `${pointsFr.toFixed(2)} / 80`;
    detailMathPoints.textContent = `${pointsMath.toFixed(2)} / 80`;
    detailPhysPoints.textContent = `${pointsPhys.toFixed(2)} / 40`;
    detailAngPoints.textContent = `${pointsAng.toFixed(2)} / 40`;

    // Calcul des chances par série (normalisé à 100% au total)
    const avgFr = noteFr / 2;
    const avgAng = noteAng / 2;
    const avgMath = noteMath / 2;
    const avgPhys = notePhys / 2;

    const avgLit = (avgFr + avgAng) / 2;
    const avgSci = (avgMath + avgPhys) / 2;

    // Calcul de coefficients d'affinité
    let coefA = Math.pow(avgLit, 2);
    let coefC = Math.pow(avgSci, 2);

    // Pénalité pour Seconde C si la moyenne scientifique est faible (< 8.5)
    if (avgSci < 8.5) {
      coefC = coefC * 0.05; // Très peu de chance pour la Seconde C
    } else if (avgSci < 10) {
      coefC = coefC * 0.3;  // Chance réduite
    }

    // Sécurité si les deux coefficients sont nuls
    if (coefA === 0 && coefC === 0) {
      coefA = 1;
      coefC = 1;
    }

    const totalCoef = coefA + coefC;
    const chanceA = Math.round((coefA / totalCoef) * 100);
    const chanceC = 100 - chanceA; // Garantit la somme exacte de 100%

    // Message d'encouragement
    let msg = "";
    if (mo >= 14) {
      msg = "Félicitations pour ce brillant parcours ! Avec une telle moyenne d'orientation, vous avez d'excellentes chances d'être orienté(e) dans la série de votre choix (A ou C). Continuez à viser l'excellence !";
    } else if (mo >= 11) {
      if (avgSci > avgLit) {
        msg = "Excellent travail ! Votre profil montre de belles aptitudes pour les sciences. La Seconde C est une excellente option pour vous. Maintenez le cap !";
      } else {
        msg = "Félicitations pour votre réussite ! Votre profil littéraire est très solide. La Seconde A vous permettra d'exprimer pleinement vos talents d'analyse et d'expression.";
      }
    } else {
      msg = "Bravo pour votre admission au BEPC ! Vous êtes éligible pour l'orientation en classe de Seconde. Concentrez-vous sur vos points forts pour réussir brillamment votre rentrée.";
    }

    encouragementText.textContent = msg;

    // Bar animation
    setTimeout(() => {
      barSecondeA.style.width = `${chanceA}%`;
      barSecondeC.style.width = `${chanceC}%`;
    }, 100);

    // Trigger elegant animated counters
    animateValue(resultScoreText, 0, totalPoints, 1000, ' / 240', 1);
    animateValue(resultMoText, 0, mo, 1000, ' / 20', 2);
    animateValue(resultPercentText, 0, percentOrientation, 1000, '%', 1);
    animateValue(chanceSecondeA, 0, chanceA, 1000, '%', 0);
    animateValue(chanceSecondeC, 0, chanceC, 1000, '%', 0);
    
    // Animate circular progress indicator SVG
    updateProgressRing(percentOrientation);
  }

  // Count-Up Animation Function
  function animateValue(obj, start, end, duration, suffix = '', decimals = 2) {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const currentVal = progress * (end - start) + start;
      obj.innerHTML = currentVal.toFixed(decimals) + suffix;
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }

  // Animated Circular SVG Progress Ring
  function updateProgressRing(percent) {
    if (!progressCircle) return;
    const radius = progressCircle.r.baseVal.value;
    const circumference = radius * 2 * Math.PI;
    
    progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
    
    const offset = circumference - (percent / 100) * circumference;
    progressCircle.style.strokeDashoffset = offset;

    // Pulse colors depending on the score level
    if (percent >= 60) {
      progressCircle.style.stroke = '#008751'; // Forest green for high scores
    } else if (percent >= 50) {
      progressCircle.style.stroke = '#ea580c'; // Warm orange for mid-range
    } else {
      progressCircle.style.stroke = '#ef4444'; // Red for warning level
    }

    animateValue(progressPercentText, 0, percent, 1000, '%', 1);
  }
});
