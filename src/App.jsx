import React, { useState, useEffect, useRef } from 'react';
import { Camera, Sun, MapPin, Star, ArrowLeft, Home, Search, PlusCircle, User, Check, Sparkles, Droplets, Cloud, CloudRain, CloudSun, Loader2, LogOut, Mail, Lock, X, DollarSign, Calendar, Clock, XCircle, CheckCircle, MessageCircle, RefreshCw, Crown, Phone, Navigation, Pencil, Trash2, Wallet, CreditCard, Bell, Heart, Map as MapIcon, List, Send, HelpCircle, Moon } from 'lucide-react';
import { supabase } from './supabaseClient';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import 'leaflet/dist/leaflet.css';

const hostMapIcon = L.divIcon({
  className: '',
  html: `<div style="width:30px;height:30px;border-radius:50%;background:#3A5A40;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.35);"></div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

// Kazda wartosc wskazuje na zmienna CSS (zdefiniowana w index.css, w :root i [data-theme="dark"]).
// Dzieki temu WSZYSTKIE miejsca uzywajace colors.xxx w calej apce automatycznie
// zmieniaja sie po przelaczeniu motywu - nie trzeba nic wiecej dotykac.
const colors = {
  bg: 'var(--lf-bg)',
  ink: 'var(--lf-ink)',
  fern: 'var(--lf-fern)',
  fernDark: 'var(--lf-fern-dark)',
  clay: 'var(--lf-clay)',
  clayLight: 'var(--lf-clay-light)',
  gold: 'var(--lf-gold)',
  line: 'var(--lf-line)',
  card: 'var(--lf-card)',
  muted: 'var(--lf-muted)',
};

// ============================================================
// SYSTEM JĘZYKÓW (i18n)
// ============================================================

const LANGUAGES = [
  { code: 'pl', flag: '🇵🇱', name: 'Polski' },
  { code: 'en', flag: '🇬🇧', name: 'English' },
  { code: 'uk', flag: '🇺🇦', name: 'Українська' },
];

const TRANSLATIONS = {
  pl: {
    // Nawigacja
    'tab.home': 'Szukaj',
    'tab.add': 'Dodaj',
    'tab.scan': 'Rozpoznaj',
    'tab.profile': 'Profil',

    // Logowanie / rejestracja
    'auth.loginSubtitle': 'Zaloguj się do swojego konta',
    'auth.signupSubtitle': 'Załóż nowe konto',
    'auth.namePlaceholder': 'Imię i nazwisko (lub nick)',
    'auth.referralPlaceholder': 'Kod polecenia (opcjonalnie)',
    'auth.referralDetected': 'Zaproszenie od znajomego wykryte automatycznie ✓',
    'auth.emailConsent': 'Chcę otrzymywać powiadomienia email (np. o nowych rezerwacjach)',
    'auth.acceptPrefix': 'Akceptuję',
    'auth.termsLink': 'Regulamin i Politykę Prywatności',
    'auth.acceptSuffix': 'Leafsit',
    'auth.emailPlaceholder': 'Adres email',
    'auth.passwordPlaceholder': 'Hasło',
    'auth.loginButton': 'Zaloguj się',
    'auth.signupButton': 'Zarejestruj się',
    'auth.noAccount': 'Nie masz jeszcze konta?',
    'auth.hasAccount': 'Masz już konto?',
    'auth.accountCreated': 'Konto utworzone! Możesz się teraz zalogować.',
    'auth.languageLabel': 'Język',

    // Samouczek
    'onb.skip': 'Pomiń',
    'onb.next': 'Dalej',
    'onb.start': 'Zaczynajmy!',
    'onb.1.title': 'Witaj w Leafsit!',
    'onb.1.text': 'Aplikacja łącząca osoby wyjeżdżające z tymi, którzy zaopiekują się ich roślinami pod nieobecność.',
    'onb.2.title': 'Znajdź opiekuna',
    'onb.2.text': 'Przeglądaj hostów w okolicy, sprawdź opinie i ceny, wyślij prośbę o rezerwację na wybrane daty.',
    'onb.3.title': 'Dodaj swoje rośliny',
    'onb.3.text': 'Zrób zdjęcie, a AI rozpozna gatunek. Możesz też odblokować płatny, spersonalizowany przewodnik pielęgnacyjny.',
    'onb.4.title': 'Zarabiaj jako host',
    'onb.4.text': 'Masz wolne miejsce? Ustal cenę i przyjmuj rośliny sąsiadów — pieniądze trafiają prosto na Twoje konto.',
    'onb.5.title': 'Bądź na bieżąco',
    'onb.5.text': 'Powiadomienia i czat w aplikacji pomogą Ci domówić szczegóły z drugą stroną rezerwacji.',
    'onb.6.title': 'Masz pytanie?',
    'onb.6.text': 'Asystent wsparcia w Profilu odpowie od razu. Jeśli sprawa jest pilna, automatycznie przekażemy ją naszemu zespołowi.',

    // Cookies
    'cookie.text': 'Używamy plików cookie niezbędnych do działania aplikacji oraz — za Twoją zgodą — analitycznych. Więcej w Polityce Prywatności.',
    'cookie.essential': 'Tylko niezbędne',
    'cookie.acceptAll': 'Akceptuj wszystkie',

    // Ekran wyszukiwania
    'home.yourArea': 'Twoja okolica',
    'home.defaultArea': 'Warszawa · Mokotów',
    'home.titleLine1': 'Komu zostawisz',
    'home.titleLine2': 'swoje rośliny?',
    'home.locationDenied': 'Brak dostępu do lokalizacji — hosty pokazane bez sortowania po odległości.',
    'home.searchPlaceholder': 'Szukaj po imieniu lub lokalizacji...',
    'home.filterNear': 'W pobliżu',
    'home.filterTop': 'Najwyżej oceniani',
    'home.filterAvailable': 'Dostępni teraz',
    'home.filterMatched': 'Dopasowani',
    'home.matchesPlant': 'Pasuje do: {plant}',
    'home.filterFavorites': 'Ulubione',
    'home.filterPrice': 'Cena',
    'home.filterDates': 'Terminy',
    'home.viewList': 'Lista',
    'home.viewMap': 'Mapa',
    'home.priceFrom': 'Cena od',
    'home.priceTo': 'Cena do',
    'home.howManyPlants': 'Ile roślin?',
    'home.loading': 'Ładowanie...',
    'home.hostsFound': '{n} hostów {suffix}',
    'home.suffixMatching': 'pasujących do wyszukiwania',
    'home.suffixNearby': 'w pobliżu',
    'home.noHostsQuery': 'Brak hostów pasujących do "{q}".',
    'home.noHostsCriteria': 'Nie ma jeszcze żadnych hostów spełniających te kryteria.',
    'home.perPlantPerDay': '/roślinę/dzień',
    'home.acceptsPlants': 'przyjmuje {n} roślin',
    'home.away': '{km} km',
    'home.recentlyViewed': 'Ostatnio oglądani',

    // Szczegóły hosta
    'host.reviewsCount': '{n} opinii',
    'host.freeSpots': 'miejsca wolne',
    'host.perPlantDay': 'za roślinę/dzień',
    'host.privacyNote': 'Dokładny adres i numer telefonu hosta zobaczysz dopiero po zaakceptowaniu Twojej rezerwacji — dla bezpieczeństwa obu stron.',
    'host.bookButton': 'Zarezerwuj termin',
    'host.reviewsHeader': 'Opinie',
    'host.loading': 'Ładowanie...',
    'host.noReviews': 'Ten host nie ma jeszcze żadnych opinii.',
    'host.anonymousGuest': 'Anonimowy gość',
    'host.watchOff': 'Powiadom mnie, gdy zwolni się miejsce',
    'host.watchingOn': 'Obserwujesz — kliknij, aby przestać',
    'host.respondsHour': '⚡ Zwykle odpowiada w ciągu godziny',
    'host.respondsFewHours': 'Zwykle odpowiada w ciągu kilku godzin',
    'host.respondsDay': 'Zwykle odpowiada w ciągu doby',

    // Formularz rezerwacji
    'booking.requestSent': 'Prośba wysłana!',
    'booking.backToList': 'Wróć do listy',
    'booking.loadingPlants': 'Ładowanie Twoich roślin...',
    'booking.noPlants': 'Nie masz jeszcze żadnych roślin. Dodaj pierwszą w zakładce "Dodaj", żeby móc zarezerwować hosta.',
    'booking.whichDates': 'Na jakie daty?',
    'booking.from': 'Od',
    'booking.to': 'Do',
    'calendar.legendUnavailable': 'Niedostępny',
    'calendar.legendSelected': 'Wybrane',
    'calendar.rangeBlocked': 'W tym zakresie jest niedostępny dzień — wybierz inne daty.',
    'booking.whichPlant': 'Która roślina?',
    'booking.howMany': 'Ile sztuk? (masz {max})',
    'booking.estimatedCost': 'Szacowany koszt: {total} zł ({days} {dayWord}) — płatność dopiero po akceptacji przez hosta',
    'booking.day': 'dzień',
    'booking.days': 'dni',
    'booking.yourPhone': 'Twój telefon (opcjonalnie)',
    'booking.phoneNote': 'Host zobaczy go dopiero po zaakceptowaniu — ułatwi ustalenie godziny odbioru',
    'booking.sending': 'Wysyłanie...',
    'booking.sendRequest': 'Wyślij prośbę o rezerwację',
    'booking.sendFailed': 'Nie udało się wysłać prośby: ',

    // Dodawanie rośliny
    'plant.title': 'Dodaj roślinę',
    'plant.subtitle': 'Zrób zdjęcie, a rozpoznamy gatunek',
    'plant.takePhoto': 'Zrób zdjęcie rośliny',
    'plant.identifying': 'Rozpoznaję gatunek...',
    'plant.recognized': 'Rozpoznano: {name}',
    'plant.confidence': '(pewność {n}%)',
    'plant.wrongName': 'Nazwa nie zgadza się? Popraw ją:',
    'plant.howManySame': 'Ile masz takich samych roślin?',
    'plant.unlockPremium': 'Odblokuj pełny przewodnik Premium',
    'plant.premiumTitle': 'Przewodnik Premium — 9 zł',
    'plant.checkingPayment': 'Sprawdzam płatność...',
    'plant.sunlightQuestion': 'Jaki poziom nasłonecznienia ma ta roślina u Ciebie?',
    'plant.redirecting': 'Przekierowuję do płatności...',
    'plant.payButton': 'Zapłać 9 zł i odblokuj przewodnik',
    'plant.testMode': 'Tryb testowy — użyj karty 4242 4242 4242 4242, dowolna data i CVC',
    'plant.generating': 'Generuję Twój przewodnik...',
    'plant.guidePaid': 'Twój przewodnik pielęgnacji (opłacony ✓)',
    'plant.added': 'Roślina dodana!',
    'plant.checkProfile': 'Sprawdź ją w zakładce Profil',
    'plant.errIdentify': 'Nie udało się rozpoznać rośliny.',
    'plant.errNoSpecies': 'Nie rozpoznano gatunku. Spróbuj wyraźniejszego zdjęcia liścia.',
    'plant.errConnection': 'Błąd połączenia z rozpoznawaniem roślin.',
    'plant.errGuide': 'Nie udało się wygenerować porady.',
    'plant.errGuideConn': 'Błąd połączenia z generatorem porad.',
    'plant.errPayment': 'Nie udało się utworzyć płatności.',
    'plant.errPaymentConn': 'Błąd połączenia z systemem płatności.',
    'plant.errPaymentConfirm': 'Nie udało się potwierdzić płatności. Spróbuj ponownie.',
    'plant.errPaymentCheck': 'Błąd sprawdzania płatności.',
    'plant.errSave': 'Nie udało się zapisać: ',

    // Rozpoznawanie
    'scan.title': 'Rozpoznaj roślinę',
    'scan.takeOrUpload': 'Zrób lub wgraj zdjęcie',
    'scan.confidence': 'Pewność rozpoznania: {n}%',
    'scan.addPrompt': 'Chcesz dodać ją do swoich roślin?',
    'scan.addHint': 'Przejdź do zakładki "Dodaj" — tam też odblokujesz pełny przewodnik Premium.',

    // Statusy rezerwacji
    'status.accepted': 'Zaakceptowana',
    'status.rejected': 'Odrzucona',
    'status.cancelled': 'Anulowana',
    'status.pending': 'Oczekuje',

    // Opinie
    'review.rateHost': 'Oceń hosta',
    'review.rateRenter': 'Oceń wynajmującego',
    'review.commentPlaceholder': 'Jak przebiegła współpraca? (opcjonalnie)',
    'review.submit': 'Wyślij opinię',
    'review.saveFailed': 'Nie udało się zapisać opinii: ',
    'review.guest': 'Gość',
    'review.receivedTitle': 'Otrzymałeś opinię',

    // Wsparcie
    'support.title': 'Wsparcie',
    'support.subtitle': 'Zwykle odpowiadamy od razu',
    'support.welcome': 'Cześć! W czym mogę pomóc? Zapytaj o rezerwacje, płatności, albo bycie hostem.',
    'support.inputPlaceholder': 'Napisz wiadomość...',
    'support.errGeneric': 'Przepraszam, wystąpił błąd. Spróbuj ponownie.',
    'support.errConnection': 'Przepraszam, wystąpił problem z połączeniem. Spróbuj ponownie.',

    // Czat
    'chat.quickAccept': 'Tak, chętnie przyjmę! 🌿',
    'chat.quickBusy': 'Niestety w tym terminie nie dam rady.',
    'chat.quickWhen': 'O której godzinie Ci pasuje?',
    'chat.quickThanks': 'Dziękuję!',
    'chat.firstMessage': 'Napisz pierwszą wiadomość!',
    'chat.loading': 'Ładowanie...',
    'chat.messagesTitle': 'Wiadomości',
    'chat.noConversations': 'Nie masz jeszcze żadnych rozmów.',
    'chat.startConversation': 'Rozpocznij rozmowę',
    'chat.renter': 'Wynajmujący',

    // Panel hosta
    'dash.title': 'Panel hosta',
    'calendar.title': 'Kalendarz dostępności',
    'calendar.hint': 'Dni z zaakceptowanymi rezerwacjami blokują się same. Kliknij dzień, aby dodatkowo zablokować go ręcznie (np. urlop).',
    'calendar.legendFree': 'Wolny',
    'calendar.legendOccupied': 'Zajęte (rezerwacje)',
    'calendar.legendBlocked': 'Zablokowany',
    'calendar.jan': 'Styczeń', 'calendar.feb': 'Luty', 'calendar.mar': 'Marzec', 'calendar.apr': 'Kwiecień',
    'calendar.may': 'Maj', 'calendar.jun': 'Czerwiec', 'calendar.jul': 'Lipiec', 'calendar.aug': 'Sierpień',
    'calendar.sep': 'Wrzesień', 'calendar.oct': 'Październik', 'calendar.nov': 'Listopad', 'calendar.dec': 'Grudzień',
    'calendar.mon': 'Pn', 'calendar.tue': 'Wt', 'calendar.wed': 'Śr', 'calendar.thu': 'Cz',
    'calendar.fri': 'Pt', 'calendar.sat': 'So', 'calendar.sun': 'Nd',
    'booking.datesBlocked': 'Niestety host zablokował przynajmniej jeden dzień w tym terminie. Wybierz inne daty.',
    'dash.loading': 'Ładowanie...',
    'dash.totalEarned': 'Łącznie zarobione',
    'dash.completed': 'Zrealizowane',
    'dash.pending': 'Oczekujące',
    'dash.rating': 'Ocena',
    'dash.historyTitle': 'Historia rezerwacji',
    'dash.noHistory': 'Brak historii rezerwacji.',

    // Listy
    'list.newest': 'Najnowsze',
    'list.oldest': 'Najstarsze',
    'list.all': 'Wszystkie',
    'list.noResults': 'Brak wyników.',

    // Zostań hostem
    'becomeHost.titleNew': 'Zostań hostem',
    'becomeHost.titleEdit': 'Edytuj profil hosta',
    'becomeHost.photoFromAccount': 'Zdjęcie z Twojego konta',
    'becomeHost.namePlaceholder': 'Twoje imię',
    'becomeHost.areaPlaceholder': 'Okolica (np. Mokotów, Warszawa)',
    'becomeHost.addressPlaceholder': 'Dokładny adres (opcjonalnie, widoczny po akceptacji)',
    'becomeHost.phonePlaceholder': 'Telefon (opcjonalnie, widoczny po akceptacji)',
    'becomeHost.pricePlaceholder': 'Cena za roślinę / dzień (zł)',
    'becomeHost.priceHint': 'Sugerowana cena: 2-5 zł za roślinę dziennie',
    'becomeHost.capacityPlaceholder': 'Ile roślin możesz przyjąć?',
    'becomeHost.descPlaceholder': 'Krótki opis (opcjonalnie) — np. doświadczenie z roślinami, jak często wysyłasz zdjęcia...',
    'becomeHost.sunlightLabel': 'Nasłonecznienie u Ciebie',
    'becomeHost.useLocation': 'Użyj mojej lokalizacji (dla odległości)',
    'becomeHost.locationSaved': 'Lokalizacja zapisana ✓ (kliknij by zaktualizować)',
    'becomeHost.locationLoading': 'Pobieram lokalizację...',
    'becomeHost.locationUnsupported': 'Twoja przeglądarka nie obsługuje lokalizacji.',
    'becomeHost.locationFailed': 'Nie udało się pobrać lokalizacji. Sprawdź uprawnienia przeglądarki.',
    'becomeHost.saveChanges': 'Zapisz zmiany',
    'becomeHost.saveFailed': 'Nie udało się zapisać: ',
    'becomeHost.spacePhotosLabel': 'Zdjęcia miejsca',
    'becomeHost.spacePhotosHint': 'Pokaż, gdzie dokładnie będzie stała roślina (maks. 4 zdjęcia).',
    'host.spacePhotosTitle': 'Zdjęcia miejsca',
    'becomeHost.priceInvalid': 'Podaj poprawną cenę, w rozsądnym przedziale (0,50 – 1000 zł).',
    'becomeHost.capacityInvalid': 'Podaj poprawną liczbę miejsc, w rozsądnym przedziale (1 – 50).',
    'sun.full': 'Pełne słońce',
    'sun.partial': 'Półcień',
    'sun.shade': 'Cień',

    // Profil
    'profile.loading': 'Ładowanie...',
    'profile.changeName': 'Zmień imię',
    'profile.namePlaceholder': 'Twoje imię i nazwisko',
    'profile.fillNameHint': 'Uzupełnij swoje imię — host zobaczy je zamiast samego emaila',
    'profile.notifications': 'Powiadomienia',
    'profile.noNotifications': 'Brak powiadomień.',
    'profile.emailNotifications': 'Powiadomienia email',
    'profile.saving': 'Zapisywanie...',
    'profile.referralTitle': 'Poleć znajomym Leafsit',
    'profile.referredCount': 'Poleconych znajomych: {n}',
    'profile.copyLink': 'Kopiuj link',
    'profile.copied': 'Skopiowano ✓',
    'profile.viewAll': 'Wyświetl wszystkie ({n})',
    'profile.hostPanel': 'Panel hosta',
    'profile.yourPlants': 'Twoje rośliny',
    'profile.noPlants': 'Nie masz jeszcze żadnych roślin — dodaj pierwszą w zakładce "Dodaj".',
    'profile.yourBookings': 'Twoje rezerwacje',
    'profile.noBookings': 'Nie masz jeszcze żadnych rezerwacji.',
    'profile.bookingRequests': 'Prośby o rezerwację',
    'profile.acceptedBookings': 'Zaakceptowane rezerwacje',
    'profile.accept': 'Akceptuj',
    'profile.reject': 'Odrzuć',
    'profile.contactHost': 'Kontakt do hosta',
    'profile.contactOwner': 'Kontakt do właściciela rośliny',
    'profile.noNameGiven': 'Bez podanego imienia',
    'profile.from': 'od',
    'profile.leaveReview': 'Zostaw opinię',
    'profile.rateRenter': 'Oceń wynajmującego',
    'profile.reviewGiven': 'Opinia wystawiona',
    'profile.renterReviewGiven': 'Opinia o wynajmującym wystawiona',
    'profile.hostReviewOfYou': 'Opinia hosta o Tobie',
    'profile.checkingPayment': 'Sprawdzam płatność...',
    'profile.redirecting': 'Przekierowuję...',
    'profile.payConfirm': 'Zapłać i potwierdź ({total} zł)',
    'profile.paymentReceived': 'Otrzymano płatność',
    'profile.cancelBooking': 'Anuluj rezerwację',
    'profile.cancelAndRefund': 'Anuluj i zwróć płatność',
    'profile.confirmCancel': 'Na pewno anulować tę rezerwację?',
    'profile.refundFailed': 'Nie udało się zwrócić płatności. Spróbuj ponownie lub skontaktuj się z pomocą.',
    'profile.currentlyAt': 'Obecnie u {name}',
    'profile.atYourHome': 'U Ciebie w domu',
    'profile.hostHistory': 'Historia u hostów',
    'profile.neverAtHost': 'Ta roślina nigdy nie była jeszcze u hosta.',
    'profile.becomeHostTitle': 'Chcesz zostać hostem?',
    'profile.becomeHostText': 'Ustal cenę i przyjmuj rośliny sąsiadów pod nieobecność',
    'profile.connectStripe': 'Podłącz konto Stripe',
    'profile.checkingPayoutAccount': 'Sprawdzam status konta wypłat...',
    'profile.payoutConnected': 'Konto do wypłat podłączone',
    'profile.pending': 'Oczekujące',
    'profile.terms': 'Regulamin i Polityka Prywatności',
    'profile.darkMode': 'Ciemny motyw',
    'profile.lightMode': 'Jasny motyw',
    'profile.toggleTheme': 'Przełącz motyw',
    'profile.yourHostProfile': 'Twój profil hosta',
    'profile.confirmCancelPaid': 'Na pewno anulować? Zapłacone {amount} zł zostanie w pełni zwrócone.',
    'weather.loading': 'Ładowanie pogody dla Twojej lokalizacji...',
    'weather.humidity': 'wilgotność',
    'weather.lowHumidity': 'Niska wilgotność powietrza — rozważ zraszanie liści.',
    'becomeHost.changePhotoHint': 'Aby je zmienić, przejdź do zakładki Profil i kliknij w swój awatar.',
    'becomeHost.priceWarning': 'To znacznie powyżej średniej — czy na pewno?',
    'profile.awaitingPayment': 'Oczekuje na opłacenie przez wynajmującego',
    'profile.hostNoPayout': 'Host jeszcze nie podłączył konta do wypłat — spróbuj ponownie za chwilę.',
    'profile.photoAlsoOnListing': 'To zdjęcie jest też widoczne na Twoim ogłoszeniu hosta.',
    'profile.connectStripeHint': 'Aby otrzymywać wypłaty za rezerwacje, podłącz konto Stripe (kilka minut).',
    'plant.yourPlantAlt': 'Twoja roślina',

    // Powiadomienia (tresc budowana w jezyku ODBIORCY)
    'notif.someone': 'Ktoś',
    'notif.qtySuffix': ' (×{n} szt.)',
    'notif.booking_request.title': 'Nowa prośba o rezerwację',
    'notif.booking_request.body': '{name} chce zostawić u Ciebie roślinę "{plant}"{qtySuffix}',
    'notif.new_review.title': 'Nowa opinia',
    'notif.new_review.body': '{name} wystawił(a) Ci ocenę {rating}/5 za "{plant}"',
    'notif.review_received.title': 'Otrzymałeś opinię',
    'notif.review_received.body': '{name} wystawił(a) Ci ocenę {rating}/5 za rezerwację "{plant}"',
    'notif.new_message.title': 'Nowa wiadomość',
    'notif.new_message.body': '{text}',
    'notif.booking_paid.title': 'Otrzymano płatność',
    'notif.booking_paid.body': 'Rezerwacja "{plant}" została opłacona — {amount} zł',
    'notif.booking_accepted.title': 'Rezerwacja zaakceptowana!',
    'notif.booking_accepted.body': 'Twoja prośba dla "{plant}"{qtySuffix} została zaakceptowana — możesz teraz opłacić rezerwację w Profilu.',
    'notif.booking_rejected.title': 'Rezerwacja odrzucona',
    'notif.booking_rejected.body': 'Twoja prośba dla "{plant}"{qtySuffix} została odrzucona przez hosta.',
    'notif.booking_cancelled.title': 'Rezerwacja anulowana',
    'notif.booking_cancelled.body': 'Prośba dla "{plant}" została anulowana przez wynajmującego.',
    'notif.booking_cancelled_refund.title': 'Rezerwacja anulowana',
    'notif.booking_cancelled_refund.body': 'Rezerwacja "{plant}" została anulowana i zwrócona — środki zostaną wycofane z Twojego konta.',
    'notif.host_spot_available.title': 'Zwolniło się miejsce!',
    'notif.host_spot_available.body': 'U hosta {host} zwolniło się miejsce — sprawdź, zanim ktoś inny je zajmie.',
    'notif.booking_reminder_renter.title': 'Jutro zaczyna się Twoja rezerwacja',
    'notif.booking_reminder_renter.body': 'Pamiętaj o dostarczeniu rośliny "{plant}" do {host} ({date}).',
    'notif.booking_reminder_host.title': 'Jutro przyjmujesz rośliny',
    'notif.booking_reminder_host.body': '{name} dostarczy Ci roślinę "{plant}"{qtySuffix} ({date}).',
    'rail.referralText': 'Za każde polecenie Ty i znajomy zyskujecie zniżkę na Premium.',
    'weather.clear': 'Bezchmurnie',
    'weather.partlyCloudy': 'Częściowe zachmurzenie',
    'weather.cloudy': 'Pochmurno',
    'weather.fog': 'Mgła',
    'weather.rain': 'Opady',
    'weather.variable': 'Zmiennie',
    'weather.conditionsFor': '{place} · warunki dla Twoich roślin',
    'weather.fetchFailed': 'Nie udało się pobrać pogody',
    'scan.subtitle': 'Szybkie sprawdzenie gatunku — bez zapisywania w profilu',
    'booking.waitingAcceptance': 'Czeka na akceptację przez {host}. Gdy host zaakceptuje, będziesz mógł opłacić i potwierdzić rezerwację.',
    'booking.priceLine': '{price} zł / roślinę / dzień',
    'review.yourPlant': 'Twoja roślina: {plant}',
    'review.renterPlant': '{renter} — roślina: {plant}',
    'profile.earnTitle': 'Zarabiaj na wolnym miejscu w domu',
    'profile.paidWithShare': 'Opłacona — {total} zł (Twoja część: {share} zł)',
    'profile.paidAmount': 'Zapłacono {amount} zł',
    'profile.cancelRequest': 'Anuluj prośbę',
    'profile.cancelling': 'Anulowanie...',
    'profile.confirmDeletePlant': 'Usunąć "{name}" z Twoich roślin?',
    'profile.capacityExceeded': 'Nie możesz zaakceptować tej prośby — w tym terminie masz już {current} zaakceptowanych roślin, a Twój limit to {limit}.',
    'profile.noRequests': 'Brak próśb o rezerwację.',
    'profile.noAccepted': 'Brak zaakceptowanych rezerwacji.',
    'profile.spots': '{n} miejsc',
    'profile.profileVisible': 'Twój profil jest już widoczny na liście hostów ✓',
    'profile.gpsSaved': ' · lokalizacja GPS zapisana',
  },

  en: {
    // Navigation
    'tab.home': 'Search',
    'tab.add': 'Add',
    'tab.scan': 'Identify',
    'tab.profile': 'Profile',

    // Login / signup
    'auth.loginSubtitle': 'Sign in to your account',
    'auth.signupSubtitle': 'Create a new account',
    'auth.namePlaceholder': 'Full name (or nickname)',
    'auth.referralPlaceholder': 'Referral code (optional)',
    'auth.referralDetected': "Friend's invitation detected automatically ✓",
    'auth.emailConsent': 'I want to receive email notifications (e.g. about new bookings)',
    'auth.acceptPrefix': 'I accept the Leafsit',
    'auth.termsLink': 'Terms and Privacy Policy',
    'auth.acceptSuffix': '',
    'auth.emailPlaceholder': 'Email address',
    'auth.passwordPlaceholder': 'Password',
    'auth.loginButton': 'Sign in',
    'auth.signupButton': 'Sign up',
    'auth.noAccount': "Don't have an account yet?",
    'auth.hasAccount': 'Already have an account?',
    'auth.accountCreated': 'Account created! You can sign in now.',
    'auth.languageLabel': 'Language',

    // Onboarding
    'onb.skip': 'Skip',
    'onb.next': 'Next',
    'onb.start': "Let's go!",
    'onb.1.title': 'Welcome to Leafsit!',
    'onb.1.text': 'An app connecting people going away with those who will look after their plants while they are gone.',
    'onb.2.title': 'Find a plant sitter',
    'onb.2.text': 'Browse hosts nearby, check reviews and prices, and send a booking request for your chosen dates.',
    'onb.3.title': 'Add your plants',
    'onb.3.text': 'Take a photo and AI will identify the species. You can also unlock a paid, personalised care guide.',
    'onb.4.title': 'Earn as a host',
    'onb.4.text': 'Got spare space? Set your price and take in your neighbours\u2019 plants — the money goes straight to your account.',
    'onb.5.title': 'Stay in the loop',
    'onb.5.text': 'In-app notifications and chat help you sort out the details with the other side of the booking.',
    'onb.6.title': 'Got a question?',
    'onb.6.text': 'The support assistant in your Profile answers right away. If it is urgent, we pass it straight to our team.',

    // Cookies
    'cookie.text': 'We use cookies essential to the app and — with your consent — analytics cookies. More in our Privacy Policy.',
    'cookie.essential': 'Essential only',
    'cookie.acceptAll': 'Accept all',

    // Search screen
    'home.yourArea': 'Your area',
    'home.defaultArea': 'Warsaw · Mokotów',
    'home.titleLine1': 'Who will look after',
    'home.titleLine2': 'your plants?',
    'home.locationDenied': 'No location access — hosts shown without distance sorting.',
    'home.searchPlaceholder': 'Search by name or location...',
    'home.filterNear': 'Nearby',
    'home.filterTop': 'Top rated',
    'home.filterAvailable': 'Available now',
    'home.filterMatched': 'Matched',
    'home.matchesPlant': 'Matches: {plant}',
    'home.filterFavorites': 'Favourites',
    'home.filterPrice': 'Price',
    'home.filterDates': 'Dates',
    'home.viewList': 'List',
    'home.viewMap': 'Map',
    'home.priceFrom': 'Price from',
    'home.priceTo': 'Price to',
    'home.howManyPlants': 'How many plants?',
    'home.loading': 'Loading...',
    'home.hostsFound': '{n} hosts {suffix}',
    'home.suffixMatching': 'matching your search',
    'home.suffixNearby': 'nearby',
    'home.noHostsQuery': 'No hosts matching "{q}".',
    'home.noHostsCriteria': 'There are no hosts matching these criteria yet.',
    'home.perPlantPerDay': '/plant/day',
    'home.acceptsPlants': 'takes {n} plants',
    'home.away': '{km} km',
    'home.recentlyViewed': 'Recently viewed',

    // Host detail
    'host.reviewsCount': '{n} reviews',
    'host.freeSpots': 'free spots',
    'host.perPlantDay': 'per plant/day',
    'host.privacyNote': "You'll see the host's exact address and phone number only after your booking is accepted — for the safety of both sides.",
    'host.bookButton': 'Book dates',
    'host.reviewsHeader': 'Reviews',
    'host.loading': 'Loading...',
    'host.noReviews': 'This host has no reviews yet.',
    'host.anonymousGuest': 'Anonymous guest',
    'host.watchOff': 'Notify me when a spot opens up',
    'host.watchingOn': "You're watching — click to stop",
    'host.respondsHour': '⚡ Usually responds within an hour',
    'host.respondsFewHours': 'Usually responds within a few hours',
    'host.respondsDay': 'Usually responds within a day',

    // Booking form
    'booking.requestSent': 'Request sent!',
    'booking.backToList': 'Back to list',
    'booking.loadingPlants': 'Loading your plants...',
    'booking.noPlants': 'You have no plants yet. Add your first one in the "Add" tab to book a host.',
    'booking.whichDates': 'Which dates?',
    'booking.from': 'From',
    'booking.to': 'To',
    'calendar.legendUnavailable': 'Unavailable',
    'calendar.legendSelected': 'Selected',
    'calendar.rangeBlocked': 'This range includes an unavailable day — please choose different dates.',
    'booking.whichPlant': 'Which plant?',
    'booking.howMany': 'How many? (you have {max})',
    'booking.estimatedCost': 'Estimated cost: {total} zł ({days} {dayWord}) — payment only after the host accepts',
    'booking.day': 'day',
    'booking.days': 'days',
    'booking.yourPhone': 'Your phone (optional)',
    'booking.phoneNote': 'The host will see it only after accepting — it helps arrange the pick-up time',
    'booking.sending': 'Sending...',
    'booking.sendRequest': 'Send booking request',
    'booking.sendFailed': 'Could not send the request: ',

    // Add plant
    'plant.title': 'Add a plant',
    'plant.subtitle': 'Take a photo and we will identify the species',
    'plant.takePhoto': 'Take a photo of the plant',
    'plant.identifying': 'Identifying species...',
    'plant.recognized': 'Identified: {name}',
    'plant.confidence': '({n}% confidence)',
    'plant.wrongName': 'Name not right? Correct it:',
    'plant.howManySame': 'How many identical plants do you have?',
    'plant.unlockPremium': 'Unlock the full Premium guide',
    'plant.premiumTitle': 'Premium guide — 9 zł',
    'plant.checkingPayment': 'Checking payment...',
    'plant.sunlightQuestion': 'How much sunlight does this plant get at your place?',
    'plant.redirecting': 'Redirecting to payment...',
    'plant.payButton': 'Pay 9 zł and unlock the guide',
    'plant.testMode': 'Test mode — use card 4242 4242 4242 4242, any date and CVC',
    'plant.generating': 'Generating your guide...',
    'plant.guidePaid': 'Your care guide (paid ✓)',
    'plant.added': 'Plant added!',
    'plant.checkProfile': 'See it in the Profile tab',
    'plant.errIdentify': 'Could not identify the plant.',
    'plant.errNoSpecies': 'Species not recognised. Try a clearer photo of a leaf.',
    'plant.errConnection': 'Connection error with plant identification.',
    'plant.errGuide': 'Could not generate the guide.',
    'plant.errGuideConn': 'Connection error with the guide generator.',
    'plant.errPayment': 'Could not create the payment.',
    'plant.errPaymentConn': 'Connection error with the payment system.',
    'plant.errPaymentConfirm': 'Could not confirm the payment. Please try again.',
    'plant.errPaymentCheck': 'Payment check error.',
    'plant.errSave': 'Could not save: ',

    // Identify
    'scan.title': 'Identify a plant',
    'scan.takeOrUpload': 'Take or upload a photo',
    'scan.confidence': 'Identification confidence: {n}%',
    'scan.addPrompt': 'Want to add it to your plants?',
    'scan.addHint': 'Go to the "Add" tab — you can also unlock the full Premium guide there.',

    // Booking statuses
    'status.accepted': 'Accepted',
    'status.rejected': 'Rejected',
    'status.cancelled': 'Cancelled',
    'status.pending': 'Pending',

    // Reviews
    'review.rateHost': 'Rate the host',
    'review.rateRenter': 'Rate the renter',
    'review.commentPlaceholder': 'How did it go? (optional)',
    'review.submit': 'Submit review',
    'review.saveFailed': 'Could not save the review: ',
    'review.guest': 'Guest',
    'review.receivedTitle': 'You received a review',

    // Support
    'support.title': 'Support',
    'support.subtitle': 'We usually reply right away',
    'support.welcome': 'Hi! How can I help? Ask about bookings, payments, or becoming a host.',
    'support.inputPlaceholder': 'Write a message...',
    'support.errGeneric': 'Sorry, something went wrong. Please try again.',
    'support.errConnection': 'Sorry, there was a connection problem. Please try again.',

    // Chat
    'chat.quickAccept': "Yes, I'd be happy to take it! 🌿",
    'chat.quickBusy': "Sorry, I can't manage those dates.",
    'chat.quickWhen': 'What time works for you?',
    'chat.quickThanks': 'Thank you!',
    'chat.firstMessage': 'Write the first message!',
    'chat.loading': 'Loading...',
    'chat.messagesTitle': 'Messages',
    'chat.noConversations': 'You have no conversations yet.',
    'chat.startConversation': 'Start a conversation',
    'chat.renter': 'Renter',

    // Host dashboard
    'dash.title': 'Host dashboard',
    'calendar.title': 'Availability calendar',
    'calendar.hint': 'Days with accepted bookings block themselves automatically. Tap a day to also block it manually (e.g. for time off).',
    'calendar.legendFree': 'Free',
    'calendar.legendOccupied': 'Occupied (bookings)',
    'calendar.legendBlocked': 'Blocked',
    'calendar.jan': 'January', 'calendar.feb': 'February', 'calendar.mar': 'March', 'calendar.apr': 'April',
    'calendar.may': 'May', 'calendar.jun': 'June', 'calendar.jul': 'July', 'calendar.aug': 'August',
    'calendar.sep': 'September', 'calendar.oct': 'October', 'calendar.nov': 'November', 'calendar.dec': 'December',
    'calendar.mon': 'Mo', 'calendar.tue': 'Tu', 'calendar.wed': 'We', 'calendar.thu': 'Th',
    'calendar.fri': 'Fr', 'calendar.sat': 'Sa', 'calendar.sun': 'Su',
    'booking.datesBlocked': 'The host has blocked at least one day in this date range. Please choose different dates.',
    'dash.loading': 'Loading...',
    'dash.totalEarned': 'Total earned',
    'dash.completed': 'Completed',
    'dash.pending': 'Pending',
    'dash.rating': 'Rating',
    'dash.historyTitle': 'Booking history',
    'dash.noHistory': 'No booking history yet.',

    // Lists
    'list.newest': 'Newest',
    'list.oldest': 'Oldest',
    'list.all': 'All',
    'list.noResults': 'No results.',

    // Become a host
    'becomeHost.titleNew': 'Become a host',
    'becomeHost.titleEdit': 'Edit host profile',
    'becomeHost.photoFromAccount': 'Photo from your account',
    'becomeHost.namePlaceholder': 'Your name',
    'becomeHost.areaPlaceholder': 'Area (e.g. Mokotów, Warsaw)',
    'becomeHost.addressPlaceholder': 'Exact address (optional, shown after acceptance)',
    'becomeHost.phonePlaceholder': 'Phone (optional, shown after acceptance)',
    'becomeHost.pricePlaceholder': 'Price per plant / day (zł)',
    'becomeHost.priceHint': 'Suggested price: 2-5 zł per plant per day',
    'becomeHost.capacityPlaceholder': 'How many plants can you take?',
    'becomeHost.descPlaceholder': 'Short description (optional) — e.g. your experience with plants, how often you send photos...',
    'becomeHost.sunlightLabel': 'Sunlight at your place',
    'becomeHost.useLocation': 'Use my location (for distances)',
    'becomeHost.locationSaved': 'Location saved ✓ (click to update)',
    'becomeHost.locationLoading': 'Getting location...',
    'becomeHost.locationUnsupported': 'Your browser does not support location.',
    'becomeHost.locationFailed': 'Could not get your location. Check your browser permissions.',
    'becomeHost.saveChanges': 'Save changes',
    'becomeHost.saveFailed': 'Could not save: ',
    'becomeHost.spacePhotosLabel': 'Photos of the space',
    'becomeHost.spacePhotosHint': 'Show exactly where the plant will stay (up to 4 photos).',
    'host.spacePhotosTitle': 'Photos of the space',
    'becomeHost.priceInvalid': 'Please enter a reasonable price (0.50 – 1000 zł).',
    'becomeHost.capacityInvalid': 'Please enter a reasonable capacity (1 – 50).',
    'sun.full': 'Full sun',
    'sun.partial': 'Partial shade',
    'sun.shade': 'Shade',

    // Profile
    'profile.loading': 'Loading...',
    'profile.changeName': 'Change name',
    'profile.namePlaceholder': 'Your full name',
    'profile.fillNameHint': 'Add your name — the host will see it instead of just your email',
    'profile.notifications': 'Notifications',
    'profile.noNotifications': 'No notifications.',
    'profile.emailNotifications': 'Email notifications',
    'profile.saving': 'Saving...',
    'profile.referralTitle': 'Refer friends to Leafsit',
    'profile.referredCount': 'Friends referred: {n}',
    'profile.copyLink': 'Copy link',
    'profile.copied': 'Copied ✓',
    'profile.viewAll': 'View all ({n})',
    'profile.hostPanel': 'Host dashboard',
    'profile.yourPlants': 'Your plants',
    'profile.noPlants': 'You have no plants yet — add your first one in the "Add" tab.',
    'profile.yourBookings': 'Your bookings',
    'profile.noBookings': 'You have no bookings yet.',
    'profile.bookingRequests': 'Booking requests',
    'profile.acceptedBookings': 'Accepted bookings',
    'profile.accept': 'Accept',
    'profile.reject': 'Reject',
    'profile.contactHost': 'Host contact details',
    'profile.contactOwner': 'Plant owner contact details',
    'profile.noNameGiven': 'No name given',
    'profile.from': 'from',
    'profile.leaveReview': 'Leave a review',
    'profile.rateRenter': 'Rate the renter',
    'profile.reviewGiven': 'Review submitted',
    'profile.renterReviewGiven': 'Renter review submitted',
    'profile.hostReviewOfYou': "Host's review of you",
    'profile.checkingPayment': 'Checking payment...',
    'profile.redirecting': 'Redirecting...',
    'profile.payConfirm': 'Pay and confirm ({total} zł)',
    'profile.paymentReceived': 'Payment received',
    'profile.cancelBooking': 'Cancel booking',
    'profile.cancelAndRefund': 'Cancel and refund',
    'profile.confirmCancel': 'Cancel this booking?',
    'profile.refundFailed': 'Could not refund the payment. Please try again or contact support.',
    'profile.currentlyAt': 'Currently at {name}',
    'profile.atYourHome': 'At your home',
    'profile.hostHistory': 'History with hosts',
    'profile.neverAtHost': 'This plant has never stayed with a host yet.',
    'profile.becomeHostTitle': 'Want to become a host?',
    'profile.becomeHostText': "Set your price and take in your neighbours' plants while they're away",
    'profile.connectStripe': 'Connect Stripe account',
    'profile.checkingPayoutAccount': 'Checking payout account status...',
    'profile.payoutConnected': 'Payout account connected',
    'profile.pending': 'Pending',
    'profile.terms': 'Terms and Privacy Policy',
    'profile.darkMode': 'Dark mode',
    'profile.lightMode': 'Light mode',
    'profile.toggleTheme': 'Toggle theme',
    'profile.yourHostProfile': 'Your host profile',
    'profile.confirmCancelPaid': 'Cancel this booking? The {amount} zł you paid will be fully refunded.',
    'weather.loading': 'Loading weather for your location...',
    'weather.humidity': 'humidity',
    'weather.lowHumidity': 'Low air humidity — consider misting the leaves.',
    'becomeHost.changePhotoHint': 'To change it, go to the Profile tab and tap your avatar.',
    'becomeHost.priceWarning': 'That is well above average — are you sure?',
    'profile.awaitingPayment': 'Awaiting payment from the renter',
    'profile.hostNoPayout': 'The host has not connected a payout account yet — please try again shortly.',
    'profile.photoAlsoOnListing': 'This photo is also shown on your host listing.',
    'profile.connectStripeHint': 'To receive payouts for bookings, connect a Stripe account (takes a few minutes).',
    'plant.yourPlantAlt': 'Your plant',

    // Notifications (rendered in the RECIPIENT's language)
    'notif.someone': 'Someone',
    'notif.qtySuffix': ' (×{n} pcs)',
    'notif.booking_request.title': 'New booking request',
    'notif.booking_request.body': '{name} would like to leave the plant "{plant}"{qtySuffix} with you',
    'notif.new_review.title': 'New review',
    'notif.new_review.body': '{name} rated you {rating}/5 for "{plant}"',
    'notif.review_received.title': 'You received a review',
    'notif.review_received.body': '{name} rated you {rating}/5 for the booking "{plant}"',
    'notif.new_message.title': 'New message',
    'notif.new_message.body': '{text}',
    'notif.booking_paid.title': 'Payment received',
    'notif.booking_paid.body': 'Booking "{plant}" has been paid — {amount} zł',
    'notif.booking_accepted.title': 'Booking accepted!',
    'notif.booking_accepted.body': 'Your request for "{plant}"{qtySuffix} was accepted — you can now pay for it in your Profile.',
    'notif.booking_rejected.title': 'Booking rejected',
    'notif.booking_rejected.body': 'Your request for "{plant}"{qtySuffix} was rejected by the host.',
    'notif.booking_cancelled.title': 'Booking cancelled',
    'notif.booking_cancelled.body': 'The request for "{plant}" was cancelled by the renter.',
    'notif.booking_cancelled_refund.title': 'Booking cancelled',
    'notif.booking_cancelled_refund.body': 'Booking "{plant}" was cancelled and refunded — the funds will be withdrawn from your account.',
    'notif.host_spot_available.title': 'A spot opened up!',
    'notif.host_spot_available.body': 'A spot just opened up at {host} — check it before someone else takes it.',
    'notif.booking_reminder_renter.title': 'Your booking starts tomorrow',
    'notif.booking_reminder_renter.body': 'Remember to bring the plant "{plant}" to {host} ({date}).',
    'notif.booking_reminder_host.title': 'You are taking in plants tomorrow',
    'notif.booking_reminder_host.body': '{name} will bring you the plant "{plant}"{qtySuffix} ({date}).',
    'rail.referralText': 'For every referral, you and your friend get a discount on Premium.',
    'weather.clear': 'Clear',
    'weather.partlyCloudy': 'Partly cloudy',
    'weather.cloudy': 'Cloudy',
    'weather.fog': 'Fog',
    'weather.rain': 'Rain',
    'weather.variable': 'Variable',
    'weather.conditionsFor': '{place} · conditions for your plants',
    'weather.fetchFailed': 'Could not fetch the weather',
    'scan.subtitle': 'Quick species check — without saving to your profile',
    'booking.waitingAcceptance': 'Waiting for {host} to accept. Once accepted, you will be able to pay and confirm the booking.',
    'booking.priceLine': '{price} zł / plant / day',
    'review.yourPlant': 'Your plant: {plant}',
    'review.renterPlant': '{renter} — plant: {plant}',
    'profile.earnTitle': 'Earn from spare space at home',
    'profile.paidWithShare': 'Paid — {total} zł (your share: {share} zł)',
    'profile.paidAmount': 'Paid {amount} zł',
    'profile.cancelRequest': 'Cancel request',
    'profile.cancelling': 'Cancelling...',
    'profile.confirmDeletePlant': 'Remove "{name}" from your plants?',
    'profile.capacityExceeded': 'You cannot accept this request — you already have {current} accepted plants for these dates, and your limit is {limit}.',
    'profile.noRequests': 'No booking requests.',
    'profile.noAccepted': 'No accepted bookings.',
    'profile.spots': '{n} spots',
    'profile.profileVisible': 'Your profile is already visible in the host list ✓',
    'profile.gpsSaved': ' · GPS location saved',
  },

  uk: {
    // Навігація
    'tab.home': 'Пошук',
    'tab.add': 'Додати',
    'tab.scan': 'Розпізнати',
    'tab.profile': 'Профіль',

    // Вхід / реєстрація
    'auth.loginSubtitle': 'Увійдіть до свого облікового запису',
    'auth.signupSubtitle': 'Створити новий обліковий запис',
    'auth.namePlaceholder': "Ім'я та прізвище (або нікнейм)",
    'auth.referralPlaceholder': 'Реферальний код (необов\u2019язково)',
    'auth.referralDetected': 'Запрошення від друга виявлено автоматично ✓',
    'auth.emailConsent': 'Хочу отримувати сповіщення на email (наприклад, про нові бронювання)',
    'auth.acceptPrefix': 'Приймаю',
    'auth.termsLink': 'Правила та Політику конфіденційності',
    'auth.acceptSuffix': 'Leafsit',
    'auth.emailPlaceholder': 'Адреса email',
    'auth.passwordPlaceholder': 'Пароль',
    'auth.loginButton': 'Увійти',
    'auth.signupButton': 'Зареєструватися',
    'auth.noAccount': 'Ще не маєте облікового запису?',
    'auth.hasAccount': 'Вже маєте обліковий запис?',
    'auth.accountCreated': 'Обліковий запис створено! Тепер можете увійти.',
    'auth.languageLabel': 'Мова',

    // Навчання
    'onb.skip': 'Пропустити',
    'onb.next': 'Далі',
    'onb.start': 'Почнімо!',
    'onb.1.title': 'Вітаємо в Leafsit!',
    'onb.1.text': 'Застосунок, що з\u2019єднує тих, хто від\u2019їжджає, з тими, хто догляне за їхніми рослинами.',
    'onb.2.title': 'Знайдіть доглядача',
    'onb.2.text': 'Перегляньте господарів поблизу, ознайомтеся з відгуками та цінами, надішліть запит на бронювання.',
    'onb.3.title': 'Додайте свої рослини',
    'onb.3.text': 'Зробіть фото — ШІ розпізнає вид. Також можна відкрити платний персоналізований довідник з догляду.',
    'onb.4.title': 'Заробляйте як господар',
    'onb.4.text': 'Маєте вільне місце? Встановіть ціну та приймайте рослини сусідів — гроші йдуть прямо на ваш рахунок.',
    'onb.5.title': 'Будьте в курсі',
    'onb.5.text': 'Сповіщення та чат у застосунку допоможуть узгодити деталі з іншою стороною бронювання.',
    'onb.6.title': 'Маєте запитання?',
    'onb.6.text': 'Асистент підтримки в Профілі відповість одразу. Якщо справа термінова, ми передамо її нашій команді.',

    // Cookies
    'cookie.text': 'Ми використовуємо файли cookie, необхідні для роботи застосунку, та — за вашою згодою — аналітичні. Детальніше в Політиці конфіденційності.',
    'cookie.essential': 'Лише необхідні',
    'cookie.acceptAll': 'Прийняти всі',

    // Екран пошуку
    'home.yourArea': 'Ваш район',
    'home.defaultArea': 'Варшава · Мокотув',
    'home.titleLine1': 'Кому довірите',
    'home.titleLine2': 'свої рослини?',
    'home.locationDenied': 'Немає доступу до геолокації — господарів показано без сортування за відстанню.',
    'home.searchPlaceholder': "Пошук за ім'ям або місцем...",
    'home.filterNear': 'Поблизу',
    'home.filterTop': 'Найкращі оцінки',
    'home.filterAvailable': 'Доступні зараз',
    'home.filterMatched': 'Підходять',
    'home.matchesPlant': 'Підходить для: {plant}',
    'home.filterFavorites': 'Улюблені',
    'home.filterPrice': 'Ціна',
    'home.filterDates': 'Дати',
    'home.viewList': 'Список',
    'home.viewMap': 'Карта',
    'home.priceFrom': 'Ціна від',
    'home.priceTo': 'Ціна до',
    'home.howManyPlants': 'Скільки рослин?',
    'home.loading': 'Завантаження...',
    'home.hostsFound': '{n} господарів {suffix}',
    'home.suffixMatching': 'за вашим пошуком',
    'home.suffixNearby': 'поблизу',
    'home.noHostsQuery': 'Немає господарів за запитом «{q}».',
    'home.noHostsCriteria': 'Поки немає господарів, що відповідають цим критеріям.',
    'home.perPlantPerDay': '/рослина/день',
    'home.acceptsPlants': 'приймає {n} рослин',
    'home.away': '{km} км',
    'home.recentlyViewed': 'Нещодавно переглянуті',

    // Деталі господаря
    'host.reviewsCount': '{n} відгуків',
    'host.freeSpots': 'вільних місць',
    'host.perPlantDay': 'за рослину/день',
    'host.privacyNote': 'Точну адресу та номер телефону господаря ви побачите лише після підтвердження бронювання — задля безпеки обох сторін.',
    'host.bookButton': 'Забронювати дати',
    'host.reviewsHeader': 'Відгуки',
    'host.loading': 'Завантаження...',
    'host.noReviews': 'Цей господар ще не має відгуків.',
    'host.anonymousGuest': 'Анонімний гість',
    'host.watchOff': 'Повідомте мене, коли зʼявиться місце',
    'host.watchingOn': 'Ви стежите — натисніть, щоб зупинити',
    'host.respondsHour': '⚡ Зазвичай відповідає протягом години',
    'host.respondsFewHours': 'Зазвичай відповідає протягом кількох годин',
    'host.respondsDay': 'Зазвичай відповідає протягом доби',

    // Форма бронювання
    'booking.requestSent': 'Запит надіслано!',
    'booking.backToList': 'Назад до списку',
    'booking.loadingPlants': 'Завантаження ваших рослин...',
    'booking.noPlants': 'У вас ще немає рослин. Додайте першу у вкладці «Додати», щоб забронювати господаря.',
    'booking.whichDates': 'На які дати?',
    'booking.from': 'Від',
    'booking.to': 'До',
    'calendar.legendUnavailable': 'Недоступно',
    'calendar.legendSelected': 'Обрано',
    'calendar.rangeBlocked': 'У цьому періоді є недоступний день — оберіть інші дати.',
    'booking.whichPlant': 'Яка рослина?',
    'booking.howMany': 'Скільки штук? (у вас {max})',
    'booking.estimatedCost': 'Орієнтовна вартість: {total} zł ({days} {dayWord}) — оплата лише після підтвердження господарем',
    'booking.day': 'день',
    'booking.days': 'днів',
    'booking.yourPhone': 'Ваш телефон (необов\u2019язково)',
    'booking.phoneNote': 'Господар побачить його лише після підтвердження — це допоможе узгодити час передачі',
    'booking.sending': 'Надсилання...',
    'booking.sendRequest': 'Надіслати запит на бронювання',
    'booking.sendFailed': 'Не вдалося надіслати запит: ',

    // Додати рослину
    'plant.title': 'Додати рослину',
    'plant.subtitle': 'Зробіть фото — ми розпізнаємо вид',
    'plant.takePhoto': 'Зробити фото рослини',
    'plant.identifying': 'Розпізнаю вид...',
    'plant.recognized': 'Розпізнано: {name}',
    'plant.confidence': '(впевненість {n}%)',
    'plant.wrongName': 'Назва не збігається? Виправте її:',
    'plant.howManySame': 'Скільки у вас таких самих рослин?',
    'plant.unlockPremium': 'Відкрити повний Premium-довідник',
    'plant.premiumTitle': 'Premium-довідник — 9 zł',
    'plant.checkingPayment': 'Перевіряю оплату...',
    'plant.sunlightQuestion': 'Скільки сонця отримує ця рослина у вас?',
    'plant.redirecting': 'Переходжу до оплати...',
    'plant.payButton': 'Сплатити 9 zł і відкрити довідник',
    'plant.testMode': 'Тестовий режим — картка 4242 4242 4242 4242, будь-яка дата та CVC',
    'plant.generating': 'Генерую ваш довідник...',
    'plant.guidePaid': 'Ваш довідник з догляду (оплачено ✓)',
    'plant.added': 'Рослину додано!',
    'plant.checkProfile': 'Перегляньте її у вкладці Профіль',
    'plant.errIdentify': 'Не вдалося розпізнати рослину.',
    'plant.errNoSpecies': 'Вид не розпізнано. Спробуйте чіткіше фото листка.',
    'plant.errConnection': "Помилка з'єднання з розпізнаванням рослин.",
    'plant.errGuide': 'Не вдалося згенерувати пораду.',
    'plant.errGuideConn': "Помилка з'єднання з генератором порад.",
    'plant.errPayment': 'Не вдалося створити платіж.',
    'plant.errPaymentConn': "Помилка з'єднання з платіжною системою.",
    'plant.errPaymentConfirm': 'Не вдалося підтвердити оплату. Спробуйте ще раз.',
    'plant.errPaymentCheck': 'Помилка перевірки оплати.',
    'plant.errSave': 'Не вдалося зберегти: ',

    // Розпізнавання
    'scan.title': 'Розпізнати рослину',
    'scan.takeOrUpload': 'Зробити або завантажити фото',
    'scan.confidence': 'Впевненість розпізнавання: {n}%',
    'scan.addPrompt': 'Бажаєте додати її до своїх рослин?',
    'scan.addHint': 'Перейдіть до вкладки «Додати» — там також можна відкрити повний Premium-довідник.',

    // Статуси бронювання
    'status.accepted': 'Підтверджено',
    'status.rejected': 'Відхилено',
    'status.cancelled': 'Скасовано',
    'status.pending': 'Очікує',

    // Відгуки
    'review.rateHost': 'Оцініть господаря',
    'review.rateRenter': 'Оцініть орендаря',
    'review.commentPlaceholder': 'Як пройшла співпраця? (необов\u2019язково)',
    'review.submit': 'Надіслати відгук',
    'review.saveFailed': 'Не вдалося зберегти відгук: ',
    'review.guest': 'Гість',
    'review.receivedTitle': 'Ви отримали відгук',

    // Підтримка
    'support.title': 'Підтримка',
    'support.subtitle': 'Зазвичай відповідаємо одразу',
    'support.welcome': 'Вітаю! Чим можу допомогти? Запитайте про бронювання, оплату або як стати господарем.',
    'support.inputPlaceholder': 'Напишіть повідомлення...',
    'support.errGeneric': 'Вибачте, сталася помилка. Спробуйте ще раз.',
    'support.errConnection': "Вибачте, виникла проблема зі з'єднанням. Спробуйте ще раз.",

    // Чат
    'chat.quickAccept': 'Так, охоче прийму! 🌿',
    'chat.quickBusy': 'На жаль, у ці дати не вийде.',
    'chat.quickWhen': 'О котрій годині вам зручно?',
    'chat.quickThanks': 'Дякую!',
    'chat.firstMessage': 'Напишіть перше повідомлення!',
    'chat.loading': 'Завантаження...',
    'chat.messagesTitle': 'Повідомлення',
    'chat.noConversations': 'У вас ще немає розмов.',
    'chat.startConversation': 'Почати розмову',
    'chat.renter': 'Орендар',

    // Панель господаря
    'dash.title': 'Панель господаря',
    'calendar.title': 'Календар доступності',
    'calendar.hint': 'Дні з підтвердженими бронюваннями блокуються самі. Натисніть на день, щоб заблокувати його вручну (напр. на відпустку).',
    'calendar.legendFree': 'Вільно',
    'calendar.legendOccupied': 'Зайнято (бронювання)',
    'calendar.legendBlocked': 'Заблоковано',
    'calendar.jan': 'Січень', 'calendar.feb': 'Лютий', 'calendar.mar': 'Березень', 'calendar.apr': 'Квітень',
    'calendar.may': 'Травень', 'calendar.jun': 'Червень', 'calendar.jul': 'Липень', 'calendar.aug': 'Серпень',
    'calendar.sep': 'Вересень', 'calendar.oct': 'Жовтень', 'calendar.nov': 'Листопад', 'calendar.dec': 'Грудень',
    'calendar.mon': 'Пн', 'calendar.tue': 'Вт', 'calendar.wed': 'Ср', 'calendar.thu': 'Чт',
    'calendar.fri': 'Пт', 'calendar.sat': 'Сб', 'calendar.sun': 'Нд',
    'booking.datesBlocked': 'Господар заблокував щонайменше один день у цьому періоді. Оберіть інші дати.',
    'dash.loading': 'Завантаження...',
    'dash.totalEarned': 'Усього зароблено',
    'dash.completed': 'Виконано',
    'dash.pending': 'Очікує',
    'dash.rating': 'Оцінка',
    'dash.historyTitle': 'Історія бронювань',
    'dash.noHistory': 'Історії бронювань ще немає.',

    // Списки
    'list.newest': 'Найновіші',
    'list.oldest': 'Найстаріші',
    'list.all': 'Усі',
    'list.noResults': 'Немає результатів.',

    // Стати господарем
    'becomeHost.titleNew': 'Стати господарем',
    'becomeHost.titleEdit': 'Редагувати профіль господаря',
    'becomeHost.photoFromAccount': 'Фото з вашого облікового запису',
    'becomeHost.namePlaceholder': "Ваше ім'я",
    'becomeHost.areaPlaceholder': 'Район (напр. Мокотув, Варшава)',
    'becomeHost.addressPlaceholder': 'Точна адреса (необов\u2019язково, видно після підтвердження)',
    'becomeHost.phonePlaceholder': 'Телефон (необов\u2019язково, видно після підтвердження)',
    'becomeHost.pricePlaceholder': 'Ціна за рослину / день (zł)',
    'becomeHost.priceHint': 'Рекомендована ціна: 2-5 zł за рослину на день',
    'becomeHost.capacityPlaceholder': 'Скільки рослин можете прийняти?',
    'becomeHost.descPlaceholder': 'Короткий опис (необов\u2019язково) — напр. досвід з рослинами, як часто надсилаєте фото...',
    'becomeHost.sunlightLabel': 'Освітлення у вас',
    'becomeHost.useLocation': 'Використати мою геолокацію (для відстаней)',
    'becomeHost.locationSaved': 'Геолокацію збережено ✓ (натисніть, щоб оновити)',
    'becomeHost.locationLoading': 'Отримую геолокацію...',
    'becomeHost.locationUnsupported': 'Ваш браузер не підтримує геолокацію.',
    'becomeHost.locationFailed': 'Не вдалося отримати геолокацію. Перевірте дозволи браузера.',
    'becomeHost.saveChanges': 'Зберегти зміни',
    'becomeHost.saveFailed': 'Не вдалося зберегти: ',
    'becomeHost.spacePhotosLabel': 'Фото приміщення',
    'becomeHost.spacePhotosHint': 'Покажіть, де саме стоятиме рослина (до 4 фото).',
    'host.spacePhotosTitle': 'Фото приміщення',
    'becomeHost.priceInvalid': 'Вкажіть коректну ціну в розумних межах (0,50 – 1000 zł).',
    'becomeHost.capacityInvalid': 'Вкажіть коректну кількість місць в розумних межах (1 – 50).',
    'sun.full': 'Повне сонце',
    'sun.partial': 'Півтінь',
    'sun.shade': 'Тінь',

    // Профіль
    'profile.loading': 'Завантаження...',
    'profile.changeName': "Змінити ім'я",
    'profile.namePlaceholder': "Ваше ім'я та прізвище",
    'profile.fillNameHint': "Додайте своє ім'я — господар побачить його замість самої лише пошти",
    'profile.notifications': 'Сповіщення',
    'profile.noNotifications': 'Немає сповіщень.',
    'profile.emailNotifications': 'Сповіщення на email',
    'profile.saving': 'Збереження...',
    'profile.referralTitle': 'Порекомендуйте Leafsit друзям',
    'profile.referredCount': 'Запрошених друзів: {n}',
    'profile.copyLink': 'Копіювати посилання',
    'profile.copied': 'Скопійовано ✓',
    'profile.viewAll': 'Переглянути всі ({n})',
    'profile.hostPanel': 'Панель господаря',
    'profile.yourPlants': 'Ваші рослини',
    'profile.noPlants': 'У вас ще немає рослин — додайте першу у вкладці «Додати».',
    'profile.yourBookings': 'Ваші бронювання',
    'profile.noBookings': 'У вас ще немає бронювань.',
    'profile.bookingRequests': 'Запити на бронювання',
    'profile.acceptedBookings': 'Підтверджені бронювання',
    'profile.accept': 'Підтвердити',
    'profile.reject': 'Відхилити',
    'profile.contactHost': 'Контакти господаря',
    'profile.contactOwner': 'Контакти власника рослини',
    'profile.noNameGiven': "Ім'я не вказано",
    'profile.from': 'від',
    'profile.leaveReview': 'Залишити відгук',
    'profile.rateRenter': 'Оцінити орендаря',
    'profile.reviewGiven': 'Відгук надіслано',
    'profile.renterReviewGiven': 'Відгук про орендаря надіслано',
    'profile.hostReviewOfYou': 'Відгук господаря про вас',
    'profile.checkingPayment': 'Перевіряю оплату...',
    'profile.redirecting': 'Переходжу...',
    'profile.payConfirm': 'Сплатити та підтвердити ({total} zł)',
    'profile.paymentReceived': 'Оплату отримано',
    'profile.cancelBooking': 'Скасувати бронювання',
    'profile.cancelAndRefund': 'Скасувати та повернути кошти',
    'profile.confirmCancel': 'Справді скасувати це бронювання?',
    'profile.refundFailed': "Не вдалося повернути кошти. Спробуйте ще раз або зв'яжіться з підтримкою.",
    'profile.currentlyAt': 'Зараз у {name}',
    'profile.atYourHome': 'У вас удома',
    'profile.hostHistory': 'Історія в господарів',
    'profile.neverAtHost': 'Ця рослина ще ніколи не була в господаря.',
    'profile.becomeHostTitle': 'Хочете стати господарем?',
    'profile.becomeHostText': 'Встановіть ціну та приймайте рослини сусідів на час їхньої відсутності',
    'profile.connectStripe': 'Підключити рахунок Stripe',
    'profile.checkingPayoutAccount': 'Перевіряю статус рахунку для виплат...',
    'profile.payoutConnected': 'Рахунок для виплат підключено',
    'profile.pending': 'Очікує',
    'profile.terms': 'Правила та Політика конфіденційності',
    'profile.darkMode': 'Темна тема',
    'profile.lightMode': 'Світла тема',
    'profile.toggleTheme': 'Перемкнути тему',
    'profile.yourHostProfile': 'Ваш профіль господаря',
    'profile.confirmCancelPaid': 'Справді скасувати? Сплачені {amount} zł буде повністю повернено.',
    'weather.loading': 'Завантаження погоди для вашої локації...',
    'weather.humidity': 'вологість',
    'weather.lowHumidity': 'Низька вологість повітря — варто обприскати листя.',
    'becomeHost.changePhotoHint': 'Щоб змінити його, перейдіть до вкладки Профіль і натисніть на свій аватар.',
    'becomeHost.priceWarning': 'Це значно вище середнього — ви впевнені?',
    'profile.awaitingPayment': 'Очікує на оплату від орендаря',
    'profile.hostNoPayout': 'Господар ще не підключив рахунок для виплат — спробуйте трохи пізніше.',
    'profile.photoAlsoOnListing': 'Це фото також показується у вашому оголошенні господаря.',
    'profile.connectStripeHint': 'Щоб отримувати виплати за бронювання, підключіть рахунок Stripe (кілька хвилин).',
    'plant.yourPlantAlt': 'Ваша рослина',

    // Сповіщення (формуються мовою ОТРИМУВАЧА)
    'notif.someone': 'Хтось',
    'notif.qtySuffix': ' (×{n} шт.)',
    'notif.booking_request.title': 'Новий запит на бронювання',
    'notif.booking_request.body': '{name} хоче залишити у вас рослину «{plant}»{qtySuffix}',
    'notif.new_review.title': 'Новий відгук',
    'notif.new_review.body': '{name} оцінив(ла) вас на {rating}/5 за «{plant}»',
    'notif.review_received.title': 'Ви отримали відгук',
    'notif.review_received.body': '{name} оцінив(ла) вас на {rating}/5 за бронювання «{plant}»',
    'notif.new_message.title': 'Нове повідомлення',
    'notif.new_message.body': '{text}',
    'notif.booking_paid.title': 'Оплату отримано',
    'notif.booking_paid.body': 'Бронювання «{plant}» оплачено — {amount} zł',
    'notif.booking_accepted.title': 'Бронювання підтверджено!',
    'notif.booking_accepted.body': 'Ваш запит на «{plant}»{qtySuffix} підтверджено — тепер ви можете оплатити його у Профілі.',
    'notif.booking_rejected.title': 'Бронювання відхилено',
    'notif.booking_rejected.body': 'Ваш запит на «{plant}»{qtySuffix} відхилено господарем.',
    'notif.booking_cancelled.title': 'Бронювання скасовано',
    'notif.booking_cancelled.body': 'Запит на «{plant}» скасовано орендарем.',
    'notif.booking_cancelled_refund.title': 'Бронювання скасовано',
    'notif.booking_cancelled_refund.body': 'Бронювання «{plant}» скасовано та повернуто кошти — їх буде списано з вашого рахунку.',
    'notif.host_spot_available.title': 'Звільнилося місце!',
    'notif.host_spot_available.body': 'У господаря {host} звільнилося місце — перевірте, поки хтось інший його не зайняв.',
    'notif.booking_reminder_renter.title': 'Ваше бронювання починається завтра',
    'notif.booking_reminder_renter.body': 'Не забудьте привезти рослину «{plant}» до {host} ({date}).',
    'notif.booking_reminder_host.title': 'Завтра ви приймаєте рослини',
    'notif.booking_reminder_host.body': '{name} привезе вам рослину «{plant}»{qtySuffix} ({date}).',
    'rail.referralText': 'За кожну рекомендацію ви й ваш друг отримуєте знижку на Premium.',
    'weather.clear': 'Ясно',
    'weather.partlyCloudy': 'Мінлива хмарність',
    'weather.cloudy': 'Хмарно',
    'weather.fog': 'Туман',
    'weather.rain': 'Опади',
    'weather.variable': 'Мінливо',
    'weather.conditionsFor': '{place} · умови для ваших рослин',
    'weather.fetchFailed': 'Не вдалося отримати погоду',
    'scan.subtitle': 'Швидка перевірка виду — без збереження у профілі',
    'booking.waitingAcceptance': 'Очікує підтвердження від {host}. Після підтвердження ви зможете сплатити та підтвердити бронювання.',
    'booking.priceLine': '{price} zł / рослина / день',
    'review.yourPlant': 'Ваша рослина: {plant}',
    'review.renterPlant': '{renter} — рослина: {plant}',
    'profile.earnTitle': 'Заробляйте на вільному місці вдома',
    'profile.paidWithShare': 'Оплачено — {total} zł (ваша частка: {share} zł)',
    'profile.paidAmount': 'Сплачено {amount} zł',
    'profile.cancelRequest': 'Скасувати запит',
    'profile.cancelling': 'Скасування...',
    'profile.confirmDeletePlant': 'Видалити «{name}» з ваших рослин?',
    'profile.capacityExceeded': 'Ви не можете підтвердити цей запит — на ці дати у вас уже {current} підтверджених рослин, а ваш ліміт — {limit}.',
    'profile.noRequests': 'Немає запитів на бронювання.',
    'profile.noAccepted': 'Немає підтверджених бронювань.',
    'profile.spots': '{n} місць',
    'profile.profileVisible': 'Ваш профіль уже видно у списку господарів ✓',
    'profile.gpsSaved': ' · GPS-локацію збережено',
  },
};

const LanguageContext = React.createContext({ lang: 'pl', setLang: () => {} });

function translate(lang, key, params) {
  let str = TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS.pl[key] ?? key;
  if (params) {
    Object.keys(params).forEach(p => {
      str = str.split('{' + p + '}').join(params[p]);
    });
  }
  return str;
}

// Buduje tresc powiadomienia w JEZYKU ODBIORCY na podstawie typu zdarzenia i danych.
function notificationText(lang, type, params) {
  const p = { ...(params || {}) };
  if (!p.name) p.name = translate(lang, 'notif.someone');
  p.qtySuffix = p.qty && Number(p.qty) > 1 ? translate(lang, 'notif.qtySuffix', { n: p.qty }) : '';
  return {
    title: translate(lang, 'notif.' + type + '.title', p),
    body: translate(lang, 'notif.' + type + '.body', p),
  };
}

function useT() {
  const { lang } = React.useContext(LanguageContext);
  return (key, params) => translate(lang, key, params);
}

function useLang() {
  return React.useContext(LanguageContext);
}

function detectInitialLanguage() {
  try {
    const saved = localStorage.getItem('leafsit_lang');
    if (saved && TRANSLATIONS[saved]) return saved;
  } catch (e) { /* ignore */ }
  try {
    const browser = (navigator.language || 'pl').slice(0, 2).toLowerCase();
    if (TRANSLATIONS[browser]) return browser;
  } catch (e) { /* ignore */ }
  return 'pl';
}

function LanguagePicker({ compact = false }) {
  const { lang, setLang } = useLang();
  return (
    <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
      {LANGUAGES.map(l => {
        const isActive = l.code === lang;
        return (
          <button
            key={l.code}
            onClick={() => setLang(l.code)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: compact ? '5px 10px' : '7px 13px',
              borderRadius: 999,
              border: `1.5px solid ${isActive ? colors.fern : colors.line}`,
              background: isActive ? colors.fern : 'transparent',
              color: isActive ? '#fff' : '#7A7261',
              fontFamily: 'Inter, sans-serif',
              fontSize: compact ? 11.5 : 12.5,
              fontWeight: isActive ? 700 : 500,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            <span style={{ fontSize: compact ? 13 : 15 }}>{l.flag}</span>
            {l.name}
          </button>
        );
      })}
    </div>
  );
}

const SUNLIGHT_OPTIONS = ['Pełne słońce', 'Półcień', 'Cień'];

function sunlightKey(value) {
  if (value === 'Pełne słońce') return 'sun.full';
  if (value === 'Półcień') return 'sun.partial';
  if (value === 'Cień') return 'sun.shade';
  return 'sun.full';
}

// Zwraca klucz tlumaczenia dla "typowego czasu odpowiedzi" hosta, albo null
// (brak danych lub odpowiada zbyt wolno - wtedy po prostu nie pokazujemy odznaki, zamiast kogos zawstydzac).
function responseTimeKey(avgMinutes) {
  if (avgMinutes == null) return null;
  if (avgMinutes <= 60) return 'host.respondsHour';
  if (avgMinutes <= 60 * 6) return 'host.respondsFewHours';
  if (avgMinutes <= 60 * 24) return 'host.respondsDay';
  return null;
}

function sunlightInfo(value) {
  if (value === 'Pełne słońce') return { Icon: Sun, tone: colors.gold };
  if (value === 'Półcień') return { Icon: CloudSun, tone: colors.gold };
  if (value === 'Cień') return { Icon: Cloud, tone: '#8A8574' };
  return { Icon: Sun, tone: colors.gold };
}

function isTopHost(host) {
  return (host?.rating ?? 0) >= 4.8 && (host?.reviews ?? 0) >= 5;
}

function isVerifiedHost(host) {
  return !!host?.stripe_charges_enabled;
}

function HostBadges({ host, size = 'small' }) {
  const verified = isVerifiedHost(host);
  const top = isTopHost(host);
  if (!verified && !top) return null;
  const fontSize = size === 'small' ? 9.5 : 11;
  return (
    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
      {verified && (
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 3, background: '#EEF3EA', color: colors.fern,
          fontFamily: 'Inter, sans-serif', fontSize, fontWeight: 700, padding: '2px 7px', borderRadius: 10
        }}><CheckCircle size={size === 'small' ? 10 : 12} /> Zweryfikowany</span>
      )}
      {top && (
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 3, background: '#FFF8EC', color: colors.gold,
          fontFamily: 'Inter, sans-serif', fontSize, fontWeight: 700, padding: '2px 7px', borderRadius: 10
        }}><Star size={size === 'small' ? 10 : 12} fill={colors.gold} /> Top Host</span>
      )}
    </div>
  );
}

function distanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function daysBetween(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));
}

function isUpcoming(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(dateStr) > today;
}

function displayNameOf(user) {
  return user?.user_metadata?.full_name || user?.email || '';
}

function avatarUrlOf(user) {
  return user?.user_metadata?.avatar_url || null;
}

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short', year: 'numeric' });
}

function resizeImage(file, maxSize = 800) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxSize) {
          height = Math.round((height * maxSize) / width);
          width = maxSize;
        } else if (height > maxSize) {
          width = Math.round((width * maxSize) / height);
          height = maxSize;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Central place for creating an in-app notification, with optional email.
// Zapisuje TYP zdarzenia + dane (params), zamiast gotowego tekstu.
// Dzieki temu kazdy odbiorca widzi powiadomienie w SWOIM jezyku.
// Rejestruje urzadzenie (tylko na Androidzie/iOS, nie w przegladarce) do odbierania
// powiadomien push, i zapisuje otrzymany "adres" (token) w bazie danych.
async function setupPushNotifications(userId) {
  if (!Capacitor.isNativePlatform()) {
    console.log('[push] pominieto - nie jest to platforma natywna');
    return;
  }
  console.log('[push] start konfiguracji dla userId=', userId);

  try {
    // WAZNA KOLEJNOSC: najpierw nasluchiwanie, dopiero potem register().
    // Firebase moze odpowiedziec bardzo szybko - jesli register() jest
    // wywolane pierwsze, odpowiedz moze przyjsc zanim ktokolwiek jej sluchat.
    PushNotifications.addListener('registration', async (token) => {
      console.log('[push] otrzymano token:', token.value ? token.value.slice(0, 20) + '...' : '(pusty!)');
      try {
        const { error } = await supabase.from('push_tokens').upsert(
          { user_id: userId, token: token.value, platform: Capacitor.getPlatform() },
          { onConflict: 'token' }
        );
        if (error) {
          console.error('[push] BLAD zapisu tokena do Supabase:', JSON.stringify(error));
        } else {
          console.log('[push] token zapisany do Supabase poprawnie');
        }
      } catch (e) {
        console.error('[push] WYJATEK przy zapisie tokena:', e?.message || e);
      }
    });

    PushNotifications.addListener('registrationError', (err) => {
      console.error('[push] BLAD rejestracji (registrationError):', JSON.stringify(err));
    });

    let perm = await PushNotifications.checkPermissions();
    console.log('[push] status uprawnien:', perm.receive);
    if (perm.receive === 'prompt') {
      perm = await PushNotifications.requestPermissions();
      console.log('[push] status po requestPermissions:', perm.receive);
    }
    if (perm.receive !== 'granted') {
      console.log('[push] przerwano - brak zgody (status:', perm.receive, ')');
      return;
    }

    console.log('[push] wywoluje register()...');
    await PushNotifications.register();
    console.log('[push] register() zakonczone bez bledu');
  } catch (e) {
    console.error('[push] WYJATEK w setupPushNotifications:', e?.message || e);
  }
}


// Powiadamia wszystkich, ktorzy obserwuja danego hosta (bo byl pelny), ze zwolnilo sie miejsce.
// To jednorazowy "ping" - po wyslaniu obserwacja jest usuwana, zeby nie spamowac wielokrotnie.
async function notifyHostWatchers(hostId, hostName) {
  try {
    const { data: watches } = await supabase
      .from('host_watches')
      .select('id, user_id')
      .eq('host_id', hostId);

    if (!watches || watches.length === 0) return;

    await Promise.all(watches.map(w =>
      createNotification(w.user_id, 'host_spot_available', { host: hostName || '' }, null, null)
    ));

    await supabase.from('host_watches').delete().eq('host_id', hostId);
  } catch (e) { /* powiadomienie o wolnym miejscu nie jest krytyczne dla dzialania apki */ }
}

async function createNotification(userId, type, params = {}, bookingId = null, recipientEmail = null) {
  if (!userId) return;

  // Pobieramy jezyk odbiorcy (i preferencje email) jednym zapytaniem.
  const { data: profile } = await supabase
    .from('profiles')
    .select('email_notifications, language')
    .eq('id', userId)
    .maybeSingle();
  const recipientLang = profile?.language && TRANSLATIONS[profile.language] ? profile.language : 'pl';

  // title/body zapisujemy dodatkowo jako zapas (starsze wpisy i ewentualne wymagania kolumn).
  const rendered = notificationText(recipientLang, type, params);

  await supabase.from('notifications').insert([{
    user_id: userId,
    type,
    params,
    title: rendered.title,
    body: rendered.body,
    related_booking_id: bookingId,
  }]);

  if (recipientEmail) {
    const wantsEmail = profile ? profile.email_notifications !== false : true;
    if (wantsEmail) {
      try {
        await fetch('/api/send-notification-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ to: recipientEmail, title: rendered.title, body: rendered.body }),
        });
      } catch (e) { /* email jest opcjonalne, powiadomienie w apce już zapisane */ }
    }
  }

  // Push wysylamy "w tle" - jego ewentualny brak/blad nie powinien
  // zepsuc reszty (powiadomienie w apce i mail juz sa zapisane/wyslane).
  try {
    fetch('/api/send-push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, title: rendered.title, body: rendered.body }),
    });
  } catch (e) { /* push jest opcjonalny */ }
}

function Avatar({ photoUrl, name, size = 56, radius = 14 }) {
  if (photoUrl) {
    return (
      <img src={photoUrl} alt={name} style={{
        width: size, height: size, borderRadius: radius, objectFit: 'cover', flexShrink: 0
      }} />
    );
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: radius, background: `linear-gradient(135deg, ${colors.fern}, ${colors.fernDark})`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700,
      fontSize: Math.round(size * 0.32), flexShrink: 0
    }}>{name.charAt(0)}</div>
  );
}

function Screen({ children }) {
  return (
    <div className="app-screen" style={{
      width: '100%', maxWidth: 480, minHeight: '100vh', boxSizing: 'border-box',
      margin: '0 auto', background: colors.bg, display: 'flex', flexDirection: 'column',
      fontFamily: "'Fraunces', Georgia, serif",
    }}>
      {children}
    </div>
  );
}

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 1080 : false
  );
  useEffect(() => {
    function onResize() { setIsDesktop(window.innerWidth >= 1080); }
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return isDesktop;
}

function Sidebar({ active, onNav, user, theme, toggleTheme, unreadCount = 0 }) {
  const t = useT();
  const tabs = [
    { id: 'home', icon: Home, label: t('tab.home') },
    { id: 'add', icon: PlusCircle, label: t('tab.add') },
    { id: 'scan', icon: Camera, label: t('tab.scan') },
    { id: 'profile', icon: User, label: t('tab.profile') },
  ];
  const name = displayNameOf(user);
  const initial = (name || user.email || '?').charAt(0).toUpperCase();

  return (
    <aside style={{
      background: colors.fernDark, color: '#EDE7DA', padding: '28px 18px',
      display: 'flex', flexDirection: 'column', position: 'sticky', top: 0,
      height: '100vh', width: 240, flexShrink: 0, boxSizing: 'border-box'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 10px 24px', marginBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <img src="/logo-mark.png" alt="Leafsit" style={{ width: 32, height: 32 }} />
        <div style={{ fontFamily: 'Cambria, Georgia, serif', fontSize: 19, fontWeight: 600 }}>Leafsit</div>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 8 }}>
        {tabs.map(item => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button key={item.id} onClick={() => onNav(item.id)} style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '12px 12px',
              borderRadius: 12, cursor: 'pointer', position: 'relative', border: 'none',
              background: 'none', textAlign: 'left', width: '100%',
              color: isActive ? '#fff' : '#C9C2AE', fontFamily: 'Inter, sans-serif',
              fontSize: 15, fontWeight: isActive ? 700 : 500,
            }}>
              {isActive && <span style={{ position: 'absolute', left: -18, top: '50%', transform: 'translateY(-50%)', width: 4, height: 22, background: colors.gold, borderRadius: '0 6px 6px 0' }} />}
              <Icon size={20} strokeWidth={isActive ? 2.4 : 1.8} />
              <span>{item.label}</span>
              {item.id === 'profile' && unreadCount > 0 && (
                <span style={{
                  width: 8, height: 8, borderRadius: 4, background: colors.clay, marginLeft: 'auto', flexShrink: 0
                }} />
              )}
            </button>
          );
        })}
      </nav>

      <div style={{
        marginTop: 'auto', background: `linear-gradient(155deg, ${colors.fern} 0%, #2f4a35 100%)`,
        border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 18
      }}>
        <p style={{ fontFamily: 'Cambria, Georgia, serif', fontSize: 15, fontWeight: 600, margin: '0 0 6px', color: '#fff' }}>{t('profile.becomeHostTitle')}</p>
        <p style={{ fontSize: 12, color: '#C9C2AE', lineHeight: 1.5, margin: '0 0 14px' }}>{t('profile.becomeHostText')}</p>
        <button onClick={() => onNav('profile')} style={{
          display: 'block', width: '100%', textAlign: 'center', background: colors.gold, color: '#2A1F0E',
          fontSize: 12.5, fontWeight: 700, padding: 10, borderRadius: 10, border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif'
        }}>{t('profile.hostPanel')}</button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 18, paddingTop: 18, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%', background: colors.gold, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2A1F0E',
          fontFamily: 'Cambria, Georgia, serif', fontWeight: 700, fontSize: 13
        }}>{initial}</div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#EDE7DA', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name || user.email}</div>
          <div style={{ fontSize: 11, color: '#8C8570', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</div>
        </div>
        <button
          onClick={toggleTheme}
          aria-label={t('profile.toggleTheme')}
          style={{
            width: 30, height: 30, borderRadius: 8, border: 'none', cursor: 'pointer', flexShrink: 0,
            background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
        >
          {theme === 'dark' ? <Sun size={15} color={colors.gold} /> : <Moon size={15} color="#C9C2AE" />}
        </button>
      </div>
    </aside>
  );
}

function RightRail({ onNav }) {
  const t = useT();
  return (
    <aside style={{ padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: 20, width: '100%', boxSizing: 'border-box' }}>
      <WeatherWidget />
      <div
        onClick={() => onNav('profile')}
        style={{ background: colors.card, border: `1px solid ${colors.line}`, borderRadius: 16, padding: 18, cursor: 'pointer' }}
      >
        <p style={{ fontFamily: 'Cambria, Georgia, serif', fontSize: 15.5, fontWeight: 600, margin: '0 0 6px', color: colors.ink }}>{t('profile.referralTitle')}</p>
        <p style={{ fontSize: 12, color: '#8A8574', lineHeight: 1.5, margin: 0 }}>{t('rail.referralText')}</p>
      </div>
    </aside>
  );
}

function TabBar({ active, onNav, unreadCount = 0 }) {
  const t = useT();
  const tabs = [
    { id: 'home', icon: Home, label: t('tab.home') },
    { id: 'add', icon: PlusCircle, label: t('tab.add') },
    { id: 'scan', icon: Camera, label: t('tab.scan') },
    { id: 'profile', icon: User, label: t('tab.profile') },
  ];
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-around', alignItems: 'center',
      padding: '10px 0 16px', borderTop: `1px solid ${colors.line}`, background: colors.card
    }}>
      {tabs.map(item => {
        const Icon = item.icon;
        const isActive = active === item.id;
        return (
          <button key={item.id} onClick={() => onNav(item.id)} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            background: 'none', border: 'none', cursor: 'pointer', position: 'relative',
            color: isActive ? colors.fern : colors.muted, fontFamily: 'Inter, sans-serif'
          }}>
            <span style={{ position: 'relative' }}>
              <Icon size={22} strokeWidth={isActive ? 2.4 : 1.8} />
              {item.id === 'profile' && unreadCount > 0 && (
                <span style={{
                  position: 'absolute', top: -3, right: -5, width: 9, height: 9, borderRadius: 5,
                  background: colors.clay, border: `1.5px solid ${colors.card}`
                }} />
              )}
            </span>
            <span style={{ fontSize: 10, fontWeight: isActive ? 700 : 500 }}>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function Pill({ children, tone = 'fern', active, onClick }) {
  const bg = tone === 'fern' ? colors.fern : tone === 'clay' ? colors.clay : tone === 'gray' ? colors.muted : colors.gold;
  return (
    <span
      onClick={onClick}
      style={{
        background: active === false ? colors.clayLight : bg,
        color: active === false ? '#7A7261' : '#fff',
        fontSize: 11, fontWeight: 700, padding: '4px 10px',
        borderRadius: 20, fontFamily: 'Inter, sans-serif', letterSpacing: 0.3,
        display: 'inline-flex', alignItems: 'center', gap: 5,
        cursor: onClick ? 'pointer' : 'default', whiteSpace: 'nowrap',
        border: active === false ? `1px solid ${colors.line}` : 'none'
      }}>{children}</span>
  );
}

function TextField({ icon: Icon, ...props }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10, background: colors.card,
      border: `1.5px solid ${colors.line}`, borderRadius: 14, padding: '12px 16px', marginBottom: 12
    }}>
      {Icon && <Icon size={18} color="#A9A08B" style={{ flexShrink: 0 }} />}
      <input
        {...props}
        style={{ border: 'none', outline: 'none', flex: 1, fontFamily: 'Inter, sans-serif', fontSize: 14, background: 'transparent', color: colors.ink }}
      />
    </div>
  );
}

function generateReferralCode() {
  return Math.random().toString(36).slice(2, 10);
}

function TermsScreen({ onBack }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 20, paddingBottom: 14, borderBottom: `1px solid ${colors.line}` }}>
        <button onClick={onBack} style={{
          width: 34, height: 34, borderRadius: 17, background: colors.clayLight, border: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0
        }}><ArrowLeft size={18} color={colors.ink} /></button>
        <h2 style={{ fontSize: 16, color: colors.ink, fontWeight: 600, margin: 0 }}>Regulamin i Polityka Prywatności</h2>
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: colors.muted, marginBottom: 16 }}>
          Usługodawcą jest Krystian Kędra, ul. Marywilska 60c/89, 03-042 Warszawa.
        </div>

        <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 13, color: colors.fern, marginBottom: 8 }}>§1 Postanowienia ogólne</div>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12.5, color: '#4A4638', lineHeight: 1.6, marginBottom: 14 }}>
          Aplikacja Leafsit służy do kojarzenia osób poszukujących opieki nad roślinami doniczkowymi pod czasową nieobecność z osobami oferującymi taką opiekę. Korzystanie z aplikacji oznacza akceptację niniejszego Regulaminu.
        </p>

        <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 13, color: colors.fern, marginBottom: 8 }}>§2 Rola platformy</div>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12.5, color: '#4A4638', lineHeight: 1.6, marginBottom: 14 }}>
          Usługodawca pełni funkcję pośrednika technicznego. Nie jest stroną umowy między Właścicielem Rośliny a Hostem i nie ponosi odpowiedzialności za jakość, terminowość ani sposób wykonania opieki, ani za szkody powstałe w związku z realizacją rezerwacji.
        </p>

        <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 13, color: colors.fern, marginBottom: 8 }}>§3 Płatności i prowizja</div>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12.5, color: '#4A4638', lineHeight: 1.6, marginBottom: 14 }}>
          Aplikacja pobiera prowizję w wysokości 10% wartości każdej zrealizowanej rezerwacji, potrącaną z wynagrodzenia Hosta. Funkcja Premium (porada AI) jest płatna jednorazowo w wysokości wskazanej w aplikacji. Płatności obsługuje Stripe.
        </p>

        <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 13, color: colors.fern, marginBottom: 8 }}>§4 Sztuczna inteligencja</div>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12.5, color: '#4A4638', lineHeight: 1.6, marginBottom: 14 }}>
          Aplikacja wykorzystuje AI do rozpoznawania gatunku rośliny, generowania porad pielęgnacyjnych oraz obsługi asystenta wsparcia klienta w zakładce "Wsparcie". Wygenerowane treści mają charakter orientacyjny. Wiadomości wysłane do asystenta wsparcia mogą zostać automatycznie oznaczone jako pilne i przekazane zespołowi Leafsit do dalszej, ręcznej obsługi.
        </p>

        <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 14, color: colors.ink, marginTop: 20, marginBottom: 8 }}>Polityka Prywatności</div>

        <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 13, color: colors.fern, marginBottom: 8 }}>§1 Jakie dane przetwarzamy</div>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12.5, color: '#4A4638', lineHeight: 1.6, marginBottom: 14 }}>
          Dane konta (email, imię, zdjęcie), dane profilu Hosta (cena, opis, telefon, adres, lokalizacja), dane roślin i rezerwacji, dane transakcyjne (przetwarzane przez Stripe — nie przechowujemy danych kart płatniczych), treść rozmów z asystentem wsparcia AI oraz dane techniczne.
        </p>

        <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 13, color: colors.fern, marginBottom: 8 }}>§2 Odbiorcy danych</div>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12.5, color: '#4A4638', lineHeight: 1.6, marginBottom: 14 }}>
          Supabase (baza danych), Vercel (hosting), Stripe (płatności), Pl@ntNet (rozpoznawanie roślin), Anthropic (porady AI i asystent wsparcia — podmiot z siedzibą poza UE, na podstawie standardowych klauzul umownych), Resend (wysyłka maili, w tym powiadomień o pilnych zgłoszeniach wsparcia).
        </p>

        <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 13, color: colors.fern, marginBottom: 8 }}>§3 Twoje prawa</div>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12.5, color: '#4A4638', lineHeight: 1.6, marginBottom: 14 }}>
          Masz prawo do dostępu, sprostowania, usunięcia, ograniczenia przetwarzania, przenoszenia danych oraz sprzeciwu wobec przetwarzania, a także wniesienia skargi do Prezesa UODO.
        </p>

        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: colors.muted, marginTop: 10 }}>
          Pełna, prawnicza wersja obu dokumentów dostępna jest na życzenie u Usługodawcy.
        </div>
      </div>
    </div>
  );
}

function CookieBanner() {
  const t = useT();
  const [visible, setVisible] = useState(() => {
    try { return !localStorage.getItem('leafsit_cookie_choice'); } catch (e) { return true; }
  });

  const choose = (value) => {
    try { localStorage.setItem('leafsit_cookie_choice', value); } catch (e) { /* ignore */ }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000,
      background: colors.ink, padding: '16px 20px', display: 'flex', flexWrap: 'wrap',
      alignItems: 'center', justifyContent: 'center', gap: 14
    }}>
      <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12.5, color: '#EDE7DA', maxWidth: 480, flex: '1 1 260px' }}>
        {t('cookie.text')}
      </div>
      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        <button onClick={() => choose('essential')} style={{
          padding: '9px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.12)', color: '#EDE7DA', border: 'none',
          fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 12, cursor: 'pointer'
        }}>{t('cookie.essential')}</button>
        <button onClick={() => choose('all')} style={{
          padding: '9px 14px', borderRadius: 10, background: colors.fern, color: '#fff', border: 'none',
          fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 12, cursor: 'pointer'
        }}>{t('cookie.acceptAll')}</button>
      </div>
    </div>
  );
}

const ONBOARDING_SLIDES = [
  { Icon: Sparkles, key: 'onb.1' },
  { Icon: Search, key: 'onb.2' },
  { Icon: Camera, key: 'onb.3' },
  { Icon: Wallet, key: 'onb.4' },
  { Icon: MessageCircle, key: 'onb.5' },
  { Icon: HelpCircle, key: 'onb.6' },
];

function OnboardingScreen({ onFinish }) {
  const t = useT();
  const [step, setStep] = useState(0);
  const slide = ONBOARDING_SLIDES[step];
  const isLast = step === ONBOARDING_SLIDES.length - 1;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 28 }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={onFinish} style={{
          background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
          fontSize: 12.5, color: colors.muted, fontWeight: 600
        }}>{t('onb.skip')}</button>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        {step === 0 ? (
          <img src="/logo-mark.png" alt="Leafsit" style={{ width: 96, height: 96, marginBottom: 28 }} />
        ) : (
          <div style={{
            width: 88, height: 88, borderRadius: 44, background: `linear-gradient(135deg, ${colors.fern}, ${colors.fernDark})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 28
          }}>
            <slide.Icon size={38} color="#fff" />
          </div>
        )}
        <h2 style={{ fontSize: 21, color: colors.ink, fontWeight: 600, margin: '0 0 12px' }}>{t(slide.key + '.title')}</h2>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#7A7261', lineHeight: 1.6, maxWidth: 280 }}>{t(slide.key + '.text')}</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 24 }}>
        {ONBOARDING_SLIDES.map((_, i) => (
          <div key={i} style={{
            width: i === step ? 20 : 6, height: 6, borderRadius: 3,
            background: i === step ? colors.fern : colors.line, transition: 'width 0.2s'
          }} />
        ))}
      </div>

      <button
        onClick={() => isLast ? onFinish() : setStep(s => s + 1)}
        style={{
          width: '100%', padding: 16, borderRadius: 16, background: colors.fern, color: '#fff',
          border: 'none', fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 15, cursor: 'pointer'
        }}
      >
        {isLast ? t('onb.start') : t('onb.next')}
      </button>
    </div>
  );
}

function AuthScreen({ referralCodeFromUrl }) {
  const t = useT();
  const { lang } = useLang();
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailConsent, setEmailConsent] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [referralInput, setReferralInput] = useState(referralCodeFromUrl || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);

  if (showTerms) {
    return <TermsScreen onBack={() => setShowTerms(false)} />;
  }

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setInfo(null);
    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    } else {
      const { data: signUpData, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
      });
      if (error) {
        setError(error.message);
      } else {
        if (signUpData?.user) {
          let referredBy = null;
          const trimmedCode = referralInput.trim();
          if (trimmedCode) {
            const { data: referrer } = await supabase.from('profiles').select('id').eq('referral_code', trimmedCode).maybeSingle();
            if (referrer && referrer.id !== signUpData.user.id) referredBy = referrer.id;
          }
          await supabase.from('profiles').upsert({
            id: signUpData.user.id,
            email_notifications: emailConsent,
            referral_code: generateReferralCode(),
            referred_by: referredBy,
            terms_accepted_at: new Date().toISOString(),
            language: lang,
          });
        }
        setInfo(t('auth.accountCreated'));
      }
    }
    setLoading(false);
  };

  const canSubmit = mode === 'login' ? (email && password) : (name && email && password && termsAccepted);

  return (
    <div style={{ flex: 1, padding: 28, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div style={{ marginBottom: 24 }}>
        <LanguagePicker />
      </div>

      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <img src="/logo-mark.png" alt="Leafsit" style={{
          width: 72, height: 72, margin: '0 auto 14px', display: 'block'
        }} />
        <h1 style={{ fontSize: 24, color: colors.ink, fontWeight: 600, margin: 0 }}>Leafsit</h1>
        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: colors.muted, marginTop: 4 }}>
          {mode === 'login' ? t('auth.loginSubtitle') : t('auth.signupSubtitle')}
        </div>
      </div>

      {mode === 'signup' && (
        <TextField icon={User} placeholder={t('auth.namePlaceholder')} value={name} onChange={e => setName(e.target.value)} />
      )}
      {mode === 'signup' && (
        <TextField placeholder={t('auth.referralPlaceholder')} value={referralInput} onChange={e => setReferralInput(e.target.value)} />
      )}
      {mode === 'signup' && referralCodeFromUrl && (
        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11.5, color: colors.fern, marginTop: -6, marginBottom: 12 }}>
          {t('auth.referralDetected')}
        </div>
      )}
      {mode === 'signup' && (
        <div onClick={() => setEmailConsent(c => !c)} style={{
          display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, cursor: 'pointer'
        }}>
          <div style={{
            width: 20, height: 20, borderRadius: 6, flexShrink: 0,
            border: `2px solid ${emailConsent ? colors.fern : colors.line}`,
            background: emailConsent ? colors.fern : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            {emailConsent && <Check size={13} color="#fff" strokeWidth={3} />}
          </div>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12.5, color: '#7A7261' }}>
            {t('auth.emailConsent')}
          </span>
        </div>
      )}
      {mode === 'signup' && (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 16, cursor: 'pointer' }} onClick={() => setTermsAccepted(a => !a)}>
          <div style={{
            width: 20, height: 20, borderRadius: 6, flexShrink: 0, marginTop: 1,
            border: `2px solid ${termsAccepted ? colors.fern : colors.line}`,
            background: termsAccepted ? colors.fern : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            {termsAccepted && <Check size={13} color="#fff" strokeWidth={3} />}
          </div>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12.5, color: '#7A7261' }}>
            {t('auth.acceptPrefix')}{' '}
            <span onClick={(e) => { e.stopPropagation(); setShowTerms(true); }} style={{ color: colors.clay, fontWeight: 700, textDecoration: 'underline' }}>
              {t('auth.termsLink')}
            </span>{t('auth.acceptSuffix') ? ' ' + t('auth.acceptSuffix') : ''}
          </span>
        </div>
      )}
      <TextField icon={Mail} type="email" placeholder={t('auth.emailPlaceholder')} value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && canSubmit) handleSubmit(); }} />
      <TextField icon={Lock} type="password" placeholder={t('auth.passwordPlaceholder')} value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && canSubmit) handleSubmit(); }} />

      {error && <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12.5, color: colors.clay, marginBottom: 12 }}>{error}</div>}
      {info && <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12.5, color: colors.fern, marginBottom: 12 }}>{info}</div>}

      <button onClick={handleSubmit} disabled={loading || !canSubmit} style={{
        width: '100%', padding: 16, borderRadius: 16, background: colors.fern, color: '#fff',
        border: 'none', fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 15,
        cursor: loading ? 'default' : 'pointer', opacity: (loading || !canSubmit) ? 0.6 : 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4, marginBottom: 16
      }}>
        {loading && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
        {mode === 'login' ? t('auth.loginButton') : t('auth.signupButton')}
      </button>

      <div style={{ textAlign: 'center', fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#7A7261' }}>
        {mode === 'login' ? t('auth.noAccount') : t('auth.hasAccount')}{' '}
        <span
          onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(null); setInfo(null); }}
          style={{ color: colors.clay, fontWeight: 700, cursor: 'pointer' }}
        >
          {mode === 'login' ? t('auth.signupButton') : t('auth.loginButton')}
        </span>
      </div>
    </div>
  );
}

// Ostatnio ogladani hostowie - trzymane w pamieci przegladarki (localStorage),
// bez zadnej nowej tabeli w bazie danych. Max 8 pozycji, najnowsze pierwsze.
function recordHostView(hostId) {
  try {
    const raw = localStorage.getItem('leafsit_recent_hosts');
    let ids = raw ? JSON.parse(raw) : [];
    ids = ids.filter(id => id !== hostId);
    ids.unshift(hostId);
    ids = ids.slice(0, 8);
    localStorage.setItem('leafsit_recent_hosts', JSON.stringify(ids));
  } catch (e) { /* localStorage moze byc niedostepne - nic sie nie stanie */ }
}

function getRecentHostIds() {
  try {
    const raw = localStorage.getItem('leafsit_recent_hosts');
    return raw ? JSON.parse(raw) : [];
  } catch (e) { return []; }
}

function RecentlyViewedRow({ onSelectHost }) {
  const t = useT();
  const [recentHosts, setRecentHosts] = useState([]);

  useEffect(() => {
    const ids = getRecentHostIds();
    if (ids.length === 0) return;
    (async () => {
      const { data } = await supabase.from('hosts').select('*').in('id', ids);
      if (data) {
        // Zachowujemy kolejnosc "najnowiej ogladany pierwszy"
        const byId = {};
        data.forEach(h => { byId[h.id] = h; });
        setRecentHosts(ids.map(id => byId[id]).filter(Boolean));
      }
    })();
  }, []);

  if (recentHosts.length === 0) return null;

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 700, color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>
        {t('home.recentlyViewed')}
      </div>
      <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
        {recentHosts.map(h => (
          <div
            key={h.id}
            onClick={() => onSelectHost(h)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, cursor: 'pointer',
              background: colors.card, border: `1px solid ${colors.line}`, borderRadius: 999,
              padding: '6px 14px 6px 6px'
            }}
          >
            <Avatar photoUrl={h.photo_url} name={h.name} size={30} radius={15} />
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12.5, fontWeight: 600, color: colors.ink, whiteSpace: 'nowrap' }}>{h.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function HomeScreen({ onSelectHost, userId }) {
  const t = useT();
  const isDesktop = useIsDesktop();
  const handleSelectHost = (h) => {
    recordHostView(h.id);
    onSelectHost(h);
  };
  const [hosts, setHosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [myCoords, setMyCoords] = useState(null);
  const [locStatus, setLocStatus] = useState('idle');
  const [activeFilter, setActiveFilter] = useState(null);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [showFilters, setShowFilters] = useState(false);
  // Rosliny uzytkownika z ZNANYM wymaganiem nasłonecznienia (tylko te z wykupionym
  // przewodnikiem Premium maja to pole wypelnione) - do inteligentnego dopasowania hostow.
  const [plantsWithSunlight, setPlantsWithSunlight] = useState([]);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('plants')
        .select('name, sunlight')
        .eq('user_id', userId)
        .not('sunlight', 'is', null);
      if (!cancelled && data) setPlantsWithSunlight(data);
    })();
    return () => { cancelled = true; };
  }, [userId]);

  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [filterQuantity, setFilterQuantity] = useState(1);
  const [bookedQuantities, setBookedQuantities] = useState({});
  const [viewMode, setViewMode] = useState('list');

  useEffect(() => {
    let cancelled = false;
    async function loadHosts() {
      setLoading(true);
      const { data, error } = await supabase
        .from('hosts')
        .select('*')
        .order('created_at', { ascending: false });
      if (!cancelled) {
        if (!error && data) setHosts(data);
        setLoading(false);
      }
    }
    loadHosts();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) { setLocStatus('denied'); return; }
    setLocStatus('loading');
    navigator.geolocation.getCurrentPosition(
      (pos) => { setMyCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude }); setLocStatus('granted'); },
      () => setLocStatus('denied'),
      { timeout: 8000 }
    );
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadFavorites() {
      if (!userId) return;
      const { data, error } = await supabase.from('favorites').select('host_id').eq('user_id', userId);
      if (!cancelled && !error && data) setFavoriteIds(new Set(data.map(f => f.host_id)));
    }
    loadFavorites();
    return () => { cancelled = true; };
  }, [userId]);

  useEffect(() => {
    let cancelled = false;
    async function loadOverlapping() {
      if (!filterStartDate || !filterEndDate) { setBookedQuantities({}); return; }
      const { data, error } = await supabase
        .from('bookings')
        .select('host_id, quantity')
        .eq('status', 'accepted')
        .lte('start_date', filterEndDate)
        .gte('end_date', filterStartDate);
      if (cancelled || error || !data) return;
      const map = {};
      data.forEach(b => { map[b.host_id] = (map[b.host_id] || 0) + (b.quantity || 1); });
      setBookedQuantities(map);
    }
    loadOverlapping();
    return () => { cancelled = true; };
  }, [filterStartDate, filterEndDate]);

  const toggleFavorite = async (hostId, e) => {
    e.stopPropagation();
    const isFav = favoriteIds.has(hostId);
    setFavoriteIds(prev => {
      const next = new Set(prev);
      if (isFav) next.delete(hostId); else next.add(hostId);
      return next;
    });
    if (isFav) {
      await supabase.from('favorites').delete().eq('user_id', userId).eq('host_id', hostId);
    } else {
      await supabase.from('favorites').insert([{ user_id: userId, host_id: hostId }]);
    }
  };

  const toggleFilter = (name) => {
    if (name === 'near' && !myCoords) return;
    setActiveFilter(prev => prev === name ? null : name);
  };

  const q = query.trim().toLowerCase();
  let list = q
    ? hosts.filter(h =>
        (h.name || '').toLowerCase().includes(q) ||
        (h.location || '').toLowerCase().includes(q)
      )
    : hosts;

  list = list.map(h => {
    const hasCoords = myCoords && h.latitude != null && h.longitude != null;
    const dist = hasCoords ? distanceKm(myCoords.lat, myCoords.lon, h.latitude, h.longitude) : null;
    return { ...h, __dist: dist };
  });

  if (activeFilter === 'available') {
    list = list.filter(h => (h.plants_capacity ?? 0) > 0);
  }

  if (activeFilter === 'favorites') {
    list = list.filter(h => favoriteIds.has(h.id));
  }

  if (activeFilter === 'matched') {
    list = list.filter(h => plantsWithSunlight.some(p => p.sunlight === h.sunlight));
  }

  if (priceMin !== '') {
    list = list.filter(h => h.price >= Number(priceMin));
  }
  if (priceMax !== '') {
    list = list.filter(h => h.price <= Number(priceMax));
  }

  if (filterStartDate && filterEndDate) {
    list = list.filter(h => ((h.plants_capacity || 0) - (bookedQuantities[h.id] || 0)) >= filterQuantity);
  }

  if (activeFilter === 'top') {
    list = [...list].sort((a, b) => (b.rating ?? -1) - (a.rating ?? -1));
  } else if (activeFilter === 'near' || myCoords) {
    list = [...list].sort((a, b) => {
      if (a.__dist == null && b.__dist == null) return 0;
      if (a.__dist == null) return 1;
      if (b.__dist == null) return -1;
      return a.__dist - b.__dist;
    });
  }

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '20px 20px 0' }}>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 11, color: colors.clay, fontWeight: 700, letterSpacing: 1.5, fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 5 }}>
          {locStatus === 'granted' ? <><Navigation size={11} /> {t('home.yourArea')}</> : t('home.defaultArea')}
        </div>
        <h1 style={{ fontSize: 28, color: colors.ink, margin: '4px 0 2px', fontWeight: 600 }}>{t('home.titleLine1')}<br/>{t('home.titleLine2')}</h1>
      </div>

      {locStatus === 'denied' && (
        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11.5, color: colors.muted, marginBottom: 14 }}>
          {t('home.locationDenied')}
        </div>
      )}

      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, background: colors.card,
        border: `1.5px solid ${colors.line}`, borderRadius: 16, padding: '12px 16px', marginBottom: 20
      }}>
        <Search size={18} color="#A9A08B" />
        <input
          type="text"
          placeholder={t('home.searchPlaceholder')}
          value={query}
          onChange={e => setQuery(e.target.value)}
          style={{ border: 'none', outline: 'none', flex: 1, minWidth: 0, fontFamily: 'Inter, sans-serif', fontSize: 14, background: 'transparent', color: colors.ink }}
        />
        {query && (
          <button onClick={() => setQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
            <X size={16} color="#A9A08B" />
          </button>
        )}
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 12, flexWrap: isDesktop ? 'wrap' : 'nowrap', overflowX: isDesktop ? 'visible' : 'auto', minWidth: 0 }}>
        <Pill tone="fern" active={activeFilter === 'near'} onClick={() => toggleFilter('near')}>{t('home.filterNear')}</Pill>
        <Pill tone="gold" active={activeFilter === 'top'} onClick={() => toggleFilter('top')}>{t('home.filterTop')}</Pill>
        <Pill tone="clay" active={activeFilter === 'available'} onClick={() => toggleFilter('available')}>{t('home.filterAvailable')}</Pill>
        <Pill tone="gold" active={activeFilter === 'favorites'} onClick={() => toggleFilter('favorites')}>❤️ {t('home.filterFavorites')}</Pill>
        {plantsWithSunlight.length > 0 && (
          <Pill tone="fern" active={activeFilter === 'matched'} onClick={() => toggleFilter('matched')}>🌿 {t('home.filterMatched')}</Pill>
        )}
        <Pill tone="gray" active={showFilters || priceMin !== '' || priceMax !== ''} onClick={() => setShowFilters(s => !s)}>{t('home.filterPrice')}</Pill>
        <Pill tone="gray" active={showDateFilter || (filterStartDate && filterEndDate)} onClick={() => setShowDateFilter(s => !s)}>{t('home.filterDates')}</Pill>
        <Pill tone="fern" active={viewMode === 'map'} onClick={() => setViewMode(v => v === 'map' ? 'list' : 'map')}>
          {viewMode === 'map' ? <List size={12} /> : <MapIcon size={12} />} {viewMode === 'map' ? t('home.viewList') : t('home.viewMap')}
        </Pill>
      </div>

      {showFilters && (
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 20, background: colors.card, border: `1.5px solid ${colors.line}`, borderRadius: 14, padding: 12 }}>
          <input type="number" placeholder={t('home.priceFrom')} value={priceMin} onChange={e => setPriceMin(e.target.value)} style={{
            flex: 1, border: `1.5px solid ${colors.line}`, borderRadius: 10, padding: 8, fontFamily: 'Inter, sans-serif', fontSize: 13, color: colors.ink, boxSizing: 'border-box'
          }} />
          <span style={{ color: colors.muted, fontFamily: 'Inter, sans-serif' }}>—</span>
          <input type="number" placeholder={t('home.priceTo')} value={priceMax} onChange={e => setPriceMax(e.target.value)} style={{
            flex: 1, border: `1.5px solid ${colors.line}`, borderRadius: 10, padding: 8, fontFamily: 'Inter, sans-serif', fontSize: 13, color: colors.ink, boxSizing: 'border-box'
          }} />
          {(priceMin !== '' || priceMax !== '') && (
            <button onClick={() => { setPriceMin(''); setPriceMax(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex' }}>
              <X size={16} color="#A9A08B" />
            </button>
          )}
        </div>
      )}

      {showDateFilter && (
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8, background: colors.card, border: `1.5px solid ${colors.line}`, borderRadius: 14, padding: 12 }}>
          <input type="date" value={filterStartDate} onChange={e => setFilterStartDate(e.target.value)} style={{
            flex: 1, border: `1.5px solid ${colors.line}`, borderRadius: 10, padding: 8, fontFamily: 'Inter, sans-serif', fontSize: 12.5, color: colors.ink, boxSizing: 'border-box'
          }} />
          <span style={{ color: colors.muted, fontFamily: 'Inter, sans-serif' }}>—</span>
          <input type="date" value={filterEndDate} onChange={e => setFilterEndDate(e.target.value)} style={{
            flex: 1, border: `1.5px solid ${colors.line}`, borderRadius: 10, padding: 8, fontFamily: 'Inter, sans-serif', fontSize: 12.5, color: colors.ink, boxSizing: 'border-box'
          }} />
          {(filterStartDate || filterEndDate) && (
            <button onClick={() => { setFilterStartDate(''); setFilterEndDate(''); setFilterQuantity(1); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex' }}>
              <X size={16} color="#A9A08B" />
            </button>
          )}
        </div>
      )}
      {showDateFilter && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#7A7261' }}>{t('home.howManyPlants')}</span>
          <button onClick={() => setFilterQuantity(q => Math.max(1, q - 1))} style={{
            width: 28, height: 28, borderRadius: 8, background: colors.clayLight, border: 'none', fontSize: 15, fontWeight: 700, color: colors.ink, cursor: 'pointer'
          }}>−</button>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 700, color: colors.ink, minWidth: 16, textAlign: 'center' }}>{filterQuantity}</span>
          <button onClick={() => setFilterQuantity(q => Math.min(20, q + 1))} style={{
            width: 28, height: 28, borderRadius: 8, background: colors.fern, border: 'none', fontSize: 15, fontWeight: 700, color: '#fff', cursor: 'pointer'
          }}>+</button>
        </div>
      )}

      <RecentlyViewedRow onSelectHost={handleSelectHost} />

      <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 700, color: colors.ink, marginBottom: 10 }}>
        {loading ? t('home.loading') : t('home.hostsFound', { n: list.length, suffix: q ? t('home.suffixMatching') : t('home.suffixNearby') })}
      </div>

      {!loading && list.length === 0 && (
        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: colors.muted }}>
          {q ? t('home.noHostsQuery', { q: query }) : t('home.noHostsCriteria')}
        </div>
      )}

      {viewMode === 'map' && (
        <div style={{ height: 400, borderRadius: 18, overflow: 'hidden', marginBottom: 20, border: `1px solid ${colors.line}` }}>
          <MapContainer
            center={myCoords ? [myCoords.lat, myCoords.lon] : [52.208, 21.038]}
            zoom={12}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; OpenStreetMap'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {list.filter(h => h.latitude != null && h.longitude != null).map(h => (
              <Marker key={h.id} position={[h.latitude, h.longitude]} icon={hostMapIcon}>
                <Popup>
                  <div onClick={() => handleSelectHost(h)} style={{ cursor: 'pointer', fontFamily: 'sans-serif' }}>
                    <b>{h.name}</b><br />
                    {h.price} zł{t('home.perPlantPerDay')}<br />
                    <span style={{ color: '#3A5A40', textDecoration: 'underline' }}>Zobacz profil</span>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      )}

      {viewMode === 'list' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 12, minWidth: 0,
        }}>
          {list.map((h) => {
            const si = sunlightInfo(h.sunlight);
            const SIcon = si.Icon;
            return (
              <div key={h.id} onClick={() => handleSelectHost(h)} style={{
                background: colors.card, borderRadius: 18, padding: 16, minWidth: 0,
                border: `1px solid ${colors.line}`, cursor: 'pointer'
              }}>
                <div style={{ display: 'flex', gap: 12, minWidth: 0 }}>
                  <div style={{ position: 'relative' }}>
                    <Avatar photoUrl={h.photo_url} name={h.name} size={56} radius={14} />
                    <button onClick={(e) => toggleFavorite(h.id, e)} style={{
                      position: 'absolute', top: -6, left: -6, width: 22, height: 22, borderRadius: 11,
                      background: colors.card, border: `1px solid ${colors.line}`, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0
                    }}>
                      <Heart size={11} fill={favoriteIds.has(h.id) ? colors.clay : 'none'} color={colors.clay} />
                    </button>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 6, minWidth: 0 }}>
                      <span style={{ fontWeight: 600, color: colors.ink, fontSize: 16, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.name}</span>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, color: colors.clay, fontSize: 14, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 90 }}>{h.price} zł</span>
                    </div>
                    <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 10.5, color: colors.muted, textAlign: 'right', marginTop: 1 }}>{t('home.perPlantPerDay')}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4, flexWrap: 'wrap', fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#7A7261' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 3, whiteSpace: 'nowrap' }}><Star size={12} fill={colors.gold} color={colors.gold} /> {h.rating ?? '—'} ({h.reviews ?? 0})</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 3, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        <MapPin size={12} style={{ flexShrink: 0 }} /> {h.__dist != null ? `${h.__dist < 1 ? Math.round(h.__dist * 1000) + ' m' : h.__dist.toFixed(1) + ' km'}` : h.location}
                      </span>
                    </div>
                    <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'Inter, sans-serif', fontSize: 12, color: colors.fern, fontWeight: 600 }}>
                      <SIcon size={13} color={si.tone} /> {t(sunlightKey(h.sunlight))} · {t('home.acceptsPlants', { n: h.plants_capacity })}
                    </div>
                    {responseTimeKey(h.avg_response_minutes) && (
                      <div style={{ marginTop: 4, fontFamily: 'Inter, sans-serif', fontSize: 11, color: colors.muted }}>
                        {t(responseTimeKey(h.avg_response_minutes))}
                      </div>
                    )}
                    {plantsWithSunlight.find(p => p.sunlight === h.sunlight) && (
                      <div style={{
                        marginTop: 4, display: 'inline-flex', alignItems: 'center', gap: 4,
                        background: colors.clayLight, color: colors.fernDark, fontFamily: 'Inter, sans-serif',
                        fontSize: 10.5, fontWeight: 700, padding: '3px 9px', borderRadius: 999
                      }}>
                        🌿 {t('home.matchesPlant', { plant: plantsWithSunlight.find(p => p.sunlight === h.sunlight).name })}
                      </div>
                    )}
                    <div style={{ marginTop: 6 }}>
                      <HostBadges host={h} size="small" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function HostDetailScreen({ host, userId, onBack, onBook, onMessage }) {
  const t = useT();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [watching, setWatching] = useState(false);
  const [watchLoading, setWatchLoading] = useState(false);

  useEffect(() => {
    if (!userId || !host) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('host_watches')
        .select('id')
        .eq('user_id', userId)
        .eq('host_id', host.id)
        .maybeSingle();
      if (!cancelled) setWatching(!!data);
    })();
    return () => { cancelled = true; };
  }, [userId, host?.id]);

  const toggleWatch = async () => {
    if (!userId || !host) return;
    setWatchLoading(true);
    if (watching) {
      await supabase.from('host_watches').delete().eq('user_id', userId).eq('host_id', host.id);
      setWatching(false);
    } else {
      await supabase.from('host_watches').upsert({ user_id: userId, host_id: host.id });
      setWatching(true);
    }
    setWatchLoading(false);
  };

  useEffect(() => {
    let cancelled = false;
    async function loadReviews() {
      if (!host) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('host_id', host.id)
        .eq('reviewer_role', 'renter')
        .order('created_at', { ascending: false });
      if (!cancelled) {
        if (!error && data) setReviews(data);
        setLoading(false);
      }
    }
    loadReviews();
    return () => { cancelled = true; };
  }, [host]);

  if (!host) return null;

  const si = sunlightInfo(host.sunlight);
  const SIcon = si.Icon;

  return (
    <div style={{ flex: 1, overflow: 'auto' }}>
      <div style={{
        height: 180, background: `linear-gradient(160deg, ${colors.fern}, ${colors.fernDark})`,
        position: 'relative', display: 'flex', alignItems: 'flex-end', padding: 20
      }}>
        <button onClick={onBack} style={{
          position: 'absolute', top: 16, left: 16, width: 34, height: 34, borderRadius: 17,
          background: 'rgba(255,255,255,0.25)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
        }}><ArrowLeft size={18} color="#fff" /></button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {host.photo_url ? (
            <img src={host.photo_url} alt={host.name} style={{ width: 64, height: 64, borderRadius: 16, objectFit: 'cover', border: '3px solid rgba(255,255,255,0.4)' }} />
          ) : (
            <div style={{ width: 64, height: 64, borderRadius: 16, background: colors.gold, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700, color: '#fff', border: '3px solid rgba(255,255,255,0.4)' }}>{host.name.charAt(0)}</div>
          )}
          <div>
            <h2 style={{ color: '#fff', margin: 0, fontSize: 22, fontWeight: 600 }}>{host.name}</h2>
            <div style={{ color: 'rgba(255,255,255,0.85)', fontFamily: 'Inter, sans-serif', fontSize: 13, marginBottom: 6 }}>{host.location}</div>
            <HostBadges host={host} size="large" />
          </div>
        </div>
      </div>

      <div style={{ padding: 20 }}>
        <div style={{ display: 'flex', gap: 20, marginBottom: 20, fontFamily: 'Inter, sans-serif' }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: colors.ink, display: 'flex', alignItems: 'center', gap: 4 }}><Star size={16} fill={colors.gold} color={colors.gold}/> {host.rating ?? '—'}</div>
            <div style={{ fontSize: 11, color: colors.muted }}>{t('host.reviewsCount', { n: host.reviews ?? 0 })}</div>
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: colors.ink }}>{host.plants_capacity}</div>
            <div style={{ fontSize: 11, color: colors.muted }}>{t('host.freeSpots')}</div>
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: colors.ink }}>{host.price} zł</div>
            <div style={{ fontSize: 11, color: colors.muted }}>{t('host.perPlantDay')}</div>
          </div>
        </div>

        {responseTimeKey(host.avg_response_minutes) && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 16,
            background: colors.clayLight, color: colors.fernDark, fontFamily: 'Inter, sans-serif',
            fontSize: 12, fontWeight: 600, padding: '6px 12px', borderRadius: 999
          }}>
            {t(responseTimeKey(host.avg_response_minutes))}
          </div>
        )}

        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#4A4638', lineHeight: 1.6, marginBottom: 20 }}>
          {host.description}
        </p>

        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          <Pill tone="gold"><SIcon size={13} color="#fff" /> {t(sunlightKey(host.sunlight))}</Pill>
        </div>

        {host.space_photos && host.space_photos.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{
              fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 700, color: colors.muted,
              textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8
            }}>
              {t('host.spacePhotosTitle')}
            </div>
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
              {host.space_photos.map((src, idx) => (
                <img
                  key={idx}
                  src={src}
                  alt=""
                  style={{ width: 110, height: 110, objectFit: 'cover', borderRadius: 14, flexShrink: 0, border: `1px solid ${colors.line}` }}
                />
              ))}
            </div>
          </div>
        )}

        <div style={{
          background: colors.clayLight, borderRadius: 14, padding: 14, marginBottom: 24,
          fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#5A5445', lineHeight: 1.5
        }}>
          {t('host.privacyNote')}
        </div>

        <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
          <button onClick={onMessage} style={{
            padding: 16, borderRadius: 16, background: colors.clayLight, color: colors.ink,
            border: 'none', fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 15, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
          }}><MessageCircle size={17} /></button>
          {userId && (
            <button onClick={toggleWatch} disabled={watchLoading} title={t(watching ? 'host.watchingOn' : 'host.watchOff')} style={{
              padding: 16, borderRadius: 16, background: watching ? colors.gold : colors.clayLight,
              color: watching ? '#fff' : colors.ink, border: 'none', cursor: watchLoading ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: watchLoading ? 0.6 : 1
            }}><Bell size={17} fill={watching ? '#fff' : 'none'} /></button>
          )}
          <button onClick={onBook} style={{
            flex: 1, padding: 16, borderRadius: 16, background: colors.clay, color: '#fff',
            border: 'none', fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 15, cursor: 'pointer'
          }}>{t('host.bookButton')}</button>
        </div>

        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 700, color: colors.ink, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>{t('host.reviewsHeader')}</div>

        {loading && (
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: colors.muted }}>{t('host.loading')}</div>
        )}

        {!loading && reviews.length === 0 && (
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: colors.muted }}>{t('host.noReviews')}</div>
        )}

        {!loading && reviews.map(r => (
          <div key={r.id} style={{ background: colors.clayLight, borderRadius: 16, padding: 16, marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <div style={{ display: 'flex', gap: 2 }}>
                {[1,2,3,4,5].map(n => (
                  <Star key={n} size={13} fill={n <= r.rating ? colors.gold : 'none'} color={colors.gold} />
                ))}
              </div>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 10.5, color: colors.muted }}>{formatDate(r.created_at)}</span>
            </div>
            {r.comment && (
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#5A5445', margin: '0 0 6px', fontStyle: 'italic' }}>{r.comment}</p>
            )}
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#7A7261', fontWeight: 600 }}>— {r.renter_name || t('host.anonymousGuest')}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Kalendarz dla WYNAJMUJACEGO - pokazuje realna dostepnosc hosta (na podstawie
// zaakceptowanych rezerwacji i recznych blokad hosta) i pozwala wybrac zakres dat klikaniem.
function BookingCalendar({ hostId, capacity, startDate, endDate, onSelectStart, onSelectEnd }) {
  const t = useT();
  const [viewMonth, setViewMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [blockedDates, setBlockedDates] = useState(new Set());
  const [acceptedBookings, setAcceptedBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rangeError, setRangeError] = useState(false);

  useEffect(() => {
    if (!hostId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [blockedRes, bookingsRes] = await Promise.all([
        supabase.from('host_blocked_dates').select('date').eq('host_id', hostId),
        supabase.from('bookings').select('start_date, end_date, quantity').eq('host_id', hostId).eq('status', 'accepted'),
      ]);
      if (!cancelled) {
        setBlockedDates(new Set((blockedRes.data || []).map(d => d.date)));
        setAcceptedBookings(bookingsRes.data || []);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [hostId]);

  const occupiedOn = (dateStr) => acceptedBookings.reduce((sum, b) => {
    if (dateStr >= b.start_date && dateStr <= b.end_date) return sum + (b.quantity || 1);
    return sum;
  }, 0);
  const isDayUnavailable = (dateStr) => blockedDates.has(dateStr) || (capacity != null && occupiedOn(dateStr) >= capacity);

  const handleDayClick = (dateStr) => {
    setRangeError(false);
    if (!startDate || (startDate && endDate)) {
      onSelectStart(dateStr);
      onSelectEnd('');
      return;
    }
    if (dateStr < startDate) {
      onSelectStart(dateStr);
      return;
    }
    // Sprawdzamy, czy w calym wybranym zakresie nie ma dnia niedostepnego.
    let cursor = new Date(startDate);
    const endD = new Date(dateStr);
    let hasBlocked = false;
    while (cursor <= endD) {
      const cStr = cursor.toISOString().slice(0, 10);
      if (isDayUnavailable(cStr)) { hasBlocked = true; break; }
      cursor.setDate(cursor.getDate() + 1);
    }
    if (hasBlocked) {
      setRangeError(true);
      onSelectStart(dateStr);
      onSelectEnd('');
      return;
    }
    onSelectEnd(dateStr);
  };

  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startWeekday = (firstDay.getDay() + 6) % 7;
  const todayStr = new Date().toISOString().slice(0, 10);

  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    cells.push({
      day, dateStr,
      isPast: dateStr < todayStr,
      isUnavailable: isDayUnavailable(dateStr),
      isSelected: (startDate && dateStr === startDate) || (endDate && dateStr === endDate) ||
        (startDate && endDate && dateStr > startDate && dateStr < endDate),
    });
  }

  const monthKeys = ['calendar.jan', 'calendar.feb', 'calendar.mar', 'calendar.apr', 'calendar.may', 'calendar.jun', 'calendar.jul', 'calendar.aug', 'calendar.sep', 'calendar.oct', 'calendar.nov', 'calendar.dec'];
  const weekdayKeys = ['calendar.mon', 'calendar.tue', 'calendar.wed', 'calendar.thu', 'calendar.fri', 'calendar.sat', 'calendar.sun'];

  return (
    <div style={{ background: colors.card, border: `1px solid ${colors.line}`, borderRadius: 16, padding: 14, marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <button onClick={() => setViewMonth(new Date(year, month - 1, 1))} style={{
          background: colors.clayLight, border: 'none', borderRadius: 8, width: 26, height: 26, cursor: 'pointer', fontSize: 14, color: colors.ink
        }}>‹</button>
        <div style={{ fontFamily: 'Cambria, Georgia, serif', fontWeight: 600, fontSize: 13.5, color: colors.ink }}>
          {t(monthKeys[month])} {year}
        </div>
        <button onClick={() => setViewMonth(new Date(year, month + 1, 1))} style={{
          background: colors.clayLight, border: 'none', borderRadius: 8, width: 26, height: 26, cursor: 'pointer', fontSize: 14, color: colors.ink
        }}>›</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3, marginBottom: 3 }}>
        {weekdayKeys.map(k => (
          <div key={k} style={{ textAlign: 'center', fontFamily: 'Inter, sans-serif', fontSize: 9.5, fontWeight: 700, color: colors.muted }}>{t(k)}</div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3, marginBottom: 8 }}>
        {cells.map((c, idx) => c === null ? <div key={'empty' + idx} /> : (
          <button
            key={c.dateStr}
            disabled={c.isPast || c.isUnavailable || loading}
            onClick={() => handleDayClick(c.dateStr)}
            style={{
              aspectRatio: '1', borderRadius: 7, border: 'none', fontFamily: 'Inter, sans-serif', fontSize: 11.5,
              cursor: (c.isPast || c.isUnavailable) ? 'default' : 'pointer',
              background: c.isPast ? colors.line
                : c.isUnavailable ? colors.gold
                : c.isSelected ? colors.fern
                : colors.clayLight,
              color: c.isPast ? colors.muted
                : (c.isUnavailable || c.isSelected) ? '#fff'
                : colors.ink,
              opacity: c.isPast ? 0.5 : 1,
            }}
          >{c.day}</button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', fontFamily: 'Inter, sans-serif', fontSize: 10.5, color: colors.muted }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 10, height: 10, borderRadius: 3, background: colors.clayLight, display: 'inline-block' }} /> {t('calendar.legendFree')}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 10, height: 10, borderRadius: 3, background: colors.gold, display: 'inline-block' }} /> {t('calendar.legendUnavailable')}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 10, height: 10, borderRadius: 3, background: colors.fern, display: 'inline-block' }} /> {t('calendar.legendSelected')}
        </span>
      </div>

      {rangeError && (
        <div style={{ marginTop: 8, fontFamily: 'Inter, sans-serif', fontSize: 11.5, color: colors.clay, fontWeight: 600 }}>
          {t('calendar.rangeBlocked')}
        </div>
      )}
    </div>
  );
}

function BookingForm({ host, userId, userEmail, userName, onCancel, onBooked }) {
  const t = useT();
  const [plants, setPlants] = useState([]);
  const [plantsLoading, setPlantsLoading] = useState(true);
  const [selectedPlantId, setSelectedPlantId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [renterPhone, setRenterPhone] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function loadPlants() {
      setPlantsLoading(true);
      const { data, error } = await supabase
        .from('plants')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (!cancelled) {
        if (!error && data) {
          setPlants(data);
          if (data.length > 0) setSelectedPlantId(data[0].id);
        }
        setPlantsLoading(false);
      }
    }
    loadPlants();
    return () => { cancelled = true; };
  }, [userId]);

  const selectedPlant = plants.find(p => p.id === selectedPlantId);
  const maxQuantity = selectedPlant?.quantity || 1;
  const canSave = selectedPlantId && startDate && endDate;
  const estimatedDays = (startDate && endDate) ? daysBetween(startDate, endDate) : null;
  const estimatedTotal = estimatedDays ? (estimatedDays * host.price * quantity) : null;

  useEffect(() => {
    setQuantity(1);
  }, [selectedPlantId]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    // Sprawdzamy zarowno reczne blokady hosta, jak i realna zajetosc (zaakceptowane rezerwacje).
    const [blockedRes, acceptedRes] = await Promise.all([
      supabase.from('host_blocked_dates').select('date').eq('host_id', host.id).gte('date', startDate).lte('date', endDate),
      supabase.from('bookings').select('start_date, end_date, quantity').eq('host_id', host.id).eq('status', 'accepted'),
    ]);

    if (blockedRes.data && blockedRes.data.length > 0) {
      setSaving(false);
      setError(t('booking.datesBlocked'));
      return;
    }

    const capacity = host.plants_capacity;
    if (capacity != null && acceptedRes.data) {
      let cursor = new Date(startDate);
      const endD = new Date(endDate);
      let exceeded = false;
      while (cursor <= endD) {
        const cStr = cursor.toISOString().slice(0, 10);
        const occupied = acceptedRes.data.reduce((sum, b) => (cStr >= b.start_date && cStr <= b.end_date) ? sum + (b.quantity || 1) : sum, 0);
        if (occupied + quantity > capacity) { exceeded = true; break; }
        cursor.setDate(cursor.getDate() + 1);
      }
      if (exceeded) {
        setSaving(false);
        setError(t('booking.datesBlocked'));
        return;
      }
    }

    const { data, error } = await supabase.from('bookings').insert([{
      host_id: host.id,
      renter_user_id: userId,
      renter_email: userEmail,
      renter_name: userName || null,
      renter_phone: renterPhone || null,
      plant_id: selectedPlantId,
      plant_name: selectedPlant ? selectedPlant.name : '',
      quantity: quantity,
      start_date: startDate,
      end_date: endDate,
      status: 'pending',
      payment_status: 'unpaid',
    }]).select().single();
    setSaving(false);
    if (error) {
      setError(t('booking.sendFailed') + error.message);
    } else {
      if (host.user_id) {
        const qtyLabel = quantity > 1 ? ` (×${quantity} szt.)` : '';
        await createNotification(
          host.user_id,
          'booking_request',
          { name: userName || userEmail, plant: selectedPlant ? selectedPlant.name : '', qty: quantity },
          data?.id || null,
          host.email || null
        );
      }
      setDone(true);
    }
  };

  if (done) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, padding: 20 }}>
        <div style={{ width: 64, height: 64, borderRadius: 32, background: colors.gold, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Clock size={30} color="#fff" />
        </div>
        <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 16, color: colors.ink }}>{t('booking.requestSent')}</div>
        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#7A7261', textAlign: 'center' }}>
          {t('booking.waitingAcceptance', { host: host.name })}
        </div>
        <button onClick={onBooked} style={{
          padding: '12px 24px', borderRadius: 14, background: colors.fern, color: '#fff',
          border: 'none', fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 14, cursor: 'pointer', marginTop: 8
        }}>{t('booking.backToList')}</button>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, padding: 20, overflow: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <button onClick={onCancel} style={{
          width: 34, height: 34, borderRadius: 17, background: colors.clayLight, border: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0
        }}><ArrowLeft size={18} color={colors.ink} /></button>
        <div>
          <h2 style={{ fontSize: 18, color: colors.ink, fontWeight: 600, margin: 0 }}>Zarezerwuj u {host.name}</h2>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: colors.muted }}>{t('booking.priceLine', { price: host.price })}</div>
        </div>
      </div>

      {plantsLoading && (
        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: colors.muted }}>{t('booking.loadingPlants')}</div>
      )}

      {!plantsLoading && plants.length === 0 && (
        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: colors.muted, marginBottom: 16 }}>
          {t('booking.noPlants')}
        </div>
      )}

      {!plantsLoading && plants.length > 0 && (
        <>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 700, color: colors.ink, marginBottom: 10 }}>{t('booking.whichPlant')}</div>
          {plants.map(p => (
            <div key={p.id} onClick={() => setSelectedPlantId(p.id)} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: 14, borderRadius: 14,
              border: `1.5px solid ${selectedPlantId === p.id ? colors.fern : colors.line}`, marginBottom: 10,
              background: selectedPlantId === p.id ? '#EEF3EA' : colors.card, cursor: 'pointer'
            }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: colors.clayLight, overflow: 'hidden', flexShrink: 0 }}>
                {p.photo_url && <img src={p.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
              </div>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: colors.ink, fontWeight: selectedPlantId === p.id ? 700 : 500 }}>
                {p.name}{p.quantity > 1 ? ` (masz ${p.quantity})` : ''}
              </span>
            </div>
          ))}

          {maxQuantity > 1 && (
            <>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 700, color: colors.ink, marginTop: 16, marginBottom: 10 }}>{t('booking.howMany', { max: maxQuantity })}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} style={{
                  width: 36, height: 36, borderRadius: 10, background: colors.clayLight, border: 'none',
                  fontSize: 18, fontWeight: 700, color: colors.ink, cursor: 'pointer'
                }}>−</button>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 700, color: colors.ink, minWidth: 20, textAlign: 'center' }}>{quantity}</span>
                <button onClick={() => setQuantity(q => Math.min(maxQuantity, q + 1))} style={{
                  width: 36, height: 36, borderRadius: 10, background: colors.fern, border: 'none',
                  fontSize: 18, fontWeight: 700, color: '#fff', cursor: 'pointer'
                }}>+</button>
              </div>
            </>
          )}

          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 700, color: colors.ink, marginTop: 16, marginBottom: 10 }}>{t('booking.whichDates')}</div>

          <BookingCalendar
            hostId={host.id}
            capacity={host.plants_capacity}
            startDate={startDate}
            endDate={endDate}
            onSelectStart={setStartDate}
            onSelectEnd={setEndDate}
          />

          <div style={{ display: 'flex', gap: 10, marginBottom: 8, fontFamily: 'Inter, sans-serif', fontSize: 12.5, color: colors.ink }}>
            <div style={{ flex: 1 }}>
              <span style={{ color: colors.muted }}>{t('booking.from')}: </span>
              <strong>{startDate || '—'}</strong>
            </div>
            <div style={{ flex: 1 }}>
              <span style={{ color: colors.muted }}>{t('booking.to')}: </span>
              <strong>{endDate || '—'}</strong>
            </div>
          </div>

          {estimatedTotal != null && (
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: colors.fern, fontWeight: 600, marginBottom: 16 }}>
              {t('booking.estimatedCost', { total: estimatedTotal, days: estimatedDays, dayWord: estimatedDays === 1 ? t('booking.day') : t('booking.days') })}
            </div>
          )}

          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 700, color: colors.ink, marginBottom: 10 }}>{t('booking.yourPhone')}</div>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11.5, color: colors.muted, marginBottom: 8 }}>{t('booking.phoneNote')}</div>
          <TextField icon={Phone} type="tel" placeholder="np. 500 100 200" value={renterPhone} onChange={e => setRenterPhone(e.target.value)} />

          {error && <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12.5, color: colors.clay, marginBottom: 12 }}>{error}</div>}

          <button onClick={handleSave} disabled={!canSave || saving} style={{
            width: '100%', padding: 16, borderRadius: 16, background: colors.clay, color: '#fff',
            border: 'none', fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 15,
            cursor: (!canSave || saving) ? 'default' : 'pointer', opacity: (!canSave || saving) ? 0.6 : 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
          }}>
            {saving && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
            {saving ? t('booking.sending') : t('booking.sendRequest')}
          </button>
        </>
      )}
    </div>
  );
}

function ReviewForm({ booking, userId, userName, onCancel, onSaved }) {
  const t = useT();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    const { error } = await supabase.from('reviews').insert([{
      host_id: booking.host_id,
      booking_id: booking.id,
      renter_user_id: userId,
      renter_name: userName || null,
      reviewer_role: 'renter',
      rating,
      comment,
    }]);
    if (error) {
      setSaving(false);
      setError(t('review.saveFailed') + error.message);
      return;
    }
    await supabase.rpc('update_host_rating', { host_id_param: booking.host_id });
    if (booking.hosts?.user_id) {
      await createNotification(
        booking.hosts.user_id,
        'new_review',
        { name: userName || '', rating, plant: booking.plant_name },
        booking.id,
        booking.hosts.email || null
      );
    }
    setSaving(false);
    onSaved();
  };

  return (
    <div style={{ flex: 1, padding: 20, overflow: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <button onClick={onCancel} style={{
          width: 34, height: 34, borderRadius: 17, background: colors.clayLight, border: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0
        }}><ArrowLeft size={18} color={colors.ink} /></button>
        <h2 style={{ fontSize: 18, color: colors.ink, fontWeight: 600, margin: 0 }}>{t('review.rateHost')}</h2>
      </div>

      <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#7A7261', marginBottom: 20 }}>
        {t('review.yourPlant', { plant: booking.plant_name })}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
        {[1, 2, 3, 4, 5].map(n => (
          <button key={n} onClick={() => setRating(n)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <Star size={32} fill={n <= rating ? colors.gold : 'none'} color={colors.gold} />
          </button>
        ))}
      </div>

      <textarea
        placeholder={t('review.commentPlaceholder')}
        value={comment}
        onChange={e => setComment(e.target.value)}
        rows={4}
        style={{
          width: '100%', border: `1.5px solid ${colors.line}`, borderRadius: 14, padding: 14,
          fontFamily: 'Inter, sans-serif', fontSize: 14, color: colors.ink, marginBottom: 16,
          resize: 'none', boxSizing: 'border-box'
        }}
      />

      {error && <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12.5, color: colors.clay, marginBottom: 12 }}>{error}</div>}

      <button onClick={handleSave} disabled={saving} style={{
        width: '100%', padding: 16, borderRadius: 16, background: colors.fern, color: '#fff',
        border: 'none', fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 15,
        cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.6 : 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
      }}>
        {saving && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
        {saving ? t('booking.sending') : t('review.submit')}
      </button>
    </div>
  );
}

function HostReviewForm({ booking, hostName, onCancel, onSaved }) {
  const t = useT();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    const { error } = await supabase.from('reviews').insert([{
      host_id: booking.host_id,
      booking_id: booking.id,
      renter_user_id: booking.renter_user_id,
      renter_name: booking.renter_name || null,
      reviewer_role: 'host',
      rating,
      comment,
    }]);
    if (error) {
      setSaving(false);
      setError(t('review.saveFailed') + error.message);
      return;
    }
    await createNotification(
      booking.renter_user_id,
      'review_received',
      { name: hostName || '', rating, plant: booking.plant_name },
      booking.id,
      booking.renter_email || null
    );
    setSaving(false);
    onSaved();
  };

  return (
    <div style={{ flex: 1, padding: 20, overflow: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <button onClick={onCancel} style={{
          width: 34, height: 34, borderRadius: 17, background: colors.clayLight, border: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0
        }}><ArrowLeft size={18} color={colors.ink} /></button>
        <h2 style={{ fontSize: 18, color: colors.ink, fontWeight: 600, margin: 0 }}>{t('review.rateRenter')}</h2>
      </div>

      <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#7A7261', marginBottom: 20 }}>
        {t('review.renterPlant', { renter: booking.renter_name || booking.renter_email, plant: booking.plant_name })}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
        {[1, 2, 3, 4, 5].map(n => (
          <button key={n} onClick={() => setRating(n)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <Star size={32} fill={n <= rating ? colors.gold : 'none'} color={colors.gold} />
          </button>
        ))}
      </div>

      <textarea
        placeholder={t('review.commentPlaceholder')}
        value={comment}
        onChange={e => setComment(e.target.value)}
        rows={4}
        style={{
          width: '100%', border: `1.5px solid ${colors.line}`, borderRadius: 14, padding: 14,
          fontFamily: 'Inter, sans-serif', fontSize: 14, color: colors.ink, marginBottom: 16,
          resize: 'none', boxSizing: 'border-box'
        }}
      />

      {error && <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12.5, color: colors.clay, marginBottom: 12 }}>{error}</div>}

      <button onClick={handleSave} disabled={saving} style={{
        width: '100%', padding: 16, borderRadius: 16, background: colors.fern, color: '#fff',
        border: 'none', fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 15,
        cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.6 : 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
      }}>
        {saving && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
        {saving ? t('booking.sending') : t('review.submit')}
      </button>
    </div>
  );
}

function CareGuide({ text }) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {lines.map((line, i) => {
        const match = line.match(/^-?\s*\*{0,2}([^:]+)\*{0,2}:\s*(.+)$/);
        if (!match) {
          return <div key={i} style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#4A4638' }}>{line}</div>;
        }
        return (
          <div key={i}>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11.5, fontWeight: 700, color: colors.fern, textTransform: 'uppercase', letterSpacing: 0.4 }}>{match[1]}</div>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13.5, color: '#4A4638', lineHeight: 1.5 }}>{match[2]}</div>
          </div>
        );
      })}
    </div>
  );
}

const PENDING_PLANT_KEY = 'leafsit_pending_plant';

function AddPlantScreen({ userId, onPlantAdded, premiumReturn, onPremiumReturnHandled }) {
  const t = useT();
  const fileInputRef = useRef(null);
  const [photoDataUrl, setPhotoDataUrl] = useState(null);
  const [identifying, setIdentifying] = useState(false);
  const [identifyError, setIdentifyError] = useState(null);
  const [plantName, setPlantName] = useState('');
  const [confidence, setConfidence] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const [showPremium, setShowPremium] = useState(false);
  const [premiumSunlight, setPremiumSunlight] = useState('Pełne słońce');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [generatingGuide, setGeneratingGuide] = useState(false);
  const [guideError, setGuideError] = useState(null);
  const [careGuide, setCareGuide] = useState(null);

  useEffect(() => {
    if (!premiumReturn) return;
    const saved = sessionStorage.getItem(PENDING_PLANT_KEY);
    let restoredName = premiumReturn.plant || '';
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPhotoDataUrl(parsed.photoDataUrl || null);
        setConfidence(parsed.confidence ?? null);
        if (parsed.plantName) restoredName = parsed.plantName;
      } catch (e) { /* ignore malformed cache */ }
    }
    setPlantName(restoredName);
    setPremiumSunlight(premiumReturn.sunlight || 'Pełne słońce');
    setShowPremium(true);
    setVerifyingPayment(true);

    (async () => {
      try {
        const res = await fetch('/api/stripe-verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'verify-premium', sessionId: premiumReturn.sessionId }),
        });
        const data = await res.json();
        if (data.paid) {
          sessionStorage.removeItem(PENDING_PLANT_KEY);
          await generateGuide(restoredName, premiumReturn.sunlight || 'Pełne słońce');
        } else {
          setGuideError(t('plant.errPaymentConfirm'));
        }
      } catch (err) {
        setGuideError(t('plant.errPaymentCheck'));
      }
      setVerifyingPayment(false);
      onPremiumReturnHandled();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIdentifyError(null);
    setPlantName('');
    setConfidence(null);
    setCareGuide(null);
    setShowPremium(false);

    const resized = await resizeImage(file);
    setPhotoDataUrl(resized);

    setIdentifying(true);
    try {
      const res = await fetch('/api/identify-plant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: resized }),
      });
      const data = await res.json();
      if (!res.ok) {
        setIdentifyError(data.error || t('plant.errIdentify'));
      } else if (!data.name) {
        setIdentifyError(t('plant.errNoSpecies'));
      } else {
        setPlantName(data.name);
        setConfidence(data.confidence);
      }
    } catch (err) {
      setIdentifyError(t('plant.errConnection'));
    }
    setIdentifying(false);
  };

  const generateGuide = async (name, sunlight) => {
    setGeneratingGuide(true);
    setGuideError(null);
    try {
      const res = await fetch('/api/plant-care', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plantName: name, sunlight }),
      });
      const data = await res.json();
      if (!res.ok) {
        setGuideError(data.error || t('plant.errGuide'));
      } else {
        setCareGuide(data.guide);
      }
    } catch (err) {
      setGuideError(t('plant.errGuideConn'));
    }
    setGeneratingGuide(false);
  };

  const handleUnlockPremium = async () => {
    setCheckoutLoading(true);
    setGuideError(null);
    sessionStorage.setItem(PENDING_PLANT_KEY, JSON.stringify({ photoDataUrl, plantName, confidence }));
    try {
      const res = await fetch('/api/stripe-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'premium', plantName, sunlight: premiumSunlight, origin: window.location.origin }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setGuideError(data.error || t('plant.errPayment'));
        setCheckoutLoading(false);
        return;
      }
      window.location.href = data.url;
    } catch (err) {
      setGuideError(t('plant.errPaymentConn'));
      setCheckoutLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    const { error } = await supabase
      .from('plants')
      .insert([{
        name: plantName,
        user_id: userId,
        photo_url: photoDataUrl,
        sunlight: careGuide ? premiumSunlight : null,
        care_guide: careGuide,
        quantity: quantity,
      }]);
    setSaving(false);
    if (error) {
      setError(t('plant.errSave') + error.message);
    } else {
      setSaved(true);
      if (onPlantAdded) onPlantAdded();
    }
  };

  return (
    <div style={{ flex: 1, padding: 20, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
      <h2 style={{ fontSize: 22, color: colors.ink, fontWeight: 600, marginBottom: 4 }}>{t('plant.title')}</h2>
      <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: colors.muted, marginBottom: 20 }}>{t('plant.subtitle')}</div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {!saved && (
        <div onClick={() => fileInputRef.current?.click()} style={{
          aspectRatio: '1', background: photoDataUrl ? '#000' : colors.clayLight, borderRadius: 20,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10,
          border: photoDataUrl ? 'none' : `2px dashed ${colors.clay}`, marginBottom: 20, cursor: 'pointer',
          overflow: 'hidden', position: 'relative', flexShrink: 0
        }}>
          {photoDataUrl ? (
            <>
              <img src={photoDataUrl} alt={t('plant.yourPlantAlt')} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: identifying ? 0.5 : 1 }} />
              <div style={{ position: 'absolute', bottom: 10, right: 10, background: 'rgba(0,0,0,0.5)', borderRadius: 10, padding: 8, display: 'flex' }}>
                <RefreshCw size={16} color="#fff" />
              </div>
            </>
          ) : (
            <>
              <Camera size={40} color={colors.clay} />
              <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, color: colors.clay, fontSize: 14 }}>{t('plant.takePhoto')}</span>
            </>
          )}
        </div>
      )}

      {identifying && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Inter, sans-serif', fontSize: 13, color: colors.muted, marginBottom: 20 }}>
          <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> {t('plant.identifying')}
        </div>
      )}

      {identifyError && !identifying && (
        <div style={{
          display: 'flex', gap: 10, alignItems: 'flex-start', background: '#FFF3EC', borderRadius: 14,
          padding: 14, marginBottom: 20, fontFamily: 'Inter, sans-serif', fontSize: 12.5, color: colors.clay
        }}>{identifyError}</div>
      )}

      {plantName && !identifying && !saved && (
        <>
          <div style={{
            display: 'flex', gap: 10, alignItems: 'flex-start', background: '#EEF3EA', borderRadius: 14,
            padding: 14, marginBottom: 16
          }}>
            <Sparkles size={18} color={colors.fern} style={{ flexShrink: 0, marginTop: 2 }} />
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12.5, color: colors.fernDark, lineHeight: 1.5 }}>
              <b>{t('plant.recognized', { name: plantName })}</b> {confidence != null && t('plant.confidence', { n: confidence })}
            </div>
          </div>

          {!premiumReturn && (
            <>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: colors.muted, marginBottom: 8 }}>{t('plant.wrongName')}</div>
              <TextField value={plantName} onChange={e => setPlantName(e.target.value)} />
            </>
          )}

          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: colors.muted, marginBottom: 8 }}>{t('plant.howManySame')}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
            <button onClick={() => setQuantity(q => Math.max(1, q - 1))} style={{
              width: 36, height: 36, borderRadius: 10, background: colors.clayLight, border: 'none',
              fontSize: 18, fontWeight: 700, color: colors.ink, cursor: 'pointer'
            }}>−</button>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 700, color: colors.ink, minWidth: 20, textAlign: 'center' }}>{quantity}</span>
            <button onClick={() => setQuantity(q => Math.min(20, q + 1))} style={{
              width: 36, height: 36, borderRadius: 10, background: colors.fern, border: 'none',
              fontSize: 18, fontWeight: 700, color: '#fff', cursor: 'pointer'
            }}>+</button>
          </div>

          {!careGuide && !showPremium && (
            <button onClick={() => setShowPremium(true)} style={{
              width: '100%', padding: 14, borderRadius: 16, background: `linear-gradient(135deg, ${colors.gold}, ${colors.clay})`,
              color: '#fff', border: 'none', fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 14, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 16
            }}>
              <Crown size={16} /> {t('plant.unlockPremium')}
            </button>
          )}

          {showPremium && !careGuide && (
            <div style={{ background: colors.card, border: `1.5px solid ${colors.gold}`, borderRadius: 16, padding: 16, marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <Crown size={16} color={colors.gold} />
                <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 13, color: colors.ink }}>{t('plant.premiumTitle')}</span>
              </div>

              {verifyingPayment && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Inter, sans-serif', fontSize: 13, color: colors.muted, padding: '8px 0' }}>
                  <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> {t('plant.checkingPayment')}
                </div>
              )}

              {!verifyingPayment && (
                <>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#7A7261', marginBottom: 10 }}>{t('plant.sunlightQuestion')}</div>
                  {SUNLIGHT_OPTIONS.map((l) => {
                    const si = sunlightInfo(l);
                    const SIcon = si.Icon;
                    return (
                      <div key={l} onClick={() => setPremiumSunlight(l)} style={{
                        display: 'flex', alignItems: 'center', gap: 12, padding: 12, borderRadius: 12,
                        border: `1.5px solid ${premiumSunlight === l ? colors.gold : colors.line}`, marginBottom: 8,
                        background: premiumSunlight === l ? '#FFF8EC' : colors.bg, cursor: 'pointer'
                      }}>
                        <SIcon size={16} color={premiumSunlight === l ? si.tone : colors.muted} />
                        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: colors.ink, fontWeight: premiumSunlight === l ? 700 : 500 }}>{t(sunlightKey(l))}</span>
                      </div>
                    );
                  })}

                  {guideError && <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: colors.clay, marginTop: 8, marginBottom: 4 }}>{guideError}</div>}

                  <button onClick={handleUnlockPremium} disabled={checkoutLoading} style={{
                    width: '100%', padding: 12, borderRadius: 12, background: colors.fern, color: '#fff', border: 'none',
                    fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 13, cursor: checkoutLoading ? 'default' : 'pointer',
                    opacity: checkoutLoading ? 0.7 : 1, marginTop: 10,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                  }}>
                    {checkoutLoading && <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />}
                    {checkoutLoading ? t('plant.redirecting') : t('plant.payButton')}
                  </button>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 10.5, color: colors.muted, textAlign: 'center', marginTop: 8 }}>
                    {t('plant.testMode')}
                  </div>
                </>
              )}
            </div>
          )}

          {generatingGuide && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Inter, sans-serif', fontSize: 13, color: colors.muted, marginBottom: 16 }}>
              <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> {t('plant.generating')}
            </div>
          )}

          {careGuide && (
            <div style={{ background: '#FFF8EC', border: `1.5px solid ${colors.gold}`, borderRadius: 16, padding: 16, marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <Crown size={16} color={colors.gold} />
                <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 13, color: colors.ink }}>{t('plant.guidePaid')}</span>
              </div>
              <CareGuide text={careGuide} />
            </div>
          )}

          {error && (
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12.5, color: colors.clay, marginBottom: 12 }}>{error}</div>
          )}
          <button onClick={handleSave} disabled={saving || !plantName} style={{
            width: '100%', padding: 16, borderRadius: 16, background: colors.fern, color: '#fff',
            border: 'none', fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 15,
            cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.7 : 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
          }}>
            {saving && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
            {saving ? 'Zapisywanie...' : 'Dodaj do profilu'}
          </button>
        </>
      )}

      {saved && (
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14
        }}>
          <div style={{ width: 64, height: 64, borderRadius: 32, background: colors.fern, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Check size={32} color="#fff" />
          </div>
          <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 16, color: colors.ink }}>{t('plant.added')}</div>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#7A7261', textAlign: 'center' }}>{t('plant.checkProfile')}</div>
        </div>
      )}
    </div>
  );
}

function ScanScreen() {
  const t = useT();
  const fileInputRef = useRef(null);
  const [photoDataUrl, setPhotoDataUrl] = useState(null);
  const [identifying, setIdentifying] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setResult(null);

    const resized = await resizeImage(file);
    setPhotoDataUrl(resized);

    setIdentifying(true);
    try {
      const res = await fetch('/api/identify-plant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: resized }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t('plant.errIdentify'));
      } else if (!data.name) {
        setError(t('plant.errNoSpecies'));
      } else {
        setResult(data);
      }
    } catch (err) {
      setError(t('plant.errConnection'));
    }
    setIdentifying(false);
  };

  return (
    <div style={{ flex: 1, padding: 20, overflow: 'auto' }}>
      <h2 style={{ fontSize: 22, color: colors.ink, fontWeight: 600, marginBottom: 4 }}>{t('scan.title')}</h2>
      <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: colors.muted, marginBottom: 20 }}>{t('scan.subtitle')}</div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      <div onClick={() => fileInputRef.current?.click()} style={{
        aspectRatio: '4/5', background: photoDataUrl ? '#000' : `linear-gradient(160deg, ${colors.fern}22, ${colors.gold}22)`,
        borderRadius: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 14, marginBottom: 20, border: photoDataUrl ? 'none' : `1px solid ${colors.line}`, cursor: 'pointer',
        overflow: 'hidden', position: 'relative'
      }}>
        {photoDataUrl ? (
          <img src={photoDataUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: identifying ? 0.5 : 1 }} />
        ) : (
          <>
            <div style={{ width: 88, height: 88, borderRadius: 44, background: colors.card, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(0,0,0,0.08)' }}>
              <Camera size={36} color={colors.fern} />
            </div>
            <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, color: colors.ink, fontSize: 15 }}>{t('scan.takeOrUpload')}</span>
          </>
        )}
      </div>

      {identifying && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Inter, sans-serif', fontSize: 13, color: colors.muted, marginBottom: 20 }}>
          <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> {t('plant.identifying')}
        </div>
      )}

      {error && !identifying && (
        <div style={{
          display: 'flex', gap: 10, alignItems: 'flex-start', background: '#FFF3EC', borderRadius: 14,
          padding: 14, marginBottom: 20, fontFamily: 'Inter, sans-serif', fontSize: 12.5, color: colors.clay
        }}>{error}</div>
      )}

      {result && !identifying && (
        <div style={{
          display: 'flex', gap: 10, alignItems: 'flex-start', background: '#EEF3EA', borderRadius: 14,
          padding: 16, marginBottom: 20
        }}>
          <Sparkles size={18} color={colors.fern} style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 15, color: colors.fernDark }}>{result.name}</div>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: colors.fern, marginTop: 2 }}>{t('scan.confidence', { n: result.confidence })}</div>
          </div>
        </div>
      )}

      <div style={{
        border: `1.5px solid ${colors.gold}`, background: '#FFF8EC', borderRadius: 16, padding: 16,
        display: 'flex', gap: 12, alignItems: 'center'
      }}>
        <Crown size={20} color={colors.gold} style={{ flexShrink: 0 }} />
        <div style={{ fontFamily: 'Inter, sans-serif' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: colors.ink }}>{t('scan.addPrompt')}</div>
          <div style={{ fontSize: 12, color: '#7A7261', marginTop: 2 }}>{t('scan.addHint')}</div>
        </div>
      </div>
    </div>
  );
}

function weatherFromCode(code) {
  if (code === 0) return { Icon: Sun, labelKey: 'weather.clear', tone: colors.gold };
  if ([1, 2].includes(code)) return { Icon: CloudSun, labelKey: 'weather.partlyCloudy', tone: colors.gold };
  if (code === 3) return { Icon: Cloud, labelKey: 'weather.cloudy', tone: '#8A8574' };
  if ([45, 48].includes(code)) return { Icon: Cloud, labelKey: 'weather.fog', tone: '#8A8574' };
  if (code >= 51 && code <= 82) return { Icon: CloudRain, labelKey: 'weather.rain', tone: '#5A7BA6' };
  return { Icon: Cloud, labelKey: 'weather.variable', tone: '#8A8574' };
}

function WeatherWidget() {
  const t = useT();
  const [state, setState] = useState({ loading: true, error: null, data: null, place: '' });

  useEffect(() => {
    let cancelled = false;

    function fetchWeather(lat, lon, place) {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code&hourly=temperature_2m,relative_humidity_2m,weather_code&forecast_days=2&timezone=auto`;
      fetch(url)
        .then(res => res.json())
        .then(json => { if (!cancelled) setState({ loading: false, error: null, data: json, place }); })
        .catch(() => { if (!cancelled) setState({ loading: false, error: t('weather.fetchFailed'), data: null, place: '' }); });
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude, 'Twoja okolica'),
        () => fetchWeather(52.208, 21.038, 'Warszawa · Mokotów'),
        { timeout: 8000 }
      );
    } else {
      fetchWeather(52.208, 21.038, 'Warszawa · Mokotów');
    }

    return () => { cancelled = true; };
  }, []);

  if (state.loading) {
    return (
      <div style={{ background: colors.card, border: `1px solid ${colors.line}`, borderRadius: 18, padding: 20, marginBottom: 20, fontFamily: 'Inter, sans-serif', fontSize: 13, color: colors.muted }}>
        {t('weather.loading')}
      </div>
    );
  }
  if (state.error || !state.data) {
    return (
      <div style={{ background: colors.card, border: `1px solid ${colors.line}`, borderRadius: 18, padding: 20, marginBottom: 20, fontFamily: 'Inter, sans-serif', fontSize: 13, color: colors.clay }}>
        {state.error || 'Brak danych pogodowych'}
      </div>
    );
  }

  const { current, hourly } = state.data;
  const nowInfo = weatherFromCode(current.weather_code);
  const NowIcon = nowInfo.Icon;

  const nowMs = new Date(current.time).getTime();
  let startIdx = 0;
  let smallestDiff = Infinity;
  hourly.time.forEach((t, idx) => {
    const diff = Math.abs(new Date(t).getTime() - nowMs);
    if (diff < smallestDiff) {
      smallestDiff = diff;
      startIdx = idx;
    }
  });
  const nextHours = hourly.time.slice(startIdx, startIdx + 6).map((t, i) => ({
    time: t,
    temp: hourly.temperature_2m[startIdx + i],
    humidity: hourly.relative_humidity_2m[startIdx + i],
    code: hourly.weather_code[startIdx + i],
  }));

  return (
    <div style={{ background: colors.card, border: `1px solid ${colors.line}`, borderRadius: 18, padding: 18, marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
        <MapPin size={13} color="#A9A08B" />
        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11.5, color: colors.muted, fontWeight: 600 }}>{t('weather.conditionsFor', { place: state.place })}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '10px 0 16px' }}>
        <div style={{
          width: 56, height: 56, borderRadius: 16, background: `${nowInfo.tone}1A`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
        }}>
          <NowIcon size={28} color={nowInfo.tone} />
        </div>
        <div>
          <div style={{ fontSize: 26, fontWeight: 700, color: colors.ink, lineHeight: 1 }}>{Math.round(current.temperature_2m)}°C</div>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12.5, color: '#7A7261', marginTop: 2 }}>{t(nowInfo.labelKey)}</div>
        </div>
        <div style={{ marginLeft: 'auto', textAlign: 'right', fontFamily: 'Inter, sans-serif' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#5A7BA6', fontWeight: 700, fontSize: 14 }}>
            <Droplets size={14} /> {current.relative_humidity_2m}%
          </div>
          <div style={{ fontSize: 10.5, color: colors.muted }}>{t('weather.humidity')}</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
        {nextHours.map((h, i) => {
          const info = weatherFromCode(h.code);
          const HIcon = info.Icon;
          const hour = new Date(h.time).getHours();
          return (
            <div key={i} style={{
              flex: '0 0 auto', width: 54, background: colors.bg, borderRadius: 12, padding: '10px 6px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, fontFamily: 'Inter, sans-serif'
            }}>
              <span style={{ fontSize: 10.5, color: colors.muted, fontWeight: 600 }}>{i === 0 ? 'Teraz' : `${hour}:00`}</span>
              <HIcon size={16} color={info.tone} />
              <span style={{ fontSize: 12.5, fontWeight: 700, color: colors.ink }}>{Math.round(h.temp)}°</span>
              <span style={{ fontSize: 9.5, color: '#5A7BA6', display: 'flex', alignItems: 'center', gap: 2 }}><Droplets size={9}/>{h.humidity}%</span>
            </div>
          );
        })}
      </div>

      {current.relative_humidity_2m < 35 && (
        <div style={{ marginTop: 12, fontFamily: 'Inter, sans-serif', fontSize: 11.5, color: colors.clay, display: 'flex', gap: 6, alignItems: 'flex-start' }}>
          <Sparkles size={13} style={{ flexShrink: 0, marginTop: 1 }} />
          {t('weather.lowHumidity')}
        </div>
      )}
    </div>
  );
}

function BecomeHostForm({ userId, existingHost, userAvatarUrl, onCancel, onSaved }) {
  const t = useT();
  const isEdit = !!existingHost;
  const [name, setName] = useState(existingHost?.name || '');
  const [price, setPrice] = useState(existingHost ? String(existingHost.price) : '');
  const [location, setLocation] = useState(existingHost?.location || '');
  const [address, setAddress] = useState(existingHost?.address || '');
  const [phone, setPhone] = useState(existingHost?.phone || '');
  const [sunlight, setSunlight] = useState(existingHost?.sunlight || 'Pełne słońce');
  const [capacity, setCapacity] = useState(existingHost ? String(existingHost.plants_capacity) : '');
  const [description, setDescription] = useState(existingHost?.description || '');
  const [spacePhotos, setSpacePhotos] = useState(existingHost?.space_photos || []);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleAddSpacePhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (spacePhotos.length >= 4) return;
    setUploadingPhoto(true);
    try {
      const resized = await resizeImage(file, 800);
      setSpacePhotos(prev => [...prev, resized]);
    } catch (err) {
      // niepowodzenie kompresji zdjecia nie jest krytyczne - po prostu nic sie nie doda
    } finally {
      setUploadingPhoto(false);
      e.target.value = '';
    }
  };

  const handleRemoveSpacePhoto = (idx) => {
    setSpacePhotos(prev => prev.filter((_, i) => i !== idx));
  };

  const [coords, setCoords] = useState(
    existingHost?.latitude != null ? { lat: existingHost.latitude, lon: existingHost.longitude } : null
  );
  const [locLoading, setLocLoading] = useState(false);
  const [locError, setLocError] = useState(null);

  const canSave = name && price && location && capacity;

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      setLocError(t('becomeHost.locationUnsupported'));
      return;
    }
    setLocLoading(true);
    setLocError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        setLocLoading(false);
      },
      () => {
        setLocError(t('becomeHost.locationFailed'));
        setLocLoading(false);
      },
      { timeout: 8000 }
    );
  };

  const handleSave = async () => {
    const priceNum = Number(price);
    const capacityNum = Number(capacity);

    if (!Number.isFinite(priceNum) || priceNum < 0.5 || priceNum > 1000) {
      setError(t('becomeHost.priceInvalid'));
      return;
    }
    if (!Number.isFinite(capacityNum) || !Number.isInteger(capacityNum) || capacityNum < 1 || capacityNum > 50) {
      setError(t('becomeHost.capacityInvalid'));
      return;
    }

    setSaving(true);
    setError(null);
    const payload = {
      name,
      price: priceNum,
      location,
      address: address || null,
      phone: phone || null,
      sunlight,
      plants_capacity: capacityNum,
      description,
      photo_url: userAvatarUrl || null,
      space_photos: spacePhotos,
      latitude: coords ? coords.lat : null,
      longitude: coords ? coords.lon : null,
    };
    const { error } = isEdit
      ? await supabase.from('hosts').update(payload).eq('id', existingHost.id)
      : await supabase.from('hosts').insert([{ ...payload, user_id: userId, rating: null, reviews: 0 }]);
    setSaving(false);
    if (error) {
      setError(t('becomeHost.saveFailed') + error.message);
    } else {
      onSaved();
    }
  };

  return (
    <div style={{ flex: 1, padding: 20, overflow: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <button onClick={onCancel} style={{
          width: 34, height: 34, borderRadius: 17, background: colors.clayLight, border: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0
        }}><ArrowLeft size={18} color={colors.ink} /></button>
        <h2 style={{ fontSize: 20, color: colors.ink, fontWeight: 600, margin: 0 }}>{isEdit ? t('becomeHost.titleEdit') : t('becomeHost.titleNew')}</h2>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
        <Avatar photoUrl={userAvatarUrl} name={name || 'H'} size={64} radius={16} />
        <div>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 700, color: colors.ink }}>{t('becomeHost.photoFromAccount')}</div>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11.5, color: colors.muted, marginTop: 2 }}>
            {t('becomeHost.changePhotoHint')}
          </div>
        </div>
      </div>

      <TextField placeholder={t('becomeHost.namePlaceholder')} value={name} onChange={e => setName(e.target.value)} />
      <TextField icon={DollarSign} type="number" min="0.5" max="1000" step="0.5" placeholder={t('becomeHost.pricePlaceholder')} value={price} onChange={e => setPrice(e.target.value)} />
      <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11.5, color: colors.muted, marginTop: -6, marginBottom: 14 }}>
        {t('becomeHost.priceHint')}
      </div>
      {Number(price) > 10 && (
        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11.5, color: colors.clay, marginTop: -6, marginBottom: 14 }}>
          {t('becomeHost.priceWarning')}
        </div>
      )}
      <TextField icon={MapPin} placeholder={t('becomeHost.areaPlaceholder')} value={location} onChange={e => setLocation(e.target.value)} />
      <TextField icon={Phone} type="tel" placeholder={t('becomeHost.phonePlaceholder')} value={phone} onChange={e => setPhone(e.target.value)} />
      <TextField placeholder={t('becomeHost.addressPlaceholder')} value={address} onChange={e => setAddress(e.target.value)} />

      <button onClick={handleUseLocation} disabled={locLoading} style={{
        width: '100%', padding: 12, borderRadius: 12, background: coords ? '#EEF3EA' : colors.clayLight,
        border: `1.5px solid ${coords ? colors.fern : colors.line}`, color: coords ? colors.fern : colors.ink,
        fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 13, cursor: locLoading ? 'default' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 12
      }}>
        {locLoading ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Navigation size={15} />}
        {locLoading ? t('becomeHost.locationLoading') : coords ? t('becomeHost.locationSaved') : t('becomeHost.useLocation')}
      </button>
      {locError && <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11.5, color: colors.clay, marginBottom: 12 }}>{locError}</div>}

      <TextField type="number" min="1" max="50" step="1" placeholder={t('becomeHost.capacityPlaceholder')} value={capacity} onChange={e => setCapacity(e.target.value)} />

      <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 700, color: colors.ink, marginBottom: 10, marginTop: 4 }}>{t('becomeHost.sunlightLabel')}</div>
      {SUNLIGHT_OPTIONS.map((l) => {
        const si = sunlightInfo(l);
        const SIcon = si.Icon;
        return (
          <div key={l} onClick={() => setSunlight(l)} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: 14, borderRadius: 14,
            border: `1.5px solid ${sunlight === l ? colors.gold : colors.line}`, marginBottom: 10,
            background: sunlight === l ? '#FFF8EC' : colors.card, cursor: 'pointer'
          }}>
            <SIcon size={18} color={sunlight === l ? si.tone : colors.muted} />
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: colors.ink, fontWeight: sunlight === l ? 700 : 500 }}>{t(sunlightKey(l))}</span>
          </div>
        );
      })}

      <textarea
        placeholder={t('becomeHost.descPlaceholder')}
        value={description}
        onChange={e => setDescription(e.target.value)}
        rows={4}
        style={{
          width: '100%', border: `1.5px solid ${colors.line}`, borderRadius: 14, padding: 14,
          fontFamily: 'Inter, sans-serif', fontSize: 14, color: colors.ink, marginTop: 4, marginBottom: 16,
          resize: 'none', boxSizing: 'border-box'
        }}
      />

      <div style={{
        fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 700, color: colors.muted,
        textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 8
      }}>
        {t('becomeHost.spacePhotosLabel')}
      </div>
      <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: colors.muted, marginBottom: 10 }}>
        {t('becomeHost.spacePhotosHint')}
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
        {spacePhotos.map((src, idx) => (
          <div key={idx} style={{ position: 'relative', width: 76, height: 76, flexShrink: 0 }}>
            <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 12, border: `1px solid ${colors.line}` }} />
            <button
              onClick={() => handleRemoveSpacePhoto(idx)}
              style={{
                position: 'absolute', top: -6, right: -6, width: 22, height: 22, borderRadius: 11,
                background: colors.card, border: `1px solid ${colors.line}`, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0
              }}
            >
              <X size={12} color={colors.clay} />
            </button>
          </div>
        ))}
        {spacePhotos.length < 4 && (
          <label style={{
            width: 76, height: 76, flexShrink: 0, borderRadius: 12, border: `1.5px dashed ${colors.line}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: colors.muted
          }}>
            {uploadingPhoto ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <PlusCircle size={20} />}
            <input type="file" accept="image/*" onChange={handleAddSpacePhoto} style={{ display: 'none' }} disabled={uploadingPhoto} />
          </label>
        )}
      </div>

      {error && <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12.5, color: colors.clay, marginBottom: 12 }}>{error}</div>}

      <button onClick={handleSave} disabled={!canSave || saving} style={{
        width: '100%', padding: 16, borderRadius: 16, background: colors.fern, color: '#fff',
        border: 'none', fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 15,
        cursor: (!canSave || saving) ? 'default' : 'pointer', opacity: (!canSave || saving) ? 0.6 : 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
      }}>
        {saving && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
        {saving ? t('booking.sending') : isEdit ? t('becomeHost.saveChanges') : t('becomeHost.titleNew')}
      </button>
    </div>
  );
}

function statusInfo(status) {
  if (status === 'accepted') return { labelKey: 'status.accepted', tone: 'fern' };
  if (status === 'rejected') return { labelKey: 'status.rejected', tone: 'clay' };
  if (status === 'cancelled') return { labelKey: 'status.cancelled', tone: 'gray' };
  return { labelKey: 'status.pending', tone: 'gold' };
}

function ContactBlock({ title, phone, address, extra }) {
  if (!phone && !address && !extra) return null;
  return (
    <div style={{ marginTop: 10, background: '#EEF3EA', borderRadius: 10, padding: 10 }}>
      <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 10.5, fontWeight: 700, color: colors.fern, textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 4 }}>{title}</div>
      {phone && <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12.5, color: colors.ink, display: 'flex', alignItems: 'center', gap: 5 }}><Phone size={12} /> {phone}</div>}
      {address && <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12.5, color: colors.ink, display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}><MapPin size={12} /> {address}</div>}
      {extra && <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11.5, color: '#7A7261', marginTop: 2 }}>{extra}</div>}
    </div>
  );
}

function SupportScreen({ userId, userEmail, onBack }) {
  const t = useT();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const { data } = await supabase
        .from('support_messages')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });
      if (!cancelled) {
        setMessages(data || []);
        setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [userId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const handleSend = async () => {
    const userText = text.trim();
    if (!userText || sending) return;
    setText('');
    setSending(true);

    const { data: savedUserMsg } = await supabase
      .from('support_messages')
      .insert([{ user_id: userId, sender: 'user', content: userText }])
      .select()
      .single();
    if (savedUserMsg) setMessages(prev => [...prev, savedUserMsg]);

    try {
      const history = messages.slice(-8).map(m => ({ sender: m.sender, content: m.content }));
      const res = await fetch('/api/support-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText, history, userEmail }),
      });
      const data = await res.json();
      const replyText = data.reply || t('support.errGeneric');

      const { data: savedReply } = await supabase
        .from('support_messages')
        .insert([{ user_id: userId, sender: 'assistant', content: replyText }])
        .select()
        .single();
      if (savedReply) setMessages(prev => [...prev, savedReply]);

      if (data.escalated) {
        await supabase.from('profiles').upsert({ id: userId, support_escalated: true });
      }
    } catch (e) {
      const { data: errMsg } = await supabase
        .from('support_messages')
        .insert([{ user_id: userId, sender: 'assistant', content: t('support.errConnection') }])
        .select()
        .single();
      if (errMsg) setMessages(prev => [...prev, errMsg]);
    }
    setSending(false);
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 20, paddingBottom: 14, borderBottom: `1px solid ${colors.line}` }}>
        <button onClick={onBack} style={{
          width: 34, height: 34, borderRadius: 17, background: colors.clayLight, border: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0
        }}><ArrowLeft size={18} color={colors.ink} /></button>
        <div>
          <h2 style={{ fontSize: 16, color: colors.ink, fontWeight: 600, margin: 0 }}>{t('support.title')}</h2>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: colors.muted }}>{t('support.subtitle')}</div>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
        {loading && (
          <div style={{ textAlign: 'center', color: colors.muted, fontFamily: 'Inter, sans-serif', fontSize: 13, marginTop: 20 }}>{t('chat.loading')}</div>
        )}
        {!loading && messages.length === 0 && (
          <div style={{ textAlign: 'center', color: colors.muted, fontFamily: 'Inter, sans-serif', fontSize: 13, marginTop: 20, padding: '0 20px' }}>
            {t('support.welcome')}
          </div>
        )}
        {messages.map(m => (
          <div key={m.id} style={{ display: 'flex', justifyContent: m.sender === 'user' ? 'flex-end' : 'flex-start', marginBottom: 10 }}>
            <div style={{
              maxWidth: '78%', padding: '10px 14px', borderRadius: 16,
              background: m.sender === 'user' ? colors.fern : colors.clayLight,
              color: m.sender === 'user' ? '#fff' : colors.ink,
              fontFamily: 'Inter, sans-serif', fontSize: 13.5, lineHeight: 1.4,
            }}>
              {m.content}
            </div>
          </div>
        ))}
        {sending && (
          <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 10 }}>
            <div style={{ padding: '10px 14px', borderRadius: 16, background: colors.clayLight, display: 'flex', alignItems: 'center' }}>
              <Loader2 size={14} color={colors.ink} style={{ animation: 'spin 1s linear infinite' }} />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={{ display: 'flex', gap: 8, padding: 16, borderTop: `1px solid ${colors.line}` }}>
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !sending) handleSend(); }}
          placeholder={t('support.inputPlaceholder')}
          style={{
            flex: 1, padding: '12px 14px', borderRadius: 12, border: `1px solid ${colors.line}`,
            fontFamily: 'Inter, sans-serif', fontSize: 13.5, outline: 'none'
          }}
        />
        <button onClick={handleSend} disabled={sending || !text.trim()} style={{
          width: 44, height: 44, borderRadius: 12, background: colors.fern, border: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          opacity: (sending || !text.trim()) ? 0.6 : 1, flexShrink: 0
        }}>
          <Send size={18} color="#fff" />
        </button>
      </div>
    </div>
  );
}

function ChatScreen({ conversationId, myUserId, otherName, otherUserId, onBack }) {
  const t = useT();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
      if (!cancelled) {
        if (!error && data) setMessages(data);
        setLoading(false);
      }
      const unread = (data || []).filter(m => !m.read && m.sender_id !== myUserId);
      if (unread.length > 0) {
        await supabase.from('messages').update({ read: true }).in('id', unread.map(m => m.id));
      }
    }
    load();
    const interval = setInterval(load, 4000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [conversationId, myUserId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!text.trim()) return;
    setSending(true);
    const { error } = await supabase.from('messages').insert([{
      conversation_id: conversationId,
      sender_id: myUserId,
      content: text.trim(),
    }]);
    if (!error) {
      const sentText = text.trim();
      setText('');
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
      if (data) setMessages(data);
      await supabase.from('conversations').update({
        last_message: sentText,
        last_message_at: new Date().toISOString(),
      }).eq('id', conversationId);
      if (otherUserId) {
        await createNotification(
          otherUserId,
          'new_message',
          { text: sentText.length > 80 ? sentText.slice(0, 80) + '…' : sentText },
          null,
          null
        );
      }
    }
    setSending(false);
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 20, paddingBottom: 14, borderBottom: `1px solid ${colors.line}` }}>
        <button onClick={onBack} style={{
          width: 34, height: 34, borderRadius: 17, background: colors.clayLight, border: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0
        }}><ArrowLeft size={18} color={colors.ink} /></button>
        <h2 style={{ fontSize: 16, color: colors.ink, fontWeight: 600, margin: 0 }}>{otherName}</h2>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
        {loading && <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: colors.muted }}>{t('chat.loading')}</div>}
        {!loading && messages.length === 0 && (
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: colors.muted, textAlign: 'center', marginTop: 30 }}>{t('chat.firstMessage')}</div>
        )}
        {messages.map(m => {
          const mine = m.sender_id === myUserId;
          return (
            <div key={m.id} style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start', marginBottom: 10 }}>
              <div style={{
                maxWidth: '75%', padding: '10px 14px', borderRadius: 16,
                background: mine ? colors.fern : colors.clayLight,
                color: mine ? '#fff' : colors.ink,
                fontFamily: 'Inter, sans-serif', fontSize: 13.5, lineHeight: 1.4
              }}>
                {m.content}
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      {!text.trim() && (
        <div style={{ display: 'flex', gap: 8, padding: '0 16px 4px', overflowX: 'auto' }}>
          {['chat.quickAccept', 'chat.quickBusy', 'chat.quickWhen', 'chat.quickThanks'].map(key => (
            <button
              key={key}
              onClick={() => setText(t(key))}
              style={{
                flexShrink: 0, background: colors.card, border: `1.5px solid ${colors.line}`,
                borderRadius: 999, padding: '7px 13px', cursor: 'pointer',
                fontFamily: 'Inter, sans-serif', fontSize: 12, color: colors.ink, whiteSpace: 'nowrap'
              }}
            >
              {t(key)}
            </button>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, padding: 16, borderTop: `1px solid ${colors.line}` }}>
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
          placeholder={t('support.inputPlaceholder')}
          style={{
            flex: 1, border: `1.5px solid ${colors.line}`, borderRadius: 14, padding: '10px 14px',
            fontFamily: 'Inter, sans-serif', fontSize: 13.5, color: colors.ink, boxSizing: 'border-box'
          }}
        />
        <button onClick={handleSend} disabled={sending || !text.trim()} style={{
          width: 44, height: 44, borderRadius: 14, background: colors.clay, border: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0,
          opacity: (sending || !text.trim()) ? 0.6 : 1
        }}>
          <Send size={18} color="#fff" />
        </button>
      </div>
    </div>
  );
}

function ConversationsListScreen({ myUserId, onOpenConversation, onBack }) {
  const t = useT();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadByConvo, setUnreadByConvo] = useState({});

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const { data, error } = await supabase
        .from('conversations')
        .select('*, hosts(id, name, photo_url, user_id)')
        .order('last_message_at', { ascending: false });
      if (cancelled) return;
      const mine = (data || []).filter(c => c.renter_user_id === myUserId || c.hosts?.user_id === myUserId);
      setConversations(mine);
      setLoading(false);

      if (mine.length > 0) {
        const { data: unread } = await supabase
          .from('messages')
          .select('conversation_id')
          .in('conversation_id', mine.map(c => c.id))
          .eq('read', false)
          .neq('sender_id', myUserId);
        if (!cancelled && unread) {
          const map = {};
          unread.forEach(m => { map[m.conversation_id] = (map[m.conversation_id] || 0) + 1; });
          setUnreadByConvo(map);
        }
      }
    }
    load();
    return () => { cancelled = true; };
  }, [myUserId]);

  return (
    <div style={{ flex: 1, padding: 20, overflow: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <button onClick={onBack} style={{
          width: 34, height: 34, borderRadius: 17, background: colors.clayLight, border: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0
        }}><ArrowLeft size={18} color={colors.ink} /></button>
        <h2 style={{ fontSize: 18, color: colors.ink, fontWeight: 600, margin: 0 }}>{t('chat.messagesTitle')}</h2>
      </div>

      {loading && <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: colors.muted }}>{t('chat.loading')}</div>}
      {!loading && conversations.length === 0 && (
        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: colors.muted }}>{t('chat.noConversations')}</div>
      )}
      {!loading && conversations.map(c => {
        const isHostSide = c.hosts?.user_id === myUserId;
        const otherName = isHostSide ? (c.renter_name || c.renter_email || t('chat.renter')) : (c.hosts?.name || 'Host');
        const otherUserId = isHostSide ? c.renter_user_id : c.hosts?.user_id;
        const unread = unreadByConvo[c.id] || 0;
        return (
          <div
            key={c.id}
            onClick={() => onOpenConversation({ id: c.id, otherName, otherUserId })}
            style={{
              display: 'flex', alignItems: 'center', gap: 12, background: colors.card, border: `1px solid ${colors.line}`,
              borderRadius: 14, padding: 14, marginBottom: 10, cursor: 'pointer'
            }}
          >
            <Avatar photoUrl={isHostSide ? null : c.hosts?.photo_url} name={otherName} size={44} radius={22} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 14, color: colors.ink }}>{otherName}</span>
                {c.last_message_at && (
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 10.5, color: colors.muted, flexShrink: 0 }}>{formatDate(c.last_message_at)}</span>
                )}
              </div>
              <div style={{
                fontFamily: 'Inter, sans-serif', fontSize: 12.5, color: unread > 0 ? colors.ink : '#7A7261',
                fontWeight: unread > 0 ? 700 : 400, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
              }}>
                {c.last_message || t('chat.startConversation')}
              </div>
            </div>
            {unread > 0 && (
              <div style={{
                minWidth: 20, height: 20, borderRadius: 10, background: colors.clay, color: '#fff',
                fontSize: 10.5, fontWeight: 700, fontFamily: 'Inter, sans-serif',
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px', flexShrink: 0
              }}>{unread}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function AvailabilityCalendar({ hostId, capacity }) {
  const t = useT();
  const [viewMonth, setViewMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [blockedDates, setBlockedDates] = useState(new Set());
  const [acceptedBookings, setAcceptedBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hostId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [blockedRes, bookingsRes] = await Promise.all([
        supabase.from('host_blocked_dates').select('date').eq('host_id', hostId),
        supabase.from('bookings').select('start_date, end_date, quantity').eq('host_id', hostId).eq('status', 'accepted'),
      ]);
      if (!cancelled) {
        setBlockedDates(new Set((blockedRes.data || []).map(d => d.date)));
        setAcceptedBookings(bookingsRes.data || []);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [hostId]);

  // Ile roslin jest juz zajetych danego dnia, na podstawie ZAAKCEPTOWANYCH rezerwacji.
  const occupiedOn = (dateStr) => acceptedBookings.reduce((sum, b) => {
    if (dateStr >= b.start_date && dateStr <= b.end_date) return sum + (b.quantity || 1);
    return sum;
  }, 0);

  const toggleDate = async (dateStr) => {
    const wasBlocked = blockedDates.has(dateStr);
    setBlockedDates(prev => {
      const next = new Set(prev);
      if (wasBlocked) next.delete(dateStr); else next.add(dateStr);
      return next;
    });
    if (wasBlocked) {
      await supabase.from('host_blocked_dates').delete().eq('host_id', hostId).eq('date', dateStr);
    } else {
      await supabase.from('host_blocked_dates').insert([{ host_id: hostId, date: dateStr }]);
    }
  };

  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startWeekday = (firstDay.getDay() + 6) % 7; // 0 = poniedzialek
  const todayStr = new Date().toISOString().slice(0, 10);

  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const isFull = capacity != null && occupiedOn(dateStr) >= capacity;
    cells.push({ day, dateStr, isPast: dateStr < todayStr, isFull });
  }

  const monthKeys = ['calendar.jan', 'calendar.feb', 'calendar.mar', 'calendar.apr', 'calendar.may', 'calendar.jun', 'calendar.jul', 'calendar.aug', 'calendar.sep', 'calendar.oct', 'calendar.nov', 'calendar.dec'];
  const weekdayKeys = ['calendar.mon', 'calendar.tue', 'calendar.wed', 'calendar.thu', 'calendar.fri', 'calendar.sat', 'calendar.sun'];

  return (
    <div>
      <div style={{
        fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 700, color: colors.muted,
        textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4
      }}>
        {t('calendar.title')}
      </div>
      <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: colors.muted, marginBottom: 12 }}>
        {t('calendar.hint')}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <button onClick={() => setViewMonth(new Date(year, month - 1, 1))} style={{
          background: colors.clayLight, border: 'none', borderRadius: 8, width: 30, height: 30, cursor: 'pointer',
          fontSize: 16, color: colors.ink
        }}>‹</button>
        <div style={{ fontFamily: 'Cambria, Georgia, serif', fontWeight: 600, fontSize: 15, color: colors.ink }}>
          {t(monthKeys[month])} {year}
        </div>
        <button onClick={() => setViewMonth(new Date(year, month + 1, 1))} style={{
          background: colors.clayLight, border: 'none', borderRadius: 8, width: 30, height: 30, cursor: 'pointer',
          fontSize: 16, color: colors.ink
        }}>›</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 4 }}>
        {weekdayKeys.map(k => (
          <div key={k} style={{ textAlign: 'center', fontFamily: 'Inter, sans-serif', fontSize: 10, fontWeight: 700, color: colors.muted }}>
            {t(k)}
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 12 }}>
        {cells.map((c, idx) => c === null ? <div key={'empty' + idx} /> : (
          <button
            key={c.dateStr}
            disabled={c.isPast || loading}
            onClick={() => toggleDate(c.dateStr)}
            title={c.isFull && !blockedDates.has(c.dateStr) ? t('calendar.legendOccupied') : undefined}
            style={{
              aspectRatio: '1', borderRadius: 8, border: 'none', fontFamily: 'Inter, sans-serif', fontSize: 12,
              cursor: c.isPast ? 'default' : 'pointer',
              background: c.isPast ? colors.line
                : blockedDates.has(c.dateStr) ? colors.clay
                : c.isFull ? colors.gold
                : colors.clayLight,
              color: c.isPast ? colors.muted
                : (blockedDates.has(c.dateStr) || c.isFull) ? '#fff'
                : colors.ink,
              opacity: c.isPast ? 0.5 : 1,
            }}
          >{c.day}</button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontFamily: 'Inter, sans-serif', fontSize: 11.5, color: colors.muted }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 12, height: 12, borderRadius: 4, background: colors.clayLight, display: 'inline-block' }} /> {t('calendar.legendFree')}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 12, height: 12, borderRadius: 4, background: colors.gold, display: 'inline-block' }} /> {t('calendar.legendOccupied')}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 12, height: 12, borderRadius: 4, background: colors.clay, display: 'inline-block' }} /> {t('calendar.legendBlocked')}
        </span>
      </div>
    </div>
  );
}

function HostDashboardScreen({ myHost, onBack }) {
  const t = useT();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('host_id', myHost.id)
        .order('start_date', { ascending: false });
      if (!cancelled) {
        if (!error && data) setBookings(data);
        setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [myHost.id]);

  const paidBookings = bookings.filter(b => b.payment_status === 'paid');
  const totalEarned = paidBookings.reduce((sum, b) => sum + (b.amount_total || 0) * 0.9, 0);
  const completedCount = paidBookings.length;
  const pendingCount = bookings.filter(b => b.status === 'pending').length;

  return (
    <div style={{ flex: 1, padding: 20, overflow: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <button onClick={onBack} style={{
          width: 34, height: 34, borderRadius: 17, background: colors.clayLight, border: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0
        }}><ArrowLeft size={18} color={colors.ink} /></button>
        <h2 style={{ fontSize: 20, color: colors.ink, fontWeight: 600, margin: 0 }}>{t('dash.title')}</h2>
      </div>

      <div style={{ background: colors.fern, borderRadius: 16, padding: 16, marginBottom: 12 }}>
        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: 0.4 }}>{t('dash.totalEarned')}</div>
        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 26, fontWeight: 700, color: '#fff', marginTop: 4 }}>{Math.round(totalEarned * 100) / 100} zł</div>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
        <div style={{ flex: 1, background: colors.card, border: `1px solid ${colors.line}`, borderRadius: 14, padding: 14, textAlign: 'center' }}>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 20, fontWeight: 700, color: colors.ink }}>{completedCount}</div>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: colors.muted }}>{t('dash.completed')}</div>
        </div>
        <div style={{ flex: 1, background: colors.card, border: `1px solid ${colors.line}`, borderRadius: 14, padding: 14, textAlign: 'center' }}>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 20, fontWeight: 700, color: colors.ink }}>{pendingCount}</div>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: colors.muted }}>{t('dash.pending')}</div>
        </div>
        <div style={{ flex: 1, background: colors.card, border: `1px solid ${colors.line}`, borderRadius: 14, padding: 14, textAlign: 'center' }}>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 20, fontWeight: 700, color: colors.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
            <Star size={14} fill={colors.gold} color={colors.gold} /> {myHost.rating ?? '—'}
          </div>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: colors.muted }}>{t('dash.rating')}</div>
        </div>
      </div>

      <div style={{ background: colors.card, border: `1px solid ${colors.line}`, borderRadius: 16, padding: 16, marginBottom: 20 }}>
        <AvailabilityCalendar hostId={myHost.id} capacity={myHost.plants_capacity} />
      </div>

      <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 700, color: colors.ink, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>{t('dash.historyTitle')}</div>

      {loading && <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: colors.muted }}>{t('chat.loading')}</div>}
      {!loading && bookings.length === 0 && <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: colors.muted }}>{t('dash.noHistory')}</div>}
      {!loading && bookings.map(b => {
        const si = statusInfo(b.status);
        return (
          <div key={b.id} style={{ background: colors.card, border: `1px solid ${colors.line}`, borderRadius: 14, padding: 14, marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
              <div>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 700, color: colors.ink }}>
                  {b.plant_name}{b.quantity > 1 ? ` × ${b.quantity}` : ''}
                </div>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#7A7261' }}>{b.renter_name || b.renter_email}</div>
              </div>
              <Pill tone={si.tone}>{t(si.labelKey)}</Pill>
            </div>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#7A7261' }}>{b.start_date} → {b.end_date}</div>
            {b.payment_status === 'paid' && (
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11.5, color: colors.fern, fontWeight: 700, marginTop: 4 }}>
                +{Math.round(b.amount_total * 0.9 * 100) / 100} zł
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function FullListScreen({ title, items, renderItem, statusOptions, getStatus, getDate, onBack, emptyText }) {
  const t = useT();
  const [sortDesc, setSortDesc] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  let list = (statusOptions && statusFilter !== 'all')
    ? items.filter(it => getStatus(it) === statusFilter)
    : items;

  list = [...list].sort((a, b) => {
    const da = new Date(getDate(a)).getTime();
    const db = new Date(getDate(b)).getTime();
    return sortDesc ? db - da : da - db;
  });

  return (
    <div style={{ flex: 1, padding: 20, overflow: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <button onClick={onBack} style={{
          width: 34, height: 34, borderRadius: 17, background: colors.clayLight, border: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0
        }}><ArrowLeft size={18} color={colors.ink} /></button>
        <h2 style={{ fontSize: 18, color: colors.ink, fontWeight: 600, margin: 0 }}>{title}</h2>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, overflowX: 'auto' }}>
        <Pill tone="fern" active={sortDesc} onClick={() => setSortDesc(true)}>{t('list.newest')}</Pill>
        <Pill tone="fern" active={!sortDesc} onClick={() => setSortDesc(false)}>{t('list.oldest')}</Pill>
        {statusOptions && (
          <Pill tone="clay" active={statusFilter === 'all'} onClick={() => setStatusFilter('all')}>{t('list.all')}</Pill>
        )}
        {statusOptions && statusOptions.map(opt => (
          <Pill key={opt.value} tone="gold" active={statusFilter === opt.value} onClick={() => setStatusFilter(opt.value)}>{opt.label}</Pill>
        ))}
      </div>

      {list.length === 0 && (
        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: colors.muted }}>{emptyText || t('list.noResults')}</div>
      )}
      {list.map(renderItem)}
    </div>
  );
}

function ProfileScreen({ user, refreshKey, onSignOut, onUserUpdated, connectReturn, onConnectReturnHandled, bookingPaymentReturn, onBookingPaymentReturnHandled, onOpenConversation, theme, toggleTheme }) {
  const t = useT();
  const { lang } = useLang();
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myHost, setMyHost] = useState(null);
  const [hostLoading, setHostLoading] = useState(true);
  const [showHostForm, setShowHostForm] = useState(false);
  const [editingHost, setEditingHost] = useState(false);
  const [showHostDashboard, setShowHostDashboard] = useState(false);
  const [showTermsInProfile, setShowTermsInProfile] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [hostRefresh, setHostRefresh] = useState(0);

  const [myBookings, setMyBookings] = useState([]);
  const [myBookingsLoading, setMyBookingsLoading] = useState(true);
  const [incoming, setIncoming] = useState([]);
  const [incomingLoading, setIncomingLoading] = useState(true);
  const [bookingsRefresh, setBookingsRefresh] = useState(0);

  const [reviewedBookingIds, setReviewedBookingIds] = useState(new Set());
  const [reviewingBooking, setReviewingBooking] = useState(null);
  const [reviewsRefresh, setReviewsRefresh] = useState(0);
  const [hostReviewedBookingIds, setHostReviewedBookingIds] = useState(new Set());
  const [reviewingAsHostBooking, setReviewingAsHostBooking] = useState(null);
  const [receivedReviews, setReceivedReviews] = useState({});

  const [expandedPlantId, setExpandedPlantId] = useState(null);
  const [deletingPlantId, setDeletingPlantId] = useState(null);
  const [plantHistory, setPlantHistory] = useState({});
  const [loadingPlantHistory, setLoadingPlantHistory] = useState(null);

  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(displayNameOf(user));
  const [savingName, setSavingName] = useState(false);
  const hasName = !!user?.user_metadata?.full_name;

  const avatarFileInputRef = useRef(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [profileAvatarUrl, setProfileAvatarUrl] = useState(null);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [savingEmailPref, setSavingEmailPref] = useState(false);
  const [referralCode, setReferralCode] = useState(null);
  const [referredCount, setReferredCount] = useState(0);
  const [referralCopied, setReferralCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function loadProfile() {
      let { data } = await supabase.from('profiles').select('avatar_url, email_notifications, referral_code').eq('id', user.id).maybeSingle();
      if (!data?.referral_code) {
        const code = generateReferralCode();
        await supabase.from('profiles').upsert({ id: user.id, referral_code: code });
        data = { ...(data || {}), referral_code: code };
      }
      if (!cancelled) {
        setProfileAvatarUrl(data?.avatar_url || null);
        setEmailNotifications(data?.email_notifications !== false);
        setReferralCode(data?.referral_code || null);
      }
    }
    loadProfile();
    return () => { cancelled = true; };
  }, [user.id]);

  useEffect(() => {
    let cancelled = false;
    async function loadReferredCount() {
      const { data } = await supabase.from('profiles').select('id').eq('referred_by', user.id);
      if (!cancelled) setReferredCount(data?.length || 0);
    }
    loadReferredCount();
    return () => { cancelled = true; };
  }, [user.id]);

  const copyReferralLink = () => {
    if (!referralCode) return;
    const link = `${window.location.origin}/?ref=${referralCode}`;
    navigator.clipboard.writeText(link).then(() => {
      setReferralCopied(true);
      setTimeout(() => setReferralCopied(false), 2000);
    });
  };

  const toggleEmailNotifications = async () => {
    const next = !emailNotifications;
    setSavingEmailPref(true);
    setEmailNotifications(next);
    await supabase.from('profiles').upsert({ id: user.id, email_notifications: next });
    setSavingEmailPref(false);
  };

  const [connectLoading, setConnectLoading] = useState(false);
  const [connectChecking, setConnectChecking] = useState(false);

  const [payingBookingId, setPayingBookingId] = useState(null);
  const [verifyingBookingPayment, setVerifyingBookingPayment] = useState(false);
  const [cancellingBookingId, setCancellingBookingId] = useState(null);

  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifRefresh, setNotifRefresh] = useState(0);
  const unreadCount = notifications.filter(n => !n.read).length;

  const [showConversations, setShowConversations] = useState(false);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [fullListView, setFullListView] = useState(null); // 'pending' | 'accepted' | 'bookings' | 'plants'

  useEffect(() => {
    let cancelled = false;
    async function loadUnreadMessages() {
      const { data: myConvos } = await supabase.from('conversations').select('id, renter_user_id, hosts(user_id)');
      if (cancelled || !myConvos) return;
      const mineIds = myConvos.filter(c => c.renter_user_id === user.id || c.hosts?.user_id === user.id).map(c => c.id);
      if (mineIds.length === 0) { setUnreadMessagesCount(0); return; }
      const { data: unread } = await supabase
        .from('messages')
        .select('id')
        .in('conversation_id', mineIds)
        .eq('read', false)
        .neq('sender_id', user.id);
      if (!cancelled) setUnreadMessagesCount(unread?.length || 0);
    }
    loadUnreadMessages();
    return () => { cancelled = true; };
  }, [user.id, refreshKey, showConversations]);

  const togglePlantExpand = async (plantId) => {
    if (expandedPlantId === plantId) {
      setExpandedPlantId(null);
      return;
    }
    setExpandedPlantId(plantId);
    if (!plantHistory[plantId]) {
      setLoadingPlantHistory(plantId);
      const { data } = await supabase
        .from('bookings')
        .select('id, start_date, end_date, status, payment_status, quantity, hosts(name, location)')
        .eq('plant_id', plantId)
        .order('start_date', { ascending: false });
      setPlantHistory(prev => ({ ...prev, [plantId]: data || [] }));
      setLoadingPlantHistory(null);
    }
  };

  useEffect(() => {
    let cancelled = false;
    async function loadNotifications() {
      setNotifLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(30);
      if (!cancelled) {
        if (!error && data) setNotifications(data);
        setNotifLoading(false);
      }
    }
    loadNotifications();
    return () => { cancelled = true; };
  }, [user.id, notifRefresh]);

  const markNotificationRead = async (id) => {
    await supabase.from('notifications').update({ read: true }).eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  useEffect(() => {
    let cancelled = false;
    async function loadPlants() {
      setLoading(true);
      const { data, error } = await supabase
        .from('plants')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (!cancelled) {
        if (!error && data) setPlants(data);
        setLoading(false);
      }
    }
    loadPlants();
    return () => { cancelled = true; };
  }, [refreshKey, user.id]);

  useEffect(() => {
    let cancelled = false;
    async function loadMyHost() {
      setHostLoading(true);
      const { data, error } = await supabase
        .from('hosts')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (!cancelled) {
        if (!error) setMyHost(data);
        setHostLoading(false);
      }
    }
    loadMyHost();
    return () => { cancelled = true; };
  }, [user.id, hostRefresh]);

  useEffect(() => {
    let cancelled = false;
    async function loadMyBookings() {
      setMyBookingsLoading(true);
      const { data, error } = await supabase
        .from('bookings')
        .select('*, hosts(user_id, name, location, phone, address, price, stripe_account_id, stripe_charges_enabled, email)')
        .eq('renter_user_id', user.id)
        .order('created_at', { ascending: false });
      if (!cancelled) {
        if (!error && data) setMyBookings(data);
        setMyBookingsLoading(false);
      }
    }
    loadMyBookings();
    return () => { cancelled = true; };
  }, [user.id, bookingsRefresh]);

  useEffect(() => {
    let cancelled = false;
    async function loadIncoming() {
      if (!myHost) { setIncoming([]); setIncomingLoading(false); return; }
      setIncomingLoading(true);
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('host_id', myHost.id)
        .order('created_at', { ascending: false });
      if (!cancelled) {
        if (!error && data) setIncoming(data);
        setIncomingLoading(false);
      }
    }
    loadIncoming();
    return () => { cancelled = true; };
  }, [myHost, bookingsRefresh]);

  useEffect(() => {
    let cancelled = false;
    async function loadMyReviews() {
      const { data, error } = await supabase
        .from('reviews')
        .select('booking_id')
        .eq('renter_user_id', user.id)
        .eq('reviewer_role', 'renter');
      if (!cancelled && !error && data) {
        setReviewedBookingIds(new Set(data.map(r => r.booking_id)));
      }
    }
    loadMyReviews();
    return () => { cancelled = true; };
  }, [user.id, reviewsRefresh]);

  useEffect(() => {
    let cancelled = false;
    async function loadHostReviews() {
      if (!myHost) return;
      const { data, error } = await supabase
        .from('reviews')
        .select('booking_id')
        .eq('host_id', myHost.id)
        .eq('reviewer_role', 'host');
      if (!cancelled && !error && data) {
        setHostReviewedBookingIds(new Set(data.map(r => r.booking_id)));
      }
    }
    loadHostReviews();
    return () => { cancelled = true; };
  }, [myHost, reviewsRefresh]);

  useEffect(() => {
    let cancelled = false;
    async function loadReceivedReviews() {
      const { data, error } = await supabase
        .from('reviews')
        .select('booking_id, rating, comment')
        .eq('renter_user_id', user.id)
        .eq('reviewer_role', 'host');
      if (!cancelled && !error && data) {
        const map = {};
        data.forEach(r => { map[r.booking_id] = r; });
        setReceivedReviews(map);
      }
    }
    loadReceivedReviews();
    return () => { cancelled = true; };
  }, [user.id, reviewsRefresh]);

  useEffect(() => {
    if (!connectReturn || hostLoading) return;
    if (!myHost || !myHost.stripe_account_id) { onConnectReturnHandled(); return; }
    (async () => {
      setConnectChecking(true);
      try {
        const res = await fetch('/api/stripe-connect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'status', accountId: myHost.stripe_account_id }),
        });
        const data = await res.json();
        if (res.ok) {
          await supabase.from('hosts').update({ stripe_charges_enabled: !!data.chargesEnabled }).eq('id', myHost.id);
          setHostRefresh(k => k + 1);
        }
      } catch (e) { /* ignore, host can just try again */ }
      setConnectChecking(false);
      onConnectReturnHandled();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectReturn, hostLoading, myHost]);

  useEffect(() => {
    if (!bookingPaymentReturn) return;
    (async () => {
      setVerifyingBookingPayment(true);
      try {
        const res = await fetch('/api/stripe-verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'verify-booking', sessionId: bookingPaymentReturn.sessionId }),
        });
        const data = await res.json();
        if (res.ok && data.paid) {
          await supabase.from('bookings').update({
            payment_status: 'paid',
            amount_total: data.amountTotal,
            stripe_session_id: bookingPaymentReturn.sessionId,
            stripe_payment_intent_id: data.paymentIntentId,
          }).eq('id', bookingPaymentReturn.bookingId);
          const { data: bd } = await supabase
            .from('bookings')
            .select('plant_name, hosts(user_id, email)')
            .eq('id', bookingPaymentReturn.bookingId)
            .maybeSingle();
          if (bd?.hosts?.user_id) {
            await createNotification(
              bd.hosts.user_id,
              'booking_paid',
              { plant: bd.plant_name, amount: data.amountTotal },
              bookingPaymentReturn.bookingId,
              bd.hosts.email || null
            );
          }
          setBookingsRefresh(k => k + 1);
        }
      } catch (e) { /* ignore, renter can retry from the booking */ }
      setVerifyingBookingPayment(false);
      onBookingPaymentReturnHandled();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingPaymentReturn]);

  const respondToBooking = async (bookingId, newStatus) => {
    const b = incoming.find(x => x.id === bookingId);

    if (newStatus === 'accepted' && b && myHost) {
      const { data: overlapping } = await supabase
        .from('bookings')
        .select('id, quantity')
        .eq('host_id', myHost.id)
        .eq('status', 'accepted')
        .lte('start_date', b.end_date)
        .gte('end_date', b.start_date);
      const currentCount = (overlapping || []).reduce((sum, o) => sum + (o.quantity || 1), 0);
      if (currentCount + (b.quantity || 1) > myHost.plants_capacity) {
        alert(t('profile.capacityExceeded', { current: currentCount, limit: myHost.plants_capacity }));
        return;
      }
    }

    await supabase.from('bookings').update({ status: newStatus, responded_at: new Date().toISOString() }).eq('id', bookingId);

    // Przeliczamy sredni czas odpowiedzi hosta na podstawie WSZYSTKICH jego dotychczasowych
    // odpowiedzi - prosciej i bezpieczniej niz probowac aktualizowac srednia "na biezaco".
    if (myHost) {
      const { data: responded } = await supabase
        .from('bookings')
        .select('created_at, responded_at')
        .eq('host_id', myHost.id)
        .not('responded_at', 'is', null);
      if (responded && responded.length > 0) {
        const totalMinutes = responded.reduce((sum, r) => {
          const diffMs = new Date(r.responded_at) - new Date(r.created_at);
          return sum + Math.max(0, diffMs) / 60000;
        }, 0);
        const avgMinutes = Math.round(totalMinutes / responded.length);
        await supabase.from('hosts').update({ avg_response_minutes: avgMinutes }).eq('id', myHost.id);
      }
    }

    if (b) {
      const qtyLabel = b.quantity > 1 ? ` (×${b.quantity} szt.)` : '';
      await createNotification(
        b.renter_user_id,
        newStatus === 'accepted' ? 'booking_accepted' : 'booking_rejected',
        { plant: b.plant_name, qty: b.quantity },
        bookingId,
        b.renter_email || null
      );
    }
    setBookingsRefresh(k => k + 1);
  };

  const cancelMyBooking = async (bookingId) => {
    const b = myBookings.find(x => x.id === bookingId);
    setCancellingBookingId(bookingId);

    if (b?.payment_status === 'paid' && b?.stripe_payment_intent_id) {
      try {
        const res = await fetch('/api/stripe-verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'refund', paymentIntentId: b.stripe_payment_intent_id }),
        });
        if (!res.ok) {
          setCancellingBookingId(null);
          alert(t('profile.refundFailed'));
          return;
        }
        await supabase.from('bookings').update({ status: 'cancelled', payment_status: 'refunded' }).eq('id', bookingId);
      } catch (e) {
        setCancellingBookingId(null);
        alert(t('profile.refundFailed'));
        return;
      }
    } else {
      await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', bookingId);
    }

    if (b?.hosts?.user_id) {
      await createNotification(
        b.hosts.user_id,
        b.payment_status === 'paid' ? 'booking_cancelled_refund' : 'booking_cancelled',
        { plant: b.plant_name },
        bookingId,
        b.hosts.email || null
      );
    }

    // Zwolnilo sie realne miejsce (rezerwacja BYLA zaakceptowana) - powiadamiamy obserwatorow tego hosta.
    if (b?.status === 'accepted' && b?.host_id) {
      notifyHostWatchers(b.host_id, b.hosts?.name);
    }
    setCancellingBookingId(null);
    setBookingsRefresh(k => k + 1);
  };

  const deletePlant = async (plantId) => {
    setDeletingPlantId(plantId);
    const { error } = await supabase.from('plants').delete().eq('id', plantId);
    setDeletingPlantId(null);
    if (!error) {
      setPlants(prev => prev.filter(p => p.id !== plantId));
    }
  };

  const handleSaveName = async () => {
    if (!nameInput.trim()) return;
    setSavingName(true);
    const { data, error } = await supabase.auth.updateUser({ data: { full_name: nameInput.trim() } });
    setSavingName(false);
    if (!error && data?.user) {
      onUserUpdated(data.user);
      setEditingName(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    const resized = await resizeImage(file, 400);
    const { error } = await supabase.from('profiles').upsert({ id: user.id, avatar_url: resized, updated_at: new Date().toISOString() });
    if (!error) {
      setProfileAvatarUrl(resized);
      if (myHost) {
        await supabase.from('hosts').update({ photo_url: resized }).eq('id', myHost.id);
        setHostRefresh(k => k + 1);
      }
    }
    setAvatarUploading(false);
  };

  const handleConnectStripe = async () => {
    setConnectLoading(true);
    try {
      const res = await fetch('/api/stripe-connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          hostId: myHost.id,
          existingAccountId: myHost.stripe_account_id || null,
          email: user.email,
          origin: window.location.origin,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setConnectLoading(false);
        return;
      }
      if (!myHost.stripe_account_id && data.accountId) {
        await supabase.from('hosts').update({ stripe_account_id: data.accountId }).eq('id', myHost.id);
      }
      window.location.href = data.url;
    } catch (e) {
      setConnectLoading(false);
    }
  };

  const handlePayForBooking = async (booking) => {
    setPayingBookingId(booking.id);
    try {
      const res = await fetch('/api/stripe-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'booking',
          bookingId: booking.id,
          hostStripeAccountId: booking.hosts?.stripe_account_id,
          hostPricePerDay: booking.hosts?.price,
          startDate: booking.start_date,
          endDate: booking.end_date,
          hostName: booking.hosts?.name,
          plantName: booking.plant_name,
          quantity: booking.quantity,
          origin: window.location.origin,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setPayingBookingId(null);
        return;
      }
      window.location.href = data.url;
    } catch (e) {
      setPayingBookingId(null);
    }
  };

  if (showHostDashboard) {
    return <HostDashboardScreen myHost={myHost} onBack={() => setShowHostDashboard(false)} />;
  }

  if (showTermsInProfile) {
    return <TermsScreen onBack={() => setShowTermsInProfile(false)} />;
  }

  if (showSupport) {
    return <SupportScreen userId={user.id} userEmail={user.email} onBack={() => setShowSupport(false)} />;
  }

  if (showHostForm || editingHost) {
    return (
      <BecomeHostForm
        userId={user.id}
        existingHost={editingHost ? myHost : null}
        userAvatarUrl={profileAvatarUrl}
        onCancel={() => { setShowHostForm(false); setEditingHost(false); }}
        onSaved={() => { setShowHostForm(false); setEditingHost(false); setHostRefresh(k => k + 1); }}
      />
    );
  }

  if (reviewingBooking) {
    return (
      <ReviewForm
        booking={reviewingBooking}
        userId={user.id}
        userName={displayNameOf(user) !== user.email ? displayNameOf(user) : null}
        onCancel={() => setReviewingBooking(null)}
        onSaved={() => { setReviewingBooking(null); setReviewsRefresh(k => k + 1); }}
      />
    );
  }

  if (reviewingAsHostBooking) {
    return (
      <HostReviewForm
        booking={reviewingAsHostBooking}
        hostName={myHost?.name}
        onCancel={() => setReviewingAsHostBooking(null)}
        onSaved={() => { setReviewingAsHostBooking(null); setReviewsRefresh(k => k + 1); }}
      />
    );
  }

  if (showConversations) {
    return (
      <ConversationsListScreen
        myUserId={user.id}
        onOpenConversation={(conv) => { setShowConversations(false); onOpenConversation(conv); }}
        onBack={() => setShowConversations(false)}
      />
    );
  }

  const pendingIncoming = incoming.filter(b => b.status === 'pending');
  const acceptedIncoming = incoming.filter(b => b.status === 'accepted');

  const renderPendingCard = (b) => (
    <div key={b.id} style={{ background: colors.card, border: `1.5px solid ${colors.gold}`, borderRadius: 14, padding: 14, marginBottom: 10 }}>
      <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 700, color: colors.ink, marginBottom: 2 }}>
        {b.plant_name}{b.quantity > 1 ? ` × ${b.quantity}` : ''}
      </div>
      <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#7A7261', marginBottom: 2 }}>{t('profile.from')} {b.renter_name || b.renter_email}</div>
      <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#7A7261', marginBottom: 10 }}>{b.start_date} → {b.end_date}</div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => respondToBooking(b.id, 'accepted')} style={{
          flex: 1, padding: 10, borderRadius: 10, background: colors.fern, color: '#fff', border: 'none',
          fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 12.5, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4
        }}><CheckCircle size={14} /> {t('profile.accept')}</button>
        <button onClick={() => respondToBooking(b.id, 'rejected')} style={{
          flex: 1, padding: 10, borderRadius: 10, background: colors.clayLight, color: colors.clay, border: 'none',
          fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 12.5, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4
        }}><XCircle size={14} /> {t('profile.reject')}</button>
      </div>
    </div>
  );

  const renderAcceptedCard = (b) => (
    <div key={b.id} style={{ background: colors.card, border: `1px solid ${colors.line}`, borderRadius: 14, padding: 14, marginBottom: 10 }}>
      <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 700, color: colors.ink, marginBottom: 2 }}>
        {b.plant_name}{b.quantity > 1 ? ` × ${b.quantity}` : ''}
      </div>
      <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#7A7261' }}>{b.start_date} → {b.end_date}</div>
      {b.payment_status === 'paid' ? (
        <div style={{ marginTop: 8, fontFamily: 'Inter, sans-serif', fontSize: 11.5, color: colors.fern, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
          <CheckCircle size={13} /> {t('profile.paidWithShare', { total: b.amount_total, share: Math.round(b.amount_total * 0.9 * 100) / 100 })}
        </div>
      ) : (
        <div style={{ marginTop: 8, fontFamily: 'Inter, sans-serif', fontSize: 11.5, color: colors.muted }}>
          {t('profile.awaitingPayment')}
        </div>
      )}
      <ContactBlock title={t('profile.contactOwner')} phone={b.renter_phone} extra={`${b.renter_name || t('profile.noNameGiven')} · ${b.renter_email}`} />
      {b.payment_status === 'paid' && !hostReviewedBookingIds.has(b.id) && (
        <button onClick={() => setReviewingAsHostBooking(b)} style={{
          marginTop: 10, width: '100%', padding: 10, borderRadius: 10, background: colors.gold, color: '#fff',
          border: 'none', fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 12.5, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
        }}><MessageCircle size={14} /> {t('profile.rateRenter')}</button>
      )}
      {b.payment_status === 'paid' && hostReviewedBookingIds.has(b.id) && (
        <div style={{ marginTop: 10, fontFamily: 'Inter, sans-serif', fontSize: 11.5, color: colors.fern, display: 'flex', alignItems: 'center', gap: 4 }}>
          <Check size={13} /> {t('profile.renterReviewGiven')}
        </div>
      )}
    </div>
  );

  const renderBookingCard = (b) => {
    const si = statusInfo(b.status);
    const alreadyReviewed = reviewedBookingIds.has(b.id);
    const needsPayment = b.status === 'accepted' && b.payment_status !== 'paid';
    const hostReady = b.hosts?.stripe_account_id && b.hosts?.stripe_charges_enabled;
    const estDays = daysBetween(b.start_date, b.end_date);
    const estTotal = b.amount_total ?? (estDays * (b.hosts?.price ?? 0) * (b.quantity || 1));
    return (
      <div key={b.id} style={{ background: colors.card, border: `1px solid ${colors.line}`, borderRadius: 14, padding: 14, marginBottom: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
          <div>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 700, color: colors.ink }}>
              {b.plant_name}{b.quantity > 1 ? ` × ${b.quantity}` : ''}
            </div>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#7A7261' }}>u {b.hosts?.name} · {b.hosts?.location}</div>
          </div>
          <Pill tone={si.tone}>{t(si.labelKey)}</Pill>
        </div>
        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#7A7261' }}>{b.start_date} → {b.end_date}</div>

        {b.status === 'accepted' && (
          <ContactBlock title={t('profile.contactHost')} phone={b.hosts?.phone} address={b.hosts?.address} />
        )}

        {b.payment_status === 'paid' && (
          <div style={{ marginTop: 10, fontFamily: 'Inter, sans-serif', fontSize: 11.5, color: colors.fern, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
            <CheckCircle size={13} /> {t('profile.paidAmount', { amount: b.amount_total })}
          </div>
        )}

        {receivedReviews[b.id] && (
          <div style={{ marginTop: 10, background: '#FFF8EC', borderRadius: 10, padding: 10 }}>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 10.5, fontWeight: 700, color: colors.gold, textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 4 }}>
              {t('profile.hostReviewOfYou')}
            </div>
            <div style={{ display: 'flex', gap: 2, marginBottom: 4 }}>
              {[1,2,3,4,5].map(n => (
                <Star key={n} size={12} fill={n <= receivedReviews[b.id].rating ? colors.gold : 'none'} color={colors.gold} />
              ))}
            </div>
            {receivedReviews[b.id].comment && (
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#5A5445', fontStyle: 'italic' }}>{receivedReviews[b.id].comment}</div>
            )}
          </div>
        )}

        {needsPayment && verifyingBookingPayment && (
          <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Inter, sans-serif', fontSize: 12.5, color: colors.muted }}>
            <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> {t('profile.checkingPayment')}
          </div>
        )}

        {needsPayment && !verifyingBookingPayment && hostReady && (
          <button onClick={() => handlePayForBooking(b)} disabled={payingBookingId === b.id} style={{
            marginTop: 10, width: '100%', padding: 10, borderRadius: 10, background: colors.clay, color: '#fff',
            border: 'none', fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 12.5, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            opacity: payingBookingId === b.id ? 0.7 : 1
          }}>
            {payingBookingId === b.id
              ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
              : <CreditCard size={14} />}
            {payingBookingId === b.id ? t('profile.redirecting') : t('profile.payConfirm', { total: estTotal })}
          </button>
        )}

        {needsPayment && !verifyingBookingPayment && !hostReady && (
          <div style={{ marginTop: 10, fontFamily: 'Inter, sans-serif', fontSize: 11.5, color: colors.muted }}>
            {t('profile.hostNoPayout')}
          </div>
        )}

        {b.status === 'pending' && (
          <button onClick={() => cancelMyBooking(b.id)} disabled={cancellingBookingId === b.id} style={{
            marginTop: 10, width: '100%', padding: 10, borderRadius: 10, background: colors.clayLight, color: colors.clay,
            border: 'none', fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 12.5, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            opacity: cancellingBookingId === b.id ? 0.7 : 1
          }}>
            {cancellingBookingId === b.id ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <X size={14} />}
            {t('profile.cancelRequest')}
          </button>
        )}

        {b.status === 'accepted' && (b.payment_status === 'paid' || b.payment_status === 'unpaid') && isUpcoming(b.start_date) && (
          <button
            onClick={() => {
              const msg = b.payment_status === 'paid'
                ? t('profile.confirmCancelPaid', { amount: b.amount_total })
                : t('profile.confirmCancel');
              if (window.confirm(msg)) cancelMyBooking(b.id);
            }}
            disabled={cancellingBookingId === b.id}
            style={{
              marginTop: 10, width: '100%', padding: 10, borderRadius: 10, background: colors.clayLight, color: colors.clay,
              border: 'none', fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 12.5, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              opacity: cancellingBookingId === b.id ? 0.7 : 1
            }}
          >
            {cancellingBookingId === b.id ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <X size={14} />}
            {cancellingBookingId === b.id ? t('profile.cancelling') : b.payment_status === 'paid' ? t('profile.cancelAndRefund') : t('profile.cancelBooking')}
          </button>
        )}

        {b.status === 'accepted' && b.payment_status === 'paid' && !alreadyReviewed && (
          <button onClick={() => setReviewingBooking(b)} style={{
            marginTop: 10, width: '100%', padding: 10, borderRadius: 10, background: colors.gold, color: '#fff',
            border: 'none', fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 12.5, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
          }}><MessageCircle size={14} /> {t('profile.leaveReview')}</button>
        )}
        {b.status === 'accepted' && alreadyReviewed && (
          <div style={{ marginTop: 10, fontFamily: 'Inter, sans-serif', fontSize: 11.5, color: colors.fern, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Check size={13} /> {t('profile.reviewGiven')}
          </div>
        )}
      </div>
    );
  };

  const renderPlantCard = (p) => {
    const history = plantHistory[p.id] || [];
    const active = history.find(h => h.status === 'accepted' && new Date(h.end_date) >= new Date().setHours(0,0,0,0));
    return (
      <div key={p.id} style={{ background: colors.card, border: `1px solid ${colors.line}`, borderRadius: 14, marginBottom: 10, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12 }}>
          <div onClick={() => togglePlantExpand(p.id)} style={{
            width: 40, height: 40, borderRadius: 10, background: colors.clayLight, overflow: 'hidden', flexShrink: 0, cursor: 'pointer'
          }}>
            {p.photo_url && <img src={p.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
          </div>
          <div onClick={() => togglePlantExpand(p.id)} style={{ flex: 1, cursor: 'pointer' }}>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600, color: colors.ink }}>
              {p.name}{p.quantity > 1 ? ` × ${p.quantity}` : ''}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
              {p.care_guide && (
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: colors.gold, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Crown size={11} /> Premium
                </div>
              )}
              {active ? (
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: colors.fern, fontWeight: 700 }}>
                  {t('profile.currentlyAt', { name: active.hosts?.name })}
                </div>
              ) : (
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: colors.muted }}>{t('profile.atYourHome')}</div>
              )}
            </div>
          </div>
          <button
            onClick={() => { if (window.confirm(t('profile.confirmDeletePlant', { name: p.name }))) deletePlant(p.id); }}
            disabled={deletingPlantId === p.id}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: 6, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            {deletingPlantId === p.id
              ? <Loader2 size={16} color="#A9A08B" style={{ animation: 'spin 1s linear infinite' }} />
              : <Trash2 size={16} color="#A9A08B" />}
          </button>
        </div>
        {expandedPlantId === p.id && (
          <div style={{ padding: '0 16px 16px' }}>
            {p.care_guide && <div style={{ marginBottom: 14 }}><CareGuide text={p.care_guide} /></div>}
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 700, color: colors.ink, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 8 }}>
              {t('profile.hostHistory')}
            </div>
            {loadingPlantHistory === p.id && (
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12.5, color: colors.muted }}>{t('profile.loading')}</div>
            )}
            {loadingPlantHistory !== p.id && history.length === 0 && (
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12.5, color: colors.muted }}>{t('profile.neverAtHost')}</div>
            )}
            {loadingPlantHistory !== p.id && history.map(h => (
              <div key={h.id} style={{ background: colors.bg, borderRadius: 10, padding: 10, marginBottom: 6 }}>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12.5, fontWeight: 700, color: colors.ink }}>
                  {h.hosts?.name} {h.quantity > 1 ? `(×${h.quantity})` : ''} · {h.hosts?.location}
                </div>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11.5, color: '#7A7261', marginTop: 2 }}>
                  {h.start_date} → {h.end_date}
                </div>
                <div style={{ marginTop: 4 }}>
                  <Pill tone={statusInfo(h.status).tone}>{t(statusInfo(h.status).labelKey)}</Pill>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const viewAllBtnStyle = {
    width: '100%', padding: 10, borderRadius: 10, background: 'none', border: `1.5px dashed ${colors.line}`,
    color: colors.fern, fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 12.5, cursor: 'pointer', marginBottom: 10
  };

  if (fullListView === 'pending') {
    return (
      <FullListScreen title={t('profile.bookingRequests')} items={pendingIncoming} renderItem={renderPendingCard}
        getDate={(b) => b.created_at} onBack={() => setFullListView(null)} emptyText={t('profile.noRequests')} />
    );
  }
  if (fullListView === 'accepted') {
    return (
      <FullListScreen title={t('profile.acceptedBookings')} items={acceptedIncoming} renderItem={renderAcceptedCard}
        getDate={(b) => b.created_at} onBack={() => setFullListView(null)} emptyText={t('profile.noAccepted')} />
    );
  }
  if (fullListView === 'bookings') {
    return (
      <FullListScreen
        title="Twoje rezerwacje" items={myBookings} renderItem={renderBookingCard}
        statusOptions={[
          { value: 'pending', label: t('status.pending') },
          { value: 'accepted', label: t('status.accepted') },
          { value: 'rejected', label: t('status.rejected') },
          { value: 'cancelled', label: t('status.cancelled') },
        ]}
        getStatus={(b) => b.status}
        getDate={(b) => b.created_at}
        onBack={() => setFullListView(null)}
        emptyText={t('profile.noBookings')}
      />
    );
  }
  if (fullListView === 'plants') {
    return (
      <FullListScreen title={t('profile.yourPlants')} items={plants} renderItem={renderPlantCard}
        getDate={(p) => p.created_at} onBack={() => setFullListView(null)} emptyText={t('profile.noPlants')} />
    );
  }

  return (
    <div style={{ flex: 1, padding: 20, overflow: 'auto', position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
        <input
          ref={avatarFileInputRef}
          type="file"
          accept="image/*"
          onChange={handleAvatarChange}
          style={{ display: 'none' }}
        />
        <div onClick={() => avatarFileInputRef.current?.click()} style={{ position: 'relative', cursor: 'pointer', flexShrink: 0 }}>
          <Avatar photoUrl={profileAvatarUrl} name={displayNameOf(user)} size={60} radius={30} />
          <div style={{
            position: 'absolute', bottom: -2, right: -2, width: 22, height: 22, borderRadius: 11,
            background: colors.gold, border: `2px solid ${colors.bg}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            {avatarUploading
              ? <Loader2 size={11} color="#fff" style={{ animation: 'spin 1s linear infinite' }} />
              : <Pencil size={10} color="#fff" />}
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: colors.ink, wordBreak: 'break-word' }}>{displayNameOf(user)}</div>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11.5, color: colors.muted, wordBreak: 'break-all' }}>{user.email}</div>
        </div>
        <button onClick={() => setShowSupport(true)} style={{
          background: colors.clayLight, border: 'none', borderRadius: 12, padding: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0
        }}>
          <HelpCircle size={16} color={colors.ink} />
        </button>
        <button onClick={() => setShowConversations(true)} style={{
          background: colors.clayLight, border: 'none', borderRadius: 12, padding: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0,
          position: 'relative'
        }}>
          <MessageCircle size={16} color={colors.ink} />
          {unreadMessagesCount > 0 && (
            <div style={{
              position: 'absolute', top: -3, right: -3, minWidth: 16, height: 16, borderRadius: 8,
              background: colors.clay, color: '#fff', fontSize: 9.5, fontWeight: 700, fontFamily: 'Inter, sans-serif',
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px'
            }}>{unreadMessagesCount > 9 ? '9+' : unreadMessagesCount}</div>
          )}
        </button>
        <button onClick={() => setShowNotifications(s => !s)} style={{
          background: colors.clayLight, border: 'none', borderRadius: 12, padding: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0,
          position: 'relative'
        }}>
          <Bell size={16} color={colors.ink} />
          {unreadCount > 0 && (
            <div style={{
              position: 'absolute', top: -3, right: -3, minWidth: 16, height: 16, borderRadius: 8,
              background: colors.clay, color: '#fff', fontSize: 9.5, fontWeight: 700, fontFamily: 'Inter, sans-serif',
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px'
            }}>{unreadCount > 9 ? '9+' : unreadCount}</div>
          )}
        </button>
        <button onClick={onSignOut} style={{
          background: colors.clayLight, border: 'none', borderRadius: 12, padding: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0
        }}>
          <LogOut size={16} color={colors.clay} />
        </button>
      </div>

      {showNotifications && (
        <div style={{
          background: colors.card, border: `1px solid ${colors.line}`, borderRadius: 16,
          marginBottom: 20, overflow: 'hidden'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderBottom: `1px solid ${colors.line}` }}>
            <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 12.5, color: colors.ink }}>{t('profile.notifications')}</span>
            <button onClick={() => setShowNotifications(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
              <X size={15} color="#A9A08B" />
            </button>
          </div>
          <div style={{ maxHeight: 300, overflow: 'auto' }}>
            {notifLoading && <div style={{ padding: 14, fontFamily: 'Inter, sans-serif', fontSize: 12.5, color: colors.muted }}>{t('profile.loading')}</div>}
            {!notifLoading && notifications.length === 0 && (
              <div style={{ padding: 14, fontFamily: 'Inter, sans-serif', fontSize: 12.5, color: colors.muted }}>{t('profile.noNotifications')}</div>
            )}
            {!notifLoading && notifications.map(n => {
              // Nowe powiadomienia maja params -> tlumaczymy na biezaco.
              // Starsze (sprzed zmiany) maja tylko zapisany tekst -> pokazujemy go bez zmian.
              const nt = n.params
                ? notificationText(lang, n.type, n.params)
                : { title: n.title, body: n.body };
              return (
              <div key={n.id} onClick={() => !n.read && markNotificationRead(n.id)} style={{
                padding: '12px 14px', borderBottom: `1px solid ${colors.line}`, cursor: n.read ? 'default' : 'pointer',
                background: n.read ? 'transparent' : '#FFF8EC'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {!n.read && <div style={{ width: 6, height: 6, borderRadius: 3, background: colors.gold, flexShrink: 0 }} />}
                  <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 12.5, color: colors.ink }}>{nt.title}</span>
                </div>
                {nt.body && <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11.5, color: '#7A7261', marginTop: 3 }}>{nt.body}</div>}
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: colors.muted, marginTop: 4 }}>{formatDate(n.created_at)}</div>
              </div>
              );
            })}
          </div>
          <div onClick={toggleEmailNotifications} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderTop: `1px solid ${colors.line}`, cursor: 'pointer'
          }}>
            <div style={{
              width: 34, height: 20, borderRadius: 10, flexShrink: 0, position: 'relative',
              background: emailNotifications ? colors.fern : colors.line, transition: 'background 0.15s'
            }}>
              <div style={{
                position: 'absolute', top: 2, left: emailNotifications ? 16 : 2, width: 16, height: 16, borderRadius: 8,
                background: '#fff', transition: 'left 0.15s'
              }} />
            </div>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#7A7261' }}>
              {savingEmailPref ? t('profile.saving') : t('profile.emailNotifications')}
            </span>
          </div>
        </div>
      )}

      {myHost && (
        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: colors.muted, marginBottom: 20 }}>
          {t('profile.photoAlsoOnListing')}
        </div>
      )}

      {!hasName && !editingName && (
        <div onClick={() => setEditingName(true)} style={{
          display: 'flex', alignItems: 'center', gap: 8, background: '#FFF8EC', border: `1.5px solid ${colors.gold}`,
          borderRadius: 12, padding: 12, marginBottom: 20, cursor: 'pointer'
        }}>
          <Pencil size={14} color={colors.gold} />
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12.5, color: colors.ink }}>{t('profile.fillNameHint')}</span>
        </div>
      )}
      {hasName && !editingName && (
        <div onClick={() => setEditingName(true)} style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 20, cursor: 'pointer' }}>
          <Pencil size={11} color="#A9A08B" />
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: colors.muted }}>{t('profile.changeName')}</span>
        </div>
      )}
      {editingName && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          <div style={{ flex: 1 }}>
            <TextField placeholder={t('profile.namePlaceholder')} value={nameInput} onChange={e => setNameInput(e.target.value)} />
          </div>
          <button onClick={handleSaveName} disabled={savingName || !nameInput.trim()} style={{
            padding: '0 16px', borderRadius: 14, background: colors.fern, color: '#fff', border: 'none',
            fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 13, cursor: 'pointer', flexShrink: 0
          }}>{savingName ? '...' : 'Zapisz'}</button>
        </div>
      )}

      {referralCode && (
        <div style={{ background: colors.card, border: `1.5px solid ${colors.gold}`, borderRadius: 16, padding: 16, marginBottom: 20 }}>
          <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 13, color: colors.ink, marginBottom: 4 }}>{t('profile.referralTitle')}</div>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11.5, color: '#7A7261', marginBottom: 10 }}>
            {t('profile.referredCount', { n: referredCount })}
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{
              flex: 1, fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 700, color: colors.gold,
              background: '#FFF8EC', borderRadius: 10, padding: '8px 12px', letterSpacing: 0.5
            }}>{referralCode}</div>
            <button onClick={copyReferralLink} style={{
              padding: '9px 14px', borderRadius: 10, background: colors.gold, color: '#fff', border: 'none',
              fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 12, cursor: 'pointer', flexShrink: 0
            }}>{referralCopied ? t('profile.copied') : t('profile.copyLink')}</button>
          </div>
        </div>
      )}

      <WeatherWidget />

      {myHost && pendingIncoming.length > 0 && (
        <>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 700, color: colors.ink, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {t('profile.bookingRequests')} ({pendingIncoming.length})
          </div>
          {renderPendingCard([...pendingIncoming].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0])}
          {pendingIncoming.length > 1 && (
            <button onClick={() => setFullListView('pending')} style={viewAllBtnStyle}>{t('profile.viewAll', { n: pendingIncoming.length })}</button>
          )}
        </>
      )}

      {myHost && acceptedIncoming.length > 0 && (
        <>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 700, color: colors.ink, marginBottom: 10, marginTop: pendingIncoming.length > 0 ? 20 : 0, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {t('profile.acceptedBookings')} ({acceptedIncoming.length})
          </div>
          {renderAcceptedCard([...acceptedIncoming].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0])}
          {acceptedIncoming.length > 1 && (
            <button onClick={() => setFullListView('accepted')} style={viewAllBtnStyle}>{t('profile.viewAll', { n: acceptedIncoming.length })}</button>
          )}
        </>
      )}

      <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 700, color: colors.ink, marginBottom: 10, marginTop: (myHost && (pendingIncoming.length > 0 || acceptedIncoming.length > 0)) ? 20 : 0, textTransform: 'uppercase', letterSpacing: 0.5 }}>{t('profile.yourBookings')}</div>
      {myBookingsLoading && (
        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: colors.muted, marginBottom: 20 }}>{t('profile.loading')}</div>
      )}
      {!myBookingsLoading && myBookings.length === 0 && (
        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: colors.muted, marginBottom: 20 }}>{t('profile.noBookings')}</div>
      )}
      {!myBookingsLoading && myBookings.length > 0 && renderBookingCard([...myBookings].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0])}
      {!myBookingsLoading && myBookings.length > 1 && (
        <button onClick={() => setFullListView('bookings')} style={viewAllBtnStyle}>{t('profile.viewAll', { n: myBookings.length })}</button>
      )}

      <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 700, color: colors.ink, marginBottom: 10, marginTop: 20, textTransform: 'uppercase', letterSpacing: 0.5 }}>{t('profile.yourPlants')}</div>

      {loading && (
        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: colors.muted }}>{t('profile.loading')}</div>
      )}

      {!loading && plants.length === 0 && (
        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: colors.muted }}>{t('profile.noPlants')}</div>
      )}

      {!loading && plants.length > 0 && renderPlantCard([...plants].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0])}
      {!loading && plants.length > 1 && (
        <button onClick={() => setFullListView('plants')} style={viewAllBtnStyle}>{t('profile.viewAll', { n: plants.length })}</button>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '20px 0 10px' }}>
        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 700, color: colors.ink, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          {myHost ? t('profile.yourHostProfile') : t('profile.becomeHostTitle')}
        </span>
        {myHost && (
          <div style={{ display: 'flex', gap: 14 }}>
            <button onClick={() => setShowHostDashboard(true)} style={{
              background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, padding: 0
            }}>
              <DollarSign size={11} color={colors.fern} />
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: colors.fern, fontWeight: 700 }}>{t('profile.hostPanel')}</span>
            </button>
            <button onClick={() => setEditingHost(true)} style={{
              background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, padding: 0
            }}>
              <Pencil size={11} color="#A9A08B" />
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: colors.muted }}>Edytuj</span>
            </button>
          </div>
        )}
      </div>

      {hostLoading && (
        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: colors.muted }}>{t('profile.loading')}</div>
      )}

      {!hostLoading && myHost && (
        <div style={{ background: colors.card, border: `1px solid ${colors.line}`, borderRadius: 16, padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <Avatar photoUrl={myHost.photo_url} name={myHost.name} size={40} radius={10} />
            <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 14, color: colors.ink }}>{myHost.name}</span>
              <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 14, color: colors.clay }}>{myHost.price} zł</span>
            </div>
          </div>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#7A7261' }}>{myHost.location} · {myHost.plants_capacity} miejsc</div>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11.5, color: colors.fern, marginTop: 6 }}>
            {t('profile.profileVisible')}{myHost.latitude != null ? t('profile.gpsSaved') : ''}
          </div>

          <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${colors.line}` }}>
            {connectChecking ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Inter, sans-serif', fontSize: 12.5, color: colors.muted }}>
                <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> {t('profile.checkingPayoutAccount')}
              </div>
            ) : myHost.stripe_charges_enabled ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'Inter, sans-serif', fontSize: 12.5, color: colors.fern, fontWeight: 700 }}>
                <CheckCircle size={14} /> {t('profile.payoutConnected')}
              </div>
            ) : (
              <>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#7A7261', marginBottom: 8 }}>
                  {t('profile.connectStripeHint')}
                </div>
                <button onClick={handleConnectStripe} disabled={connectLoading} style={{
                  width: '100%', padding: 12, borderRadius: 12, background: colors.ink, color: '#fff', border: 'none',
                  fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 13, cursor: connectLoading ? 'default' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: connectLoading ? 0.7 : 1
                }}>
                  {connectLoading ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Wallet size={15} />}
                  {connectLoading ? t('profile.redirecting') : t('profile.connectStripe')}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {!hostLoading && !myHost && (
        <div onClick={() => setShowHostForm(true)} style={{ background: colors.fern, borderRadius: 16, padding: 16, color: '#fff', cursor: 'pointer' }}>
          <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{t('profile.earnTitle')}</div>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12.5, opacity: 0.9 }}>{t('profile.becomeHostText')}</div>
        </div>
      )}

      <div style={{ marginTop: 28, paddingTop: 20, borderTop: `1px solid ${colors.line}` }}>
        <div style={{
          fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 700, color: colors.muted,
          textTransform: 'uppercase', letterSpacing: 0.4, textAlign: 'center', marginBottom: 10
        }}>
          {t('auth.languageLabel')}
        </div>
        <LanguagePicker compact />
      </div>

      <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${colors.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12.5, color: colors.ink, fontWeight: 600 }}>
          {theme === 'dark' ? t('profile.darkMode') : t('profile.lightMode')}
        </span>
        <button
          onClick={toggleTheme}
          aria-label={t('profile.toggleTheme')}
          style={{
            width: 44, height: 26, borderRadius: 13, border: 'none', cursor: 'pointer',
            background: theme === 'dark' ? colors.fern : colors.line, position: 'relative',
            transition: 'background 0.2s', padding: 0, flexShrink: 0
          }}
        >
          <span style={{
            position: 'absolute', top: 3, left: theme === 'dark' ? 21 : 3,
            width: 20, height: 20, borderRadius: '50%', background: colors.card,
            transition: 'left 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            {theme === 'dark' ? <Moon size={12} color={colors.fern} /> : <Sun size={12} color={colors.gold} />}
          </span>
        </button>
      </div>

      <div
        onClick={() => setShowTermsInProfile(true)}
        style={{ textAlign: 'center', marginTop: 20, cursor: 'pointer' }}
      >
        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11.5, color: colors.muted, textDecoration: 'underline' }}>
          {t('profile.terms')}
        </span>
      </div>
    </div>
  );
}

function readPremiumReturnFromUrl() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('premium_paid') === '1' && params.get('session_id')) {
    const result = {
      plant: params.get('plant') || '',
      sunlight: params.get('sunlight') || '',
      sessionId: params.get('session_id'),
    };
    window.history.replaceState({}, '', window.location.pathname);
    return result;
  }
  if (params.get('premium_cancelled') === '1') {
    window.history.replaceState({}, '', window.location.pathname);
  }
  return null;
}

function readConnectReturnFromUrl() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('connect_return') === '1' || params.get('connect_refresh') === '1') {
    window.history.replaceState({}, '', window.location.pathname);
    return true;
  }
  return false;
}

function readBookingPaymentReturnFromUrl() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('booking_paid') === '1' && params.get('session_id') && params.get('booking_id')) {
    const result = {
      bookingId: params.get('booking_id'),
      sessionId: params.get('session_id'),
    };
    window.history.replaceState({}, '', window.location.pathname);
    return result;
  }
  if (params.get('booking_payment_cancelled') === '1') {
    window.history.replaceState({}, '', window.location.pathname);
  }
  return null;
}

function readReferralCodeFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('ref') || null;
}

export default function App() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [tab, setTab] = useState('home');
  const isDesktop = useIsDesktop();
  const [view, setView] = useState('list');
  const [selectedHost, setSelectedHost] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);

  const refreshUnreadCount = React.useCallback(async () => {
    if (!session?.user?.id) { setUnreadNotifCount(0); return; }
    const { count } = await supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', session.user.id)
      .eq('read', false);
    setUnreadNotifCount(count || 0);
  }, [session?.user?.id]);

  useEffect(() => {
    refreshUnreadCount();
  }, [refreshUnreadCount, tab, refreshKey]);

  const [premiumReturn, setPremiumReturn] = useState(null);
  const [connectReturn, setConnectReturn] = useState(false);
  const [bookingPaymentReturn, setBookingPaymentReturn] = useState(null);
  const [activeConversation, setActiveConversation] = useState(null);
  const [referralCodeFromUrl, setReferralCodeFromUrl] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const [lang, setLangState] = useState(detectInitialLanguage);

  const setLang = React.useCallback((newLang) => {
    setLangState(newLang);
    try { localStorage.setItem('leafsit_lang', newLang); } catch (e) { /* ignore */ }
    supabase.auth.getSession().then(({ data }) => {
      const uid = data?.session?.user?.id;
      if (uid) supabase.from('profiles').upsert({ id: uid, language: newLang });
    });
  }, []);

  const langValue = React.useMemo(() => ({ lang, setLang }), [lang, setLang]);

  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('leafsit_theme');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch (e) { /* ignore */ }
    try {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    } catch (e) { /* ignore */ }
    return 'light';
  });

  const toggleTheme = React.useCallback(() => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem('leafsit_theme', next); } catch (e) { /* ignore */ }
      return next;
    });
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (!session) { setOnboardingChecked(false); return; }
    let cancelled = false;
    (async () => {
      const { data } = await supabase.from('profiles').select('onboarding_seen, language').eq('id', session.user.id).maybeSingle();
      if (!cancelled) {
        setShowOnboarding(!data || data.onboarding_seen !== true);
        setOnboardingChecked(true);
        if (data?.language && TRANSLATIONS[data.language]) {
          setLangState(data.language);
          try { localStorage.setItem('leafsit_lang', data.language); } catch (e) { /* ignore */ }
        }
      }
    })();
    return () => { cancelled = true; };
  }, [session]);

  useEffect(() => {
    if (session) setupPushNotifications(session.user.id);
  }, [session]);

  const finishOnboarding = async () => {
    if (session) {
      await supabase.from('profiles').upsert({ id: session.user.id, onboarding_seen: true });
    }
    setShowOnboarding(false);
  };

  const openConversationWithHost = async (host) => {
    const myName = displayNameOf(session.user) !== session.user.email ? displayNameOf(session.user) : null;
    const { data: existing } = await supabase
      .from('conversations')
      .select('id')
      .eq('host_id', host.id)
      .eq('renter_user_id', session.user.id)
      .maybeSingle();
    let conversationId = existing?.id;
    if (!conversationId) {
      const { data: created, error } = await supabase
        .from('conversations')
        .insert([{
          host_id: host.id,
          renter_user_id: session.user.id,
          renter_name: myName,
          renter_email: session.user.email,
        }])
        .select()
        .single();
      if (error) return;
      conversationId = created.id;
    }
    setActiveConversation({ id: conversationId, otherName: host.name, otherUserId: host.user_id });
  };

  useEffect(() => {
    const pending = readPremiumReturnFromUrl();
    if (pending) {
      setPremiumReturn(pending);
      setTab('add');
    }
    const connectPending = readConnectReturnFromUrl();
    if (connectPending) {
      setConnectReturn(true);
      setTab('profile');
    }
    const bookingPaymentPending = readBookingPaymentReturnFromUrl();
    if (bookingPaymentPending) {
      setBookingPaymentReturn(bookingPaymentPending);
      setTab('profile');
    }
    const ref = readReferralCodeFromUrl();
    if (ref) setReferralCodeFromUrl(ref);
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setTab('home');
    setView('list');
  };

  const handleUserUpdated = (updatedUser) => {
    setSession(prev => prev ? { ...prev, user: updatedUser } : prev);
  };

  const renderTab = () => {
    if (activeConversation) {
      return (
        <ChatScreen
          conversationId={activeConversation.id}
          myUserId={session.user.id}
          otherName={activeConversation.otherName}
          otherUserId={activeConversation.otherUserId}
          onBack={() => setActiveConversation(null)}
        />
      );
    }
    const userName = displayNameOf(session.user) !== session.user.email ? displayNameOf(session.user) : null;

    if (tab === 'home') {
      if (view === 'detail') {
        return <HostDetailScreen host={selectedHost} userId={session.user.id} onBack={() => setView('list')} onBook={() => setView('booking')} onMessage={() => openConversationWithHost(selectedHost)} />;
      }
      if (view === 'booking') {
        return (
          <BookingForm
            host={selectedHost}
            userId={session.user.id}
            userEmail={session.user.email}
            userName={userName}
            onCancel={() => setView('detail')}
            onBooked={() => setView('list')}
          />
        );
      }
      return <HomeScreen onSelectHost={(h) => { setSelectedHost(h); setView('detail'); }} userId={session.user.id} />;
    }
    if (tab === 'add') {
      return (
        <AddPlantScreen
          userId={session.user.id}
          onPlantAdded={() => setRefreshKey(k => k + 1)}
          premiumReturn={premiumReturn}
          onPremiumReturnHandled={() => setPremiumReturn(null)}
        />
      );
    }
    if (tab === 'scan') return <ScanScreen />;
    if (tab === 'profile') {
      return (
        <ProfileScreen
          user={session.user}
          refreshKey={refreshKey}
          onSignOut={handleSignOut}
          onUserUpdated={handleUserUpdated}
          connectReturn={connectReturn}
          onConnectReturnHandled={() => setConnectReturn(false)}
          bookingPaymentReturn={bookingPaymentReturn}
          onBookingPaymentReturnHandled={() => setBookingPaymentReturn(null)}
          onOpenConversation={(conv) => setActiveConversation(conv)}
          theme={theme}
          toggleTheme={toggleTheme}
        />
      );
    }
  };

  const showMainApp = !authLoading && session && onboardingChecked && !showOnboarding;

  return (
    <LanguageContext.Provider value={langValue}>
      <div className="app-outer" style={{ minHeight: '100vh', background: colors.bg }}>
        {showMainApp && isDesktop ? (
          <div style={{
            display: 'grid', gridTemplateColumns: '240px 1fr 320px',
            justifyContent: 'center', minHeight: '100vh'
          }}>
            <Sidebar active={tab} onNav={(t) => { setTab(t); setView('list'); }} user={session.user} theme={theme} toggleTheme={toggleTheme} unreadCount={unreadNotifCount} />
            <main style={{
              padding: '32px 32px 60px', borderLeft: `1px solid ${colors.line}`, borderRight: `1px solid ${colors.line}`,
              background: colors.bg, display: 'flex', flexDirection: 'column', minWidth: 0
            }}>
              {renderTab()}
            </main>
            <RightRail onNav={(t) => { setTab(t); setView('list'); }} />
          </div>
        ) : (
          <Screen>
            {authLoading ? (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 size={28} color={colors.fern} style={{ animation: 'spin 1s linear infinite' }} />
              </div>
            ) : !session ? (
              <AuthScreen referralCodeFromUrl={referralCodeFromUrl} />
            ) : !onboardingChecked ? (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 size={28} color={colors.fern} style={{ animation: 'spin 1s linear infinite' }} />
              </div>
            ) : showOnboarding ? (
              <OnboardingScreen onFinish={finishOnboarding} />
            ) : (
              <>
                {renderTab()}
                <TabBar active={tab} onNav={(t) => { setTab(t); setView('list'); }} unreadCount={unreadNotifCount} />
              </>
            )}
          </Screen>
        )}
        <CookieBanner />
      </div>
    </LanguageContext.Provider>
  );
}
