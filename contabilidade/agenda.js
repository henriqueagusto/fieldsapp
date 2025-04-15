class AgendaApp {
    constructor() {
        this.currentDate = new Date();
        this.events = JSON.parse(localStorage.getItem('plarufrda-events')) || [];
        this.selectedView = 'week'; // week, month, day
        this.init();
    }

    init() {
        this.renderCalendar();
        this.setupEventListeners();
        this.setupDragAndDrop();
    }

    renderCalendar() {
        this.updateCurrentPeriodText();
        
        if (this.selectedView === 'week') {
            this.renderWeekView();
        } else if (this.selectedView === 'month') {
            this.renderMonthView();
        } else {
            this.renderDayView();
        }
    }

    updateCurrentPeriodText() {
        const options = { month: 'long', year: 'numeric' };
        document.querySelector('.current-period').textContent = 
            this.currentDate.toLocaleDateString('pt-BR', options);
    }

    renderWeekView() {
        const weekStart = this.getWeekStart(this.currentDate);
        const weekDays = document.querySelectorAll('.week-day');
        
        // Atualiza cabeçalho dos dias
        for (let i = 0; i < 7; i++) {
            const day = new Date(weekStart);
            day.setDate(day.getDate() + i);
            
            const dayName = day.toLocaleDateString('pt-BR', { weekday: 'short' });
            const dayNumber = day.getDate();
            
            weekDays[i].innerHTML = `${dayName}<br>${dayNumber}`;
            
            // Marca o dia atual
            const today = new Date();
            if (day.getDate() === today.getDate() && 
                day.getMonth() === today.getMonth() && 
                day.getFullYear() === today.getFullYear()) {
                weekDays[i].classList.add('active');
            } else {
                weekDays[i].classList.remove('active');
            }
        }
        
        // Limpa a grade
        const weekGrid = document.querySelector('.week-grid');
        weekGrid.innerHTML = '';
        
        // Adiciona slots de tempo
        for (let hour = 0; hour < 24; hour++) {
            for (let day = 0; day < 7; day++) {
                const timeSlot = document.createElement('div');
                timeSlot.className = 'time-slot';
                timeSlot.dataset.day = day;
                timeSlot.dataset.hour = hour;
                
                if (day === 0) {
                    const timeLabel = document.createElement('div');
                    timeLabel.className = 'time-label';
                    timeLabel.textContent = `${hour}:00`;
                    timeSlot.appendChild(timeLabel);
                }
                
                weekGrid.appendChild(timeSlot);
            }
        }
        
        // Adiciona eventos
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);
        
        const weekEvents = this.events.filter(event => {
            const eventDate = new Date(event.startDate);
            return eventDate >= weekStart && eventDate < weekEnd;
        });
        
        weekEvents.forEach(event => {
            this.renderEvent(event);
        });
    }

    renderMonthView() {
        const monthStart = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
        const monthEnd = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);
        
        const startDay = monthStart.getDay();
        const totalDays = monthEnd.getDate();
        
        const prevMonthEnd = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 0).getDate();
        
        const monthGrid = document.querySelector('.month-grid');
        monthGrid.innerHTML = '';
        
        // Dias do mês anterior
        for (let i = startDay - 1; i >= 0; i--) {
            const dayElement = this.createMonthDayElement(prevMonthEnd - i, true);
            monthGrid.appendChild(dayElement);
        }
        
        // Dias do mês atual
        const today = new Date();
        for (let i = 1; i <= totalDays; i++) {
            const dayElement = this.createMonthDayElement(i, false);
            
            // Marca o dia atual
            if (this.currentDate.getFullYear() === today.getFullYear() && 
                this.currentDate.getMonth() === today.getMonth() && 
                i === today.getDate()) {
                dayElement.classList.add('today');
            }
            
            monthGrid.appendChild(dayElement);
        }
        
        // Dias do próximo mês
        const daysToAdd = 42 - (startDay + totalDays); // 6 semanas
        for (let i = 1; i <= daysToAdd; i++) {
            const dayElement = this.createMonthDayElement(i, true);
            monthGrid.appendChild(dayElement);
        }
        
        // Adiciona marcadores de eventos
        this.addEventIndicators();
    }

    createMonthDayElement(day, isOtherMonth) {
        const dayElement = document.createElement('div');
        dayElement.className = 'month-day';
        if (isOtherMonth) dayElement.classList.add('other-month');
        
        const dayNumber = document.createElement('div');
        dayNumber.className = 'month-day-number';
        dayNumber.textContent = day;
        dayElement.appendChild(dayNumber);
        
        const eventsContainer = document.createElement('div');
        eventsContainer.className = 'month-events';
        dayElement.appendChild(eventsContainer);
        
        dayElement.addEventListener('click', () => {
            this.showDayView(new Date(
                this.currentDate.getFullYear(),
                this.currentDate.getMonth(),
                day
            ));
        });
        
        return dayElement;
    }

    addEventIndicators() {
        const monthStart = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
        const monthEnd = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);
        
        const monthEvents = this.events.filter(event => {
            const eventDate = new Date(event.startDate);
            return eventDate >= monthStart && eventDate <= monthEnd;
        });
        
        monthEvents.forEach(event => {
            const eventDate = new Date(event.startDate);
            const day = eventDate.getDate();
            const dayElement = document.querySelectorAll('.month-day:not(.other-month)')[day - 1];
            
            if (dayElement) {
                const eventsContainer = dayElement.querySelector('.month-events');
                const eventDot = document.createElement('div');
                eventDot.className = 'month-event-dot';
                eventDot.style.backgroundColor = this.getEventColor(event);
                eventsContainer.appendChild(eventDot);
            }
        });
    }

    renderDayView() {
        const dayTimeline = document.querySelector('.day-timeline');
        dayTimeline.innerHTML = '';
        
        // Cria slots de tempo
        for (let hour = 0; hour < 24; hour++) {
            const timeSlot = document.createElement('div');
            timeSlot.className = 'day-time-slot';
            
            const timeLabel = document.createElement('div');
            timeLabel.className = 'day-time-label';
            timeLabel.textContent = `${hour}:00`;
            timeSlot.appendChild(timeLabel);
            
            const eventsContainer = document.createElement('div');
            eventsContainer.className = 'day-events';
            timeSlot.appendChild(eventsContainer);
            
            dayTimeline.appendChild(timeSlot);
        }
        
        // Adiciona eventos
        const dayStart = new Date(this.currentDate);
        dayStart.setHours(0, 0, 0, 0);
        
        const dayEnd = new Date(this.currentDate);
        dayEnd.setHours(23, 59, 59, 999);
        
        const dayEvents = this.events.filter(event => {
            const eventDate = new Date(event.startDate);
            return eventDate >= dayStart && eventDate <= dayEnd;
        });
        
        dayEvents.forEach(event => {
            this.renderDayEvent(event);
        });
    }

    renderDayEvent(event) {
        const eventStart = new Date(event.startDate);
        const hour = eventStart.getHours();
        const minutes = eventStart.getMinutes();
        
        const timeSlot = document.querySelectorAll('.day-time-slot')[hour];
        if (!timeSlot) return;
        
        const eventsContainer = timeSlot.querySelector('.day-events');
        
        const eventElement = document.createElement('div');
        eventElement.className = 'event';
        eventElement.style.backgroundColor = this.getEventColor(event);
        
        const titleElement = document.createElement('div');
        titleElement.className = 'event-title';
        titleElement.textContent = event.title;
        eventElement.appendChild(titleElement);
        
        const timeElement = document.createElement('div');
        timeElement.className = 'event-time';
        
        if (event.allDay) {
            timeElement.textContent = 'Dia inteiro';
        } else {
            const endTime = event.endDate ? new Date(event.endDate) : null;
            timeElement.textContent = this.formatTime(eventStart);
            if (endTime) {
                timeElement.textContent += ` - ${this.formatTime(endTime)}`;
            }
        }
        
        eventElement.appendChild(timeElement);
        eventsContainer.appendChild(eventElement);
        
        eventElement.addEventListener('click', () => {
            this.editEvent(event);
        });
    }

    renderEvent(event) {
        const eventStart = new Date(event.startDate);
        const dayOfWeek = eventStart.getDay();
        const hour = eventStart.getHours();
        
        const timeSlot = document.querySelector(`.time-slot[data-day="${dayOfWeek}"][data-hour="${hour}"]`);
        if (!timeSlot) return;
        
        const eventElement = document.createElement('div');
        eventElement.className = 'event';
        eventElement.style.backgroundColor = this.getEventColor(event);
        
        const titleElement = document.createElement('div');
        titleElement.className = 'event-title';
        titleElement.textContent = event.title;
        eventElement.appendChild(titleElement);
        
        const timeElement = document.createElement('div');
        timeElement.className = 'event-time';
        timeElement.textContent = this.formatTime(eventStart);
        eventElement.appendChild(timeElement);
        
        timeSlot.appendChild(eventElement);
        
        eventElement.addEventListener('click', () => {
            this.editEvent(event);
        });
    }

    getEventColor(event) {
        // Gera uma cor baseada no título do evento para consistência
        const colors = [
            'var(--event-color-1)',
            'var(--event-color-2)',
            'var(--event-color-3)',
            'var(--event-color-4)'
        ];
        
        const hash = event.title.split('').reduce((acc, char) => {
            return char.charCodeAt(0) + ((acc << 5) - acc);
        }, 0);
        
        return colors[Math.abs(hash) % colors.length];
    }

    formatTime(date) {
        return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    }

    getWeekStart(date) {
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Ajuste para semana começar na segunda
        return new Date(date.setDate(diff));
    }

    showDayView(date) {
        this.currentDate = date;
        this.selectedView = 'day';
        this.updateViewButtons();
        this.renderCalendar();
    }

    updateViewButtons() {
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.view === this.selectedView) {
                btn.classList.add('active');
            }
        });
        
        document.querySelectorAll('.week-view, .month-view, .day-view').forEach(view => {
            view.classList.remove('active');
        });
        
        document.getElementById(`${this.selectedView}-view`).classList.add('active');
    }

    setupEventListeners() {
        // Navegação
        document.getElementById('prev-period').addEventListener('click', () => {
            if (this.selectedView === 'week') {
                this.currentDate.setDate(this.currentDate.getDate() - 7);
            } else if (this.selectedView === 'month') {
                this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            } else {
                this.currentDate.setDate(this.currentDate.getDate() - 1);
            }
            this.renderCalendar();
        });
        
        document.getElementById('next-period').addEventListener('click', () => {
            if (this.selectedView === 'week') {
                this.currentDate.setDate(this.currentDate.getDate() + 7);
            } else if (this.selectedView === 'month') {
                this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            } else {
                this.currentDate.setDate(this.currentDate.getDate() + 1);
            }
            this.renderCalendar();
        });
        
        document.getElementById('go-today').addEventListener('click', () => {
            this.currentDate = new Date();
            this.renderCalendar();
        });
        
        // Troca de visualização
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.selectedView = btn.dataset.view;
                this.updateViewButtons();
                this.renderCalendar();
            });
        });
        
        // Botão adicionar evento
        document.querySelector('.add-event-btn').addEventListener('click', () => {
            this.showEventModal();
        });
        
        // Formulário de evento
        document.getElementById('event-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveEvent();
        });
        
        // Toggle de evento recorrente
        document.getElementById('event-recurring').addEventListener('change', (e) => {
            const options = document.querySelector('.recurrence-options');
            if (e.target.checked) {
                options.classList.remove('hidden');
            } else {
                options.classList.add('hidden');
            }
        });
        
        // Tipo de recorrência
        document.getElementById('recurrence-type').addEventListener('change', (e) => {
            const custom = document.querySelector('.custom-recurrence');
            const frequencyText = document.getElementById('recurrence-frequency-text');
            
            if (e.target.value === 'custom') {
                custom.classList.remove('hidden');
            } else {
                custom.classList.add('hidden');
            }
            
            // Atualiza texto de frequência
            switch (e.target.value) {
                case 'daily':
                    frequencyText.textContent = 'dias';
                    break;
                case 'weekly':
                    frequencyText.textContent = 'semanas';
                    break;
                case 'monthly':
                    frequencyText.textContent = 'meses';
                    break;
                case 'yearly':
                    frequencyText.textContent = 'anos';
                    break;
            }
        });
        
        // Opções de término de recorrência
        document.getElementById('recurrence-end-type').addEventListener('change', (e) => {
            const countInput = document.getElementById('recurrence-count');
            const dateInput = document.getElementById('recurrence-end-date');
            
            countInput.classList.add('hidden');
            dateInput.classList.add('hidden');
            
            if (e.target.value === 'after') {
                countInput.classList.remove('hidden');
            } else if (e.target.value === 'on') {
                dateInput.classList.remove('hidden');
            }
        });
        
        // Dias da semana para recorrência semanal
        document.querySelectorAll('.weekday-options button').forEach(btn => {
            btn.addEventListener('click', () => {
                btn.classList.toggle('active');
            });
        });
        
        // Lembrete por localização
        document.getElementById('event-reminder').addEventListener('change', (e) => {
            const locationOptions = document.querySelector('.location-options');
            if (e.target.value === 'location') {
                locationOptions.classList.remove('hidden');
            } else {
                locationOptions.classList.add('hidden');
            }
        });
        
        // Usar localização atual
        document.getElementById('set-current-location').addEventListener('click', () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(position => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    document.getElementById('event-location').value = `${lat}, ${lng}`;
                });
            } else {
                alert('Geolocalização não é suportada pelo seu navegador');
            }
        });
        
        // Fechar modal
        document.querySelector('.btn-cancel').addEventListener('click', () => {
            document.getElementById('event-modal').classList.remove('active');
        });
        
        document.querySelector('.close-modal').addEventListener('click', () => {
            document.getElementById('event-modal').classList.remove('active');
        });
    }

    showEventModal(event = null) {
        const modal = document.getElementById('event-modal');
        const form = document.getElementById('event-form');
        
        if (event) {
            // Modo edição
            document.querySelector('.modal-header h3').textContent = 'Editar Evento';
            document.getElementById('event-title').value = event.title;
            document.getElementById('event-start-date').value = event.startDate.split('T')[0];
            
            if (event.allDay) {
                document.getElementById('event-all-day').checked = true;
                document.getElementById('event-start-time').value = '';
                document.getElementById('event-end-time').value = '';
            } else {
                document.getElementById('event-start-time').value = 
                    new Date(event.startDate).toTimeString().substring(0, 5);
                
                if (event.endDate) {
                    document.getElementById('event-end-date').value = event.endDate.split('T')[0];
                    document.getElementById('event-end-time').value = 
                        new Date(event.endDate).toTimeString().substring(0, 5);
                }
            }
            
            // Recorrência
            if (event.recurrence) {
                document.getElementById('event-recurring').checked = true;
                document.querySelector('.recurrence-options').classList.remove('hidden');
                document.getElementById('recurrence-type').value = event.recurrence.type;
                
                // Configura opções customizadas...
            }
            
            // Lembrete
            if (event.reminder) {
                document.getElementById('event-reminder').value = event.reminder;
                
                if (event.reminder === 'location' && event.location) {
                    document.querySelector('.location-options').classList.remove('hidden');
                    document.getElementById('event-location').value = event.location;
                }
            }
            
            form.dataset.editId = event.id;
        } else {
            // Modo criação
            document.querySelector('.modal-header h3').textContent = 'Novo Evento';
            form.reset();
            delete form.dataset.editId;
            
            // Preenche a data atual
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('event-start-date').value = today;
        }
        
        modal.classList.add('active');
    }

    saveEvent() {
        const form = document.getElementById('event-form');
        const title = document.getElementById('event-title').value;
        const startDate = document.getElementById('event-start-date').value;
        const startTime = document.getElementById('event-start-time').value;
        const endDate = document.getElementById('event-end-date').value;
        const endTime = document.getElementById('event-end-time').value;
        const allDay = document.getElementById('event-all-day').checked;
        const isRecurring = document.getElementById('event-recurring').checked;
        const recurrenceType = document.getElementById('recurrence-type').value;
        const reminder = document.getElementById('event-reminder').value;
        const location = document.getElementById('event-location').value;
        
        // Formata datas
        const startDateTime = allDay ? 
            `${startDate}T00:00:00` : 
            `${startDate}T${startTime}:00`;
        
        let endDateTime = null;
        if (endDate && (allDay || endTime)) {
            endDateTime = allDay ? 
                `${endDate}T23:59:59` : 
                `${endDate}T${endTime}:00`;
        }
        
        const newEvent = {
            id: form.dataset.editId || Date.now(),
            title,
            startDate: startDateTime,
            endDate: endDateTime,
            allDay,
            createdAt: new Date().toISOString()
        };
        
        // Recorrência
        if (isRecurring) {
            newEvent.recurrence = {
                type: recurrenceType,
                interval: parseInt(document.getElementById('recurrence-interval').value) || 1
            };
            
            if (recurrenceType === 'weekly') {
                const selectedDays = [];
                document.querySelectorAll('.weekday-options button.active').forEach(btn => {
                    selectedDays.push(parseInt(btn.dataset.day));
                });
                
                if (selectedDays.length > 0) {
                    newEvent.recurrence.daysOfWeek = selectedDays;
                }
            }
            
            // Configuração de término
            const endType = document.getElementById('recurrence-end-type').value;
            if (endType === 'after') {
                newEvent.recurrence.count = parseInt(document.getElementById('recurrence-count').value);
            } else if (endType === 'on') {
                newEvent.recurrence.until = document.getElementById('recurrence-end-date').value;
            }
        }
        
        // Lembrete
        if (reminder !== 'none') {
            newEvent.reminder = reminder;
            
            if (reminder === 'location' && location) {
                newEvent.location = location;
            }
        }
        
        // Adiciona ou atualiza o evento
        if (form.dataset.editId) {
            const index = this.events.findIndex(e => e.id == form.dataset.editId);
            if (index !== -1) {
                this.events[index] = newEvent;
            }
        } else {
            this.events.push(newEvent);
        }
        
        // Salva e atualiza a visualização
        this.saveToLocalStorage();
        this.renderCalendar();
        
        // Fecha o modal
        document.getElementById('event-modal').classList.remove('active');
    }

    editEvent(event) {
        this.showEventModal(event);
    }

    setupDragAndDrop() {
        // Implementação de drag and drop para reagendar eventos
        document.addEventListener('dragover', (e) => {
            e.preventDefault();
        });
        
        // Você pode expandir isso para permitir arrastar eventos entre dias/horários
    }

    saveToLocalStorage() {
        localStorage.setItem('plarufrda-events', JSON.stringify(this.events));
    }
}

// Inicializa a aplicação quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    new AgendaApp();
});