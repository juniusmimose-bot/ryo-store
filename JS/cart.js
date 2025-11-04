class CartManager {
    constructor() {
        this.cart = [];
        this.init();
    }

    init() {
        this.loadCart();
        this.setupCartModal();
        this.updateCartDisplay();
    }

    loadCart() {
        const savedCart = localStorage.getItem('ryoStoreCart');
        if (savedCart) {
            this.cart = JSON.parse(savedCart);
        }
    }

    saveCart() {
        localStorage.setItem('ryoStoreCart', JSON.stringify(this.cart));
        this.updateCartDisplay();
    }

    setupCartModal() {
        const cartBtn = document.getElementById('cartBtn');
        const cartModal = document.getElementById('cartModal');
        const closeBtn = cartModal.querySelector('.close');

        cartBtn.addEventListener('click', () => {
            if (!window.authManager.currentUser) {
                document.getElementById('authModal').style.display = 'block';
                return;
            }
            this.showCartModal();
        });

        closeBtn.addEventListener('click', () => {
            cartModal.style.display = 'none';
        });

        window.addEventListener('click', (e) => {
            if (e.target === cartModal) {
                cartModal.style.display = 'none';
            }
        });

        // Bouton de validation
        document.getElementById('checkoutBtn').addEventListener('click', () => {
            this.checkout();
        });
    }

    addToCart(product) {
        this.cart.push(product);
        this.saveCart();
        this.showMessage('Produit ajouté au panier!', 'success');
    }

    removeFromCart(index) {
        this.cart.splice(index, 1);
        this.saveCart();
        this.showCartModal();
    }

    getTotal() {
        return this.cart.reduce((total, item) => total + item.price, 0);
    }

    updateCartDisplay() {
        const cartCount = document.getElementById('cartCount');
        cartCount.textContent = this.cart.length;
    }

    showCartModal() {
        const cartModal = document.getElementById('cartModal');
        const cartItems = document.getElementById('cartItems');
        const cartTotal = document.getElementById('cartTotal');
        const checkoutBtn = document.getElementById('checkoutBtn');

        cartItems.innerHTML = '';

        if (this.cart.length === 0) {
            cartItems.innerHTML = '<p class="empty-cart">Votre panier est vide</p>';
            checkoutBtn.disabled = true;
        } else {
            this.cart.forEach((item, index) => {
                const cartItem = document.createElement('div');
                cartItem.className = 'cart-item';
                cartItem.innerHTML = `
                    <div class="item-info">
                        <strong>${item.name}</strong>
                        <div class="item-details">
                            ${Object.entries(item.formData || {}).map(([key, value]) => 
                                `<small>${key}: ${value}</small>`
                            ).join('')}
                        </div>
                    </div>
                    <div class="item-actions">
                        <span class="item-price">${item.price} HTG</span>
                        <button class="remove-btn" data-index="${index}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `;
                cartItems.appendChild(cartItem);
            });

            // Ajouter les événements de suppression
            cartItems.querySelectorAll('.remove-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const index = parseInt(e.target.closest('.remove-btn').dataset.index);
                    this.removeFromCart(index);
                });
            });

            checkoutBtn.disabled = false;
        }

        cartTotal.textContent = this.getTotal();
        cartModal.style.display = 'block';
    }

    async checkout() {
        if (!window.authManager.currentUser) {
            document.getElementById('authModal').style.display = 'block';
            return;
        }

        // Vérifier le solde
        const total = this.getTotal();
        const userBalance = await this.getUserBalance();

        if (userBalance < total) {
            this.showInsufficientBalanceModal(total, userBalance);
            return;
        }

        // Procéder à la commande
        await this.processOrder();
    }

    async getUserBalance() {
        try {
            const userDoc = await firebaseDb.collection('users')
                .doc(window.authManager.currentUser.uid)
                .get();
            return userDoc.data().solde || 0;
        } catch (error) {
            console.error('Erreur récupération solde:', error);
            return 0;
        }
    }

    showInsufficientBalanceModal(total, balance) {
        const missingAmount = total - balance;
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'block';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h3>Solde Insuffisant</h3>
                <p>Total de la commande: <strong>${total} HTG</strong></p>
                <p>Votre solde: <strong>${balance} HTG</strong></p>
                <p>Il vous manque: <strong style="color: red;">${missingAmount} HTG</strong></p>
                <div class="insufficient-balance-actions">
                    <button class="deposit-redirect-btn">Recharger mon portefeuille</button>
                    <button class="cancel-btn">Annuler</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Événements
        const closeBtn = modal.querySelector('.close');
        const depositBtn = modal.querySelector('.deposit-redirect-btn');
        const cancelBtn = modal.querySelector('.cancel-btn');

        closeBtn.addEventListener('click', () => modal.remove());
        cancelBtn.addEventListener('click', () => modal.remove());

        depositBtn.addEventListener('click', () => {
            modal.remove();
            document.getElementById('cartModal').style.display = 'none';
            document.getElementById('depositModal').style.display = 'block';
        });

        window.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }

    async processOrder() {
        const user = window.authManager.currentUser;
        const order = {
            userId: user.uid,
            items: this.cart,
            total: this.getTotal(),
            status: 'en_attente',
            createdAt: new Date(),
            customerInfo: await this.getUserInfo()
        };

        try {
            // Sauvegarder la commande
            await firebaseDb.collection('orders').add(order);

            // Déduire le solde
            await this.deductBalance(order.total);

            // Vider le panier
            this.cart = [];
            this.saveCart();

            // Fermer le modal
            document.getElementById('cartModal').style.display = 'none';

            this.showMessage('Commande passée avec succès!', 'success');
        } catch (error) {
            this.showMessage('Erreur lors de la commande: ' + error.message, 'error');
        }
    }

    async getUserInfo() {
        try {
            const userDoc = await firebaseDb.collection('users')
                .doc(window.authManager.currentUser.uid)
                .get();
            return userDoc.data();
        } catch (error) {
            return {};
        }
    }

    async deductBalance(amount) {
        try {
            const userRef = firebaseDb.collection('users')
                .doc(window.authManager.currentUser.uid);
            
            await firebaseDb.runTransaction(async (transaction) => {
                const userDoc = await transaction.get(userRef);
                const currentBalance = userDoc.data().solde || 0;
                const newBalance = currentBalance - amount;
                
                if (newBalance < 0) {
                    throw new Error('Solde insuffisant');
                }
                
                transaction.update(userRef, { solde: newBalance });
            });
        } catch (error) {
            throw error;
        }
    }

    showMessage(message, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `auth-message ${type}`;
        messageDiv.textContent = message;
        messageDiv.style.position = 'fixed';
        messageDiv.style.top = '20px';
        messageDiv.style.right = '20px';
        messageDiv.style.zIndex = '3000';

        document.body.appendChild(messageDiv);

        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 3000);
    }
}

// Initialiser le gestionnaire de panier
document.addEventListener('DOMContentLoaded', () => {
    window.cartManager = new CartManager();
});
