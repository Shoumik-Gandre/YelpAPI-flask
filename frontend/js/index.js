const form = document.getElementById("form-section");
const table = document.getElementById("table-section").getElementsByTagName("table")[0];
const tableBody = table.querySelector('tbody');

const card = document.getElementById("card-section");
const locationInput = document.getElementById("location");
const locationCheckBox = document.getElementById("location-check-box");
const locationData = { longitude: null, latitude: null };
const errorSection = document.getElementById('error-section');


async function getData(url = '', data = {}) {
    var delim = (Object.keys(data).length === 0) ? "" : "?";
    const response = await fetch(url + delim + new URLSearchParams(data), { method: 'GET' });
    return response.json();
}

function createTableRow(rowdata) {
    const tablerow = document.createElement('tr');

    const imageTableNode = document.createElement('td');
    const businessNameTableNode = document.createElement('td');
    const ratingTableNode = document.createElement('td');
    const distanceTableNode = document.createElement('td');

    const imageNode = document.createElement('img'); imageNode.src = rowdata.image_url
    const businessNamePNode = document.createElement('p');
    const businessNameTextNode = document.createTextNode(rowdata.businessName);
    const ratingTextNode = document.createTextNode(rowdata.rating);
    const distanceTextNode = document.createTextNode(rowdata.distance);

    imageTableNode.appendChild(imageNode);
    businessNamePNode.appendChild(businessNameTextNode);
    businessNamePNode['data-id'] = rowdata.businessId;
    businessNamePNode.onclick = function (event) { handleBusinessNameClicked(event) };
    businessNameTableNode.appendChild(businessNamePNode);
    ratingTableNode.appendChild(ratingTextNode);
    distanceTableNode.appendChild(distanceTextNode);

    [
        document.createElement('td'),
        imageTableNode,
        businessNameTableNode,
        ratingTableNode,
        distanceTableNode
    ].forEach(function (node) { tablerow.appendChild(node); })

    return tablerow;
}

function handleTable(data, tableNode) {
    tableNode.style.display = "block";

    const tableBody = tableNode.getElementsByTagName("tbody")[0];
    var rows = tableBody.querySelectorAll('tr');
    [].forEach.call(rows, function (row) { tableBody.removeChild(row); });

    data.forEach(function (row) {
        tableBody.appendChild(
            createTableRow(
                {
                    businessId: row.id,
                    image_url: row.image_url,
                    businessName: row.name,
                    rating: row.rating,
                    distance: row.distance,
                }
            )
        );
    });

    table.scrollIntoView();
}

async function handleBackendCall(data, ipinfo, tableNode, errorNode) {

    data.latitude = null;
    data.longitude = null;

    if (ipinfo) {
        console.log("here");
        const ipinfoResponse = await getData('https://ipinfo.io/', { token: '2fdfa1e196345d' });
        var location = ipinfoResponse.loc.split(',');
        data.latitude = parseFloat(location[0]);
        data.longitude = parseFloat(location[1]);
    }

    getData('search', data)
        .then(function (data) {
            if (data.results.length !== 0)
                handleTable(data.results, tableNode);
            else {
                errorNode.style.display = "block";
                tableNode.style.display = "none";
            }
        })
        .catch(function (err) {
            errorNode.style.display = "block";
            tableNode.style.display = "none";
        });
}

function handleFormSubmit(event, tableNode, errorNode) {

    event.preventDefault();
    card.style.display = "none";
    tableNode.style.display = "none";
    errorNode.style.display = "none";
    var formData = new FormData(event.target);

    var params = {};
    formData.forEach(function (value, key) { params[key] = value; });
    isIpinfoRequired = ('auto-location' in params && params['auto-location'] === "on");
    handleBackendCall(params, isIpinfoRequired, tableNode, errorNode)
}

function handleFormReset(event, tableNode, cardNode) {
    tableNode.style.display = "none";
    cardNode.style.display = "none";
    event.target.location.disabled = false;
}

function handleCheckBoxPressed(event, locationInput, locationData) {
    const checkBox = event.target;
    // If the checkbox is checked, fetch the location data

    if (checkBox.checked == true) {
        locationInput.value = '';
        locationInput.disabled = true;
    } else
        locationInput.disabled = false;
}


function createCard(data) {
    // REFERENCE HOLDERS
    const card = document.getElementById("card-section");
    card.style.display = "block";
    const cardTitle = document.getElementById("card-title");

    const statusNode = document.getElementById("card-status");
    const statusBox = document.getElementById("card-status-box");

    const categoryNode = document.getElementById("card-category");
    const categoryContent = document.getElementById("card-category-content");

    const addressNode = document.getElementById("card-address");
    const addressContent = document.getElementById("card-address-content");

    const phoneNumberNode = document.getElementById("card-phonenumber");
    const phoneNumberContent = document.getElementById("card-phonenumber-content");

    const transactionsNode = document.getElementById("card-transactions");
    const transactionsContent = document.getElementById("card-transactions-content");

    const priceNode = document.getElementById("card-price");
    const priceContent = document.getElementById("card-price-content");

    const moreinfoNode = document.getElementById("card-moreinfo");
    const moreinfoContent = document.getElementById("card-moreinfo-content");

    const cardImage1 = document.getElementById("card-image-1");
    const cardImage2 = document.getElementById("card-image-2");
    const cardImage3 = document.getElementById("card-image-3");


    // RESET HOLDERS
    [
        addressNode,
        phoneNumberNode,
        priceNode,
        transactionsNode,
        categoryNode,
        moreinfoNode
    ].forEach(function (node) { node.style.display = "block" });

    [
        cardImage1,
        cardImage2,
        cardImage3
    ].forEach(function (node) { node.src = "" });


    // SET HOLDERS
    cardTitle.innerText = data.name;

    [
        {
            'key': 'is_closed',
            'node': statusNode,
            'content': statusBox,
            'assign': function (content, value) {
                content.classList.remove('status-open', 'status-closed');
                content.classList.add((value === true) ? 'status-closed' : 'status-open');
            }
        },
        {
            'key': 'address',
            'node': addressNode,
            'content': addressContent
        },
        {
            'key': 'display_phone',
            'node': phoneNumberNode,
            'content': phoneNumberContent
        },
        {
            'key': 'price',
            'node': priceNode,
            'content': priceContent
        },
        {
            'key': 'transactions',
            'node': transactionsNode,
            'content': transactionsContent,
            'assign': function (content, value) { content.innerHTML = value.join(" | ") }
        },
        {
            'key': 'categories',
            'node': categoryNode,
            'content': categoryContent,
            'assign': function (content, value) { content.innerHTML = value.join(" | ") }
        },
        {
            'key': 'url',
            'node': moreinfoNode,
            'content': moreinfoContent,
            'assign': function (content, value) { content.href = value; }
        },
    ].forEach(function (obj) {
        if (obj.key in data && data[obj.key] !== null) {
            if ('assign' in obj) obj.assign(obj.content, data[obj.key]);
            else obj.content.innerText = data[obj.key];
        }
        else obj.node.style.display = "none";
    });

    if ('photos' in data) {
        if (data.photos.length > 0) cardImage1.src = data.photos[0];
        if (data.photos.length > 1) cardImage2.src = data.photos[1];
        if (data.photos.length > 2) cardImage3.src = data.photos[2];
    }

}


function handleBusinessNameClicked(event) {
    getData(`business/${event.target['data-id']}`)
        .then(function (data) {
            createCard(data);
            card.scrollIntoView();
        });
}

const sortColumn = function (index, descending = true, typecast = function (x) { return x; }) {
    var rows = tableBody.querySelectorAll('tr');

    // Clone rows
    const newRows = Array.from(rows);

    newRows.sort(function (rowA, rowB) {
        const cellA = typecast(rowA.querySelectorAll('td')[index].innerHTML);
        const cellB = typecast(rowB.querySelectorAll('td')[index].innerHTML);
        (cellA > cellB) ? ((cellA == cellB) ? 0 : 1) : ((cellA == cellB) ? 0 : -1)
        result = 0
        if (cellA > cellB) result = 1;
        else if (cellA < cellB) result = -1;
        return ((descending === true) ? -1 : 1) * result;
    });

    // Reset rows
    [].forEach.call(rows, function (row) { tableBody.removeChild(row); });

    // Append new rows
    newRows.forEach(function (newRow) { tableBody.appendChild(newRow); });
};


// ENUM for sorting; helps avoid confusion
const order = {
    DESCENDING: true,
    ASCENDING: false,
}

// Table sorting order
const ordering = {
    2: order.ASCENDING,
    3: order.ASCENDING,
    4: order.ASCENDING,
};

const typecasting = {
    2: function (x) { return x; },
    3: function (x) { return parseFloat(x); },
    4: function (x) { return parseFloat(x); }
}

function handleSortTable(index) {
    sortColumn(index, ordering[index], typecasting[index]);
    ordering[index] = (ordering[index] === order.ASCENDING) ? order.DESCENDING : order.ASCENDING;
}

form.onsubmit = function (event) { handleFormSubmit(event, table, errorSection); };
form.onreset = function (event) { handleFormReset(event, table, card); }

locationCheckBox.onchange = function (event) { handleCheckBoxPressed(event, locationInput, locationData); };