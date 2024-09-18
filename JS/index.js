function carousel() {
    return {
        activeSlide: 0,
        slides: [
            { 
                imgSrc: '../Assets/Producciones/Ficcion/LTDSF/LTDSF_1.jpg', 
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
            }
        ],
        prevSlide() {
            this.activeSlide = this.activeSlide === 0 ? this.slides.length - 1 : this.activeSlide - 1;
        },
        nextSlide() {
            this.activeSlide = this.activeSlide === this.slides.length - 1 ? 0 : this.activeSlide + 1;
        },
        startAutoSlide() {
            setInterval(() => {
                this.nextSlide();
            }, 5000); 
        }
    }
}