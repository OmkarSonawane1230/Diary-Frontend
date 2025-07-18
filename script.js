const revealMenuBtn = document.getElementById('reveal-menu');
const sendBtn = document.getElementById("sendData");

const addFields = document.getElementsByClassName('add-fields');
const deleteFields = document.getElementsByClassName('delete-fields');
const updateFields = document.getElementsByClassName('update-fields');

const menu_list = document.querySelectorAll('.menu-list li');
const entryBtns = document.querySelectorAll('.entryBtns')
const entries = document.getElementById('entries');
const orders = document.getElementById('orders');
const farmerEntryMenu = document.getElementsByClassName('farmer-entry-menu')[0]

revealMenuBtn.addEventListener('click', () => {
    document.getElementsByClassName('top-buttons')[0].classList.toggle('extendM');
    document.getElementsByClassName('menu-list')[0].classList.toggle('showM');
})

window.addEventListener('resize', (e) => {
    if (window.innerWidth > 1142) {
        document.getElementsByClassName('top-buttons')[0].classList.remove('extendM');
        document.getElementsByClassName('menu-list')[0].classList.remove('showM');
    }
})


async function postData(url = "", data = {}, method_ = "") {
    const response = await fetch(url, {
        method: method_,
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
    return response.text();
}

function createData(inputFields) {
    let date = new Date().toISOString().split('T')[0];
    let p = (inputFields[3].value / 4) + (0.21 * inputFields[2].value) + 0.36;
    p = parseFloat(p.toFixed(1));
    // {(percentage of fat/100)*quantity of milk}x price of fat + {(percentage of SNF/100)*quantity of milk}x price of SNF {(4/100)*1}x 370 + {(8/100)*1}x 247 = Rs 34.56 per litre.
    let pr = ((inputFields[2].value / 100.0) * inputFields[1].value) * 370 + ((p / 100.0) * inputFields[1].value) * 247
    // SNF %( Solids Not Fat) = CLR\4 + 0.2xF + 0.36
    /*
        fat 3.5, snf 8.5 -> 33.5
        Price=33.5+(Fat−3.5)×3.0+(SNF−8.5)×2.5
        
    */
    console.log(p);
    console.log(pr);
    const data = {
        "farmerId": inputFields[0].value,
        "quantityInLtr": inputFields[1].value,
        "date": `${date}`,
        "fatContent": inputFields[2].value,
        "snf": p,
        "pricePerLtr": pr,
        "shift": `${new Date().getHours() >= 12 ? "evening" : "morning"}`
    }
    return data;
}

entryBtns.forEach(item => {
    item.addEventListener('click', async () => {
        if (item.textContent == 'Add Entry') {
            result = await postData("/api/owner/milk-entries", createData(addFields), "POST");
            addFarmerEntry();
        } else if (item.textContent == 'Update Entry')
            result = await postData(`/api/owner/milk-entries/${updateFields[0].value}`, createData(Array.from(updateFields).slice(1)), "PUT");
        else
            result = await postData(`/api/owner/milk-entries/${deleteFields[0].value}`, { "date": `${new Date().toISOString().split('T')[0]}`, "shift": `${new Date().getHours() >= 12 ? "evening" : "morning"}` }, "DELETE")
    });
});

function HideAll() {
    document.getElementsByClassName('add-details')[0].classList.add('displayNone');
    document.getElementsByClassName('update-details')[0].classList.add('displayNone');
    document.getElementsByClassName('delete-details')[0].classList.add('displayNone');
    document.getElementsByClassName('view-details')[0].classList.add('displayNone');
    document.getElementsByClassName('order-details')[0].classList.add('displayNone');
}

menu_list.forEach(element => {
    element.addEventListener('click', () => {

        HideAll();
        switch (element.textContent) {
            case "Add Entry":
                document.getElementsByClassName('add-details')[0].classList.remove('displayNone');
                break;
            case "Update Entry":
                document.getElementsByClassName('update-details')[0].classList.remove('displayNone');
                break;
            case "Delete Entry":
                document.getElementsByClassName('delete-details')[0].classList.remove('displayNone');
                break;
            case "View Entries":
                document.getElementsByClassName('view-details')[0].classList.remove('displayNone');
                viewEntries();
                break;
            case "View Orders":
                document.getElementsByClassName('order-details')[0].classList.remove('displayNone');
                viewOrders();
                break;
            case "Payment History":
                break;
        }
    });
});

function viewEntries() {
    entries.innerHTML = "";
    fetch('/api/owner/milk-entries')
        .then(response => response.json())
        .then(milkEntries => {
            // console.log(data[0].date)
            // const output = document.getElementById('output');
            // output.innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
            milkEntries.forEach((entry, index) => {
                const entryDiv = document.createElement('div');
                entryDiv.className = 'entry';

                const header = document.createElement('div');
                const boxDiv = document.createElement('div');
                boxDiv.className = 'innerBox';
                boxDiv.textContent = `${entry.farmerId}`
                header.appendChild(boxDiv);
                header.className = 'entry-header';
                const contentDiv = document.createElement('div');
                contentDiv.textContent = `Shift: ${entry.shift}`;
                header.appendChild(contentDiv);
                const leftDiv = document.createElement('div');
                leftDiv.className = 'innerBox';
                leftDiv.textContent = `${entry.quantityInLtr}`;
                header.appendChild(leftDiv);
                console.log(entry)
                const details = document.createElement('div');
                details.className = 'details';
                details.innerHTML = `
                                    <div>Date: ${entry.date}</div>
                                    <div>Fat Content: ${entry.fatContent}</div>
                                    <div>SNF: ${entry.snf}</div>
                                    <div>Price per Liter: ₹${entry.pricePerLtr}</div> `;

                boxDiv.addEventListener('click', () => {
                    details.style.display = details.style.display === 'none' ? 'block' : 'none';
                });

                entryDiv.appendChild(header);
                entryDiv.appendChild(details);
                entries.appendChild(entryDiv);
            });
        });

}

async function viewOrders() {
    orders.innerHTML = "";
    await fetch('/api/owner/calculate-to-inventory')
    fetch('/api/owner/inventory')
        .then(response => response.json())
        .then(orderEntries => {
            orderEntries.forEach((entry, index) => {
                console.log(entry.averageFatContent);
                const entryDiv = document.createElement('div');
                entryDiv.className = 'orderEntry';

                const header = document.createElement('div');

                header.className = 'entry-header';
                header.textContent = `Farmer ID: ${entry.averageFatContent} | Quantity: ${entry.totalQuantity}L | Shift: ${entry.shift} | ${entry.status}`;

                const details = document.createElement('div');
                details.className = 'details';
                details.innerHTML = `
                <div>Date: ${entry.date}</div>
                <div>Fat Content: ${entry.averageFatContent}</div>
                <div>Price per Liter: ₹${entry.pricePerLtr}</div> `;
                if (entry.status == 'OUT-OF-STOCK') {
                    entryDiv.style.background = '#800020'
                }
                header.addEventListener('click', () => {
                    details.style.display = details.style.display === 'none' ? 'block' : 'none';
                });

                entryDiv.appendChild(header);
                entryDiv.appendChild(details);
                orders.appendChild(entryDiv);
            })

        });

}

function addFarmerEntry() {
    fetch(`/api/owner/milk-entries`)
        .then(response => response.json())
        .then(data => {
            const li = document.createElement('li');
            let temp = data[data.length - 1]
            li.textContent = `Id - ${temp.farmerId}, qty - ${temp.quantityInLtr}, price - ${temp.pricePerLtr}`;
            farmerEntryMenu.insertAdjacentElement("afterbegin", li);

        });
}
