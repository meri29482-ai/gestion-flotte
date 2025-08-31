<template>
  <div class="calendar-container">
    <div class="calendar-header">
      <h3><i class="fas fa-calendar-alt"></i> Calendrier des Maintenances</h3>
      <div class="view-options">
        <button 
          v-for="view in views" 
          :key="view" 
          @click="changeView(view)"
          :class="{ active: currentView === view }"
          class="btn btn-view"
        >
          {{ view }}
        </button>
      </div>
      <div class="navigation">
        <button @click="prevPeriod" class="btn btn-icon">
          <i class="fas fa-chevron-left"></i>
        </button>
        <h4>{{ currentPeriod }}</h4>
        <button @click="nextPeriod" class="btn btn-icon">
          <i class="fas fa-chevron-right"></i>
        </button>
        <button @click="goToToday" class="btn btn-today">
          Aujourd'hui
        </button>
      </div>
    </div>

    <!-- Vue Jour -->
    <div v-if="currentView === 'Jour'" class="day-view">
      <div class="day-header">
        <div class="time-column"></div>
        <div class="day-title">
          {{ formatDate(currentDate, 'full') }}
        </div>
      </div>
      <div class="day-body">
        <div class="time-column">
          <div v-for="hour in 24" :key="hour" class="time-slot">
            {{ hour - 1 }}:00
          </div>
        </div>
        <div class="events-column">
          <div 
            v-for="hour in 24" 
            :key="hour" 
            class="time-slot"
            @click="openAddModalWithDate(hour - 1)"
          >
            <div 
              v-for="event in getEventsForDay(currentDate, hour - 1)"
              :key="event.id"
              class="calendar-event"
              :class="`event-${getStatusClass(event.statut)}`"
              @click.stop="openEditModal(event)"
            >
              <div class="event-time">
                {{ formatTime(event.date_intervention) }}
              </div>
              <div class="event-title">
                {{ event.Vehicule?.immatriculation || 'N/A' }} - {{ event.type_principal }}
              </div>
              <div class="event-status">
                <i :class="getStatusIcon(event.statut)"></i>
                {{ event.statut }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Vue Semaine -->
    <div v-if="currentView === 'Semaine'" class="week-view">
      <div class="week-header">
        <div class="time-column"></div>
        <div 
          v-for="day in weekDays" 
          :key="day.date"
          class="day-header"
          :class="{ 'today': isToday(day.date) }"
        >
          <div class="day-name">{{ day.name }}</div>
          <div class="day-date">{{ day.date.getDate() }}</div>
        </div>
      </div>
      <div class="week-body">
        <div class="time-column">
          <div v-for="hour in 24" :key="hour" class="time-slot">
            {{ hour - 1 }}:00
          </div>
        </div>
        <div 
          v-for="day in weekDays" 
          :key="day.date"
          class="day-column"
          @click="openAddModalWithDate(9, day.date)"
        >
          <div 
            v-for="hour in 24" 
            :key="hour" 
            class="time-slot"
          >
            <div 
              v-for="event in getEventsForDay(day.date, hour - 1)"
              :key="event.id"
              class="calendar-event"
              :class="`event-${getStatusClass(event.statut)}`"
              @click.stop="openEditModal(event)"
            >
              <div class="event-time">
                {{ formatTime(event.date_intervention) }}
              </div>
              <div class="event-title">
                {{ event.Vehicule?.immatriculation || 'N/A' }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Vue Mois -->
    <div v-if="currentView === 'Mois'" class="month-view">
      <div class="month-grid">
        <div 
          v-for="day in monthDays" 
          :key="day.date"
          class="month-day"
          :class="{
            'other-month': !day.isCurrentMonth,
            'today': isToday(day.date),
            'has-events': hasEvents(day.date)
          }"
          @click="openAddModalWithDate(9, day.date)"
        >
          <div class="day-header">
            <div class="day-number">{{ day.date.getDate() }}</div>
            <div class="day-name">{{ formatDate(day.date, 'shortDay') }}</div>
          </div>
          <div class="day-events">
            <div 
              v-for="event in getEventsForDay(day.date)" 
              :key="event.id"
              class="month-event"
              :class="`event-${getStatusClass(event.statut)}`"
              @click.stop="openEditModal(event)"
            >
              <div class="event-dot"></div>
              <div class="event-title">
                {{ formatTime(event.date_intervention) }} - {{ event.type_principal }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { format, addDays, addMonths, startOfWeek, endOfWeek, 
         eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns'
import { fr } from 'date-fns/locale'

export default {
  name: 'MaintenanceCalendar',
  props: {
    maintenances: {
      type: Array,
      required: true
    },
    openAddModal: {
      type: Function,
      required: true
    },
    openEditModal: {
      type: Function,
      required: true
    }
  },

  data() {
    return {
      currentDate: new Date(),
      currentView: 'Semaine', // 'Jour', 'Semaine' ou 'Mois'
      views: ['Jour', 'Semaine', 'Mois']
    }
  },

  computed: {
    weekDays() {
      const start = startOfWeek(this.currentDate, { locale: fr })
      const end = endOfWeek(this.currentDate, { locale: fr })
      const days = eachDayOfInterval({ start, end })
      
      return days.map(date => ({
        date,
        name: format(date, 'EEE', { locale: fr }),
        fullName: format(date, 'EEEE', { locale: fr })
      }))
    },

    monthDays() {
      const year = this.currentDate.getFullYear()
      const month = this.currentDate.getMonth()
      
      const firstDay = new Date(year, month, 1)
      const lastDay = new Date(year, month + 1, 0)
      
      const start = startOfWeek(firstDay, { locale: fr })
      const end = endOfWeek(lastDay, { locale: fr })
      
      const days = eachDayOfInterval({ start, end })
      
      return days.map(date => ({
        date,
        isCurrentMonth: isSameMonth(date, this.currentDate),
        dayName: format(date, 'EEE', { locale: fr })
      }))
    },

    currentPeriod() {
      switch (this.currentView) {
  case 'Jour': {
    return format(this.currentDate, 'EEEE d MMMM yyyy', { locale: fr });
  }
  case 'Semaine': {
    const start = startOfWeek(this.currentDate, { locale: fr });
    const end = endOfWeek(this.currentDate, { locale: fr });
    return `${format(start, 'd MMM', { locale: fr })} - ${format(end, 'd MMM yyyy', { locale: fr })}`;
  }
  case 'Mois': {
    return format(this.currentDate, 'MMMM yyyy', { locale: fr });
  }
  default: {
    return '';
  }
}

    }
  },

  methods: {
    changeView(view) {
      this.currentView = view
    },

    prevPeriod() {
      switch (this.currentView) {
        case 'Jour':
          this.currentDate = addDays(this.currentDate, -1)
          break
        case 'Semaine':
          this.currentDate = addDays(this.currentDate, -7)
          break
        case 'Mois':
          this.currentDate = addMonths(this.currentDate, -1)
          break
      }
    },

    nextPeriod() {
      switch (this.currentView) {
        case 'Jour':
          this.currentDate = addDays(this.currentDate, 1)
          break
        case 'Semaine':
          this.currentDate = addDays(this.currentDate, 7)
          break
        case 'Mois':
          this.currentDate = addMonths(this.currentDate, 1)
          break
      }
    },

    goToToday() {
      this.currentDate = new Date()
    },

    getEventsForDay(date, hour = null) {
      return this.maintenances.filter(maintenance => {
        const eventDate = new Date(maintenance.date_intervention)
        const sameDay = isSameDay(eventDate, date)
        
        if (hour !== null) {
          return sameDay && eventDate.getHours() === hour
        }
        
        return sameDay
      })
    },

    hasEvents(date) {
      return this.getEventsForDay(date).length > 0
    },

    formatDate(date, formatType = 'default') {
      const formats = {
        'full': 'EEEE d MMMM yyyy',
        'shortDay': 'EEE',
        'default': 'd MMM yyyy'
      }
      return format(date, formats[formatType], { locale: fr })
    },

    formatTime(dateString) {
      const date = new Date(dateString)
      return format(date, 'HH:mm')
    },

    isToday(date) {
      return isSameDay(date, new Date())
    },

    getStatusClass(status) {
      return status.toLowerCase().replace(/\s/g, '-')
    },
    
    getStatusIcon(status) {
      const icons = {
        'Planifiée': 'far fa-calendar-check',
        'En cours': 'fas fa-spinner',
        'Terminée': 'fas fa-check-circle',
        'Annulée': 'fas fa-ban'
      }
      return icons[status] || 'fas fa-info-circle'
    },

    openAddModalWithDate(hour, specificDate = null) {
      const date = specificDate || this.currentDate
      const newDate = new Date(date)
      newDate.setHours(hour, 0, 0, 0)
      
      this.openAddModal(newDate)
    }
  }
}
</script>

<style scoped>
.calendar-container {
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.calendar-header h3 {
  font-size: 1.3rem;
  color: #2c3e50;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.view-options {
  display: flex;
  gap: 0.5rem;
  background: #f8fafc;
  padding: 0.25rem;
  border-radius: 8px;
}

.btn-view {
  padding: 0.5rem 1rem;
  border: none;
  background: transparent;
  color: #64748b;
  font-weight: 500;
}

.btn-view.active {
  background: white;
  color: #4a6cf7;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.navigation {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.navigation h4 {
  margin: 0;
  font-size: 1.1rem;
  min-width: 200px;
  text-align: center;
}

.btn-today {
  background: #f1f5f9;
  color: #475569;
  border: none;
  padding: 0.5rem 1rem;
}

/* Day View Styles */
.day-view, .week-view {
  border: 1px solid #f1f5f9;
  border-radius: 8px;
  overflow: hidden;
}

.day-header, .week-header {
  display: flex;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.day-header {
  padding: 1rem;
}

.week-header .day-header {
  flex: 1;
  flex-direction: column;
  align-items: center;
  padding: 0.75rem;
  border-right: 1px solid #e2e8f0;
}

.week-header .day-header:last-child {
  border-right: none;
}

.day-header.today {
  background: #e0f2fe;
}

.day-name {
  font-weight: 500;
  color: #475569;
  text-transform: capitalize;
}

.day-date {
  font-size: 1.2rem;
  font-weight: 600;
  color: #1e293b;
}

.day-title {
  flex: 1;
  font-weight: 600;
  color: #1e293b;
  padding-left: 1rem;
}

.day-body, .week-body {
  display: flex;
  height: 700px;
  overflow-y: auto;
}

.time-column {
  width: 60px;
  border-right: 1px solid #f1f5f9;
  background: #f8fafc;
}

.time-slot {
  height: 60px;
  border-bottom: 1px solid #f1f5f9;
  padding: 0.25rem;
  position: relative;
}

.time-slot:last-child {
  border-bottom: none;
}

.time-column .time-slot {
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  padding-right: 0.5rem;
  font-size: 0.8rem;
  color: #64748b;
}

.events-column {
  flex: 1;
}

.day-column {
  flex: 1;
  border-right: 1px solid #f1f5f9;
}

.day-column:last-child {
  border-right: none;
}

.calendar-event {
  position: absolute;
  left: 2px;
  right: 2px;
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
  font-size: 0.8rem;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.event-time {
  font-weight: 500;
  margin-bottom: 0.1rem;
}

.event-title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.event-status {
  font-size: 0.7rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-top: 0.1rem;
}

.event-planifiée {
  background: #fff3cd;
  border-left: 3px solid #ffc107;
}

.event-en-cours {
  background: #cce5ff;
  border-left: 3px solid #0d6efd;
}

.event-terminée {
  background: #d4edda;
  border-left: 3px solid #28a745;
}

.event-annulée {
  background: #f8d7da;
  border-left: 3px solid #dc3545;
}

/* Month View Styles */
.month-view {
  border: 1px solid #f1f5f9;
  border-radius: 8px;
  overflow: hidden;
}

.month-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}

.month-day {
  min-height: 120px;
  border-right: 1px solid #f1f5f9;
  border-bottom: 1px solid #f1f5f9;
  padding: 0.5rem;
  background: white;
}

.month-day.other-month {
  background: #f8fafc;
  color: #94a3b8;
}

.month-day.today {
  background: #f0f9ff;
}

.month-day.today .day-number {
  background: #4a6cf7;
  color: white;
}

.day-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.day-number {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 0.8rem;
}

.day-name {
  font-size: 0.7rem;
  color: #64748b;
  text-transform: uppercase;
}

.day-events {
  max-height: 80px;
  overflow-y: auto;
}

.month-event {
  font-size: 0.7rem;
  padding: 0.2rem;
  margin-bottom: 0.2rem;
  border-radius: 3px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.event-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.event-planifiée .event-dot {
  background: #ffc107;
}

.event-en-cours .event-dot {
  background: #0d6efd;
}

.event-terminée .event-dot {
  background: #28a745;
}

.event-annulée .event-dot {
  background: #dc3545;
}

.has-events {
  background: #f8fafc;
}

@media (max-width: 768px) {
  .calendar-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .view-options {
    width: 100%;
    justify-content: space-between;
  }
  
  .navigation {
    width: 100%;
    justify-content: space-between;
  }
  
  .month-day {
    min-height: 80px;
  }
  
  .day-events {
    display: none;
  }
  
  .has-events::after {
    content: '•';
    color: #4a6cf7;
    font-size: 1.2rem;
    position: absolute;
    top: 0.2rem;
    right: 0.2rem;
  }
}
</style>
