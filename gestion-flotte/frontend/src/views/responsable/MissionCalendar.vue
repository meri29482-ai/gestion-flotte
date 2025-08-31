<template>
  <div class="calendar-container card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
    <div class="card-body p-0">
      <div class="calendar-header d-flex justify-content-between align-items-center p-3 border-bottom">
        <h5 class="fw-semibold mb-0">
          <i class="bi bi-calendar-event me-2"></i>Calendrier des Missions
        </h5>
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
        
      </div>
    </div>

    <!-- Vue Jour -->
    <div v-if="currentView === 'jour'" class="day-view">
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
      </div>

      <!-- Vue Jour -->
      <div v-if="currentView === 'Jour'" class="day-view">
        <div class="day-header d-flex bg-light p-2">
          <div class="time-column" style="width: 60px;"></div>
          <div class="day-title fw-medium ps-3">
            {{ formatDate(currentDate, 'full') }}
          </div>
        </div>
        <div class="day-body d-flex" style="height: 600px; overflow-y: auto;">
          <div class="time-column" style="width: 60px; border-right: 1px solid #f1f5f9;">
            <div v-for="hour in 24" :key="hour" class="time-slot small text-muted pe-2 text-end" style="height: 60px;">
              {{ hour - 1 }}:00
            </div>
          </div>
          <div class="events-column flex-grow-1">
            <div 
              v-for="hour in 24" 
              :key="hour" 
              class="time-slot border-bottom" 
              style="height: 60px; position: relative;"
              @click="openAddModalWithDate(hour - 1)"
            >
              <div 
                v-for="mission in getMissionsForDay(currentDate, hour - 1)"
                :key="mission.id"
                class="calendar-event position-absolute start-0 end-0 m-1 rounded p-2"
                :class="`event-${getStatusClass(mission.etat)}`"
                @click.stop="openEditModal(mission)"
              >
                <div class="d-flex flex-column">
                  <small class="fw-medium">{{ formatTime(mission.demande?.date_heure_debut) }}</small>
                  <div class="d-flex align-items-center gap-1">
                    <i class="bi bi-car-front-fill small"></i>
                    <span class="small">{{ mission.vehicule?.immatriculation || 'N/A' }}</span>
                  </div>
                  <small class="text-truncate">{{ mission.demande?.destination || '—' }}</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Vue Semaine -->
      <div v-if="currentView === 'Semaine'" class="week-view">
  <!-- Header des jours -->
  <div class="week-header d-flex bg-light border-bottom">
    <div class="time-column" style="width: 50px;"></div>
    <div 
      v-for="day in weekDays" 
      :key="day.date"
      class="day-header flex-grow-1 text-center p-2 border-end small"
      :class="{ 'bg-primary text-white': isToday(day.date) }"
    >
      <div class="fw-semibold">{{ day.name }}</div>
      <div>{{ day.date.getDate() }}</div>
    </div>
  </div>

  <!-- Corps du calendrier -->
  <div class="week-body d-flex" style="height: 480px; overflow-y: auto;">
    <!-- Colonne des heures -->
    <div class="time-column" style="width: 50px; border-right: 1px solid #e5e7eb;">
      <div 
        v-for="hour in 24" 
        :key="hour" 
        class="time-slot text-muted text-end pe-1 small" 
        style="height: 30px; line-height: 30px;"
      >
        {{ hour - 1 }}h
      </div>
    </div>

    <!-- Colonnes des jours -->
    <div 
      v-for="day in weekDays" 
      :key="day.date"
      class="day-column flex-grow-1 border-end"
      @click="openAddModalWithDate(9, day.date)"
    >
      <div 
        v-for="hour in 24" 
        :key="hour" 
        class="time-slot border-bottom"
        :style="{ height: '30px', position: 'relative', backgroundColor: hour % 2 === 0 ? '#f8f9fa' : '#ffffff' }"
      >
        <div 
          v-for="mission in getMissionsForDay(day.date, hour - 1)"
          :key="mission.id"
          class="calendar-event position-absolute start-0 end-0 m-1 p-1 rounded small text-truncate"
          :class="`event-${getStatusClass(mission.etat)}`"
          style="font-size: 11px; cursor: pointer;"
          @click.stop="openEditModal(mission)"
        >
          {{ formatTime(mission.demande?.date_heure_debut) }} - {{ mission.vehicule?.immatriculation }}
        </div>
      </div>
    </div>
  </div>
</div>


      <!-- Vue Mois -->
      <div v-if="currentView === 'Mois'" class="month-view p-3">
        <div class="month-grid d-grid" style="grid-template-columns: repeat(7, 1fr);">
          <div 
            v-for="day in monthDays" 
            :key="day.date"
            class="month-day p-2 border"
            :class="{
              'bg-light': !day.isCurrentMonth,
              'border-primary': isToday(day.date),
              'has-events': hasMissions(day.date)
            }"
            @click="openAddModalWithDate(9, day.date)"
          >
            <div class="d-flex justify-content-between">
              <span class="small" :class="{ 'fw-bold text-primary': isToday(day.date) }">
                {{ day.date.getDate() }}
              </span>
              <span class="small text-muted">{{ day.dayName }}</span>
            </div>
            <div class="day-events mt-1">
              <div 
                v-for="mission in getMissionsForDay(day.date)" 
                :key="mission.id"
                class="month-event small p-1 mb-1 rounded"
                :class="`event-${getStatusClass(mission.etat)}`"
                @click.stop="openEditModal(mission)"
              >
                <div class="d-flex align-items-center gap-1">
                  <span class="dot" :class="`bg-${getStatusColor(mission.etat)}`"></span>
                  <span class="text-truncate">
                    {{ formatTime(mission.demande?.date_heure_debut) }} - {{ mission.vehicule?.immatriculation }}
                  </span>
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
  name: 'MissionCalendar',
  props: {
    missions: {
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
      currentView: 'Semaine',
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

    getMissionsForDay(date, hour = null) {
      return this.missions.filter(mission => {
        const eventDate = mission.demande?.date_heure_debut ? new Date(mission.demande.date_heure_debut) : null
        if (!eventDate) return false
        
        const sameDay = isSameDay(eventDate, date)
        
        if (hour !== null) {
          return sameDay && eventDate.getHours() === hour
        }
        
        return sameDay
      })
    },

    hasMissions(date) {
      return this.getMissionsForDay(date).length > 0
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
      if (!dateString) return ''
      const date = new Date(dateString)
      return format(date, 'HH:mm')
    },

    isToday(date) {
      return isSameDay(date, new Date())
    },

    getStatusClass(status) {
      return status.toLowerCase().replace(/\s/g, '-')
    },
    
    getStatusColor(status) {
      const colors = {
        'EN ATTENTE': 'warning',
        'EN COURS': 'primary',
        'TERMINER': 'success',
        'ANNULER': 'danger'
      }
      return colors[status] || 'secondary'
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
.calendar-event {
  font-size: 0.75rem;
  cursor: pointer;
  overflow: hidden;
}

.event-en-attente {
  background-color: rgba(var(--bs-warning-rgb), 0.1);
  border-left: 3px solid var(--bs-warning);
}

.event-en-cours {
  background-color: rgba(var(--bs-primary-rgb), 0.1);
  border-left: 3px solid var(--bs-primary);
}

.event-terminer {
  background-color: rgba(var(--bs-success-rgb), 0.1);
  border-left: 3px solid var(--bs-success);
}

.event-annuler {
  background-color: rgba(var(--bs-danger-rgb), 0.1);
  border-left: 3px solid var(--bs-danger);
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


.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.bg-warning {
  background-color: var(--bs-warning);
}

.bg-primary {
  background-color: var(--bs-primary);
}

.bg-success {
  background-color: var(--bs-success);
}

.bg-danger {
  background-color: var(--bs-danger);
}

.month-day {
  min-height: 100px;
}

.month-day.has-events {
  background-color: rgba(var(--bs-primary-rgb), 0.05);
}

.btn-close-calendar {
  border: none;
  background: transparent;
  color: var(--bs-secondary);
}

.btn-close-calendar:hover {
  color: var(--bs-dark);
}

@media (max-width: 768px) {
  .month-day {
    min-height: 60px;
    font-size: 0.7rem;
    padding: 0.25rem;
  }
  
  .day-events {
    display: none;
  }
  
  .month-day.has-events::after {
    content: '•';
    color: var(--bs-primary);
    font-size: 1.2rem;
    position: absolute;
    top: 0.1rem;
    right: 0.1rem;
  }
}
</style>
