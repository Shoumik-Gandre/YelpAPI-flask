class Card {
    constructor() {
        this.card = document.getElementById("card-section");
        this.cardTitle = document.getElementById("card-title");
        this.statusBox = document.getElementById("card-status-box");
        this.categoryNode = document.getElementById("card-category");
        this.categoryContent = document.getElementById("card-category-content");
        this.addressNode = document.getElementById("card-address");
        this.addressContent = document.getElementById("card-address-content");
        this.phoneNumberNode = document.getElementById("card-phonenumber");
        this.phoneNumberContent = document.getElementById("card-phonenumber-content");
        this.transactionsNode = document.getElementById("card-transactions");
        this.transactionsContent = document.getElementById("card-transactions-content");
        this.priceNode = document.getElementById("card-price");
        this.priceContent = document.getElementById("card-price-content");
        this.moreinfoNode = document.getElementById("card-moreinfo");
        this.moreinfoContent = document.getElementById("card-moreinfo-content");
        this.cardImage1 = document.getElementById("card-image-1");
        this.cardImage2 = document.getElementById("card-image-2");
        this.cardImage3 = document.getElementById("card-image-3");
    }

    reset() {
        this.addressNode.style.display = "block";
        this.phoneNumberNode.style.display = "block";
        this.priceNode.style.display = "block";
        this.transactionsNode.style.display = "block";
        this.categoryNode.style.display = "block";
        this.cardImage1.src = ""
        this.cardImage2.src = ""
        this.cardImage3.src = ""
    }

    set (data) {
        this.cardTitle.innerText = data.name;
        if ('address' in data) this.addressContent.innerText = data.address;
        else this.addressNode.style.display = "none";

        if ('display_phone' in data) this.phoneNumberContent.innerText = data.display_phone;
        else this.phoneNumberNode.style.display = "none";

        if ('price' in data) this.priceContent.innerText = data.price;
        else this.priceNode.style.display = "none";

        if ('transactions' in data) this.transactionsContent.innerText = data.transactions.join(" | ");
        else this.transactionsNode.style.display = "none";

        if ('categories' in data) this.categoryContent.innerText = data.categories.join(" | ");
        else this.categoryNode.style.display = "none";

        if ('url' in data) this.moreinfoContent.href = data.url;
        else this.moreinfoNode.style.display = "none";

        this.statusBox.classList.remove('status-open', 'status-closed');
        if (data['is_closed']) { this.statusBox.classList.add('status-closed'); } 
        else { this.statusBox.classList.add('status-open'); }

        if ('photos' in data) {
            if (data.photos.length > 0) this.cardImage1.src = data.photos[0];
            if (data.photos.length > 1) this.cardImage1.src = data.photos[1];
            if (data.photos.length > 2) this.cardImage1.src = data.photos[2];
        }
    }
}