const userAttr = ['name', 'height', 'mass'];
const planetAttr = ['name', 'diameter', 'gravity', 'climate'];
const url = 'https://swapi.dev/api/people';
const imgTdHTML = '<div><img src="./img/red-saber.png" alt="unknown" width="70px" height="19.5px"></img></div>';

function strRedact(arrStr) {
    redactedArr = [];
    arrStr.forEach((element) => {
        element = element.split('')
            .map((letter, index) => index == 0 ? letter.toUpperCase() : letter == '_' ? letter = ' ' : letter)
            .join('');
        redactedArr.push(element)
    });
    return redactedArr;
}

async function getPeople(url, array = []) {
    let response = await fetch(url);
    let responseJSON = await response.json();
    let people = array.concat(responseJSON.results);
    if (responseJSON.next != null) {
        return getPeople(responseJSON.next, people);
    } else return people;
}

function createTable(userAttr) {
    let table = document.createElement('table');
    let tr = document.createElement('tr');
    let thead = document.createElement('thead');
    table.append(thead);
    tr.className = 'header_tr';
    strRedact(userAttr).forEach(element => {
        let td = document.createElement('td');
        td.innerHTML = element;
        tr.append(td);
    });
    thead.append(tr);
    createPlanetTd(tr, 'Homeworld');
    let usersBlock = document.querySelector('.users_block');
    usersBlock.append(table);
}

async function pastePeople(peoplePromise) {
    let people = await peoplePromise;
    let table = document.querySelector('.users_block table');
    let tbody = document.createElement('tbody');
    table.append(tbody);
    people.forEach((element) => {
        let tr = document.createElement('tr');
        tr.dataset.homeWorld = element.homeworld;
        for (const attr of userAttr) {
            let td = document.createElement('td');
            td.innerHTML = (element[attr] == 'unknown') ? imgTdHTML : element[attr];
            tr.append(td);
        }
        createPlanetTd(tr, 'promise');
        tbody.append(tr);
    })

}

async function createPlanetTd(tr, text) {
    let planetTd = document.createElement('td');
    if (text == 'promise') {
        let planet = await getPlanet(tr.dataset.homeWorld);
        planetTd.innerHTML = (planet.name == 'unknown') ? imgTdHTML : planet.name;
        planetTd.addEventListener('click', showPlanetModal);
    } else planetTd.innerHTML = text;
    planetTd.classList.add('planet_td');
    tr.append(planetTd);
}

async function getPlanet(url) {
    let response = await fetch(url);
    let planet = await response.json();
    return planet;
}

async function showPlanetModal() {
    let url = this.closest('tr').dataset.homeWorld;
    let planet = await getPlanet(url);
    let modal = document.createElement('div');
    modal.className = 'planet_modal';
    let infoWrapper = document.createElement('div');
    infoWrapper.className = 'info_wrapper';
    let modalTitle = document.createElement('div');
    modalTitle.innerHTML = 'Planet info:'
    modalTitle.classList.add('modal_title')
    infoWrapper.append(modalTitle);

    planetAttr.forEach((el) => {
        let lineDiv = document.createElement('div');
        lineDiv.classList.add("modal_line_div");
        lineDiv.innerHTML = `<div class="title">${el}:</div><div class="content">
        ${planet[el] == '0' || planet[el] == 'unknown' ? '-' : planet[el]}</div>`;
        infoWrapper.append(lineDiv);
    });

    let closeBtn = document.createElement('div');
    closeBtn.className = 'close_btn';
    closeBtn.innerHTML = '<span>X</span>'

    document.body.addEventListener('click', closeModal);
    closeBtn.addEventListener('click', closeModal);

    modal.append(infoWrapper);
    modal.append(closeBtn);
    document.body.prepend(modal);
    let planetTdList = document.querySelectorAll('tbody .planet_td');
    planetTdList.forEach((el) => {
        el.classList.replace('planet_td', 'planet_td_with_active_modal')
        el.removeEventListener('click', showPlanetModal);
    });
}

function closeModal(event) {
    let modal = document.querySelector('.planet_modal');
    let closeBtn = document.querySelector('.close_btn');

    if (!event.path.includes(modal) || event.path.includes(closeBtn)) {
        document.body.removeEventListener('click', closeModal);
        modal.remove();
        let planetTdList = document.querySelectorAll('tbody .planet_td_with_active_modal');
        planetTdList.forEach((el) => {
            el.classList.replace('planet_td_with_active_modal', 'planet_td');
            el.addEventListener('click', showPlanetModal);
        });
    }
}

createTable(userAttr);
pastePeople(getPeople(url));