class AuthManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        // Écouter les changements d'authentification
        firebaseAuth.onAuthStateChanged((user) => {
            this.currentUser = user;
            this.updateUI();
            
            if (user && user.email === 'ryosukeorikita@gmail.com') {
                this.showAdminLink();
            }
        });

        // Gérer les formulaires d'authentification
        this.setupAuthForms();
        this.setupModal();
    }

    setupAuthForms() {
        // Formulaire de connexion
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.login();
        });

        // Formulaire d'inscription
        document.getElementById('registerForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.register();
        });

        // Navigation des onglets
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });
    }

    setupModal() {
        const modal = document.getElementById('authModal');
        const loginBtn = document.getElementById('loginBtn');
        const closeBtn = modal.querySelector('.close');

        loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            modal.style.display = 'block';
        });

        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    switchTab(tab) {
        // Mettre à jour les boutons d'onglets
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');

        // Mettre à jour les formulaires
        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.remove('active');
        });
        document.getElementById(tab + 'Form').classList.add('active');
    }

    async login() {
        const form = document.getElementById('loginForm');
        const email = form.querySelector('input[type="email"]').value;
        const password = form.querySelector('input[type="password"]').value;

        try {
            await firebaseAuth.signInWithEmailAndPassword(email, password);
            document.getElementById('authModal').style.display = 'none';
            this.showMessage('Connexion réussie!', 'success');
        } catch (error) {
            this.showMessage('Erreur de connexion: ' + error.message, 'error');
        }
    }

    async register() {
        const form = document.getElementById('registerForm');
        const inputs = form.querySelectorAll('input');
        const userData = {
            nom: inputs[0].value,
            email: inputs[1].value,
            whatsapp: inputs[2].value,
            solde: 0,
            dateInscription: new Date()
        };

        try {
            const userCredential = await firebaseAuth.createUserWithEmailAndPassword(
                userData.email, 
                inputs[3].value
            );
            
            // Sauvegarder les données utilisateur
            await firebaseDb.collection('users').doc(userCredential.user.uid).set(userData);
            
            document.getElementById('authModal').style.display = 'none';
            this.showMessage('Inscription réussie!', 'success');
        } catch (error) {
            this.showMessage('Erreur d\'inscription: ' + error.message, 'error');
        }
    }

    async logout() {
        try {
            await firebaseAuth.signOut();
            this.showMessage('Déconnexion réussie!', 'success');
        } catch (error) {
            this.showMessage('Erreur de déconnexion: ' + error.message, 'error');
        }
    }

    updateUI() {
        const navUser = document.getElementById('navUser');
        const loginBtn = document.getElementById('loginBtn');

        if (this.currentUser) {
            navUser.innerHTML = `
                <div class="user-menu">
                    <a href="#" class="nav-link" id="userMenuBtn">
                        <i class="fas fa-user"></i> Mon Compte
                    </a>
                    <div class="user-dropdown" id="userDropdown">
                        <a href="#" id="profileBtn">Mon Profil</a>
                        <a href="#" id="ordersBtn">Mes Commandes</a>
                        <a href="#" id="walletBtn">Mon Portefeuille</a>
                        <a href="#" id="logoutBtn">Déconnexion</a>
                    </div>
                </div>
            `;

            // Gérer le menu utilisateur
            const userMenuBtn = document.getElementById('userMenuBtn');
            const userDropdown = document.getElementById('userDropdown');
            const logoutBtn = document.getElementById('logoutBtn');

            userMenuBtn.addEventListener('click', (e) => {
                e.preventDefault();
                userDropdown.classList.toggle('show');
            });

            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });

            // Fermer le menu en cliquant ailleurs
            document.addEventListener('click', (e) => {
                if (!userMenuBtn.contains(e.target) && !userDropdown.contains(e.target)) {
                    userDropdown.classList.remove('show');
                }
            });

        } else {
            navUser.innerHTML = '<a href="#" class="nav-link" id="loginBtn">Connexion</a>';
            // Re-attacher l'événement au nouveau bouton
            document.getElementById('loginBtn').addEventListener('click', (e) => {
                e.preventDefault();
                document.getElementById('authModal').style.display = 'block';
            });
        }
    }

    showAdminLink() {
        const nav = document.querySelector('.nav');
        const adminLink = document.createElement('a');
        adminLink.href = '/admin';
        adminLink.className = 'nav-link';
        adminLink.innerHTML = '<i class="fas fa-crown"></i> Admin';
        nav.insertBefore(adminLink, document.querySelector('.nav-user'));
    }

    showMessage(message, type) {
        // Supprimer les messages existants
        const existingMessage = document.querySelector('.auth-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = `auth-message ${type}`;
        messageDiv.textContent = message;

        const modalContent = document.querySelector('.modal-content');
        modalContent.insertBefore(messageDiv, modalContent.firstChild);

        // Supprimer automatiquement après 5 secondes
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);
    }
}

// Initialiser l'authentification
document.addEventListener('DOMContentLoaded', () => {
    window.authManager = new AuthManager();
});
