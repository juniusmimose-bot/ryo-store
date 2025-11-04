class ProductManager {
    constructor() {
        this.products = {
            freefire: {
                title: "Free Fire",
                icon: "fas fa-gamepad",
                logo: "assets/logos/freefire-logo.png",
                items: [
                    // Packs Diamants
                    { id: "ff_diamond_100", name: "100+10💎 Diamants", price: 157, type: "diamants" },
                    { id: "ff_diamond_200", name: "200+20💎 Diamants", price: 314, type: "diamants" },
                    { id: "ff_diamond_310", name: "310+31💎 Diamants", price: 487, type: "diamants" },
                    { id: "ff_diamond_410", name: "410+31💎 Diamants", price: 644, type: "diamants" },
                    { id: "ff_diamond_520", name: "520+52💎 Diamants", price: 816, type: "diamants" },
                    { id: "ff_diamond_620", name: "620+62💎 Diamants", price: 973, type: "diamants" },
                    { id: "ff_diamond_720", name: "720+72💎 Diamants", price: 1130, type: "diamants" },
                    { id: "ff_diamond_830", name: "830+83💎 Diamants", price: 1303, type: "diamants" },
                    { id: "ff_diamond_930", name: "930+93💎 Diamants", price: 1460, type: "diamants" },
                    { id: "ff_diamond_1060", name: "1060+106💎 Diamants", price: 1664, type: "diamants" },
                    { id: "ff_diamond_1160", name: "1160+116💎 Diamants", price: 1821, type: "diamants" },
                    { id: "ff_diamond_1260", name: "1260+126💎 Diamants", price: 1978, type: "diamants" },
                    { id: "ff_diamond_1370", name: "1370+137💎 Diamants", price: 2151, type: "diamants" },
                    { id: "ff_diamond_1470", name: "1470+147💎 Diamants", price: 2308, type: "diamants" },
                    { id: "ff_diamond_1580", name: "1580+158💎 Diamants", price: 2481, type: "diamants" },
                    { id: "ff_diamond_1680", name: "1680+168💎 Diamants", price: 2638, type: "diamants" },
                    { id: "ff_diamond_1780", name: "1780+178💎 Diamants", price: 2795, type: "diamants" },
                    { id: "ff_diamond_1890", name: "1890+199💎 Diamants", price: 2968, type: "diamants" },
                    { id: "ff_diamond_1990", name: "1990+129💎 Diamants", price: 3124, type: "diamants" },
                    { id: "ff_diamond_2190", name: "2190+219💎 Diamants", price: 3438, type: "diamants" },
                    { id: "ff_diamond_5600", name: "5600+560💎 Diamants", price: 8792, type: "diamants" },
                    
                    // Abonnements
                    { id: "ff_abonnement_hebdo", name: "Abonnement Hebdo", price: 325, type: "abonnement" },
                    { id: "ff_abonnement_mensuel", name: "Abonnement Mensuel", price: 1600, type: "abonnement" },
                    
                    // Pass
                    { id: "ff_pass_levelup", name: "Level UP Pass", price: 800, type: "pass" },
                    { id: "ff_pass_booyah", name: "Booyah Pass", price: 400, type: "pass" }
                ]
            },
            netflix: {
                title: "Netflix",
                icon: "fas fa-tv",
                logo: "assets/logos/netflix-logo.png",
                items: [
                    { id: "netflix_1mois", name: "1 mois Premium", price: 475 },
                    { id: "netflix_2mois", name: "2 mois Premium", price: 900 },
                    { id: "netflix_3mois", name: "3 mois Premium", price: 1350 }
                ]
            },
            paypal: {
                title: "PayPal",
                icon: "fas fa-money-bill-wave",
                logo: "assets/logos/paypal-logo.png",
                items: this.generateFinancialProducts("paypal")
            },
            wise: {
                title: "Wise",
                icon: "fas fa-globe",
                logo: "assets/logos/wise-logo.png",
                items: this.generateFinancialProducts("wise")
            },
            usdt: {
                title: "USDT",
                icon: "fas fa-coins",
                logo: "assets/logos/usdt-logo.png",
                items: this.generateFinancialProducts("usdt")
            },
            webdev: {
                title: "Développement Web",
                icon: "fas fa-code",
                logo: null,
                items: [
                    { id: "web_cat1", name: "Site Vitrine Simple", price: 2500 },
                    { id: "web_cat2", name: "Site Professionnel", price: 7500 },
                    { id: "web_cat3", name: "Site Avancé/E-commerce", price: 15000 }
                ]
            },
            design: {
                title: "Design",
                icon: "fas fa-palette",
                logo: null,
                items: [
                    { id: "design_logo", name: "Création de Logo", price: 0 },
                    { id: "design_flyer", name: "Création de Flyer", price: 0 }
                ]
            }
        };
        
        this.init();
    }

    generateFinancialProducts(service) {
        const amounts = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
        return amounts.map(amount => ({
            id: `${service}_${amount}`,
            name: `${amount} ${service === 'usdt' ? 'USDT' : 'USD'}`,
            price: amount * 150
        }));
    }

    init() {
        this.renderProducts();
        this.setupOrderButtons();
    }

    renderProducts() {
        const servicesGrid = document.getElementById('servicesGrid');
        
        Object.values(this.products).forEach(service => {
            const serviceSection = this.createServiceSection(service);
            servicesGrid.appendChild(serviceSection);
        });
    }

    createServiceSection(service) {
        const section = document.createElement('div');
        section.className = 'service-card';
        
        let logoHTML = '';
        if (service.logo) {
            logoHTML = `<img src="${service.logo}" alt="${service.title}" class="product-logo">`;
        } else {
            logoHTML = `<i class="${service.icon} service-icon"></i>`;
        }
        
        section.innerHTML = `
            ${logoHTML}
            <h3>${service.title}</h3>
            <div class="service-items">
                ${service.items.map(item => `
                    <div class="service-item">
                        <span class="item-name">${item.name}</span>
                        <span class="item-price">${item.price} HTG</span>
                        <button class="order-btn" data-product='${JSON.stringify(item).replace(/'/g, "&apos;")}' data-service="${service.title}">
                            Commander
                        </button>
                    </div>
                `).join('')}
            </div>
        `;

        return section;
    }

    setupOrderButtons() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('order-btn')) {
                const productData = JSON.parse(e.target.dataset.product.replace(/&apos;/g, "'"));
                const service = e.target.dataset.service;
                this.handleOrder(productData, service);
            }
        });
    }

    handleOrder(product, service) {
        if (!window.authManager.currentUser) {
            document.getElementById('authModal').style.display = 'block';
            return;
        }

        // Afficher le formulaire spécifique au service
        this.showOrderForm(product, service);
    }

    showOrderForm(product, service) {
        let formHTML = '';
        
        switch(service.toLowerCase()) {
            case 'free fire':
                formHTML = `
                    <h4>Commander: ${product.name}</h4>
                    <input type="text" placeholder="Nom de compte" required>
                    <input type="text" placeholder="ID du compte" required>
                    <button type="submit" class="add-to-cart-btn" data-product='${JSON.stringify(product).replace(/'/g, "&apos;")}'>
                        Ajouter au panier - ${product.price} HTG
                    </button>
                `;
                break;
                
            case 'netflix':
                formHTML = `
                    <h4>Commander: ${product.name}</h4>
                    <input type="email" placeholder="Email" required>
                    <input type="tel" placeholder="Numéro WhatsApp" required>
                    <button type="submit" class="add-to-cart-btn" data-product='${JSON.stringify(product).replace(/'/g, "&apos;")}'>
                        Ajouter au panier - ${product.price} HTG
                    </button>
                `;
                break;
                
            case 'paypal':
            case 'wise':
                formHTML = `
                    <h4>Commander: ${product.name}</h4>
                    <input type="email" placeholder="Email du compte" required>
                    <input type="tel" placeholder="Numéro WhatsApp" required>
                    <button type="submit" class="add-to-cart-btn" data-product='${JSON.stringify(product).replace(/'/g, "&apos;")}'>
                        Ajouter au panier - ${product.price} HTG
                    </button>
                `;
                break;
                
            case 'usdt':
                formHTML = `
                    <h4>Commander: ${product.name}</h4>
                    <input type="text" placeholder="Adresse du portefeuille" required>
                    <input type="tel" placeholder="Numéro WhatsApp" required>
                    <button type="submit" class="add-to-cart-btn" data-product='${JSON.stringify(product).replace(/'/g, "&apos;")}'>
                        Ajouter au panier - ${product.price} HTG
                    </button>
                `;
                break;
                
            case 'développement web':
                formHTML = `
                    <h4>Commander: ${product.name}</h4>
                    <input type="text" placeholder="Nom complet" required>
                    <input type="tel" placeholder="Numéro WhatsApp" required>
                    <textarea placeholder="Description du projet" required></textarea>
                    <button type="submit" class="add-to-cart-btn" data-product='${JSON.stringify(product).replace(/'/g, "&apos;")}'>
                        Ajouter au panier - ${product.price} HTG
                    </button>
                `;
                break;
                
            case 'design':
                formHTML = `
                    <h4>Commander: ${product.name}</h4>
                    <input type="text" placeholder="Nom complet" required>
                    <input type="tel" placeholder="Numéro WhatsApp" required>
                    <textarea placeholder="Description du besoin" required></textarea>
                    <button type="submit" class="add-to-cart-btn" data-product='${JSON.stringify(product).replace(/'/g, "&apos;")}'>
                        Demander un devis
                    </button>
                `;
                break;
        }

        // Créer et afficher le modal de commande
        this.showOrderModal(formHTML, product);
    }

    showOrderModal(formHTML, product) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'block';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                ${formHTML}
            </div>
        `;

        document.body.appendChild(modal);

        // Gérer la fermeture
        const closeBtn = modal.querySelector('.close');
        closeBtn.addEventListener('click', () => {
            modal.remove();
        });

        // Gérer l'ajout au panier
        const addToCartBtn = modal.querySelector('.add-to-cart-btn');
        addToCartBtn.addEventListener('click', () => {
            this.addToCart(product, modal);
        });

        // Fermer en cliquant à l'extérieur
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    addToCart(product, modal) {
        const inputs = modal.querySelectorAll('input, textarea');
        const formData = {};
        
        inputs.forEach(input => {
            if (input.value.trim()) {
                formData[input.placeholder] = input.value;
            }
        });

        if (Object.keys(formData).length === 0) {
            alert('Veuillez remplir tous les champs requis');
            return;
        }

        // Ajouter au panier via CartManager
        if (window.cartManager) {
            window.cartManager.addToCart({
                ...product,
                formData: formData,
                timestamp: new Date().toISOString()
            });
        }

        modal.remove();
    }
}

// Initialiser le gestionnaire de produits
document.addEventListener('DOMContentLoaded', () => {
    window.productManager = new ProductManager();
});
