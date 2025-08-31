// i18n.js
import { createI18n } from 'vue-i18n';

const messages = {
  fr: {
    missionDetails: {
      title: 'Détails de la mission'
    },
    route: {
      instructions: 'Itinéraire',
      calculating: 'Calcul de l\'itinéraire en cours...',
      noRoute: 'Aucun itinéraire disponible',
      start: 'Départ',
      currentPosition: 'Votre position actuelle',
      destination: 'Destination'
    },
    voice: {
      on: 'Activé',
      off: 'Désactivé'
    },
    general: {
      back: 'Retour',
      loading: 'Chargement...',
      unknownDate: 'Date inconnue'
    },
    errors: {
      noDestination: 'Aucune destination disponible pour cette mission.',
      noCoordinates: 'Impossible de trouver les coordonnées de la destination.',
      geolocationError: 'Impossible de récupérer votre position. Vérifiez que la géolocalisation est activée.',
      routeCalculationError: 'Impossible de calculer l\'itinéraire. Vérifiez votre connexion Internet.'
    }
  },
  ar: {
    missionDetails: {
      title: 'تفاصيل المهمة'
    },
    route: {
      instructions: 'الاتجاهات',
      calculating: 'جاري حساب المسار...',
      noRoute: 'لا يوجد مسار متاح',
      start: 'بداية',
      currentPosition: 'موقعك الحالي',
      destination: 'الوجهة'
    },
    voice: {
      on: 'مفعل',
      off: 'غير مفعل'
    },
    general: {
      back: 'رجوع',
      loading: 'جار التحميل...',
      unknownDate: 'تاريخ غير معروف'
    },
    errors: {
      noDestination: 'لا توجد وجهة متاحة لهذه المهمة.',
      noCoordinates: 'تعذر العثور على إحداثيات الوجهة.',
      geolocationError: 'تعذر الحصول على موقعك. يرجى التأكد من تفعيل خدمة الموقع.',
      routeCalculationError: 'تعذر حساب المسار. يرجى التحقق من اتصال الإنترنت.'
    }
  }
};

const i18n = createI18n({
  legacy: false,
  locale: 'fr',
  fallbackLocale: 'fr',
  messages
});

export default i18n;