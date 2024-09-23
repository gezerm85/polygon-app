import { routes } from './app.routes';
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getDatabase, provideDatabase } from '@angular/fire/database';
import { getAuth, provideAuth } from '@angular/fire/auth';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideFirebaseApp(() =>
      initializeApp({
        projectId: 'polygon-app-8d3e3',
        appId: '1:891219605589:web:e631e363fb53ede609fcdc',
        databaseURL: 'https://polygon-app-8d3e3-default-rtdb.firebaseio.com',
        storageBucket: 'polygon-app-8d3e3.appspot.com',
        apiKey: 'AIzaSyDurlxI9wG3eWgK7ez26zOfgLKFrn9Zw20',
        authDomain: 'polygon-app-8d3e3.firebaseapp.com',
        messagingSenderId: '891219605589',
        measurementId: 'G-H3RR4J8JRK',
      })
    ),
    provideFirestore(() => getFirestore()),
    provideDatabase(() => getDatabase()), provideFirebaseApp(() => initializeApp({"projectId":"polygon-app-8d3e3","appId":"1:891219605589:web:e631e363fb53ede609fcdc","databaseURL":"https://polygon-app-8d3e3-default-rtdb.firebaseio.com","storageBucket":"polygon-app-8d3e3.appspot.com","apiKey":"AIzaSyDurlxI9wG3eWgK7ez26zOfgLKFrn9Zw20","authDomain":"polygon-app-8d3e3.firebaseapp.com","messagingSenderId":"891219605589","measurementId":"G-H3RR4J8JRK"})), provideAuth(() => getAuth()), provideFirestore(() => getFirestore()), provideDatabase(() => getDatabase()),
  ],
};
