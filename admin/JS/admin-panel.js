class AdminPanel {
    constructor() {
        this.currentUser = null;
        this.orders = [];
        this.deposits = [];
        this.users = [];
        this.init();
    }

    init() {
        this.checkAuth();
        this.setupNavigation();
        this.setupEventListeners();
        this.loadDashboardData();
    }

    checkAuth() {
        firebaseAuth.onAuthStateChanged((user) => {
            if (user && user.email === 'ryosukeorikita@gmail.com') {
                this.currentUser = user;
                this.setupRealTimeListeners();
            } else {
                window.location.href = '/';
            }
        });
    }

    setupNavigation() {
        // Navigation entre sections
        document.querySelectorAll('.nav-link').forEach(link => {
            if (link.getAttribute('href').startsWith('#')) {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.showSection(link.getAttribute('href').substring(1));
                });
            }
        });

        // Déconnexion
        document.getElementById('adminLogoutBtn').addEventListener('click', (e) => {
            e.preventDefault();
            this.logout();
        });
    }

    setupEventListeners() {
        // Fermeture des modals
        document.querySelectorAll('.modal .close').forEach(closeBtn => {
            closeBtn.addEventListener('click', (e) => {
                e.target.closest('.modal').style.display = 'none';
            });
        });

        // Clic en dehors des modals
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        });
    }

    showSection(sectionId) {
        // Masquer toutes les sections
        document.querySelectorAll('.admin-section').forEach(section => {
            section.classList.remove('active');
        });

        // Désactiver tous les liens
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        // Afficher la section demandée
        document.getElementById(sectionId).classList.add('active');
        
        // Activer le lien correspondant
        document.querySelector(`[href="#${sectionId}"]`).classList.add('active');

        // Charger les données spécifiques à la section
        switch(sectionId) {
            case 'orders':
                this.loadOrders();
                break;
            case 'deposits':
                this.loadDeposits();
                break;
            case 'users':
                this.loadUsers();
                break;
        }
    }

    setupRealTimeListeners() {
        // Écouter les nouvelles commandes
        firebaseDb.collection('orders')
            .orderBy('createdAt', 'desc')
            .onSnapshot((snapshot) => {
                this.orders = [];
                snapshot.forEach(doc => {
                    this.orders.push({ id: doc.id, ...doc.data() });
                });
                this.updateOrdersDisplay();
                this.updateDashboardStats();
            });

        // Écouter les nouveaux dépôts
        firebaseDb.collection('deposits')
            .orderBy('createdAt', 'desc')
            .onSnapshot((snapshot) => {
                this.deposits = [];
                snapshot.forEach(doc => {
                    this.deposits.push({ id: doc.id, ...doc.data() });
                });
                this.updateDepositsDisplay();
                this.updateDashboardStats();
            });

        // Écouter les utilisateurs
        firebaseDb.collection('users')
            .onSnapshot((snapshot) => {
                this.users = [];
                snapshot.forEach(doc => {
                    this.users.push({ id: doc.id, ...doc.data() });
                });
                this.updateUsersDisplay();
                this.updateDashboardStats();
            });
    }

    async loadDashboardData() {
        await Promise.all([
            this.loadOrders(),
            this.loadDeposits(),
            this.loadUsers()
        ]);
        this.updateDashboardStats();
    }

    async loadOrders() {
        try {
            const snapshot = await firebaseDb.collection('orders')
                .orderBy('createdAt', 'desc')
                .get();
            
            this.orders = [];
            snapshot.forEach(doc => {
                this.orders.push({ id: doc.id, ...doc.data() });
            });
            
            this.updateOrdersDisplay();
        } catch (error) {
            this.showNotification('Erreur chargement commandes: ' + error.message, 'error');
        }
    }

    async loadDeposits() {
        try {
            const snapshot = await firebaseDb.collection('deposits')
                .orderBy('createdAt', 'desc')
                .get();
            
            this.deposits = [];
            snapshot.forEach(doc => {
                this.deposits.push({ id: doc.id, ...doc.data() });
            });
            
            this.updateDepositsDisplay();
        } catch (error) {
            this.showNotification('Erreur chargement dépôts: ' + error.message, 'error');
        }
    }

    async loadUsers() {
        try {
            const snapshot = await firebaseDb.collection('users').get();
            
            this.users = [];
            snapshot.forEach(doc => {
                this.users.push({ id: doc.id, ...doc.data() });
            });
            
            this.updateUsersDisplay();
        } catch (error) {
            this.showNotification('Erreur chargement utilisateurs: ' + error.message, 'error');
        }
    }

    updateDashboardStats() {
        const pendingOrders = this.orders.filter(order => order.status === 'en_attente').length;
        const pendingDeposits = this.deposits.filter(deposit => deposit.status === 'en_attente').length;
        const totalUsers = this.users.length;
        const totalRevenue = this.orders
            .filter(order => order.status === 'completed')
            .reduce((sum, order) => sum + order.total, 0);

        document.getElementById('pendingOrdersCount').textContent = pendingOrders;
        document.getElementById('pendingDepositsCount').textContent = pendingDeposits;
        document.getElementById('totalUsersCount').textContent = totalUsers;
        document.getElementById('totalRevenue').textContent = totalRevenue + ' HTG';
    }

    updateOrdersDisplay() {
        const tbody = document.getElementById('ordersTableBody');
        
        if (this.orders.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="empty-state">
                        <i class="fas fa-shopping-cart"></i>
                        <p>Aucune commande trouvée</p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.orders.map(order => `
            <tr>
                <td>${order.id.substring(0, 8)}...</td>
                <td>${order.customerInfo?.nom || 'N/A'}</td>
                <td>${order.items.length} produit(s)</td>
                <td>${order.total} HTG</td>
                <td>${new Date(order.createdAt?.toDate()).toLocaleDateString()}</td>
                <td>
                    <span class="status-badge status-${order.status}">
                        ${this.getStatusText(order.status)}
                    </span>
                </td>
                <td>
                    <button class="action-btn btn-primary view-order-btn" data-order-id="${order.id}">
                        <i class="fas fa-eye"></i>
                    </button>
                    ${order.status === 'en_attente' ? `
                        <button class="action-btn btn-success complete-order-btn" data-order-id="${order.id}">
                            <i class="fas fa-check"></i>
                        </button>
                    ` : ''}
                </td>
            </tr>
        `).join('');

        // Événements pour les boutons
        tbody.querySelectorAll('.view-order-btn').forEach(btn => {
            btn.addEventListener('click', () => this.showOrderDetails(btn.dataset.orderId));
        });

        tbody.querySelectorAll('.complete-order-btn').forEach(btn => {
            btn.addEventListener('click', () => this.completeOrder(btn.dataset.orderId));
        });
    }

    updateDepositsDisplay() {
        const tbody = document.getElementById('depositsTableBody');
        
        if (this.deposits.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="empty-state">
                        <i class="fas fa-money-bill-wave"></i>
                        <p>Aucun dépôt trouvé</p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.deposits.map(deposit => {
            const user = this.users.find(u => u.id === deposit.userId);
            return `
            <tr>
                <td>${deposit.id.substring(0, 8)}...</td>
                <td>${user?.nom || 'N/A'}</td>
                <td>${deposit.method}</td>
                <td>${deposit.amount} HTG</td>
                <td>
                    ${deposit.proofUrl ? 
                        `<button class="action-btn btn-primary view-proof-btn" data-proof-url="${deposit.proofUrl}">
                            <i class="fas fa-image"></i>
                        </button>` : 
                        'Aucune'
                    }
                </td>
                <td>${new Date(deposit.createdAt?.toDate()).toLocaleDateString()}</td>
                <td>
                    <span class="status-badge status-${deposit.status}">
                        ${this.getStatusText(deposit.status)}
                    </span>
                </td>
                <td>
                    <button class="action-btn btn-primary view-deposit-btn" data-deposit-id="${deposit.id}">
                        <i class="fas fa-eye"></i>
                    </button>
                    ${deposit.status === 'en_attente' ? `
                        <button class="action-btn btn-success validate-deposit-btn" data-deposit-id="${deposit.id}">
                            <i class="fas fa-check"></i>
                        </button>
                        <button class="action-btn btn-danger reject-deposit-btn" data-deposit-id="${deposit.id}">
                            <i class="fas fa-times"></i>
                        </button>
                    ` : ''}
                </td>
            </tr>
        `}).join('');

        // Événements pour les boutons
        tbody.querySelectorAll('.view-deposit-btn').forEach(btn => {
            btn.addEventListener('click', () => this.showDepositDetails(btn.dataset.depositId));
        });

        tbody.querySelectorAll('.validate-deposit-btn').forEach(btn => {
            btn.addEventListener('click', () => this.validateDeposit(btn.dataset.depositId));
        });

        tbody.querySelectorAll('.reject-deposit-btn').forEach(btn => {
            btn.addEventListener('click', () => this.rejectDeposit(btn.dataset.depositId));
        });

        tbody.querySelectorAll('.view-proof-btn').forEach(btn => {
            btn.addEventListener('click', () => this.viewProof(btn.dataset.proofUrl));
        });
    }

    updateUsersDisplay() {
        const tbody = document.getElementById('usersTableBody');
        
        if (this.users.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-state">
                        <i class="fas fa-users"></i>
                        <p>Aucun utilisateur trouvé</p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.users.map(user => `
            <tr>
                <td>${user.nom}</td>
                <td>${user.email}</td>
                <td>${user.whatsapp}</td>
                <td>${user.solde || 0} HTG</td>
                <td>${new Date(user.dateInscription?.toDate()).toLocaleDateString()}</td>
                <td>
                    <button class="action-btn btn-primary" onclick="adminPanel.viewUserDetails('${user.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    async showOrderDetails(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (!order) return;

        const modal = document.getElementById('orderDetailsModal');
        const content = document.getElementById('orderDetailsContent');

        content.innerHTML = `
            <div class="order-info">
                <p><strong>Client:</strong> ${order.customerInfo?.nom || 'N/A'}</p>
                <p><strong>Email:</strong> ${order.customerInfo?.email || 'N/A'}</p>
                <p><strong>WhatsApp:</strong> ${order.customerInfo?.whatsapp || 'N/A'}</p>
                <p><strong>Date:</strong> ${new Date(order.createdAt?.toDate()).toLocaleString()}</p>
                <p><strong>Statut:</strong> ${this.getStatusText(order.status)}</p>
            </div>
            <div class="order-items">
                <h4>Produits commandés:</h4>
                ${order.items.map(item => `
                    <div class="order-item">
                        <div class="order-item-info">
                            <div>
                                <strong>${item.name}</strong>
                                <div class="item-details">
                                    ${Object.entries(item.formData || {}).map(([key, value]) => 
                                        `<small>${key}: ${value}</small><br>`
                                    ).join('')}
                                </div>
                            </div>
                            <div>${item.price} HTG</div>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="order-total">
                Total: ${order.total} HTG
            </div>
            ${order.status === 'en_attente' ? `
                <div class="order-actions" style="margin-top: 1rem; text-align: center;">
                    <button class="btn-success" onclick="adminPanel.completeOrder('${order.id}')">
                        Marquer comme complétée
                    </button>
                </div>
            ` : ''}
        `;

        modal.style.display = 'block';
    }

    async showDepositDetails(depositId) {
        const deposit = this.deposits.find(d => d.id === depositId);
        if (!deposit) return;

        const user = this.users.find(u => u.id === deposit.userId);
        const modal = document.getElementById('depositDetailsModal');
        const content = document.getElementById('depositDetailsContent');

        content.innerHTML = `
            <div class="deposit-info-grid">
                <div class="deposit-info-item">
                    <strong>Client</strong>
                    ${user?.nom || 'N/A'}
                </div>
                <div class="deposit-info-item">
                    <strong>Méthode</strong>
                    ${deposit.method}
                </div>
                <div class="deposit-info-item">
                    <strong>Montant</strong>
                    ${deposit.amount} HTG
                </div>
                <div class="deposit-info-item">
                    <strong>Date</strong>
                    ${new Date(deposit.createdAt?.toDate()).toLocaleString()}
                </div>
            </div>
            <div class="deposit-account-info">
                <h4>Informations du compte client:</h4>
                <p><strong>Nom:</strong> ${deposit.userAccountName}</p>
                <p><strong>Numéro:</strong> ${deposit.userAccountNumber}</p>
            </div>
            ${deposit.proofUrl ? `
                <div class="deposit-proof">
                    <h4>Preuve de paiement:</h4>
                    <img src="${deposit.proofUrl}" alt="Preuve de paiement" onclick="this.classList.toggle('zoomed')">
                </div>
            ` : ''}
        `;

        // Événements pour les boutons d'action
        document.getElementById('validateDepositBtn').onclick = () => this.validateDeposit(depositId);
        document.getElementById('rejectDepositBtn').onclick = () => this.rejectDeposit(depositId);

        modal.style.display = 'block';
    }

    async validateDeposit(depositId) {
        const deposit = this.deposits.find(d => d.id === depositId);
        if (!deposit) return;

        try {
            // Mettre à jour le statut du dépôt
            await firebaseDb.collection('deposits').doc(depositId).update({
                status: 'validated',
                validatedAt: new Date()
            });

            // Mettre à jour le solde de l'utilisateur
            const userRef = firebaseDb.collection('users').doc(deposit.userId);
            await firebaseDb.runTransaction(async (transaction) => {
                const userDoc = await transaction.get(userRef);
                const currentBalance = userDoc.data().solde || 0;
                const newBalance = currentBalance + deposit.amount;
                transaction.update(userRef, { solde: newBalance });
            });

            this.showNotification('Dépôt validé avec succès!', 'success');
            document.getElementById('depositDetailsModal').style.display = 'none';
        } catch (error) {
            this.showNotification('Erreur validation dépôt: ' + error.message, 'error');
        }
    }

    async rejectDeposit(depositId) {
        if (!confirm('Êtes-vous sûr de vouloir rejeter ce dépôt ?')) return;

        try {
            await firebaseDb.collection('deposits').doc(depositId).update({
                status: 'rejected',
                rejectedAt: new Date()
            });

            this.showNotification('Dépôt rejeté!', 'success');
            document.getElementById('depositDetailsModal').style.display = 'none';
        } catch (error) {
            this.showNotification('Erreur rejet dépôt: ' + error.message, 'error');
        }
    }

    async completeOrder(orderId) {
        try {
            await firebaseDb.collection('orders').doc(orderId).update({
                status: 'completed',
                completedAt: new Date()
            });

            this.showNotification('Commande marquée comme complétée!', 'success');
            document.getElementById('orderDetailsModal').style.display = 'none';
        } catch (error) {
            this.showNotification('Erreur mise à jour commande: ' + error.message, 'error');
        }
    }

    viewProof(proofUrl) {
        window.open(proofUrl, '_blank');
    }

    getStatusText(status) {
        const statusMap = {
            'en_attente': 'En attente',
            'validated': 'Validé',
            'completed': 'Complétée',
            'rejected': 'Rejeté'
        };
        return statusMap[status] || status;
    }

    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `admin-notification notification-${type}`;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 4000);
    }

    async logout() {
        try {
            await firebaseAuth.signOut();
            window.location.href = '/';
        } catch (error) {
            this.showNotification('Erreur déconnexion: ' + error.message, 'error');
        }
    }
}

// Initialiser le panel admin
document.addEventListener('DOMContentLoaded', () => {
    window.adminPanel = new AdminPanel();
});
