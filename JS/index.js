

function carousel() {
    return {
        activeSlide: 0,
        interval : null,
        slides: [
            { 
                imgSrc: '../Assets/Producciones/Documental/Scan-Web-rana.jpg', 
                title: 'DOCUMENTAL', 
                description: '' 
            },
            { 
                imgSrc: '../Assets/Producciones/Spot/perfectskull-7.jpg', 
                title: 'SPOT', 
                description: '' 
            },
            { 
                imgSrc: '../Assets/Producciones/Ficcion/LTDSF/LTDSF_4.jpg', 
                title: 'CINE', 
                description: '' 
            },
        
            { 
                imgSrc: '../Assets/Producciones/Documental/Scan_web_serpiente.jpg', 
                title: 'DOCUMENTAL', 
                description: '' 
            },
            { 
                imgSrc: '../Assets/Producciones/Videoclip/Scan_web_desintoxicado.jpg', 
                title: 'VIDEOCLIP', 
                description: '' 
            },
            { 
                imgSrc: '../Assets/Producciones/Ficcion/LTDSF/LTDSF_3.jpg', 
                title: 'CINE', 
                description: '' 
            },
            { 
                imgSrc: '../Assets/Producciones/Documental/Scan_web_serpiente2.jpg', 
                title: 'DOCUMENTAL', 
                description: '' 
            },
            { 
                imgSrc: '../Assets/Producciones/Videoclip/Scan_web_tequedas.jpg', 
                title: 'VIDEOCLIP', 
                description: '' 
            },
            { 
                imgSrc: '../Assets/Producciones/Ficcion/Cigarrillos/Cigarrillos-1.jpg', 
                title: 'CINE', 
                description: '' 
            }
            
        ],
        prevSlide() {
            this.activeSlide = this.activeSlide === 0 ? this.slides.length - 1 : this.activeSlide - 1;
            this.stopAutoSlide()
        },
        nextSlide() {
            this.activeSlide = this.activeSlide === this.slides.length - 1 ? 0 : this.activeSlide + 1;
            this.stopAutoSlide()
        },
        nextAutoSlide() {
            this.activeSlide = this.activeSlide === this.slides.length - 1 ? 0 : this.activeSlide + 1;
        },
        startAutoSlide() {
            this.interval = setInterval(() => {
                this.nextAutoSlide();
            }, 7000); 
        },
        stopAutoSlide() {
            clearInterval(this.interval);
        }
        }

}

const initAnimations = () => {
    const logo = document.querySelector('img[src*="Logo"]');
    const instagramIcon = document.querySelector('.fa-instagram');

    if (logo) {
        logo.style.transition = 'transform 0.5s ease-in-out';
        logo.addEventListener('mouseenter', () => {
            logo.style.transform = 'scale(1.1)';
        });
        logo.addEventListener('mouseleave', () => {
            logo.style.transform = 'scale(1)';
        });
    }

    if (instagramIcon) {
        instagramIcon.style.transition = 'color 0.3s';
        instagramIcon.addEventListener('mouseenter', () => {
            instagramIcon.style.color = '#167d73';
        });
        instagramIcon.addEventListener('mouseleave', () => {
            instagramIcon.style.color = '#20e2cf';
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    initAnimations();
});
