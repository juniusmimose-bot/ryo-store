class WalletManager {
    constructor() {
        this.currentBalance = 0;
        this.init();
    }

    init() {
        this.setupDepositModal();
        this.loadBalance();
        
        // Mettre à jour le solde quand l'utilisateur se connecte
        firebaseAuth.onAuthStateChanged((user) => {
            if (user) {
                this.loadBalance();
            } else {
                this.currentBalance = 0;
                this.updateBalanceDisplay();
            }
        });
    }

    setupDepositModal() {
        const depositBtn = document.getElementById('depositBtn');
        const depositModal = document.getElementById('depositModal');
        const closeBtn = depositModal.querySelector('.close');
        const methods = depositModal.querySelectorAll('.method');

        depositBtn.addEventListener('click', () => {
            if (!window.authManager.currentUser) {
                document.getElementById('authModal').style.display = 'block';
                return;
            }
            depositModal.style.display = 'block';
        });

        closeBtn.addEventListener('click', () => {
            depositModal.style.display = 'none';
        });

        methods.forEach(method => {
            method.addEventListener('click', () => {
                methods.forEach(m => m.classList.remove('active'));
                method.classList.add('active');
                this.showDepositForm(method.dataset.method);
            });
        });

        window.addEventListener('click', (e) => {
            if (e.target === depositModal) {
                depositModal.style.display = 'none';
            }
        });
    }

    showDepositForm(method) {
        const form = document.getElementById('depositForm');
        
        switch(method) {
            case 'moncash':
                form.innerHTML = this.getMoncashForm();
                break;
            case 'natcash':
                form.innerHTML = this.getNatcashForm();
                break;
            case 'crypto':
                form.innerHTML = this.getCryptoForm();
                break;
        }

        this.setupDepositForm(method);
    }

    getMoncashForm() {
        return `
            <h4>Dépôt Moncash</h4>
            <p class="deposit-info">
                <strong>Numéro: +50939442808</strong><br>
                <strong>Nom: Marcco Bien Aimé</strong>
            </p>
            <input type="text" placeholder="Nom de votre compte Moncash" required>
            <input type="tel" placeholder="Numéro de votre Moncash" required>
            <input type="number" placeholder="Montant envoyé (HTG)" required min="100">
            <input type="file" accept="image/*" id="moncashProof" required>
            <label for="moncashProof" class="file-label">Preuve de paiement</label>
            <button type="submit" class="validate-btn">Valider la demande</button>
        `;
    }

    getNatcashForm() {
        return `
            <h4>Dépôt Natcash</h4>
            <p class="deposit-info">
                <strong>Numéro: +50935669814</strong><br>
                <strong>Nom: Jinolyse Pierre Louis</strong>
            </p>
            <input type="text" placeholder="Nom de votre compte Natcash" required>
            <input type="tel" placeholder="Numéro de votre Natcash" required>
            <input type="number" placeholder="Montant envoyé (HTG)" required min="100">
            <input type="file" accept="image/*" id="natcashProof" required>
            <label for="natcashProof" class="file-label">Preuve de paiement</label>
            <button type="submit" class="validate-btn">Valider la demande</button>
        `;
    }

    getCryptoForm() {
        return `
            <h4>Dépôt Crypto</h4>
            <p>Contactez-nous sur WhatsApp pour les dépôts en crypto-monnaie</p>
            <a href="https://wa.me/50936535649?text=Bonjour%2C%20je%20souhaite%20faire%20un%20d%C3%A9p%C3%B4t%20crypto" 
               class="whatsapp-btn" target="_blank">
                <i class="fab fa-whatsapp"></i> Contacter sur WhatsApp
            </a>
        `;
    }

    setupDepositForm(method) {
        const form = document.getElementById('depositForm');
        const submitBtn = form.querySelector('button[type="submit"]');
        
        if (submitBtn) {
            submitBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.submitDeposit(method);
            });
        }

        // Style pour l'input file
        const fileInput = form.querySelector('input[type="file"]');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                const label = form.querySelector('.file-label');
                if (e.target.files.length > 0) {
                    label.textContent = e.target.files[0].name;
                } else {
                    label.textContent = 'Preuve de paiement';
                }
            });
        }
    }

    async submitDeposit(method) {
        const form = document.getElementById('depositForm');
        const inputs = form.querySelectorAll('input');
        const fileInput = form.querySelector('input[type="file"]');
        
        const depositData = {
            method: method,
            userAccountName: inputs[0]?.value || '',
            userAccountNumber: inputs[1]?.value || '',
            amount: parseInt(inputs[2]?.value) || 0,
            status: 'en_attente',
            userId: window.authManager.currentUser.uid,
            createdAt: new Date()
        };

        // Validation
        if (!depositData.userAccountName || !depositData.userAccountNumber || !depositData.amount) {
            this.showMessage('Veuillez remplir tous les champs', 'error');
            return;
        }

        if (depositData.amount < 100) {
            this.showMessage('Le montant minimum est de 100 HTG', 'error');
            return;
        }

        try {
            let proofUrl = '';
            
            // Upload de la preuve si disponible
            if (fileInput && fileInput.files[0]) {
                proofUrl = await this.uploadProof(fileInput.files[0]);
                depositData.proofUrl = proofUrl;
            }

            // Sauvegarder la demande de dépôt
            await firebaseDb.collection('deposits').add(depositData);

            // Fermer le modal et reset
            document.getElementById('depositModal').style.display = 'none';
            form.reset();
            document.querySelectorAll('.method').forEach(m => m.classList.remove('active'));

            this.showMessage('Demande de dépôt envoyée! Elle sera traitée sous peu.', 'success');
        } catch (error) {
            this.showMessage('Erreur: ' + error.message, 'error');
        }
    }

    async uploadProof(file) {
        const user = window.authManager.currentUser;
        const storageRef = firebaseStorage.ref();
        const fileRef = storageRef.child(`deposit-proofs/${user.uid}/${Date.now()}_${file.name}`);
        
        await fileRef.put(file);
        return await fileRef.getDownloadURL();
    }

    async loadBalance() {
        if (!window.authManager.currentUser) return;

        try {
            const userDoc = await firebaseDb.collection('users')
                .doc(window.authManager.currentUser.uid)
                .get();
            
            this.currentBalance = userDoc.data()?.solde || 0;
            this.updateBalanceDisplay();
        } catch (error) {
            console.error('Erreur chargement solde:', error);
        }
    }

    updateBalanceDisplay() {
        const balanceElement = document.getElementById('walletBalance');
        if (balanceElement) {
            balanceElement.textContent = this.currentBalance;
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
        }, 4000);
    }
}

// Initialiser le gestionnaire de portefeuille
document.addEventListener('DOMContentLoaded', () => {
    window.walletManager = new WalletManager();
});
