const continueButton = document.getElementById("continue");
const main = document.getElementById("mainPage");

const PREF_DEFAULT = [
  [143000, 150000, 148000],
  [2008, 2009, 2009],
  [170000, 140000, 150000]
];
const VALUES_DEFAULT = [0.3, 0.3, 0.4];
let RES = "";
let PREF_COUNT = 0;
let VAR_COUNT = 0;
const STRING_DELIMITER = "\n";

continueButton.addEventListener("click", () => {
  PREF_COUNT = parseInt(document.getElementById("prefsCount").value);
  VAR_COUNT = parseInt(document.getElementById("variantsCount").value);
  main.innerHTML = "";
  const paramsCountForm = document.createElement("form");
  paramsCountForm.id = "parametersForm";

  for (let i = 0; i < PREF_COUNT; i++) {
    const element = document.createElement("p");
    const name = "Предпочтение " + (i + 1) + ":";
    const id = "param" + i;
    element.innerHTML =
      `<b>${name}</b><br>
             <label>
                <input id="${id}" type="text" value="${id}">
             </label>`;
    paramsCountForm.appendChild(element);
  }

  const coefficientsForm = document.createElement("form");
  coefficientsForm.id = "coefficientsForm";
  for (let i = 0; i < PREF_COUNT; i++) {
    const element = document.createElement("p");
    const name = "Коэффициент " + (i + 1) + ":";
    const id = "coefficient" + i;
    const value = PREF_COUNT === 3 ? VALUES_DEFAULT[i] : " ";
    element.innerHTML =
      `<b>${name}</b><br>
             <label>
                <input id="${id}" type="text" value="${value}">
             </label>`;
    coefficientsForm.appendChild(element);
  }

  const variantsForm = document.createElement("form");
  variantsForm.id = "variantsForm";
  for (let i = 0; i < VAR_COUNT; i++) {
    const element = document.createElement("p");
    const name = "Вариант " + (i + 1) + ":";
    const id = "variant" + i;
    element.innerHTML =
      `<b>${name}</b><br>
             <label>
                <input id="${id}" type="text" value="${id}">
             </label>`;
    variantsForm.appendChild(element);
  }

  const block = document.createElement("div");
  block.id = "block";
  block.appendChild(paramsCountForm);
  block.appendChild(coefficientsForm);
  block.appendChild(variantsForm);
  main.appendChild(block);
  const buttonContinue = document.createElement("input");
  buttonContinue.id = "continue2";
  buttonContinue.type = "submit";
  buttonContinue.value = "Продолжить";
  buttonContinue.addEventListener("click", () => continue1());

  main.appendChild(buttonContinue);
})

function continue1() {
  const prefs = [PREF_COUNT];
  const coeffs = [PREF_COUNT];
  const vars = [VAR_COUNT];
  for (let i = 0; i < PREF_COUNT; i++) {
    let id = "param" + i;
    prefs[i] = document.getElementById(id).value;
    id = "coefficient" + i;
    coeffs[i] = parseFloat(document.getElementById(id).value.replaceAll(",", "."));
  }

  for (let i = 0; i < VAR_COUNT; i++) {
    let id = "variant" + i;
    vars[i] = document.getElementById(id).value;
  }
  main.innerHTML = "";

  const table = document.createElement("table");
  table.id = "prefsForm";
  const thead = document.createElement("thead");
  const tr = document.createElement("tr");
  tr.innerHTML = `<th>Варианты</th>`;
  for (let i = 0; i < VAR_COUNT; i++) {
    tr.innerHTML = tr.innerHTML.concat(
      `<th>${vars[i]}</th>`
    );
  }
  tr.innerHTML = tr.innerHTML.concat(`<th>Какое значение приоритетнее?</th>`);
  thead.appendChild(tr);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  for (let i = 0; i < PREF_COUNT; i++) {
    const tr = document.createElement("tr");
    tr.id = "subform" + i;
    for (let j = 0; j < VAR_COUNT; j++) {
      if (j === 0) {
        tr.innerHTML = `<th>${prefs[i]}</th>`;
      }
      const element = document.createElement("td");
      const id = "PREF_DEFAULT" + i + j;
      const value = (PREF_COUNT === 3 && VAR_COUNT === 3) ? PREF_DEFAULT[i][j] : " ";
      element.innerHTML = element.innerHTML.concat(
        `<label>
                    <input id="${id}" type="text" size="40" value="${value}">
                </label>`
      );
      tr.appendChild(element);
    }
    const lastColumn = document.createElement("td");
    const radioForm = document.createElement("form");
    radioForm.id = "minmaxForm" + i;
    radioForm.className = "minmaxForm";
    radioForm.innerHTML = radioForm.innerHTML.concat(
      `<p><input id="min-${i}" name="minmax-${i}" type="radio" value="min" checked>Меньше</p>
             <p><input id="max-${i}" name="minmax-${i}" type="radio" value="max">Больше</p>`
    );
    lastColumn.appendChild(radioForm);
    tr.appendChild(lastColumn);
    tbody.appendChild(tr);
  }
  table.appendChild(tbody);
  main.appendChild(table);
  const buttonContinue = document.createElement("input");
  buttonContinue.id = "continue3";
  buttonContinue.type = "submit";
  buttonContinue.value = "Продолжить";
  buttonContinue.addEventListener("click", () => continue2(prefs, coeffs, vars));

  main.appendChild(buttonContinue);
}

function continue2(params, coeffs, vars) {
  //document.getElementById("continue3").style.display = "none";
  let prefsMatrix = new Array(PREF_COUNT).fill().map(() =>
    new Array(VAR_COUNT).fill(0));
  let rating = new Array(VAR_COUNT).fill(0);
  let ratingBlock = new Array(VAR_COUNT).fill(0);
  let ratingTurnir = new Array(VAR_COUNT).fill(0);
  let kmax = new Array(VAR_COUNT).fill(0);
  let kopt = new Array(VAR_COUNT).fill(0);

  for (let i = 0; i < PREF_COUNT; i++) {
    for (let j = 0; j < VAR_COUNT; j++) {
      prefsMatrix[i][j] = parseInt(document.getElementById("PREF_DEFAULT" + i + j).value);
    }
  }
  let prep_bm = [PREF_COUNT];
  for (let i = 0; i < PREF_COUNT; i++) {
    let elements = document.getElementsByName("minmax-" + i);
    for (const el of elements) {
      if (el.checked)
        prep_bm[i] = el.value === "max";
    }
  }

  RES += "Предпочтения:" + STRING_DELIMITER;
  for (let i = 0; i < PREF_COUNT; i++) {
    RES += params[i] + ": " + coeffs[i] + STRING_DELIMITER;
  }
  for (let k = 0; k < PREF_COUNT; k++) {
    RES += STRING_DELIMITER + "<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>" + STRING_DELIMITER;
    RES += params[k];

    const Dom_data = new Array(VAR_COUNT).fill().map(() =>
      new Array(VAR_COUNT).fill(0));

    buildMatrix(prefsMatrix[k], prep_bm[k], Dom_data);

    for (let i = 0; i < VAR_COUNT; i++) {
      RES += STRING_DELIMITER;
      for (let j = 0; j < VAR_COUNT; j++) {
        RES += Dom_data[i][j] + "\t";
      }
    }

    let koptArray = new Array(VAR_COUNT).fill(-1);
    let Karray = createKarray(Dom_data, VAR_COUNT, VAR_COUNT);
    createKopt(Karray, VAR_COUNT, koptArray);
    RES += STRING_DELIMITER + "Kopt";
    for (let i = 0; i < VAR_COUNT; i++) {
      RES += STRING_DELIMITER + "[" + i + "] = " + koptArray[i];
    }
    RES += STRING_DELIMITER + "+++++++";
    RES += STRING_DELIMITER + "K-max механизм" + STRING_DELIMITER;
    writeArrKopt(Karray, VAR_COUNT, 4, koptArray);
    RES += STRING_DELIMITER + "======== ";
    const dom_Array = dominate(Dom_data, VAR_COUNT, VAR_COUNT);
    const block_Array = block(Dom_data, VAR_COUNT, VAR_COUNT);
    const turnir_Array = turnir(Dom_data, coeffs, VAR_COUNT, VAR_COUNT, k);
    RES += STRING_DELIMITER + "Доминирующий механизм" + STRING_DELIMITER;
    for (let i = 0; i < dom_Array.length; i++) {
      RES += dom_Array[i];
      RES += STRING_DELIMITER;
      rating[dom_Array[i]] += +coeffs[k];
    }
    RES += STRING_DELIMITER + "Блокирующий механизм" + STRING_DELIMITER;
    for (let i = 0; i < block_Array.length; i++) {
      RES += block_Array[i];
      RES += STRING_DELIMITER;
      ratingBlock[block_Array[i]] += +coeffs[k];
    }

    RES += STRING_DELIMITER + "Турнирный механизм" + STRING_DELIMITER;
    for (let i = 0; i < turnir_Array.length; i++) {
      RES += turnir_Array[i];
      RES += STRING_DELIMITER;
      ratingTurnir[i] += +turnir_Array[i];
    }

    for (let i = 0; i < VAR_COUNT; i++) {
      for (let j = 0; j < 4; j++) {
        kmax[i] += +Karray[i][j] * +coeffs[k];
      }
    }
    for (let i = 0; i < VAR_COUNT; i++) {
      if ((koptArray[i] === 1) || (koptArray[i] === 2) || (koptArray[i] === 3) || (koptArray[i] === 4)) {
        for (let j = 0; j < 4; j++) {
          kopt[i] += +Karray[i][j] * +coeffs[k];
        }
      }
    }
  }


  const rating_place = [VAR_COUNT];
  placeRating(rating, rating_place);
  RES += STRING_DELIMITER + "_____Механизм доминирования_____";
  RES += STRING_DELIMITER + "Баллы вариантов с учетом весовых коэффициентов и места вариантов" + STRING_DELIMITER;
  for (let i = 0; i < VAR_COUNT; i++) {
    RES += vars[i] + " \t " + rating[i] + " \t " + rating_place[i] + STRING_DELIMITER;
  }
  const rating_place_block = [VAR_COUNT];
  placeRating(ratingBlock, rating_place_block);
  RES += STRING_DELIMITER + "_____Механизм блокировки______";
  RES += STRING_DELIMITER + "Баллы вариантов с учетом весовых коэффициентов и места вариантов" + STRING_DELIMITER;
  for (let i = 0; i < VAR_COUNT; i++) {
    RES += vars[i] + " \t " + ratingBlock[i] + " \t " + rating_place_block[i] + STRING_DELIMITER;
  }
  const rating_place_turnir = [VAR_COUNT];
  placeRating(ratingTurnir, rating_place_turnir);
  RES += STRING_DELIMITER + "______Турнирный механизм______";
  RES += STRING_DELIMITER + "Баллы вариантов с учетом весовых коэффициентов и места вариантов" + STRING_DELIMITER;
  for (let i = 0; i < VAR_COUNT; i++) {
    RES += vars[i] + " \t " + ratingTurnir[i] + " \t " + rating_place_turnir[i] + STRING_DELIMITER;
  }
  const rating_place_kmax = [VAR_COUNT];
  const rating_place_kopt = [VAR_COUNT];
  placeRating(kmax, rating_place_kmax);
  placeRating(kopt, rating_place_kopt);
  RES += STRING_DELIMITER + "______Механизм K-MAX______";
  RES += STRING_DELIMITER + "Баллы вариантов с учетом весовых коэффициентов и места вариантов" + STRING_DELIMITER;
  for (let i = 0; i < VAR_COUNT; i++) {
    RES += vars[i] + " " + rating_place_kmax[i] + " " + kopt[i] + " " + rating_place_kopt[i] + STRING_DELIMITER;
  }
  RES += STRING_DELIMITER + "______Бальная система______";

  RES += STRING_DELIMITER + "================================================================= ==============";
  RES += STRING_DELIMITER + " || Блок || Дом || Тур || Sjp || SjM || Сумма бал-лов ||";
  RES += STRING_DELIMITER + "================================================================= =============="
    + STRING_DELIMITER;

  let maxSum = -1;
  let bestVar = -1;
  const sums = [VAR_COUNT];
  for (let i = 0; i < VAR_COUNT; i++) {
    let dom_value = VAR_COUNT + 1 - +rating_place[i];
    let block_value = VAR_COUNT + 1 - +rating_place_block[i];
    let turn_value = VAR_COUNT + 1 - +rating_place_turnir[i];
    let kmax_value = VAR_COUNT + 1 - +rating_place_kmax[i];
    let kopt_value = VAR_COUNT + 1 - +rating_place_kopt[i];
    let sum = +dom_value + +block_value + +turn_value + +kmax_value + +kopt_value;
    sums[i] = sum;
    RES += STRING_DELIMITER + vars[i] + " " + block_value + " " + dom_value + " " + turn_value + " " + kmax_value
      + " " + kopt_value + " " + sum;
    if (sum > maxSum) {
      maxSum = sum;
      bestVar = i;
    }
  }
  const bestResult = document.createElement("div");
  bestResult.id = "bestRes";
  bestResult.innerHTML = `<p>${vars[bestVar]}</p>`;
  const showMore = document.createElement("input");
  showMore.id = "showMore";
  showMore.type = "submit";
  showMore.value = "Показать подробный вывод";
  showMore.addEventListener("click", () => {
    document.getElementById("showMore").style.display = "none";
    const resElement = document.createElement("div");
    resElement.innerText = RES;
    main.appendChild(resElement);
  });
  createAndAddFinalTable(vars, sums, bestResult);
  bestResult.appendChild(showMore);
  main.appendChild(bestResult);
}

function createAndAddFinalTable(vars, sums, element) {
  const table = document.createElement("table");
  table.id = "finalResults";
  const thead = document.createElement("thead");
  const tr = document.createElement("tr");
  tr.innerHTML = `
        <th>Варианты</th>
        <th>Сумма баллов</th>`;
  thead.appendChild(tr);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  for (let i = 0; i < VAR_COUNT; i++) {
    const tr = document.createElement("tr");
    tr.id = "row" + i;
    tr.innerHTML = `<th>${vars[i]}</th>`;
    let element = document.createElement("td");
    let id = "sum" + i;
    element.innerHTML = element.innerHTML.concat(
      `<p id="${id}">${sums[i]}</p>`
    );
    tr.appendChild(element);
    tbody.appendChild(tr);
  }
  table.appendChild(tbody);
  element.appendChild(table);
}

function buildMatrix(vars, isGreater, matrix) {
  for (let i = 0; i < vars.length; i++) {
    for (let j = 0; j < vars.length; j++) {
      if (i === j) {
        matrix[i][j] = -1;
        continue;
      }
      if (!isGreater && vars[i] <= vars[j]) {
        matrix[i][j] = 1;
        continue;
      }
      if (isGreater && vars[i] >= vars[j]) {
        matrix[i][j] = 1;
      }
    }
  }
}

function dominate(arr, n, m) {
  let tmpArray = [];
  let isSuitable;
  for (let i = 0; i < n; i++) {
    isSuitable = true;
    for (let j = 0; j < m; j++) {
      if (i === j) {
        continue;
      }
      if (arr[i][j] !== 1) {
        isSuitable = false;
        break;
      }
    }
    if (isSuitable) {
      tmpArray.push(i);
    }
  }
  return tmpArray;
}

function block(arr, n, m) {
  let tmpArray = [];
  let isSuitable;
  for (let i = 0; i < n; i++) {
    isSuitable = true;
    for (let j = 0; j < m; j++) {
      if (i === j) {
        continue;
      }
      if (arr[j][i] !== 0) {
        isSuitable = false;
        break;
      }
    }
    if (isSuitable) {
      tmpArray.push(i);
    }
  }
  return tmpArray;
}

function turnir(arr, power, n, m, number) {
  let tmp = [];
  for (let i = 0; i < n; i++) {
    let sum = 0.0;
    for (let j = 0; j < m; j++) {
      if (i === j) {
        continue;
      }
      if (arr[i][j] === 1 && arr[j][i] === 0) {
        sum += +power[number];
      } else if (arr[i][j] === 1 && arr[j][i] === 1) {
        sum += +(power[number] / 2);
      }
    }
    tmp.push(sum);
  }
  return tmp;
}

function createKarray(arr, n, m) {
  let A = new Array(m).fill().map(() =>
    new Array(4).fill(0));

  for (let i = 0; i < n; i++) {
    let HR0 = 0;
    let ER = 0;
    let NK = 0;
    for (let j = 0; j < m; j++) {
      if (i === j) {
        continue;
      }
      if (arr[i][j] === 1 && arr[j][i] === 0) {
        HR0 += 1;
      } else if (arr[i][j] === 1 && arr[j][i] === 1) {
        ER += 1;
      } else if (arr[i][j] === -1) {
        NK += 1;
      }
    }
    for (let j = 0; j < 4; j++) {
      switch (j) {
        case 0:
          A[i][j] = HR0 + ER + NK;
          break;
        case 1:
          A[i][j] = HR0 + NK;
          break;
        case 2:
          A[i][j] = HR0 + ER;
          break;
        case 3:
          A[i][j] = HR0;
          break;
        default:
          break;
      }
    }
  }
  return A;
}

function createKopt(arr, n, koptArray) {
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < 4; j++) {
      switch (j) {
        case 0:
          if (arr[i][j] === n) {
            koptArray[i] = 1;
          }
          break;
        case 1:
          if (arr[i][j] === (n - 1) && arr[i][j] > arr[i][j + 2]) {
            koptArray[i] = 2;
          }
          break;
        case 2:
          if (arr[i][j] === n && arr[i][j] > arr[i][j + 1]) {
            koptArray[i] = 3;
          }
          break;
        case 3:
          if (arr[i][j] === (n - 1) && arr[i][j] === arr[i][j - 1] && arr[i][j] === arr[i][j - 2]) {
            koptArray[i] = 4;
          }
          break;
        default:
          koptArray[i] = 0;
          break;
      }
    }
  }
}

function placeRating(arr, A) {
  let place = [VAR_COUNT];

  let number = [VAR_COUNT];
  for (let i = 0; i < VAR_COUNT; i++) {
    number[i] = +(i + 1);
  }
  for (let i = 0; i < VAR_COUNT; i++) {
    place[i] = +arr[i];
  }
  place.sort();
  place.reverse();

  let pl = 0;
  for (let i = 0; i < VAR_COUNT; i++) {
    if ((place[i] === place[i - 1]) && (i !== 0)) {
      continue;
    }
    for (let j = 0; j < VAR_COUNT; j++) {
      if (arr[j] === place[i]) {
        A[j] = number[pl];
      }
    }
    pl++;
    if (place[i] === 0) {
      break;
    }
  }
}

function writeArrKopt(arr, n, m, opt) {
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      RES += +arr[i][j] + " ";
    }
    switch (opt[i]) {
      case 0:
        break;
      case 1:
        RES += "максимальный";
        break;
      case 2:
        RES += "строго максимальный";
        break;
      case 3:
        RES += "наибольший";
        break;
      case 4:
        RES += "строго наибольший";
        break;
      default:
        break;
    }
    RES += STRING_DELIMITER;
  }
}

