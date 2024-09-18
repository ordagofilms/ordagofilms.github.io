function carousel() {
    return {
        activeSlide: 0,
        slides: [
            '../Assets/Producciones/Ficcion/LTDSF/LTDSF_1.jpg', 
            '../Assets/Producciones/Ficcion/LTDSF/LTDSF_2.jpg', 
            '../Assets/Producciones/Ficcion/LTDSF/LTDSF_3.jpg'
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


