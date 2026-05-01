'use client';

import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { Camera, Upload, Loader2, Leaf, Droplets, Sun, Wind, Info, AlertTriangle, Thermometer, Bug, Sprout, Bookmark, BookmarkCheck, Trash2, Search, Scissors, GitBranch, Stethoscope, Activity, Pill, Bell, BellOff, Calendar, Sparkles, Moon, Heart, CheckCircle2, AlertCircle, XCircle, MessageSquare, Globe, ArrowRight, LogIn, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { collection as firestoreCollection, doc, setDoc, getDocs, deleteDoc, query, where, onSnapshot } from 'firebase/firestore';

type Language = 'en' | 'ru' | 'uz';

const translations = {
  en: {
    welcome: "Welcome to BioGarden",
    onboardingSub: "Choose your preferred language to start your green journey.",
    identify: "Identify Plant",
    diagnose: "Diagnose Health",
    search: "Search your collection...",
    uploadTitle: "Capture or Upload",
    uploadSub: "Take a photo of any plant to get started",
    identifyBtn: "Identify Now",
    diagnoseBtn: "Analyze Disease",
    pests: "Common Pests",
    pruning: "Pruning",
    propagation: "Propagation",
    issues: "Common Issues",
    companion: "Companion Planting",
    growth: "Growth Stages",
    expertTips: "Expert Tips",
    careGuide: "Care Guide",
    watering: "Watering",
    light: "Light",
    humidity: "Humidity",
    temperature: "Temperature",
    soil: "Soil Type",
    save: "Save to Collection",
    saved: "Saved",
    history: "Update History",
    description: "About",
    about: "About",
    bestNeighbors: "Best Neighbors",
    pestsDeterred: "Pests Deterred",
    safety: "Safety & Toxicity",
    petSafety: "Pet Safe",
    humanSafety: "Human Safe",
    diagSuccess: "Diagnosis Complete",
    diagSub: "Follow the treatment guide for best results.",
    inappropriate: "Inappropriate Content",
    tryAnother: "Try Another Photo",
    collection: "Collection",
    noPlants: "No plants in your collection yet.",
    healthRecords: "Health Records",
    recentWatering: "Recent Watering",
    symptoms: "Symptoms",
    treatment: "Treatment",
    urgency: "Urgency",
    low: "low",
    medium: "medium",
    high: "high",
    toxicity: "Toxicity",
    healthStatus: "Health Status",
    reminders: "Reminder",
    lastWatered: "Last Watered",
    waterNow: "Water Now",
    observations: "My Observations",
    never: "Never",
    waterNotification: "Enable notifications to receive watering reminders for your garden.",
    enableNotifications: "Enable Notifications",
    searchPlates: "Search your plants...",
    gardenWaiting: "Your Garden is Waiting",
    gardenWaitingSub: "Identify a plant and save it to your personal collection to see it bloom here.",
    noMatch: "No plants found matching",
    needsWater: "Needs Water!",
  },
  ru: {
    welcome: "Добро пожаловать в BioGarden",
    onboardingSub: "Выберите предпочитаемый язык, чтобы начать свое зеленое путешествие.",
    identify: "Определить растение",
    diagnose: "Диагностика здоровья",
    search: "Поиск в коллекции...",
    uploadTitle: "Сфотографировать или Загрузить",
    uploadSub: "Сфотографируйте любое растение, чтобы начать",
    identifyBtn: "Определить сейчас",
    diagnoseBtn: "Анализировать болезнь",
    pests: "Распространенные вредители",
    pruning: "Обрезка",
    propagation: "Размножение",
    issues: "Общие проблемы",
    companion: "Совместимые растения",
    growth: "Этапы роста",
    expertTips: "Советы экспертов",
    careGuide: "Руководство по уходу",
    watering: "Полив",
    light: "Свет",
    humidity: "Влажность",
    temperature: "Температура",
    soil: "Тип почвы",
    save: "Сохранить в коллекцию",
    saved: "Сохранено",
    history: "Обновить историю",
    description: "О растении",
    about: "О растении",
    bestNeighbors: "Лучшие соседи",
    pestsDeterred: "Отпугивает вредителей",
    safety: "Безопасность и токсичность",
    petSafety: "Безопасно для питомцев",
    humanSafety: "Безопасно для людей",
    diagSuccess: "Диагностика завершена",
    diagSub: "Следуйте руководству по лечению для достижения наилучших результатов.",
    inappropriate: "Неподходящий контент",
    tryAnother: "Попробовать другое фото",
    collection: "Коллекция",
    noPlants: "В вашей коллекции пока нет растений.",
    healthRecords: "История здоровья",
    recentWatering: "Недавний полив",
    symptoms: "Симптомы",
    treatment: "Лечение",
    urgency: "Срочность",
    low: "низкая",
    medium: "средняя",
    high: "высокая",
    toxicity: "Токсичность",
    healthStatus: "Состояние здоровья",
    reminders: "Напоминание",
    lastWatered: "Последний полив",
    waterNow: "Полить сейчас",
    observations: "Мои наблюдения",
    never: "Никогда",
    waterNotification: "Включите уведомления, чтобы получать напоминания о поливе.",
    enableNotifications: "Включить уведомления",
    searchPlates: "Поиск ваших растений...",
    gardenWaiting: "Ваш сад ждет",
    gardenWaitingSub: "Определите растение и сохраните его в свою коллекцию, чтобы увидеть его здесь.",
    noMatch: "Растений по запросу не найдено",
    needsWater: "Нужен полив!",
  },
  uz: {
    welcome: "BioGarden-ga xush kelibsiz",
    onboardingSub: "Yashil sayohatingizni boshlash uchun o'zingizga yoqqan tilni tanlang.",
    identify: "O'simlikni aniqlash",
    diagnose: "Salomatlikni tekshirish",
    search: "To'plamingizdan qidirish...",
    uploadTitle: "Rasmga oling yoki yuklang",
    uploadSub: "Boshlash uchun istalgan o'simlikni rasmga oling",
    identifyBtn: "Hozir aniqlash",
    diagnoseBtn: "Kasallikni tahlil qilish",
    pests: "Umumiy zararkunandalar",
    pruning: "Kesish (Pruning)",
    propagation: "Ko'paytirish",
    issues: "Umumiy muammolar",
    companion: "Birga ekish",
    growth: "O'sish bosqichlari",
    expertTips: "Ekspert maslahatlari",
    careGuide: "Parvarish bo'yicha qo'llanma",
    watering: "Sug'orish",
    light: "Yorug'lik",
    humidity: "Namlik",
    temperature: "Harorat",
    soil: "Tuproq turi",
    save: "To'plamga saqlash",
    saved: "Saqlandi",
    history: "Tarixni yangilash",
    description: "O'simlik haqida",
    about: "O'simlik haqida",
    bestNeighbors: "Eng yaxshi qo'shnilar",
    pestsDeterred: "Zararkunandalarni haydaydi",
    safety: "Xavfsizlik va toksiklik",
    petSafety: "Uy hayvonlari uchun xavfsiz",
    humanSafety: "Insonlar uchun xavfsiz",
    diagSuccess: "Tashxis yakunlandi",
    diagSub: "Eng yaxshi natijalarga erishish uchun davolash qo'llanmasiga amal qiling.",
    inappropriate: "Mos kelmaydigan kontent",
    tryAnother: "Boshqa rasm sinab ko'ring",
    collection: "To'plam",
    noPlants: "Sizning to'plamingizda hali o'simliklar yo'q.",
    healthRecords: "Salomatlik tarixi",
    recentWatering: "Yaqinda sug'orilgan",
    symptoms: "Simptomlar",
    treatment: "Davolash",
    urgency: "Shoshilinchlik",
    low: "past",
    medium: "o'rta",
    high: "yuqori",
    toxicity: "Toksiklik",
    healthStatus: "Salomatlik holati",
    reminders: "Eslatma",
    lastWatered: "Oxirgi sug'orish",
    waterNow: "Hozir sug'orish",
    observations: "Mening kuzatishlarim",
    never: "Hech qachon",
    waterNotification: "Bog'ingiz uchun sug'orish eslatmalarini olish uchun bildirishnomalarni yoqing.",
    enableNotifications: "Bildirishnomalarni yoqish",
    searchPlates: "O'simliklaringizni qidiring...",
    gardenWaiting: "Sizning bog'ingiz kutmoqda",
    gardenWaitingSub: "O'simlikni aniqlang va uni bu yerda ko'rish uchun shaxsiy to'plamingizga saqlang.",
    noMatch: "Quyidagi so'rov bo'yicha o'simlik topilmadi",
    needsWater: "Sug'orish kerak!",
  }
};
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';

const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY as string });

interface PlantCare {
  id?: string;
  image?: string;
  isPlant?: boolean;
  name: string;
  scientificName: string;
  description: string;
  care?: {
    watering: string;
    light: string;
    soil: string;
    humidity: string;
    temperature: string;
  };
  pests?: string[];
  pruning?: string;
  propagation?: string;
  commonIssues?: string[];
  toxicity?: string;
  diagnosis?: {
    diseaseName: string;
    description: string;
    symptoms: string[];
    treatment: string[];
    urgency: 'low' | 'medium' | 'high';
    date?: string;
  };
  diagnosisHistory?: {
    diseaseName: string;
    description: string;
    symptoms: string[];
    treatment: string[];
    date: string;
    urgency: 'low' | 'medium' | 'high';
  }[];
  reminderFrequency?: number; // frequency in days
  lastWatered?: string; // date string
  wateringHistory?: string[];
  generalTips?: string[];
  notes?: string;
  companionPlanting?: {
    beneficial: string[];
    pestsDeterred: string[];
    notes: string;
  };
  growthStages?: {
    stage: string;
    duration: string;
    description: string;
  }[];
}

export default function PlantIdentifier() {
  const { user, signInWithGoogle, logout } = useAuth();
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PlantCare | null>(null);
  const [mode, setMode] = useState<'identify' | 'diagnose'>('identify');
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [collection, setCollection] = useState<PlantCare[]>([]);
  const [isSaved, setIsSaved] = useState(false);
  const [targetPlantId, setTargetPlantId] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [language, setLanguage] = useState<Language | null>(null);
  const [mounted, setMounted] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => {
      setMounted(true);
      const savedTheme = localStorage.getItem('biogarden_theme');
      if (savedTheme) {
        setTheme(savedTheme as 'light' | 'dark');
      } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setTheme('dark');
      }
      const savedLang = localStorage.getItem('biogarden_lang');
      if (savedLang) {
        setLanguage(savedLang as Language);
      }
    }, 0);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (!user) {
      const savedCollection = localStorage.getItem('biogarden_collection');
      setTimeout(() => {
        if (savedCollection) {
          setCollection(JSON.parse(savedCollection));
        } else {
          setCollection([]);
        }
      }, 0);
      return;
    }

    // If user exists, sync with Firestore
    const q = query(firestoreCollection(db, 'collections'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: PlantCare[] = [];
      snapshot.forEach((doc) => {
        items.push({ ...doc.data() as PlantCare, id: doc.id });
      });
      setCollection(items);
      localStorage.setItem('biogarden_collection', JSON.stringify(items));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'collections');
    });

    return () => unsubscribe();
  }, [user, mounted]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      localStorage.setItem('biogarden_theme', theme);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const currentPermission = Notification.permission;
      if (notificationPermission !== currentPermission) {
        // Defer to avoid cascading renders lint error
        const timer = setTimeout(() => {
          setNotificationPermission(currentPermission);
        }, 0);
        return () => clearTimeout(timer);
      }
    }
  }, [notificationPermission]);

  const requestNotificationPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
    }
  };

  const updatePlantInCollection = async (updatedPlant: PlantCare) => {
    const updatedCollection = collection.map(p => p.id === updatedPlant.id ? updatedPlant : p);
    setCollection(updatedCollection);
    localStorage.setItem('biogarden_collection', JSON.stringify(updatedCollection));

    if (user && updatedPlant.id) {
      try {
        await setDoc(doc(db, 'collections', updatedPlant.id), {
          ...updatedPlant,
          userId: user.uid,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `collections/${updatedPlant.id}`);
      }
    }
  };

  const handleWatering = async (plant: PlantCare) => {
    const now = new Date().toISOString();
    const updatedPlant = {
      ...plant,
      lastWatered: now,
      wateringHistory: [now, ...(plant.wateringHistory || [])],
    };
    await updatePlantInCollection(updatedPlant);
  };

  const setReminder = async (plant: PlantCare, days: number) => {
    const updatedPlant = {
      ...plant,
      reminderFrequency: days,
    };
    await updatePlantInCollection(updatedPlant);
  };

  const updatePlantNotes = async (plant: PlantCare, notes: string) => {
    const updatedPlant = {
      ...plant,
      notes,
    };
    await updatePlantInCollection(updatedPlant);
  };

  useEffect(() => {
    // Check for plants that need watering
    const checkReminders = () => {
      const now = new Date();
      collection.forEach(plant => {
        if (plant.reminderFrequency && plant.lastWatered) {
          const lastWateredDate = new Date(plant.lastWatered);
          const nextWateringDate = new Date(lastWateredDate);
          nextWateringDate.setDate(nextWateringDate.getDate() + plant.reminderFrequency);

          if (now >= nextWateringDate) {
            // It's time to water!
            if (notificationPermission === 'granted') {
              new Notification(`Time to water ${plant.name}!`, {
                body: `It's been ${plant.reminderFrequency} days since your last watering.`,
                icon: plant.image,
              });
            }
          }
        }
      });
    };

    const interval = setInterval(checkReminders, 1000 * 60 * 60 * 6); // Check every 6 hours
    checkReminders(); // Initial check

    return () => clearInterval(interval);
  }, [collection, notificationPermission]);

  const filteredCollection = collection.filter(plant => 
    plant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plant.scientificName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const saveToCollection = async () => {
    if (!result || !image) return;

    const date = new Date().toISOString();
    
    if (targetPlantId) {
      // Update existing plant
      const existingPlant = collection.find(p => p.id === targetPlantId);
      if (existingPlant) {
        const updatedPlant = {
          ...existingPlant,
          diagnosis: result.diagnosis ? { ...result.diagnosis, date } : existingPlant.diagnosis,
          diagnosisHistory: result.diagnosis 
            ? [
                {
                  diseaseName: result.diagnosis.diseaseName,
                  description: result.diagnosis.description,
                  symptoms: result.diagnosis.symptoms || [],
                  treatment: result.diagnosis.treatment,
                  urgency: result.diagnosis.urgency,
                  date
                },
                ...(existingPlant.diagnosisHistory || [])
              ]
            : existingPlant.diagnosisHistory
        };
        await updatePlantInCollection(updatedPlant);
        setIsSaved(true);
        return;
      }
    }

    // Create new plant
    const newPlant: PlantCare = {
      ...result,
      id: Date.now().toString(),
      image,
      diagnosisHistory: result.diagnosis ? [{
        diseaseName: result.diagnosis.diseaseName,
        description: result.diagnosis.description,
        symptoms: result.diagnosis.symptoms || [],
        treatment: result.diagnosis.treatment,
        urgency: result.diagnosis.urgency,
        date
      }] : [],
      wateringHistory: []
    };

    const updatedCollection = [newPlant, ...collection];
    setCollection(updatedCollection);
    localStorage.setItem('biogarden_collection', JSON.stringify(updatedCollection));

    if (user) {
      try {
        await setDoc(doc(db, 'collections', newPlant.id!), {
          ...newPlant,
          userId: user.uid,
          createdAt: date
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `collections/${newPlant.id}`);
      }
    }
    
    setIsSaved(true);
  };

  const removeFromCollection = async (id: string) => {
    const updatedCollection = collection.filter(p => p.id !== id);
    setCollection(updatedCollection);
    localStorage.setItem('biogarden_collection', JSON.stringify(updatedCollection));

    if (user) {
      try {
        await deleteDoc(doc(db, 'collections', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `collections/${id}`);
      }
    }
  };

  const calculateHealthScore = (plant: PlantCare): number => {
    let score = 20; // Base score (general adherence)

    // 1. Watering (Max 50 points)
    if (plant.reminderFrequency && plant.lastWatered) {
      const now = new Date();
      const lastWateredDate = new Date(plant.lastWatered);
      const diffTime = Math.abs(now.getTime() - lastWateredDate.getTime());
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      
      if (diffDays <= plant.reminderFrequency) {
        score += 50;
      } else {
        const daysOverdue = diffDays - plant.reminderFrequency;
        const penalty = Math.min(50, (daysOverdue / plant.reminderFrequency) * 50);
        score += Math.max(0, 50 - penalty);
      }
    } else if (!plant.reminderFrequency) {
      score += 30; // Default score if no reminder is set
    }

    // 2. Diagnosis History (Max 30 points)
    if (plant.diagnosisHistory && plant.diagnosisHistory.length > 0) {
      const latestDiagnosis = plant.diagnosisHistory[0];
      const now = new Date();
      const diagnosisDate = new Date(latestDiagnosis.date);
      const diffDays = Math.abs(now.getTime() - diagnosisDate.getTime()) / (1000 * 60 * 60 * 24);

      if (diffDays > 30) {
        score += 30; // Issues resolved long ago
      } else {
        let diagnosisPenalty = 10;
        if (latestDiagnosis.urgency === 'high') diagnosisPenalty = 30;
        else if (latestDiagnosis.urgency === 'medium') diagnosisPenalty = 20;
        
        const currentPenalty = diagnosisPenalty * (1 - diffDays / 30);
        score += Math.max(0, 30 - currentPenalty);
      }
    } else {
      score += 30; // Perfect health history
    }

    return Math.round(Math.min(100, score));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null);
        setError(null);
        setIsSaved(false);
        setTargetPlantId(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const startDiagnosis = (plantId: string) => {
    setMode('diagnose');
    setTargetPlantId(plantId);
    setImage(null);
    setResult(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const analyzePlant = async () => {
    if (!image) return;

    setLoading(true);
    setError(null);
    setIsSaved(false);

    const base64Data = image.split(',')[1];
    const langName = language === 'ru' ? 'Russian' : language === 'uz' ? 'Uzbek' : 'English';

    const identificationPrompt = `First, determine if this image contains a plant. If it is NOT a plant, set 'isPlant' to false and provide a brief explanation in 'description' why it is inappropriate in ${langName} language. If it IS a plant, set 'isPlant' to true, identify it, and provide detailed care instructions in ${langName} language. Return the response in a structured JSON format with the following keys: isPlant, name, scientificName, description, care (containing watering, light, soil, humidity, temperature), pests (array of common pests for this plant), pruning (guidelines for pruning), propagation (how to propagate), commonIssues (as an array), toxicity (a string specifically mentioning safety/risks for pets and humans), generalTips (an array of 3-5 expert tips for overall plant health), companionPlanting (an object with beneficial as an array of plants that grow well with it, pestsDeterred as an array of pests it helps repel or that are repelled by companions, and notes as a brief explanation of why these pairings work), and growthStages (an array of objects detailing development phases from seedling to maturity, each with 'stage', 'duration', and 'description' keys).`;
    
    const diagnosisPrompt = `First, determine if this image contains a plant. If it is NOT a plant, set 'isPlant' to false and provide a brief explanation in 'description' why it is inappropriate in ${langName} language. If it IS a plant, set 'isPlant' to true, analyze the plant image for diseases or health issues in ${langName} language, identify the plant, and provide a diagnosis in ${langName} language. Return the response in a structured JSON format with the following keys: isPlant, name, scientificName, diagnosis (containing diseaseName, description, symptoms as array, treatment as array, and urgency as 'low', 'medium', or 'high'), description (general description of the plant), care (basic care info), toxicity, generalTips (an array of 3-5 expert tips for maintaining this specific plant's health), companionPlanting (an object with beneficial as an array of companion plants, pestsDeterred as an array, and notes as an explanation), and growthStages (an array of objects detailing development phases with 'stage', 'duration', and 'description').`;

    const identificationSchema = {
      type: Type.OBJECT,
      properties: {
        isPlant: { type: Type.BOOLEAN },
        name: { type: Type.STRING },
        scientificName: { type: Type.STRING },
        description: { type: Type.STRING },
        care: {
          type: Type.OBJECT,
          properties: {
            watering: { type: Type.STRING },
            light: { type: Type.STRING },
            soil: { type: Type.STRING },
            humidity: { type: Type.STRING },
            temperature: { type: Type.STRING },
          },
        },
        pests: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        pruning: { type: Type.STRING },
        propagation: { type: Type.STRING },
        commonIssues: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        toxicity: { type: Type.STRING },
        generalTips: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        companionPlanting: {
          type: Type.OBJECT,
          properties: {
            beneficial: { type: Type.ARRAY, items: { type: Type.STRING } },
            pestsDeterred: { type: Type.ARRAY, items: { type: Type.STRING } },
            notes: { type: Type.STRING },
          },
          required: ["beneficial", "pestsDeterred", "notes"],
        },
        growthStages: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              stage: { type: Type.STRING },
              duration: { type: Type.STRING },
              description: { type: Type.STRING },
            },
            required: ["stage", "duration", "description"],
          },
        },
      },
      required: ["isPlant", "name", "scientificName", "description", "care", "pests", "pruning", "propagation", "commonIssues", "toxicity", "generalTips", "companionPlanting", "growthStages"],
    };

    const diagnosisSchema = {
      type: Type.OBJECT,
      properties: {
        isPlant: { type: Type.BOOLEAN },
        name: { type: Type.STRING },
        scientificName: { type: Type.STRING },
        diagnosis: {
          type: Type.OBJECT,
          properties: {
            diseaseName: { type: Type.STRING },
            description: { type: Type.STRING },
            symptoms: { type: Type.ARRAY, items: { type: Type.STRING } },
            treatment: { type: Type.ARRAY, items: { type: Type.STRING } },
            urgency: { type: Type.STRING, enum: ['low', 'medium', 'high'] },
          },
        },
        description: { type: Type.STRING },
        toxicity: { type: Type.STRING },
        generalTips: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        companionPlanting: {
          type: Type.OBJECT,
          properties: {
            beneficial: { type: Type.ARRAY, items: { type: Type.STRING } },
            pestsDeterred: { type: Type.ARRAY, items: { type: Type.STRING } },
            notes: { type: Type.STRING },
          },
          required: ["beneficial", "pestsDeterred", "notes"],
        },
        growthStages: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              stage: { type: Type.STRING },
              duration: { type: Type.STRING },
              description: { type: Type.STRING },
            },
            required: ["stage", "duration", "description"],
          },
        },
      },
      required: ["isPlant", "name", "scientificName", "diagnosis", "description", "toxicity", "generalTips", "companionPlanting", "growthStages"],
    };

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            parts: [
              {
                inlineData: {
                  mimeType: "image/jpeg",
                  data: base64Data,
                },
              },
              {
                text: mode === 'identify' ? identificationPrompt : diagnosisPrompt,
              },
            ],
          },
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: mode === 'identify' ? identificationSchema : diagnosisSchema,
        },
      });

      const data = JSON.parse(response.text || "{}");
      setResult(data);
    } catch (err) {
      console.error(err);
      setError(`Failed to ${mode === 'identify' ? 'identify' : 'diagnose'} the plant. Please try a clearer photo.`);
    } finally {
      setLoading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (!mounted) return null;

  if (!language) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#f0f4ef] dark:bg-[#121212] transition-colors duration-500">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full p-8 space-y-8 bg-white dark:bg-[#1a1a1a] rounded-[3rem] shadow-2xl border border-[#a3b18a]/20 text-center"
        >
          <div className="w-20 h-20 bg-[#3a5a40] dark:bg-[#a3b18a]/20 rounded-full flex items-center justify-center mx-auto shadow-lg mb-6">
            <Globe className="w-10 h-10 text-white dark:text-[#a3b18a]" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-serif text-[#3a5a40] dark:text-[#a3b18a]">Welcome to BioGarden</h2>
            <p className="text-[#588157] dark:text-[#a3b18a]/70 text-sm">Choose your preferred language to start your green journey.</p>
          </div>
          
          <div className="grid grid-cols-1 gap-3 pt-4">
            {[
              { id: 'en', label: 'English', flag: '🇬🇧' },
              { id: 'ru', label: 'Русский', flag: '🇷🇺' },
              { id: 'uz', label: 'Oʻzbekcha', flag: '🇺🇿' }
            ].map((lang) => (
              <button
                key={lang.id}
                onClick={() => {
                  setLanguage(lang.id as Language);
                  localStorage.setItem('biogarden_lang', lang.id);
                }}
                className="flex items-center justify-between px-6 py-4 rounded-2xl border-2 border-[#a3b18a]/10 dark:border-[#2d3436] hover:border-[#3a5a40] dark:hover:border-[#a3b18a] bg-[#f0f4ef]/30 dark:bg-[#252525] transition-all group group-hover:bg-[#3a5a40]"
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl">{lang.flag}</span>
                  <span className="font-bold text-[#3a5a40] dark:text-[#a3b18a]">{lang.label}</span>
                </div>
                <ArrowRight className="w-5 h-5 text-[#3a5a40] dark:text-[#a3b18a] opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  const t = translations[language];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-16">
      <div className="flex flex-col items-center space-y-8">
        {/* Header with Theme Switcher & Auth */}
        <div className="w-full flex justify-between items-center">
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3 bg-white dark:bg-[#1a1a1a] p-1.5 pr-4 rounded-full border border-[#a3b18a]/30 shadow-sm">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || 'User'} className="w-8 h-8 rounded-full border border-[#a3b18a]/20" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#588157] flex items-center justify-center text-white">
                    <UserIcon className="w-4 h-4" />
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-[#588157] dark:text-[#a3b18a] leading-none mb-0.5">Logged in as</span>
                  <span className="text-xs font-serif font-bold text-[#3a5a40] dark:text-[#e0e0e0] leading-none">{user.displayName || user.email}</span>
                </div>
                <button 
                  onClick={logout}
                  className="ml-2 p-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={signInWithGoogle}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1a1a1a] border border-[#a3b18a]/30 rounded-full text-sm font-bold text-[#3a5a40] dark:text-[#a3b18a] shadow-sm hover:shadow-md transition-all group"
              >
                <div className="w-5 h-5 bg-[#588157] rounded-full flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                  <LogIn className="w-3 h-3" />
                </div>
                Google Login
              </button>
            )}
          </div>
          <button
            onClick={toggleTheme}
            className="p-3 rounded-full bg-white dark:bg-[#1a1a1a] border border-[#a3b18a]/30 text-[#3a5a40] dark:text-[#a3b18a] shadow-sm hover:shadow-md transition-all"
            aria-label="Toggle theme"
          >
            {mounted && (theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />)}
            {!mounted && <div className="w-5 h-5" />}
          </button>
        </div>

        {/* Mode Selector */}
        <div className="flex bg-[#e9ece6] dark:bg-[#1a1a1a] p-1 rounded-full border border-[#a3b18a]/30">
          <button
            onClick={() => setMode('identify')}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
              mode === 'identify' ? 'bg-[#588157] text-white shadow-md' : 'text-[#3a5a40] dark:text-[#a3b18a] hover:bg-[#a3b18a]/20'
            }`}
          >
            <Leaf className="w-4 h-4" />
            {t.identify}
          </button>
          <button
            onClick={() => setMode('diagnose')}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
              mode === 'diagnose' ? 'bg-[#588157] text-white shadow-md' : 'text-[#3a5a40] dark:text-[#a3b18a] hover:bg-[#a3b18a]/20'
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            {t.diagnose}
          </button>
        </div>

        <div className="w-full max-w-md aspect-square rounded-3xl overflow-hidden bg-[#e9ece6] dark:bg-[#1a1a1a] border-2 border-dashed border-[#a3b18a] relative group flex items-center justify-center">
          {image ? (
            <>
              <img src={image} alt="Plant to identify" className="w-full h-full object-cover" />
              <button
                onClick={() => { setImage(null); setResult(null); }}
                className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors"
                id="remove-image"
              >
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </button>
            </>
          ) : (
            <div className="text-center p-8 space-y-4">
              <div className="w-16 h-16 bg-[#a3b18a]/20 rounded-full flex items-center justify-center mx-auto">
                <Leaf className="w-8 h-8 text-[#588157]" />
              </div>
              <div>
                <p className="font-serif text-xl text-[#3a5a40]">{t.uploadTitle}</p>
                <p className="text-sm text-[#588157]">{t.uploadSub}</p>
              </div>
              <div className="flex justify-center gap-4">
                <button
                  onClick={triggerFileInput}
                  className="p-4 bg-[#588157] text-white rounded-full shadow-lg hover:bg-[#3a5a40] transition-all flex items-center justify-center"
                  id="upload-btn"
                >
                  <Camera className="w-6 h-6" />
                </button>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                />
              </div>
            </div>
          )}
        </div>

        {image && !result && !loading && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={analyzePlant}
            className="px-12 py-3 bg-[#588157] text-white rounded-full font-serif text-lg shadow-lg hover:bg-[#3a5a40] transition-all"
            id="identify-btn"
          >
            {mode === 'identify' ? t.identify : t.diagnose}
          </motion.button>
        )}

        {loading && (
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="w-10 h-10 text-[#588157] animate-spin" />
            <p className="font-serif text-lg text-[#3a5a40] animate-pulse">{mode === 'identify' ? t.identifyBtn : t.diagnoseBtn}...</p>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            <p>{error}</p>
          </div>
        )}

        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full space-y-8"
            >
              {result.isPlant === false ? (
                <div className="bg-red-50 dark:bg-red-900/10 p-8 rounded-[2.5rem] border border-red-200 dark:border-red-900/30 text-center space-y-6">
                  <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto shadow-sm">
                    <XCircle className="w-10 h-10 text-red-500" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-3xl font-serif text-red-900 dark:text-red-400">{t.inappropriate}</h3>
                    <p className="text-red-800 dark:text-red-300/80 leading-relaxed max-w-lg mx-auto italic">
                      &quot;{result.description}&quot;
                    </p>
                  </div>
                  <div className="pt-4">
                    <button 
                      onClick={() => { setImage(null); setResult(null); }}
                      className="px-8 py-2.5 bg-red-600 text-white rounded-full font-medium shadow-lg hover:bg-red-700 transition-all border border-red-500/20"
                    >
                      {t.tryAnother}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="text-center md:text-left space-y-2">
                      <h2 className="font-serif text-4xl text-[#3a5a40] dark:text-[#a3b18a]">{result.name}</h2>
                      <p className="text-lg italic text-[#588157] dark:text-[#a3b18a]/80 font-serif">{result.scientificName}</p>
                    </div>
                <button
                  onClick={saveToCollection}
                  disabled={isSaved}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all ${
                    isSaved 
                      ? 'bg-[#a3b18a]/20 text-[#3a5a40] dark:text-[#a3b18a] cursor-default' 
                      : 'bg-white dark:bg-[#1a1a1a] border border-[#a3b18a] text-[#3a5a40] dark:text-[#a3b18a] hover:bg-[#f0f4ef] dark:hover:bg-[#252525]'
                  }`}
                  id="save-plant-btn"
                >
                  {isSaved ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
                  {isSaved ? t.saved : (targetPlantId ? t.history : t.save)}
                </button>
              </div>

              <div className="h-px w-full bg-[#a3b18a]/20" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  {result.diagnosis && (
                    <div className="bg-red-50 p-6 rounded-3xl border border-red-200 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="flex items-center gap-2 font-serif text-xl text-red-900">
                          <Activity className="w-5 h-5 text-red-500" />
                          {t.diagnose}
                        </h3>
                        <div className="flex flex-col items-end gap-1">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                            result.diagnosis.urgency === 'high' ? 'bg-red-200 text-red-700' :
                            result.diagnosis.urgency === 'medium' ? 'bg-orange-200 text-orange-700' :
                            'bg-blue-200 text-blue-700'
                          }`}>
                            {t[result.diagnosis.urgency as keyof typeof t] || result.diagnosis.urgency} {t.urgency}
                          </span>
                          {result.diagnosis.date && (
                            <span className="text-[10px] text-red-800/60 font-bold uppercase tracking-tighter">
                              {new Date(result.diagnosis.date).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <p className="font-bold text-red-900">{result.diagnosis.diseaseName}</p>
                          <p className="text-red-800 text-sm">{result.diagnosis.description}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm font-bold text-red-900 mb-1">{t.symptoms}:</p>
                          <ul className="grid grid-cols-1 gap-1">
                            {result.diagnosis.symptoms.map((s, i) => (
                              <li key={i} className="text-sm text-red-800 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                                {s}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <p className="text-sm font-bold text-red-900 mb-2 flex items-center gap-2">
                            <Pill className="w-4 h-4" />
                            {t.treatment}:
                          </p>
                          <ul className="space-y-2">
                            {result.diagnosis.treatment.map((t, i) => (
                              <li key={i} className="text-sm text-red-800 bg-white/50 p-3 rounded-xl border border-red-100">
                                {t}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-3xl shadow-sm border border-[#e9ece6] dark:border-[#2d3436]">
                    <h3 className="flex items-center gap-2 font-serif text-xl text-[#3a5a40] dark:text-[#a3b18a] mb-3">
                      <Info className="w-5 h-5 text-[#588157] dark:text-[#a3b18a]" />
                      {t.description}
                    </h3>
                    <p className="text-[#344e41] dark:text-[#e0e0e0] leading-relaxed">{result.description}</p>
                  </div>

                  <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-3xl shadow-sm border border-[#e9ece6] dark:border-[#2d3436]">
                    <h3 className="flex items-center gap-2 font-serif text-xl text-[#3a5a40] dark:text-[#a3b18a] mb-3">
                      <Scissors className="w-5 h-5 text-[#588157] dark:text-[#a3b18a]" />
                      {t.pruning}
                    </h3>
                    <p className="text-[#344e41] dark:text-[#e0e0e0] leading-relaxed">{result.pruning}</p>
                  </div>

                  <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-3xl shadow-sm border border-[#e9ece6] dark:border-[#2d3436]">
                    <h3 className="flex items-center gap-2 font-serif text-xl text-[#3a5a40] dark:text-[#a3b18a] mb-3">
                      <GitBranch className="w-5 h-5 text-[#588157] dark:text-[#a3b18a]" />
                      {t.propagation}
                    </h3>
                    <p className="text-[#344e41] dark:text-[#e0e0e0] leading-relaxed">{result.propagation}</p>
                  </div>
                      <h3 className="flex items-center gap-2 font-serif text-xl text-[#3a5a40] dark:text-[#a3b18a] mb-4">
                        <Bug className="w-5 h-5 text-[#588157] dark:text-[#a3b18a]" />
                        {t.pests}
                      </h3>
                      <ul className="space-y-2">
                        {result.pests?.map((pest, i) => (
                          <li key={i} className="flex items-start gap-2 text-[#344e41] dark:text-[#e0e0e0]">
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#a3b18a] flex-shrink-0" />
                            {pest}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-3xl shadow-sm border border-[#e9ece6] dark:border-[#2d3436]">
                      <h3 className="font-serif text-xl text-[#3a5a40] dark:text-[#a3b18a] mb-4">{t.issues}</h3>
                      <ul className="space-y-2">
                        {result.commonIssues?.map((issue, i) => (
                          <li key={i} className="flex items-start gap-2 text-[#344e41] dark:text-[#e0e0e0]">
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#a3b18a] flex-shrink-0" />
                            {issue}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {result.companionPlanting && (
                      <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-3xl shadow-sm border border-[#e9ece6] dark:border-[#2d3436]">
                        <h3 className="flex items-center gap-2 font-serif text-xl text-[#3a5a40] dark:text-[#a3b18a] mb-4">
                          <Heart className="w-5 h-5 text-red-500" />
                          {t.companion}
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <p className="text-xs font-bold uppercase text-[#588157] dark:text-[#a3b18a] tracking-wider mb-2">{t.bestNeighbors}</p>
                            <div className="flex flex-wrap gap-2">
                              {result.companionPlanting.beneficial.map((plant, i) => (
                                <span key={i} className="px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-full text-xs font-medium border border-green-100 dark:border-green-900/30">
                                  {plant}
                                </span>
                              ))}
                            </div>
                          </div>
                          {result.companionPlanting.pestsDeterred.length > 0 && (
                            <div>
                              <p className="text-xs font-bold uppercase text-[#588157] dark:text-[#a3b18a] tracking-wider mb-2">{t.pestsDeterred}</p>
                              <div className="flex flex-wrap gap-2">
                                {result.companionPlanting.pestsDeterred.map((pest, i) => (
                                  <span key={i} className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium border border-blue-100 dark:border-blue-900/30">
                                    {pest}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          <p className="text-sm text-[#344e41] dark:text-[#e0e0e0] italic leading-relaxed bg-[#f0f4ef]/30 dark:bg-white/5 p-3 rounded-xl border border-[#a3b18a]/10">
                            {result.companionPlanting.notes}
                          </p>
                        </div>
                      </div>
                    )}

                    {result.growthStages && (
                      <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-3xl shadow-sm border border-[#e9ece6] dark:border-[#2d3436]">
                        <h3 className="flex items-center gap-2 font-serif text-xl text-[#3a5a40] dark:text-[#a3b18a] mb-6">
                          <GitBranch className="w-5 h-5 text-[#588157]" />
                          {t.growth}
                        </h3>
                        <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-[#a3b18a]/20 before:via-[#a3b18a]/50 before:to-[#a3b18a]/20">
                          {result.growthStages.map((stage, i) => (
                            <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group border-none">
                              <div className="flex items-center justify-center w-10 h-10 rounded-full shrink-0 bg-white dark:bg-[#252525] border-2 border-[#a3b18a] shadow-sm z-10 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                                <span className="text-[#3a5a40] dark:text-[#a3b18a] text-xs font-bold">{i + 1}</span>
                              </div>
                              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl bg-[#f0f4ef]/50 dark:bg-white/5 border border-[#a3b18a]/10 hover:border-[#a3b18a]/30 transition-all">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                                  <h4 className="font-bold text-[#3a5a40] dark:text-[#a3b18a]">{stage.stage}</h4>
                                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#588157]/60 dark:text-[#a3b18a]/40 bg-[#a3b18a]/10 px-2 py-0.5 rounded-full">{stage.duration}</span>
                                </div>
                                <p className="text-xs text-[#344e41] dark:text-[#e0e0e0] leading-relaxed italic">{stage.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {result.generalTips && (
                      <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-3xl shadow-sm border border-[#e9ece6] dark:border-[#2d3436]">
                        <h3 className="flex items-center gap-2 font-serif text-xl text-[#3a5a40] dark:text-[#a3b18a] mb-4">
                          <Sparkles className="w-5 h-5 text-yellow-500" />
                          {t.expertTips}
                        </h3>
                        <ul className="space-y-3">
                          {result.generalTips.map((tip, i) => (
                            <li key={i} className="flex items-start gap-3 text-[#344e41] dark:text-[#e0e0e0] bg-[#f0f4ef]/50 dark:bg-white/5 p-3 rounded-2xl">
                              <div className="mt-1 w-5 h-5 rounded-full bg-white dark:bg-[#252525] flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-[#588157] dark:text-[#a3b18a] border border-[#a3b18a]/20">
                                {i + 1}
                              </div>
                              <span className="text-sm italic leading-relaxed">{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                </div>

                <div className="space-y-6">
                  {result.care ? (
                    <div className="bg-[#f0f4ef] dark:bg-[#1a1a1a] p-6 rounded-3xl shadow-sm border border-[#a3b18a]/20">
                      <h3 className="font-serif text-xl text-[#3a5a40] dark:text-[#a3b18a] mb-4">{t.careGuide}</h3>
                      <div className="space-y-4">
                        <div className="flex gap-4">
                          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                            <Droplets className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="font-bold text-sm uppercase text-[#588157] dark:text-[#a3b18a] tracking-wider">{t.watering}</p>
                            <p className="text-[#344e41] dark:text-[#e0e0e0]">{result.care.watering}</p>
                          </div>
                        </div>
                        
                        <div className="flex gap-4">
                          <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center flex-shrink-0">
                            <Sun className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                          </div>
                          <div>
                            <p className="font-bold text-sm uppercase text-[#588157] dark:text-[#a3b18a] tracking-wider">{t.light}</p>
                            <p className="text-[#344e41] dark:text-[#e0e0e0]">{result.care.light}</p>
                          </div>
                        </div>

                        <div className="flex gap-4">
                          <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
                            <Wind className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                          </div>
                          <div>
                            <p className="font-bold text-sm uppercase text-[#588157] dark:text-[#a3b18a] tracking-wider">{t.humidity}</p>
                            <p className="text-[#344e41] dark:text-[#e0e0e0]">{result.care.humidity}</p>
                          </div>
                        </div>

                        <div className="flex gap-4">
                          <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                            <Thermometer className="w-5 h-5 text-red-600 dark:text-red-400" />
                          </div>
                          <div>
                            <p className="font-bold text-sm uppercase text-[#588157] dark:text-[#a3b18a] tracking-wider">{t.temperature}</p>
                            <p className="text-[#344e41] dark:text-[#e0e0e0]">{result.care.temperature}</p>
                          </div>
                        </div>

                        <div className="flex gap-4">
                          <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                            <Sprout className="w-5 h-5 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <p className="font-bold text-sm uppercase text-[#588157] dark:text-[#a3b18a] tracking-wider">{t.soil}</p>
                            <p className="text-[#344e41] dark:text-[#e0e0e0]">{result.care.soil}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : mode === 'diagnose' ? (
                    <div className="bg-[#f0f4ef] dark:bg-[#1f1f1f] p-6 rounded-3xl shadow-sm border border-[#a3b18a]/20 flex flex-col items-center justify-center text-center py-12 space-y-4">
                      <div className="w-16 h-16 bg-white dark:bg-[#2d3436] rounded-full flex items-center justify-center shadow-sm">
                        <Activity className="w-8 h-8 text-[#588157] dark:text-[#a3b18a]" />
                      </div>
                      <div>
                        <p className="font-serif text-lg text-[#3a5a40] dark:text-[#a3b18a]">{t.diagSuccess}</p>
                        <p className="text-sm text-[#588157] dark:text-[#a3b18a]/80 max-w-[200px]">{t.diagSub}</p>
                      </div>
                    </div>
                  ) : null}

                  <div className="bg-[#fff9f0] dark:bg-[#2a241a] p-6 rounded-3xl border border-orange-200 dark:border-orange-900/30 shadow-sm">
                    <h3 className="flex items-center gap-2 font-serif text-xl text-[#854d0e] dark:text-orange-400 mb-3">
                      <AlertTriangle className="w-5 h-5 text-orange-500" />
                      {t.safety}
                    </h3>
                    <div className="space-y-3">
                      <p className="text-[#854d0e] dark:text-orange-200 italic leading-relaxed">
                        {result.toxicity}
                      </p>
                      <div className="flex flex-wrap gap-2 pt-2">
                        <span className="px-3 py-1 bg-white/50 dark:bg-black/20 rounded-full text-xs font-medium text-[#854d0e] dark:text-orange-300 border border-orange-100 dark:border-orange-900/40">
                          {t.petSafety}
                        </span>
                        <span className="px-3 py-1 bg-white/50 dark:bg-black/20 rounded-full text-xs font-medium text-[#854d0e] dark:text-orange-300 border border-orange-100 dark:border-orange-900/40">
                          {t.humanSafety}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 flex-1">
            <h2 className="font-serif text-3xl text-[#3a5a40] dark:text-[#a3b18a] whitespace-nowrap">{t.collection}</h2>
            <div className="h-px flex-1 bg-[#a3b18a]/20 hidden sm:block" />
            <span className="px-3 py-1 bg-[#a3b18a]/20 dark:bg-[#a3b18a]/10 rounded-full text-sm text-[#3a5a40] dark:text-[#a3b18a] font-medium whitespace-nowrap">
              {collection.length} {collection.length === 1 ? (language === 'en' ? 'Plant' : language === 'ru' ? 'Растение' : 'Oʻsimlik') : (language === 'en' ? 'Plants' : language === 'ru' ? 'Растений' : 'Oʻsimliklar')}
            </span>
          </div>
          
            {collection.length > 0 && (
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#588157]" />
              <input
                type="text"
                placeholder={t.search}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-[#1a1a1a] border border-[#a3b18a]/30 rounded-full text-[#3a5a40] dark:text-[#e0e0e0] placeholder:text-[#a3b18a] focus:outline-none focus:ring-2 focus:ring-[#588157]/20 focus:border-[#588157] transition-all"
                id="garden-search"
              />
            </div>
          )}
        </div>

        {notificationPermission === 'default' && collection.length > 0 && (
          <div className="bg-[#f0f4ef] dark:bg-[#1a1a1a] border border-[#a3b18a]/30 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-[#588157] dark:text-[#a3b18a]" />
              <p className="text-sm text-[#344e41] dark:text-[#e0e0e0]">Enable notifications to receive watering reminders for your garden.</p>
            </div>
            <button 
              onClick={requestNotificationPermission}
              className="px-6 py-2 bg-[#588157] text-white rounded-full text-sm font-medium hover:bg-[#3a5a40] transition-all"
            >
              Enable Notifications
            </button>
          </div>
        )}

        {collection.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 px-6 bg-white/30 dark:bg-black/20 rounded-[3rem] border-2 border-dashed border-[#a3b18a]/30 text-center space-y-4"
          >
            <div className="w-20 h-20 bg-[#a3b18a]/10 rounded-full flex items-center justify-center mb-2">
              <Sprout className="w-10 h-10 text-[#a3b18a]" />
            </div>
            <div className="space-y-1">
              <h3 className="font-serif text-2xl text-[#3a5a40] dark:text-[#a3b18a]">{t.welcome}</h3>
              <p className="text-[#588157] dark:text-[#a3b18a]/80 max-w-sm mx-auto">
                {t.noPlants}
              </p>
            </div>
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="text-[#588157] dark:text-[#a3b18a] font-medium flex items-center gap-2 hover:text-[#3a5a40] transition-colors pt-2"
            >
              <Camera className="w-4 h-4" />
              {t.uploadTitle}
            </button>
          </motion.div>
        ) : filteredCollection.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredCollection.map((plant) => {
                const needsWatering = plant.reminderFrequency && plant.lastWatered && (() => {
                  const now = new Date();
                  const lastWateredDate = new Date(plant.lastWatered);
                  const nextWateringDate = new Date(lastWateredDate);
                  nextWateringDate.setDate(nextWateringDate.getDate() + (plant.reminderFrequency || 0));
                  return now >= nextWateringDate;
                })();

                const healthScore = calculateHealthScore(plant);
                const scoreColor = healthScore > 80 ? 'text-green-600 dark:text-green-400' : healthScore > 50 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400';
                const barColor = healthScore > 80 ? 'bg-green-500' : healthScore > 50 ? 'bg-yellow-500' : 'bg-red-500';
                const borderColor = healthScore > 80 ? 'border-green-500/30' : healthScore > 50 ? 'border-yellow-500/30' : 'border-red-500/30';
                const StatusIcon = healthScore > 80 ? CheckCircle2 : healthScore > 50 ? AlertCircle : XCircle;

                return (
                  <motion.div
                    key={plant.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className={`bg-white dark:bg-[#1a1a1a] rounded-[2rem] overflow-hidden shadow-sm border-2 ${borderColor} group flex flex-col transition-colors duration-500`}
                  >
                    <div className="aspect-[4/3] relative overflow-hidden">
                      <img 
                        src={plant.image} 
                        alt={plant.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                      />
                      <button
                        onClick={() => plant.id && removeFromCollection(plant.id)}
                        className="absolute top-3 right-3 p-2 bg-white/80 dark:bg-black/40 backdrop-blur-sm rounded-full text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      {needsWatering && (
                        <div className="absolute bottom-3 left-3 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1 animate-pulse">
                          <Droplets className="w-3 h-3" />
                          {t.needsWater}
                        </div>
                      )}
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-3">
                        <div className="space-y-1">
                          <h3 className="font-serif text-xl text-[#3a5a40] dark:text-[#a3b18a]">{plant.name}</h3>
                          <p className="text-sm italic text-[#588157] dark:text-[#a3b18a]/80 font-serif">{plant.scientificName}</p>
                        </div>
                          <div className="text-right flex flex-col items-end">
                            <div className="flex items-center gap-1">
                              <StatusIcon className={`w-3 h-3 ${scoreColor}`} />
                              <div className={`text-lg font-bold ${scoreColor}`}>{healthScore}%</div>
                            </div>
                            <div className="text-[10px] text-[#588157] dark:text-[#a3b18a]/60 uppercase font-bold tracking-wider">{t.healthStatus || 'Health Status'}</div>
                          </div>
                      </div>

                      <div className="w-full h-1.5 bg-[#f0f4ef] dark:bg-[#2d3436] rounded-full overflow-hidden mb-4 shadow-inner">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${healthScore}%` }}
                          className={`h-full ${barColor} shadow-[0_0_8px_rgba(0,0,0,0.1)]`}
                        />
                      </div>
                      
                      <div className="space-y-4 pt-4 border-t border-[#f0f4ef] dark:border-[#2d3436]">
                        <div className="flex flex-col gap-3">
                          <button
                            onClick={() => plant.id && startDiagnosis(plant.id)}
                            className="w-full flex items-center justify-center gap-2 py-2 bg-[#588157]/10 dark:bg-[#588157]/20 text-[#3a5a40] dark:text-[#a3b18a] rounded-xl text-xs font-semibold hover:bg-[#588157] hover:text-white transition-all border border-[#588157]/20"
                          >
                            <Stethoscope className="w-3.5 h-3.5" />
                            {t.diagnose}
                          </button>

                          {/* Disease History Section */}
                          {plant.diagnosisHistory && plant.diagnosisHistory.length > 0 && (
                            <div className="space-y-3 pt-2">
                              <span className="text-[10px] text-[#a3b18a] uppercase font-bold flex items-center gap-1">
                                <Activity className="w-3 h-3 text-red-500" />
                                {t.healthRecords}
                              </span>
                              <div className="space-y-3">
                                {plant.diagnosisHistory.slice(0, 3).map((item, i) => (
                                  <div key={i} className="p-3 rounded-2xl bg-red-50/50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20">
                                    <div className="flex justify-between items-start mb-2">
                                      <div className="flex flex-col">
                                        <span className="text-xs font-bold text-red-900 dark:text-red-400 leading-tight">{item.diseaseName}</span>
                                        <span className="text-[9px] text-red-800/60 dark:text-red-400/60 font-medium">{new Date(item.date).toLocaleDateString()}</span>
                                      </div>
                                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider ${
                                        item.urgency === 'high' ? 'bg-red-200 text-red-700' :
                                        item.urgency === 'medium' ? 'bg-orange-200 text-orange-700' :
                                        'bg-blue-200 text-blue-700'
                                      }`}>
                                        {item.urgency}
                                      </span>
                                    </div>
                                    <p className="text-[10px] text-red-800 dark:text-red-300 leading-relaxed mb-2 italic">
                                      {item.description}
                                    </p>
                                    
                                    {item.symptoms && item.symptoms.length > 0 && (
                                      <div className="mb-2">
                                        <p className="text-[9px] font-bold text-red-900/70 dark:text-red-400/70 uppercase mb-1">Symptoms:</p>
                                        <div className="flex flex-wrap gap-1">
                                          {item.symptoms.map((s, si) => (
                                            <span key={si} className="text-[8px] px-1.5 py-0.5 bg-white dark:bg-black/20 rounded-md border border-red-100 dark:border-red-900/30 text-red-700 dark:text-red-300">
                                              {s}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {item.treatment && item.treatment.length > 0 && (
                                      <div className="space-y-1">
                                        <p className="text-[9px] font-bold text-red-900/70 dark:text-red-400/70 uppercase flex items-center gap-1">
                                          <Pill className="w-2.5 h-2.5" />
                                          Recommended Treatment:
                                        </p>
                                        <div className="space-y-1">
                                          {item.treatment.map((t, ti) => (
                                            <div key={ti} className="text-[9px] text-red-800 dark:text-red-300 leading-snug bg-white/40 dark:bg-black/10 p-1.5 rounded-lg border border-red-50 dark:border-red-900/20">
                                              {t}
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ))}
                                {plant.diagnosisHistory.length > 3 && (
                                  <button className="w-full text-[10px] text-[#588157] font-bold hover:underline py-1">
                                    {language === 'en' ? `Show ${plant.diagnosisHistory.length - 3} more health records...` : 
                                     language === 'ru' ? `Показать еще ${plant.diagnosisHistory.length - 3} записей...` : 
                                     `Yana ${plant.diagnosisHistory.length - 3} ta salomatlik qaydlarini ko'rsatish...`}
                                  </button>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Unified Care History (Simplified) */}
                          {(() => {
                            const waterHistory = (plant.wateringHistory || [])
                              .slice(0, 5)
                              .map(date => ({ type: 'watering', date }));
                            
                            if (waterHistory.length === 0) return null;

                            return (
                              <div className="space-y-2 pt-2">
                                <span className="text-[10px] text-[#a3b18a] uppercase font-bold flex items-center gap-1">
                                  <Droplets className="w-3 h-3 text-blue-500" />
                                  {t.recentWatering}
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                  {waterHistory.map((item, i) => (
                                    <div key={i} className="px-2 py-1 rounded-full bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 flex items-center gap-1">
                                      <span className="text-[9px] font-medium text-blue-700 dark:text-blue-300">
                                        {new Date(item.date).toLocaleDateString()}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })()}

                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#588157] dark:text-[#a3b18a] uppercase tracking-wider flex items-center gap-1">
                              <Bell className="w-3 h-3" />
                              {t.reminders}
                            </span>
                            <select 
                              value={plant.reminderFrequency || 0}
                              onChange={(e) => setReminder(plant, parseInt(e.target.value))}
                              className="text-xs bg-[#f0f4ef] dark:bg-[#252525] border-none rounded-lg px-2 py-1 text-[#3a5a40] dark:text-[#e0e0e0] focus:ring-1 focus:ring-[#588157]"
                            >
                              <option value={0}>{language === 'en' ? 'Off' : language === 'ru' ? 'Выкл' : 'Oʻchirilgan'}</option>
                              <option value={1}>{language === 'en' ? 'Every Day' : language === 'ru' ? 'Каждый день' : 'Har kuni'}</option>
                              <option value={3}>{language === 'en' ? 'Every 3 Days' : language === 'ru' ? 'Каждые 3 дня' : 'Har 3 kunda'}</option>
                              <option value={7}>{language === 'en' ? 'Weekly' : language === 'ru' ? 'Еженедельно' : 'Haftalik'}</option>
                              <option value={14}>{language === 'en' ? 'Bi-weekly' : language === 'ru' ? 'Раз в 2 недели' : 'Har 2 haftada'}</option>
                              <option value={30}>{language === 'en' ? 'Monthly' : language === 'ru' ? 'Ежемесячно' : 'Oylik'}</option>
                            </select>
                          </div>
                          
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex flex-col">
                              <span className="text-[10px] text-[#a3b18a] uppercase font-bold">{t.lastWatered}</span>
                              <span className="text-xs text-[#588157]">
                                {plant.lastWatered ? new Date(plant.lastWatered).toLocaleDateString() : t.never}
                              </span>
                            </div>
                            <button
                              onClick={() => handleWatering(plant)}
                              className="flex items-center gap-1.5 px-4 py-1.5 bg-[#f0f4ef] dark:bg-[#588157]/20 text-[#3a5a40] dark:text-[#a3b18a] rounded-full text-xs font-medium hover:bg-[#588157] hover:text-white transition-all border border-[#a3b18a]/20"
                            >
                              <Droplets className="w-3 h-3" />
                              {t.waterNow}
                            </button>
                          </div>

                          <div className="space-y-2 pt-2">
                            <span className="text-[10px] text-[#a3b18a] uppercase font-bold flex items-center gap-1">
                              <MessageSquare className="w-3 h-3" />
                              {t.observations}
                            </span>
                            <textarea
                              placeholder="Add personal notes, growth updates..."
                              value={plant.notes || ''}
                              onChange={(e) => updatePlantNotes(plant, e.target.value)}
                              className="w-full text-xs bg-[#f0f4ef] dark:bg-[#252525] border-none rounded-xl p-3 text-[#3a5a40] dark:text-[#e0e0e0] focus:ring-1 focus:ring-[#588157] placeholder:text-[#a3b18a]/50 resize-none h-20"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-20 bg-white/30 dark:bg-black/20 rounded-[3rem] border-2 border-dashed border-[#a3b18a]/20">
            <p className="text-[#588157] dark:text-[#a3b18a] font-serif italic text-lg whitespace-pre-wrap">
              No plants found matching &quot;{searchQuery}&quot;
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
