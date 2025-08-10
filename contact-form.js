// Contact Form Handler
class ContactFormHandler {
    constructor() {
        this.form = document.getElementById('contactForm');
        this.successMessage = document.getElementById('contactSuccess');
        this.init();
    }

    init() {
        if (this.form) {
            this.form.addEventListener('submit', this.handleSubmit.bind(this));
        }
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(this.form);
        const contactData = {
            name: formData.get('name'),
            email: formData.get('email'),
            subject: formData.get('subject'),
            message: formData.get('message'),
            timestamp: new Date().toISOString(),
            status: 'pending'
        };

        try {
            // Show loading state
            const submitBtn = this.form.querySelector('.btn-submit');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
            submitBtn.disabled = true;

            // Send to admin panel API
            const response = await fetch('/admin_panel/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(contactData)
            });

            if (response.ok) {
                this.showSuccess();
                this.form.reset();
            } else {
                // Fallback: Store in localStorage for admin panel
                this.storeContactLocally(contactData);
                this.showSuccess();
                this.form.reset();
            }

            // Reset button
            setTimeout(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }, 2000);

        } catch (error) {
            console.log('Storing contact locally due to:', error.message);
            // Fallback: Store in localStorage
            this.storeContactLocally(contactData);
            this.showSuccess();
            this.form.reset();

            // Reset button
            const submitBtn = this.form.querySelector('.btn-submit');
            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Enviar Mensagem';
            submitBtn.disabled = false;
        }
    }

    storeContactLocally(contactData) {
        // Store contact in localStorage as fallback
        let contacts = JSON.parse(localStorage.getItem('nexor_contacts') || '[]');
        contactData.id = Date.now().toString();
        contacts.push(contactData);
        localStorage.setItem('nexor_contacts', JSON.stringify(contacts));
    }

    showSuccess() {
        this.successMessage.style.display = 'block';
        this.successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Hide success message after 5 seconds
        setTimeout(() => {
            this.successMessage.style.display = 'none';
        }, 5000);
    }

    // Method to get stored contacts (for admin panel integration)
    static getStoredContacts() {
        return JSON.parse(localStorage.getItem('nexor_contacts') || '[]');
    }

    // Method to clear stored contacts (after syncing with admin panel)
    static clearStoredContacts() {
        localStorage.removeItem('nexor_contacts');
    }
}

// Initialize contact form when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ContactFormHandler();
});

// Export for admin panel integration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ContactFormHandler;
}