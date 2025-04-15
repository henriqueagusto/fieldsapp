document.addEventListener('DOMContentLoaded', function() {
    // Mobile Menu Toggle
    const menuToggle = document.getElementById('menuToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    const closeMenu = document.getElementById('closeMenu');

    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', function() {
            mobileMenu.classList.add('active');
        });
    }

    if (closeMenu) {
        closeMenu.addEventListener('click', function() {
            mobileMenu.classList.remove('active');
        });
    }

    // Add Button Functionality
    const addButton = document.getElementById('addButton');
    if (addButton) {
        addButton.addEventListener('click', function() {
            alert('Nova tarefa será adicionada!');
            // Aqui você pode adicionar lógica para abrir um modal de criação de tarefa
        });
    }

    // Task Item Click
    const taskItems = document.querySelectorAll('.task-item');
    taskItems.forEach(item => {
        item.addEventListener('click', function() {
            this.classList.toggle('expanded');
        });
    });

    // Day Navigation
    const dayItems = document.querySelectorAll('.day-item');
    dayItems.forEach(item => {
        item.addEventListener('click', function() {
            dayItems.forEach(d => d.querySelector('.day-number').classList.remove('current-day'));
            this.querySelector('.day-number').classList.add('current-day');
            
            // Simular mudança de data
            const dayName = this.querySelector('.day-name').textContent;
            const dayNumber = this.querySelector('.day-number').textContent;
            const dateDisplay = document.querySelector('.current-date');
            
            if (dateDisplay) {
                const weekDays = {
                    'Dom': 'domingo',
                    'Seg': 'segunda-feira',
                    'Ter': 'terça-feira',
                    'Qua': 'quarta-feira',
                    'Qui': 'quinta-feira',
                    'Sex': 'sexta-feira',
                    'Sáb': 'sábado'
                };
                
                dateDisplay.textContent = `${weekDays[dayName]} - ${dayNumber} de agosto`;
            }
        });
    });

    // Desktop Add Task Button
    const desktopAddButton = document.querySelector('.add-task-btn');
    if (desktopAddButton) {
        desktopAddButton.addEventListener('click', function() {
            alert('Nova tarefa será adicionada!');
            // Lógica para abrir modal de criação de tarefa
        });
    }

    // Menu Item Active State
    const menuLinks = document.querySelectorAll('.menu-link, .menu-item');
    menuLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            menuLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Simular animação das barras do gráfico
    setTimeout(() => {
        const chartFills = document.querySelectorAll('.chart-fill');
        chartFills.forEach(fill => {
            const width = fill.style.width;
            fill.style.width = '0';
            setTimeout(() => {
                fill.style.width = width;
            }, 100);
        });
    }, 500);
});
document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('themeToggle');
    const html = document.documentElement;
    
    // Verificar preferência do sistema
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Verificar localStorage
    const userPrefersDark = localStorage.getItem('theme') === 'dark' || 
                          (localStorage.getItem('theme') === null && systemPrefersDark);
    
    // Aplicar tema inicial
    if (userPrefersDark) {
        html.setAttribute('data-theme', 'dark');
    } else {
        html.setAttribute('data-theme', 'light');
    }
    
    // Animação de entrada
    setTimeout(() => {
        document.body.style.transition = 'background-color 0.5s ease, color 0.3s ease';
    }, 100);
    
    // Alternar tema
    themeToggle.addEventListener('click', () => {
        const isDark = html.getAttribute('data-theme') === 'dark';
        
        // Animação de transição
        html.style.transition = 'none';
        const fadeOut = document.createElement('div');
        fadeOut.className = 'theme-transition-overlay';
        fadeOut.style.position = 'fixed';
        fadeOut.style.top = '0';
        fadeOut.style.left = '0';
        fadeOut.style.width = '100%';
        fadeOut.style.height = '100%';
        fadeOut.style.backgroundColor = isDark ? '#121212' : '#f8f9fa';
        fadeOut.style.zIndex = '9999';
        fadeOut.style.opacity = '0';
        fadeOut.style.transition = 'opacity 0.3s ease';
        document.body.appendChild(fadeOut);
        
        setTimeout(() => {
            fadeOut.style.opacity = '1';
            
            setTimeout(() => {
                html.setAttribute('data-theme', isDark ? 'light' : 'dark');
                localStorage.setItem('theme', isDark ? 'light' : 'dark');
                
                setTimeout(() => {
                    fadeOut.style.opacity = '0';
                    
                    setTimeout(() => {
                        document.body.removeChild(fadeOut);
                    }, 300);
                }, 100);
            }, 300);
        }, 10);
    });
    
    // Atualizar quando a preferência do sistema mudar
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (localStorage.getItem('theme') === null) {
            html.setAttribute('data-theme', e.matches ? 'dark' : 'light');
        }
    });
});

